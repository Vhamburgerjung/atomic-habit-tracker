import { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { COLORS, FONTS } from "../theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GOLD = "#FFD700";
const BURST_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const BURST_RADIUS = 140;
const OUTER_SIZE = 300;
const GLOW_PAD = 44;

function BurstLine({ triggerKey, angleDeg, color }: { triggerKey: number; angleDeg: number; color: string }) {
  const translate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const angle = (angleDeg * Math.PI) / 180;

  useEffect(() => {
    if (triggerKey === 0) return;
    translate.value = 0;
    opacity.value = 0;
    translate.value = withTiming(BURST_RADIUS, { duration: 480, easing: Easing.out(Easing.quad) });
    opacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(1, { duration: 220 }),
      withTiming(0, { duration: 300 })
    );
  }, [triggerKey]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translate.value * Math.sin(angle) },
      { translateY: -translate.value * Math.cos(angle) },
    ],
  }));

  return (
    <ReAnimated.View
      style={[
        { position: "absolute", width: 4, height: 22, borderRadius: 2, backgroundColor: color },
        animStyle,
      ]}
    />
  );
}

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  isComplete?: boolean;
  celebrationKey?: number;
}

export function ProgressRing({
  completed,
  total,
  size = 200,
  isComplete = false,
  celebrationKey = 0,
}: ProgressRingProps) {
  const percentage = total > 0 ? completed / total : 0;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;

  const svgSize = size + GLOW_PAD;
  const svgCenter = svgSize / 2;
  const svgOffset = (OUTER_SIZE - svgSize) / 2;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const goldPulseOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const prevComplete = useRef(false);
  const isCompleteRef = useRef(isComplete);

  // Neon glow layers
  const glowOuter = glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.09] });
  const glowMid   = glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.26] });
  const glowInner = glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });
  const glowWhite = glowOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.90] });

  // Continuous breathing loops (Reanimated)
  const ringScale  = useSharedValue(1); // ring + text breathe together
  const crownScale = useSharedValue(1);
  const crownY = useSharedValue(-50);
  const crownOpacity = useSharedValue(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  useEffect(() => {
    isCompleteRef.current = isComplete;

    if (isComplete && !prevComplete.current) {
      // One-shot bounce on first completion
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.12, duration: 220, useNativeDriver: true }),
        Animated.spring(pulseScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
      ]).start();
    }

    if (isComplete) {
      // Glow fades in and stays
      Animated.timing(glowOpacity, { toValue: 1, duration: 700, useNativeDriver: false }).start();

      // Ring and crown breathe in sync — reverse:true mirrors the tween seamlessly
      ringScale.value = withRepeat(
        withTiming(1.04, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      crownScale.value = withRepeat(
        withTiming(1.12, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      Animated.timing(glowOpacity, { toValue: 0, duration: 400, useNativeDriver: false }).start();
      ringScale.value  = withTiming(1, { duration: 200 });
      crownScale.value = withTiming(1, { duration: 200 });
      crownOpacity.value = withTiming(0, { duration: 200 });
    }

    prevComplete.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    if (celebrationKey === 0) return;

    goldPulseOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(goldPulseOpacity, { toValue: 0.8, duration: 200, useNativeDriver: false }),
      Animated.timing(goldPulseOpacity, { toValue: 0,   duration: 500, useNativeDriver: false }),
    ]).start();

    crownY.value = -80;
    crownOpacity.value = 0;
    crownY.value = withDelay(150, withSpring(0, { damping: 8, stiffness: 120 }));
    crownOpacity.value = withDelay(150, withTiming(1, { duration: 120 }));
  }, [celebrationKey]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const strokeColor = isComplete ? GOLD : COLORS.accent;
  const textColor   = isComplete ? GOLD : COLORS.text;
  const subColor    = isComplete ? GOLD : COLORS.muted;

  const ringScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const crownStyle = useAnimatedStyle(() => ({
    opacity: crownOpacity.value,
    transform: [
      { translateY: crownY.value },
      { scale: crownScale.value },
    ],
  }));

  return (
    <View style={{ width: OUTER_SIZE, height: OUTER_SIZE, alignItems: "center", justifyContent: "center" }}>
      {BURST_ANGLES.map((angleDeg) => (
        <BurstLine
          key={angleDeg}
          triggerKey={celebrationKey}
          angleDeg={angleDeg}
          color={angleDeg % 60 === 0 ? GOLD : COLORS.accentLight}
        />
      ))}

      {/* Ring SVG — one-shot bounce (pulseScale) + continuous breathe (ringScaleStyle) */}
      <ReAnimated.View
        style={[
          { position: "absolute", left: svgOffset, top: svgOffset },
          ringScaleStyle,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulseScale }] }}>
          <Svg width={svgSize} height={svgSize} style={{ transform: [{ rotate: "-90deg" }] }}>
            {/* Neon glow stack */}
            <AnimatedCircle cx={svgCenter} cy={svgCenter} r={radius} stroke={GOLD} strokeWidth={44} fill="none" opacity={glowOuter} />
            <AnimatedCircle cx={svgCenter} cy={svgCenter} r={radius} stroke={GOLD} strokeWidth={26} fill="none" opacity={glowMid} />
            <AnimatedCircle cx={svgCenter} cy={svgCenter} r={radius} stroke={GOLD} strokeWidth={14} fill="none" opacity={glowInner} />
            {/* Track */}
            <Circle cx={svgCenter} cy={svgCenter} r={radius} stroke={COLORS.border} strokeWidth={10} fill="none" />
            {/* Progress arc */}
            <AnimatedCircle
              cx={svgCenter} cy={svgCenter} r={radius}
              stroke={strokeColor} strokeWidth={10} fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
            {/* White hot core */}
            <AnimatedCircle
              cx={svgCenter} cy={svgCenter} r={radius}
              stroke="white" strokeWidth={3} fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              opacity={glowWhite}
            />
            {/* Gold flash on celebration */}
            <AnimatedCircle
              cx={svgCenter} cy={svgCenter} r={radius}
              stroke={GOLD} strokeWidth={14} fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              opacity={goldPulseOpacity}
            />
          </Svg>
        </Animated.View>
      </ReAnimated.View>

      {/* Center text — breathes with the ring */}
      <ReAnimated.View style={[{ alignItems: "center" }, ringScaleStyle]}>
        <Animated.View style={{ alignItems: "center", transform: [{ scale: pulseScale }] }}>
          <Text style={{ fontFamily: FONTS.display, fontSize: 48, color: textColor }}>{completed}</Text>
          <Text style={{ color: COLORS.muted, fontSize: 13 }}>of {total}</Text>
          <Text style={{ color: subColor, fontSize: 11 }}>{Math.round(percentage * 100)}%</Text>
        </Animated.View>
      </ReAnimated.View>

      {/* Crown */}
      <ReAnimated.View
        style={[
          { position: "absolute", top: -24, left: 0, right: 0, alignItems: "center" },
          crownStyle,
        ]}
      >
        <Text style={{ fontSize: 56 }}>👑</Text>
      </ReAnimated.View>
    </View>
  );
}
