import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { COLORS, FONTS } from "../src/theme";

export const ONBOARDING_V2_KEY = "atomic.onboarding_v2_completed";

const PALETTE = {
  bg: "#0A0A0F",
  card: "#141416",
  surface: "#0b0c11",
  textHi: "#fff",
  textMid: "rgba(255,255,255,0.55)",
  textLo: "rgba(255,255,255,0.4)",
  textXLo: "rgba(255,255,255,0.32)",
  divider: "rgba(255,255,255,0.07)",
  blue: "#4A90E2",
  blueLight: "#8FBEF5",
  blueSoft: "rgba(74,144,226,0.12)",
  blueSoftBorder: "rgba(74,144,226,0.22)",
  blueGlow: "rgba(74,144,226,0.6)",
  violet: "#6C63FF",
  green: "#34D399",
  amber: "#FBBF24",
  red: "#FF6B6B",
} as const;

// ─── REDUCE-MOTION HOOK ───────────────────────────────────────────────────────

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        if (!cancelled) setReduced(!!v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (v) => setReduced(!!v)
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
  return reduced;
}

// ─── ATOM LOGO ────────────────────────────────────────────────────────────────

interface AtomLogoProps {
  size: number;
  reduced: boolean;
  /** Hero variant matches Screen 1 (fast spin); cta variant matches Screen 5 (slower spin, slightly different core glow). */
  variant?: "hero" | "cta";
}

// 1:1 spec from Atomic Onboarding.html
// Hero (Screen 1, 124px): durations 8/12/16s, glow blur 36, core glow 18px+5spread
// CTA  (Screen 5, 176px): durations 13/18/23s, glow blur 46, core glow 22px+6spread
const ATOM_SPEC = {
  hero: {
    durations: [8000, 12000, 16000] as const,
    electronPcts: [0.07, 0.06, 0.06] as const,
    electronShadowPx: [9, 7, 6] as const,
    electronShadowAlpha: [1, 0.6, 0.4] as const,
    coreGlowBlur: 18,
    coreGlowSpread: 5,
    glowBlurPx: 36,
  },
  cta: {
    durations: [13000, 18000, 23000] as const,
    electronPcts: [0.06, 0.055, 0.055] as const,
    electronShadowPx: [10, 8, 7] as const,
    electronShadowAlpha: [1, 0.6, 0.4] as const,
    coreGlowBlur: 22,
    coreGlowSpread: 6,
    glowBlurPx: 46,
  },
} as const;

function AtomLogo({ size, reduced, variant = "hero" }: AtomLogoProps) {
  const spec = ATOM_SPEC[variant];

  // Core pulse: scale 1 ↔ 1.15, opacity 1 ↔ 0.9, 2.4s ease-in-out infinite.
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    pulseScale.value = withRepeat(
      withTiming(1.15, {
        duration: 1200, // 2.4s round-trip with `reverse: true`
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.9, {
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    return () => {
      cancelAnimation(pulseScale);
      cancelAnimation(pulseOpacity);
    };
  }, [reduced]);

  const dotSize = size * 0.13;

  const coreStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [
      { translateX: -dotSize / 2 },
      { translateY: -dotSize / 2 },
      { scale: pulseScale.value },
    ],
  }));

  // Glow: HTML uses `radial-gradient(circle, rgba(74,144,226,0.6), transparent 70%) + blur(N)px`.
  // The blur makes the gradient softer/larger. We approximate by extending the gradient bounds
  // beyond the `inset` and using SVG RadialGradient with a 0.6→0 falloff.
  const glowInset = size * 0.16; // matches `inset:16%`
  const glowSize = size - glowInset * 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      {/* Radial-gradient glow */}
      <View
        style={{
          position: "absolute",
          left: glowInset,
          top: glowInset,
          width: glowSize,
          height: glowSize,
        }}
        pointerEvents="none"
      >
        <Svg width={glowSize} height={glowSize} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="atomGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={PALETTE.blue} stopOpacity={0.6} />
              <Stop offset="70%" stopColor={PALETTE.blue} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill="url(#atomGlow)" />
        </Svg>
      </View>

      {/* Three orbital rings */}
      {([0, 60, 120] as const).map((baseRot, i) => (
        <Orbit
          key={i}
          size={size}
          durationMs={spec.durations[i]}
          baseRotation={baseRot}
          reduced={reduced}
          ringOpacity={i === 0 ? 1 : i === 1 ? 0.5 : 0.3}
          electronOpacity={i === 0 ? 1 : i === 1 ? 0.8 : 0.6}
          electronSize={size * spec.electronPcts[i]}
          electronShadowRadius={spec.electronShadowPx[i]}
          electronShadowOpacity={spec.electronShadowAlpha[i]}
        />
      ))}

      {/* Pulsing white core with layered glow (approximates box-shadow spread) */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: dotSize,
            height: dotSize,
            alignItems: "center",
            justifyContent: "center",
          },
          coreStyle,
        ]}
      >
        {/* Outer spread halo */}
        <View
          style={{
            position: "absolute",
            width: dotSize + spec.coreGlowSpread * 2,
            height: dotSize + spec.coreGlowSpread * 2,
            borderRadius: (dotSize + spec.coreGlowSpread * 2) / 2,
            backgroundColor: PALETTE.blue,
            opacity: 0.7,
            shadowColor: PALETTE.blue,
            shadowOpacity: 0.7,
            shadowRadius: spec.coreGlowBlur,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }}
        />
        {/* White hot core */}
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: "#fff",
          }}
        />
      </Animated.View>
    </View>
  );
}

interface OrbitProps {
  size: number;
  durationMs: number;
  baseRotation: number;
  reduced: boolean;
  ringOpacity: number;
  electronOpacity: number;
  electronSize: number;
  electronShadowRadius: number;
  electronShadowOpacity: number;
}

function Orbit({
  size,
  durationMs,
  baseRotation,
  reduced,
  ringOpacity,
  electronOpacity,
  electronSize,
  electronShadowRadius,
  electronShadowOpacity,
}: OrbitProps) {
  const rot = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    rot.value = withRepeat(
      withTiming(360, { duration: durationMs, easing: Easing.linear }),
      -1
    );
    return () => cancelAnimation(rot);
  }, [reduced, durationMs]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  // Ring geometry.
  // RING_SIDE_INSET_PCT: 0 = full-width (HTML default, flach-kapselig),
  //                     0.08 = leicht oval-iger, 0.15 = sehr eiförmig. Spiel damit.
  const RING_SIDE_INSET_PCT = 0.08;
  const ringHeight = size * 0.38;
  const ringTop = size * 0.31;
  const ringSideInset = size * RING_SIDE_INSET_PCT;
  // Electron straddles the ring's right edge (HTML uses `-2%` outside-offset).
  const electronRight = ringSideInset - size * 0.02 - electronSize / 2;

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        transform: [{ rotate: `${baseRotation}deg` }],
      }}
    >
      <Animated.View
        style={[
          { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
          spinStyle,
        ]}
      >
        {/* True mathematical ellipse via SVG — alles gleichmäßig gekrümmt */}
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <Ellipse
            cx={size / 2}
            cy={size / 2}
            rx={(size - 2 * ringSideInset) / 2}
            ry={ringHeight / 2}
            stroke={PALETTE.blue}
            strokeWidth={1.5}
            strokeOpacity={ringOpacity}
            fill="none"
          />
        </Svg>
        {/* Electron at the right edge of the ring */}
        <View
          style={{
            position: "absolute",
            right: electronRight,
            top: size / 2 - electronSize / 2,
            width: electronSize,
            height: electronSize,
            borderRadius: electronSize / 2,
            backgroundColor: PALETTE.blueLight,
            opacity: electronOpacity,
            shadowColor: PALETTE.blue,
            shadowOpacity: electronShadowOpacity,
            shadowRadius: electronShadowRadius,
            shadowOffset: { width: 0, height: 0 },
            elevation: 6,
          }}
        />
      </Animated.View>
    </View>
  );
}

// ─── PRIMARY BUTTON WITH SHIMMER ──────────────────────────────────────────────

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  reduced: boolean;
}

function PrimaryButton({ label, onPress, reduced }: PrimaryButtonProps) {
  const shimmer = useSharedValue(-1.6);
  const [btnW, setBtnW] = useState(0);

  useEffect(() => {
    if (reduced) return;
    shimmer.value = withDelay(
      600,
      withRepeat(
        withTiming(2.8, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      )
    );
    return () => cancelAnimation(shimmer);
  }, [reduced]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * btnW }, { skewX: "-20deg" }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onLayout={(e) => setBtnW(e.nativeEvent.layout.width)}
      style={({ pressed }) => ({
        opacity: pressed ? 0.92 : 1,
        width: "100%",
        borderRadius: 999,
        overflow: "hidden",
      })}
    >
      {/* Gradient fallback using stacked layers (no extra deps) */}
      <View
        style={{
          backgroundColor: PALETTE.violet,
          paddingVertical: 19,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: PALETTE.blue,
            opacity: 0.55,
          }}
        />
        {btnW > 0 && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                bottom: 0,
                width: btnW * 0.42,
                backgroundColor: "rgba(255,255,255,0.35)",
              },
              shimmerStyle,
            ]}
          />
        )}
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 17,
            color: "#fff",
            letterSpacing: -0.2,
            zIndex: 2,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── HABIT PREVIEW CARD (mirrors HabitCard look, no DB deps) ──────────────────

interface HabitPreviewCardProps {
  name: string;
  emoji: string;
  color: string;
  /** 0..1 density of "completed" cells in the heatmap */
  density: number;
  reduced: boolean;
  /** Show a pulsing "today" cell to imply liveness */
  pulse?: boolean;
}

function HabitPreviewCard({
  name,
  emoji,
  color,
  density,
  reduced,
  pulse,
}: HabitPreviewCardProps) {
  const cols = 18;
  const rows = 3;
  const grid = useMemo(() => {
    // Deterministic pseudo-random pattern keyed by color so the layout is stable.
    const seed = color.charCodeAt(1) + color.charCodeAt(2);
    const out: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const v = ((Math.sin((idx + seed) * 12.9898) * 43758.5453) % 1 + 1) % 1;
        row.push(v);
      }
      out.push(row);
    }
    return out;
  }, [color]);

  const pulseOpacity = useSharedValue(0.3);
  useEffect(() => {
    if (!pulse || reduced) return;
    pulseOpacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(pulseOpacity);
  }, [pulse, reduced]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Pulse the rightmost cell of the bottom row to imply "today".
  const pulseRow = rows - 1;
  const pulseCol = cols - 1;

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: PALETTE.surface,
        borderWidth: 1,
        borderColor: hexA(color, 0.14),
        paddingVertical: 14,
        paddingHorizontal: 15,
      }}
    >
      {/* Header row — mirrors HabitCard */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 11,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: hexA(color, 0.14),
              borderWidth: 1,
              borderColor: hexA(color, 0.35),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                lineHeight: 20,
                width: 20,
                height: 20,
                textAlign: "center",
                textAlignVertical: "center",
                includeFontPadding: false,
              }}
            >
              {emoji}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 19,
              color: PALETTE.textHi,
              letterSpacing: -0.3,
            }}
          >
            {name}
          </Text>
        </View>
        {/* Check button (decorative) */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: color,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: color,
            shadowOpacity: 0.55,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
            elevation: 6,
          }}
        >
          <CheckIcon size={21} color="#fff" />
        </View>
      </View>

      {/* Heatmap grid — rows × flex:1 cells with aspectRatio for square cells */}
      <View style={{ gap: 4 }}>
        {grid.map((row, ri) => (
          <View key={ri} style={{ flexDirection: "row", gap: 4 }}>
            {row.map((v, ci) => {
              const isOn = v < density;
              const isAccent = v < density * 0.45;
              const cellColor = isOn
                ? isAccent
                  ? color
                  : hexA(color, 0.28)
                : hexA(color, 0.06);
              const isPulse = pulse && ri === pulseRow && ci === pulseCol;
              if (isPulse) {
                return (
                  <Animated.View
                    key={ci}
                    style={[
                      {
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 3,
                        backgroundColor: color,
                        shadowColor: color,
                        shadowOpacity: 0.8,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 0 },
                        elevation: 4,
                      },
                      pulseStyle,
                    ]}
                  />
                );
              }
              return (
                <View
                  key={ci}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 3,
                    backgroundColor: cellColor,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── FLOATING STACK (Screen 3) ────────────────────────────────────────────────

function FloatingStack({
  children,
  reduced,
}: {
  children: React.ReactNode;
  reduced: boolean;
}) {
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    offset.value = withRepeat(
      withTiming(-6, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    return () => cancelAnimation(offset);
  }, [reduced]);

  // perspective + rotateX gives the slight 3D tilt from the template
  const style = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateX: "9deg" },
      { translateY: offset.value },
    ],
  }));

  return <Animated.View style={[{ width: "100%" }, style]}>{children}</Animated.View>;
}

// ─── PROGRESS ARC (Screen 5) ──────────────────────────────────────────────────

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function ProgressArc({ reduced }: { reduced: boolean }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const offset = useSharedValue(reduced ? circumference * 0.01 : circumference);

  useEffect(() => {
    if (reduced) {
      offset.value = circumference * 0.01;
      return;
    }
    offset.value = circumference;
    offset.value = withDelay(
      500,
      withTiming(circumference * 0.01, {
        duration: 1600,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [reduced]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <View style={{ width: 64, height: 64 }}>
        <Svg
          width={64}
          height={64}
          viewBox="0 0 96 96"
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={5}
          />
          <AnimatedCircle
            cx={48}
            cy={48}
            r={r}
            fill="none"
            stroke={PALETTE.blue}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </Svg>
      </View>
      <View>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 20,
            color: PALETTE.blue,
            letterSpacing: -0.5,
          }}
        >
          +1%
        </Text>
        <Text style={{ fontSize: 13, color: PALETTE.textLo }}>heute</Text>
      </View>
    </View>
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────

interface ScreenProps {
  reduced: boolean;
  onPrimary: () => void;
}

function HeroScreen({ reduced, onPrimary }: ScreenProps) {
  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View />
      <View style={{ alignItems: "center", paddingHorizontal: 28 }}>
        <AtomLogo size={124} reduced={reduced} variant="hero" />
        <View style={{ marginTop: 38, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 48,
              color: PALETTE.textHi,
              letterSpacing: -1.4,
            }}
          >
            Atomic Habit
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontFamily: FONTS.body,
              fontSize: 18,
              color: PALETTE.textLo,
              textAlign: "center",
            }}
          >
            Gewohnheiten, die bleiben.
          </Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 28, paddingBottom: 12 }}>
        <PrimaryButton label="Jetzt starten →" onPress={onPrimary} reduced={reduced} />
      </View>
    </View>
  );
}

function HookScreen({ reduced, onPrimary }: ScreenProps) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 8 }}>
      {/* Comparison */}
      <View style={{ flexDirection: "row", gap: 16, alignItems: "stretch" }}>
        {/* Left — other apps */}
        <View style={{ flex: 1, gap: 10 }}>
          <View
            style={{
              height: 230,
              borderRadius: 22,
              backgroundColor: PALETTE.card,
              borderWidth: 1,
              borderColor: PALETTE.divider,
              padding: 16,
              opacity: 0.55,
              justifyContent: "flex-start",
              gap: 14,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: 9,
                width: "55%",
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.18)",
              }}
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    borderWidth: 1.5,
                    borderColor: "rgba(255,255,255,0.25)",
                    backgroundColor: i === 2 ? "rgba(255,255,255,0.22)" : "transparent",
                  }}
                />
                <View
                  style={{
                    height: 8,
                    flex: 1,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                />
              </View>
            ))}
            <View
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,107,107,0.14)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <XIcon size={20} color={PALETTE.red} />
            </View>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontFamily: FONTS.medium,
              fontSize: 13,
              color: PALETTE.textLo,
            }}
          >
            Andere Apps
          </Text>
        </View>

        {/* Right — Atomic */}
        <View style={{ flex: 1, gap: 10 }}>
          <View
            style={{
              height: 230,
              borderRadius: 22,
              backgroundColor: PALETTE.card,
              borderWidth: 1,
              borderColor: hexA(PALETTE.blue, 0.25),
              padding: 16,
              overflow: "hidden",
              shadowColor: PALETTE.blue,
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            }}
          >
            <View
              style={{
                height: 9,
                width: "45%",
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.3)",
                marginBottom: 12,
              }}
            />
            <MiniHeatmap />
            <View
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: PALETTE.green,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: PALETTE.green,
                shadowOpacity: 0.55,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 0 },
                elevation: 6,
              }}
            >
              <CheckIcon size={22} color="#06210f" thick />
            </View>
          </View>
          <Text
            style={{
              textAlign: "center",
              fontFamily: FONTS.display,
              fontSize: 13,
              color: PALETTE.textHi,
            }}
          >
            Atomic
          </Text>
        </View>
      </View>

      {/* Headline */}
      <View style={{ marginTop: 36 }}>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 38,
            color: PALETTE.textHi,
            letterSpacing: -1.2,
            lineHeight: 42,
          }}
        >
          Kein Tracker.{"\n"}
          <Text style={{ color: PALETTE.blue }}>Ein System.</Text>
        </Text>
        <Text
          style={{
            marginTop: 16,
            fontFamily: FONTS.body,
            fontSize: 16,
            lineHeight: 22,
            color: PALETTE.textLo,
          }}
        >
          Die meisten Apps tracken Haken.{"\n"}
          Atomic baut Identität.
        </Text>
      </View>

      {/* Pills */}
      <View
        style={{
          marginTop: "auto",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 9,
          paddingBottom: 12,
        }}
      >
        <Pill color={PALETTE.blue} label="Identitäts-Basis" />
        <Pill color={PALETTE.green} label="Habit Stacking" />
        <Pill color={PALETTE.amber} label="1%-Methode" />
      </View>

      <View style={{ paddingBottom: 12 }}>
        <PrimaryButton label="Weiter →" onPress={onPrimary} reduced={reduced} />
      </View>
    </View>
  );
}

function MiniHeatmap() {
  // 4 rows × 6 cols of small colored squares — mirrors template grid.
  const cells: { c: string }[][] = [
    [
      { c: PALETTE.blue },
      { c: hexA(PALETTE.blue, 0.25) },
      { c: PALETTE.green },
      { c: hexA(PALETTE.green, 0.25) },
      { c: PALETTE.amber },
      { c: hexA(PALETTE.amber, 0.25) },
    ],
    [
      { c: hexA(PALETTE.blue, 0.25) },
      { c: PALETTE.blue },
      { c: hexA(PALETTE.green, 0.25) },
      { c: PALETTE.green },
      { c: hexA(PALETTE.amber, 0.25) },
      { c: PALETTE.red },
    ],
    [
      { c: PALETTE.red },
      { c: hexA(PALETTE.blue, 0.25) },
      { c: PALETTE.blue },
      { c: PALETTE.green },
      { c: hexA(PALETTE.red, 0.25) },
      { c: PALETTE.amber },
    ],
    [
      { c: hexA(PALETTE.green, 0.25) },
      { c: PALETTE.green },
      { c: PALETTE.amber },
      { c: hexA(PALETTE.blue, 0.25) },
      { c: PALETTE.blue },
      { c: hexA(PALETTE.green, 0.25) },
    ],
  ];
  return (
    <View style={{ gap: 5 }}>
      {cells.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 5 }}>
          {row.map((cell, ci) => (
            <View
              key={ci}
              style={{
                flex: 1,
                aspectRatio: 1,
                borderRadius: 3,
                backgroundColor: cell.c,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 999,
        backgroundColor: hexA(color, 0.12),
        borderWidth: 1,
        borderColor: hexA(color, 0.22),
      }}
    >
      <View
        style={{
          width: 8,
          height: 8,
          backgroundColor: color,
          transform: [{ rotate: "45deg" }],
        }}
      />
      <Text style={{ fontSize: 13, fontFamily: FONTS.medium, color: PALETTE.textHi }}>
        {label}
      </Text>
    </View>
  );
}

function VisualizationScreen({ reduced, onPrimary }: ScreenProps) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 8 }}>
      {/* Tilted card stack */}
      <View
        style={{
          height: 360,
          justifyContent: "center",
        }}
      >
        <FloatingStack reduced={reduced}>
          <View style={{ gap: 14 }}>
            <HabitPreviewCard
              name="laufen"
              emoji="🏃"
              color={PALETTE.blue}
              density={0.42}
              reduced={reduced}
            />
            <HabitPreviewCard
              name="meditieren"
              emoji="🧘"
              color={PALETTE.green}
              density={0.48}
              reduced={reduced}
              pulse
            />
            <HabitPreviewCard
              name="lesen"
              emoji="📖"
              color={PALETTE.amber}
              density={0.52}
              reduced={reduced}
            />
          </View>
        </FloatingStack>
      </View>

      <View style={{ marginTop: 24 }}>
        <Text
          style={{
            fontFamily: FONTS.display,
            fontSize: 32,
            color: PALETTE.textHi,
            letterSpacing: -1,
            lineHeight: 36,
          }}
        >
          Sieh wie dein{"\n"}System wächst.
        </Text>
        <Text
          style={{
            marginTop: 12,
            fontFamily: FONTS.body,
            fontSize: 16,
            lineHeight: 22,
            color: PALETTE.textLo,
          }}
        >
          Jeder Punkt ist ein Beweis.{"\n"}Für dich. Täglich.
        </Text>
      </View>

      <View
        style={{
          marginTop: "auto",
          paddingTop: 20,
          borderTopWidth: 1,
          borderTopColor: PALETTE.divider,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.body,
            fontSize: 14,
            fontStyle: "italic",
            lineHeight: 20,
            color: PALETTE.textMid,
          }}
        >
          „Gewohnheiten sind der Zinseszins der Selbstverbesserung."
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontFamily: FONTS.medium,
            fontSize: 12,
            color: PALETTE.textXLo,
          }}
        >
          — James Clear
        </Text>
      </View>

      <View style={{ paddingVertical: 16 }}>
        <PrimaryButton label="Weiter →" onPress={onPrimary} reduced={reduced} />
      </View>
    </View>
  );
}

function MethodScreen({ reduced, onPrimary }: ScreenProps) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 8 }}>
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 32,
          color: PALETTE.textHi,
          letterSpacing: -1,
          lineHeight: 36,
        }}
      >
        3 Schritte.{"\n"}Ein neues System.
      </Text>
      <Text
        style={{
          marginTop: 12,
          marginBottom: 16,
          fontFamily: FONTS.body,
          fontSize: 16,
          lineHeight: 22,
          color: PALETTE.textLo,
        }}
      >
        Nicht: Was willst du tun?{"\n"}Sondern: Wer willst du sein?
      </Text>

      {/* Habit context — alle 3 Schritte beziehen sich auf dieses Beispiel-Habit */}
      <View
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: hexA(PALETTE.green, 0.12),
          borderWidth: 1,
          borderColor: hexA(PALETTE.green, 0.22),
          marginBottom: 18,
        }}
      >
        <Text style={{ fontSize: 11, fontFamily: FONTS.medium, color: PALETTE.textLo, letterSpacing: 1 }}>
          BEISPIEL-HABIT
        </Text>
        <Text style={{ fontSize: 14 }}>🧘</Text>
        <Text style={{ fontSize: 13, fontFamily: FONTS.display, color: PALETTE.textHi }}>
          meditieren
        </Text>
      </View>

      {/* Stepper */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
        <StepNode n={1} state="active" />
        <View style={{ flex: 1, height: 2, backgroundColor: PALETTE.blue, marginHorizontal: 4 }} />
        <StepNode n={2} state="next" />
        <View
          style={{
            flex: 1,
            height: 2,
            backgroundColor: hexA(PALETTE.blue, 0.18),
            marginHorizontal: 4,
          }}
        />
        <StepNode n={3} state="future" />
      </View>

      <View style={{ gap: 14, flex: 1 }}>
        {/* Step 1 — Identität */}
        <StepCard caption="Wähle deine Identität — nicht dein Ziel">
          <View style={{ gap: 7 }}>
            <View
              style={{
                paddingVertical: 9,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: hexA(PALETTE.blue, 0.12),
                borderWidth: 1,
                borderColor: hexA(PALETTE.blue, 0.45),
              }}
            >
              <Text style={{ fontSize: 13, fontFamily: FONTS.display, color: PALETTE.blueLight }}>
                Ich bin jemand, der auf sich achtet
              </Text>
            </View>
            <View
              style={{
                paddingVertical: 9,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text style={{ fontSize: 13, color: PALETTE.textLo }}>
                Ich bin jemand, der täglich lernt
              </Text>
            </View>
          </View>
        </StepCard>

        {/* Step 2 — Trigger (cue + implementation intention) */}
        <StepCard caption="Verankere es in deinem Alltag">
          <View
            style={{
              paddingVertical: 11,
              paddingHorizontal: 13,
              borderRadius: 11,
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            <Text style={{ fontSize: 14, lineHeight: 20, color: PALETTE.textHi }}>
              Nachdem ich{" "}
              <Text style={{ color: PALETTE.blue, fontFamily: FONTS.display }}>
                Kaffee getrunken habe
              </Text>
              , werde ich{" "}
              <Text style={{ color: PALETTE.blue, fontFamily: FONTS.display }}>
                meditieren
              </Text>
              .
            </Text>
          </View>
        </StepCard>

        {/* Step 3 — Belohnung */}
        <StepCard caption="Mach es sofort befriedigend">
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: hexA(PALETTE.green, 0.14),
                borderWidth: 1,
                borderColor: hexA(PALETTE.green, 0.45),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckIcon size={18} color={PALETTE.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontFamily: FONTS.medium, color: PALETTE.textHi }}>
                Heute erledigt
              </Text>
              <Text style={{ fontSize: 11, color: PALETTE.textLo, marginTop: 1 }}>
                Sofort sichtbarer Fortschritt
              </Text>
            </View>
          </View>
        </StepCard>
      </View>

      <View style={{ paddingVertical: 16 }}>
        <PrimaryButton label="Weiter →" onPress={onPrimary} reduced={reduced} />
      </View>
    </View>
  );
}

function StepNode({
  n,
  state,
}: {
  n: number;
  state: "active" | "next" | "future";
}) {
  if (state === "active") {
    return (
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: PALETTE.blue,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: PALETTE.blue,
          shadowOpacity: 0.5,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        }}
      >
        <Text style={{ fontFamily: FONTS.display, fontSize: 14, color: "#fff" }}>{n}</Text>
      </View>
    );
  }
  if (state === "next") {
    return (
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: hexA(PALETTE.blue, 0.18),
          borderWidth: 1.5,
          borderColor: hexA(PALETTE.blue, 0.5),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{ fontFamily: FONTS.display, fontSize: 14, color: PALETTE.blueLight }}
        >
          {n}
        </Text>
      </View>
    );
  }
  return (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 14,
          color: PALETTE.textLo,
        }}
      >
        {n}
      </Text>
    </View>
  );
}

function StepCard({
  caption,
  children,
}: {
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 18,
        backgroundColor: PALETTE.card,
        borderWidth: 1,
        borderColor: PALETTE.divider,
        paddingVertical: 15,
        paddingHorizontal: 16,
      }}
    >
      <View style={{ marginBottom: 10 }}>{children}</View>
      <Text style={{ fontSize: 13, fontFamily: FONTS.medium, color: PALETTE.textMid }}>
        {caption}
      </Text>
    </View>
  );
}

interface CtaScreenProps {
  reduced: boolean;
  onCreate: () => void;
  onDashboard: () => void;
}

function CtaScreen({ reduced, onCreate, onDashboard }: CtaScreenProps) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 32, position: "relative" }}>
      {/* Background formula */}
      <Text
        style={{
          position: "absolute",
          right: -10,
          bottom: 200,
          fontSize: 58,
          fontFamily: FONTS.display,
          color: "rgba(255,255,255,0.06)",
          letterSpacing: -1,
          transform: [{ rotate: "-6deg" }],
        }}
      >
        1,01³⁶⁵ = 37,78
      </Text>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 26 }}>
        <AtomLogo size={176} reduced={reduced} variant="cta" />

        <ProgressArc reduced={reduced} />

        <View style={{ alignItems: "center", paddingHorizontal: 8 }}>
          <Text
            style={{
              textAlign: "center",
              fontFamily: FONTS.display,
              fontSize: 36,
              color: PALETTE.textHi,
              letterSpacing: -1.2,
              lineHeight: 40,
            }}
          >
            Wer willst du{"\n"}in 365 Tagen sein?
          </Text>
          <Text
            style={{
              marginTop: 16,
              textAlign: "center",
              fontFamily: FONTS.body,
              fontSize: 15,
              lineHeight: 22,
              color: PALETTE.textLo,
            }}
          >
            1% besser jeden Tag = 37× besser nach einem Jahr.{"\n"}Dein System beginnt heute.
          </Text>
        </View>
      </View>

      <View style={{ paddingBottom: 12, alignItems: "center", gap: 14 }}>
        <PrimaryButton
          label="Meinen ersten Habit erstellen →"
          onPress={onCreate}
          reduced={reduced}
        />
        <Pressable onPress={onDashboard} hitSlop={12}>
          <Text
            style={{
              fontSize: 14,
              color: PALETTE.textMid,
              fontFamily: FONTS.medium,
            }}
          >
            Erstmal nur umschauen
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── ICONS ────────────────────────────────────────────────────────────────────

function CheckIcon({
  size,
  color,
  thick,
}: {
  size: number;
  color: string;
  thick?: boolean;
}) {
  const stroke = thick ? 3 : 2.5;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.5 4.5L19 7"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function XIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function hexA(hex: string, alpha: number): string {
  // Accepts "#RRGGBB". Returns "rgba(...)".
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

async function completeOnboarding(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_V2_KEY, "true");
  } catch {
    // Storage failure shouldn't block navigation.
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      const next = step + 1;
      setStep(next);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const skipToDashboard = async () => {
    await completeOnboarding();
    router.replace("/");
  };

  const finishToWizard = async () => {
    await completeOnboarding();
    router.replace("/habit/new");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PALETTE.bg,
        paddingTop: insets.top,
        paddingBottom: Math.max(insets.bottom, 16),
      }}
    >
      {/* Top bar: progress dots + skip */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 12,
          height: 44,
        }}
      >
        <View style={{ flexDirection: "row", gap: 6 }}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={{
                width: i === step ? 22 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === step ? PALETTE.blue : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </View>
        {step >= 1 && step < TOTAL_STEPS - 1 && (
          <Pressable onPress={skipToDashboard} hitSlop={12}>
            <Text
              style={{
                fontSize: 14,
                color: PALETTE.textMid,
                fontFamily: FONTS.medium,
              }}
            >
              Überspringen
            </Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && <HeroScreen reduced={reduced} onPrimary={goNext} />}
        {step === 1 && <HookScreen reduced={reduced} onPrimary={goNext} />}
        {step === 2 && (
          <VisualizationScreen reduced={reduced} onPrimary={goNext} />
        )}
        {step === 3 && <MethodScreen reduced={reduced} onPrimary={goNext} />}
        {step === 4 && (
          <CtaScreen
            reduced={reduced}
            onCreate={finishToWizard}
            onDashboard={skipToDashboard}
          />
        )}
      </ScrollView>
    </View>
  );
}
