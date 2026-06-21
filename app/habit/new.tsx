/**
 * Slice 021 — Onboarding Wizard (replaces 4-Gesetze wizard)
 *
 * Step 1  Name + Color
 * Step 2  Identity Statement
 * Step 3  Anchor (Implementation Intention) + Time
 * Step 4  Review + Launch
 */

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useDispatch } from "../../src/data";
import { HABIT_COLORS } from "../../src/theme/habitColors";
import { hexToRgba } from "../../src/theme/colorUtils";

// ─── Design tokens (isolated from global theme per brief) ───────────────────
const BG = "#0A0A0F";
const CARD = "#1C1C1E";
const CARD2 = "#161618";
const WHITE = "#fff";
const MUTED = "#8E8E93";
const MUTED2 = "#AEAEB2";
const SEPARATOR = "rgba(255,255,255,0.08)";
const BORDER = "#48484A";
const BORDER2 = "#636366";
const SURFACE = "#39393D";
const SURFACE2 = "#2C2C2E";
const SURFACE3 = "#6E6E73";

// ─── Anchor presets ──────────────────────────────────────────────────────────
const ANCHOR_PRESETS = [
  "dem Aufwachen",
  "dem Morgenkaffee",
  "dem Frühstück",
  "der Dusche",
  "dem Mittagessen",
  "der Arbeit",
  "dem Sport",
  "dem Abendessen",
  "dem Zähneputzen",
  "dem Schlafengehen",
];

// ─── Identity presets ────────────────────────────────────────────────────────
const IDENTITY_PRESETS = [
  { label: "Bewegung", title: "Ich bin jemand der sich bewegt" },
  { label: "Gesundheit", title: "Ich bin jemand der auf sich achtet" },
  { label: "Lernen", title: "Ich bin jemand der täglich lernt" },
  { label: "Mindfulness", title: "Ich bin jemand der im Moment lebt" },
  { label: "Produktivität", title: "Ich bin jemand der Dinge erledigt" },
  { label: "Soziales", title: "Ich bin jemand der Verbindungen pflegt" },
];

// ─── Time segment options ────────────────────────────────────────────────────
const TIME_OPTIONS: { label: string; value: "2min" | "5min" | "15min" | "30min" }[] = [
  { label: "2 Min", value: "2min" },
  { label: "5 Min", value: "5min" },
  { label: "15 Min", value: "15min" },
  { label: "30 Min", value: "30min" },
];

// ─── Types ───────────────────────────────────────────────────────────────────
type StartSize = "2min" | "5min" | "15min" | "30min";

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({
  currentStep,
  accentColor,
}: {
  currentStep: number;
  accentColor: string;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 6, flex: 1 }}>
      {[1, 2, 3, 4].map((i) => {
        const active = currentStep >= i;
        return (
          <Animated.View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: active ? accentColor : "rgba(255,255,255,0.12)",
            }}
          />
        );
      })}
    </View>
  );
}

// ─── CTA Button ─────────────────────────────────────────────────────────────
function CtaButton({
  label,
  onPress,
  disabled,
  accentColor,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  accentColor: string;
}) {
  const scale = useSharedValue(1);

  // Pulse animation (2.4s repeat)
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Start pulse on mount
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.016, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      false
    );
  }, []);

  const handlePress = () => {
    if (disabled) return;
    // Bounce: replace pulse with one-shot bounce
    scale.value = withSequence(
      withTiming(0.93, { duration: 80 }),
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 220 })
    );
    onPress();
  };

  return (
    <Animated.View style={[pulseStyle, { borderRadius: 16, overflow: "hidden" }]}>
      <Pressable
        onPress={handlePress}
        style={{
          height: 56,
          borderRadius: 16,
          backgroundColor: disabled ? BORDER : accentColor,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: disabled ? 0 : 0.45,
          shadowRadius: 16,
          elevation: disabled ? 0 : 8,
        }}
      >
        <Text
          style={{
            color: disabled ? MUTED : WHITE,
            fontSize: 17,
            fontWeight: "600",
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Step 1: Name + Color ────────────────────────────────────────────────────
function Step1({
  name,
  setName,
  selectedColor,
  setSelectedColor,
}: {
  name: string;
  setName: (v: string) => void;
  selectedColor: string | null;
  setSelectedColor: (v: string) => void;
}) {
  return (
    <Animated.View entering={FadeInRight.duration(300)} style={{ gap: 28 }}>
      {/* Section: Name */}
      <View style={{ gap: 12 }}>
        <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
          Habit-Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="z.B. Jeden Tag meditieren"
          placeholderTextColor={MUTED}
          style={{
            backgroundColor: CARD,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            color: WHITE,
            fontSize: 17,
            fontWeight: "500",
          }}
          returnKeyType="done"
          autoFocus
        />
      </View>

      {/* Section: Color */}
      <View style={{ gap: 12 }}>
        <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
          Farbe wählen
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          {HABIT_COLORS.map((hex) => {
            const isSelected = selectedColor === hex;
            return (
              <Pressable
                key={hex}
                onPress={() => setSelectedColor(hex)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: hex,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: isSelected ? 3 : 0,
                  borderColor: isSelected ? WHITE : "transparent",
                  shadowColor: hex,
                  shadowOpacity: isSelected ? 0.7 : 0,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: isSelected ? 6 : 0,
                }}
              >
                {isSelected && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: WHITE,
                      opacity: 0.9,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Step 2: Identity ────────────────────────────────────────────────────────
function Step2({
  selectedPreset,
  setSelectedPreset,
  customIdentity,
  setCustomIdentity,
  showCustom,
  setShowCustom,
  accentColor,
}: {
  selectedPreset: string | null;
  setSelectedPreset: (v: string | null) => void;
  customIdentity: string;
  setCustomIdentity: (v: string) => void;
  showCustom: boolean;
  setShowCustom: (v: boolean) => void;
  accentColor: string;
}) {
  return (
    <Animated.View entering={FadeInRight.duration(300)} style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ color: WHITE, fontSize: 22, fontWeight: "700", lineHeight: 28 }}>
          Wer willst du werden?
        </Text>
        <Text style={{ color: MUTED2, fontSize: 15, lineHeight: 22 }}>
          Gewohnheiten, die zu deiner Identität passen, bleiben.
        </Text>
      </View>

      <View style={{ gap: 10 }}>
        {IDENTITY_PRESETS.map((preset, i) => {
          const isActive = selectedPreset === preset.title && !showCustom;
          return (
            <Animated.View key={preset.label} entering={FadeInDown.delay(i * 60).duration(280)}>
              <Pressable
                onPress={() => {
                  setSelectedPreset(preset.title);
                  setShowCustom(false);
                }}
                style={{
                  backgroundColor: isActive ? hexToRgba(accentColor, 0.15) : CARD,
                  borderWidth: 1,
                  borderColor: isActive ? accentColor : "transparent",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Text
                  style={{
                    color: isActive ? accentColor : WHITE,
                    fontSize: 15,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {preset.title}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}

        {/* Custom identity */}
        <Animated.View entering={FadeInDown.delay(IDENTITY_PRESETS.length * 60).duration(280)}>
          <Pressable
            onPress={() => {
              setShowCustom(true);
              setSelectedPreset(null);
            }}
            style={{
              backgroundColor: showCustom ? hexToRgba(accentColor, 0.1) : CARD,
              borderWidth: 1,
              borderColor: showCustom ? accentColor : BORDER2,
              borderRadius: 12,
              borderStyle: "dashed",
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <Text style={{ color: showCustom ? accentColor : MUTED, fontSize: 15 }}>
              + Eigene Identität
            </Text>
          </Pressable>
        </Animated.View>

        {showCustom && (
          <Animated.View entering={ZoomIn.duration(250)}>
            <TextInput
              value={customIdentity}
              onChangeText={setCustomIdentity}
              placeholder="Ich bin jemand der..."
              placeholderTextColor={MUTED}
              autoFocus
              style={{
                backgroundColor: CARD,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: WHITE,
                fontSize: 15,
                borderWidth: 1,
                borderColor: accentColor,
              }}
            />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Step 3: Anchor + Time ───────────────────────────────────────────────────
function Step3({
  habitName,
  selectedAnchor,
  setSelectedAnchor,
  customAnchor,
  setCustomAnchor,
  showCustomAnchor,
  setShowCustomAnchor,
  startSize,
  setStartSize,
  accentColor,
}: {
  habitName: string;
  selectedAnchor: string | null;
  setSelectedAnchor: (v: string | null) => void;
  customAnchor: string;
  setCustomAnchor: (v: string) => void;
  showCustomAnchor: boolean;
  setShowCustomAnchor: (v: boolean) => void;
  startSize: StartSize;
  setStartSize: (v: StartSize) => void;
  accentColor: string;
}) {
  // The effective anchor text for preview
  const anchorText = showCustomAnchor ? customAnchor : (selectedAnchor ?? "");
  const hasAnchor = anchorText.trim().length > 0;
  const hasName = habitName.trim().length > 0;
  const showPreview = hasAnchor && hasName;

  // Build sentence tokens for fadeUp stagger
  // "Nachdem ich [anchor], werde ich [name]."
  const tokens = showPreview
    ? [
        { text: "Nachdem", colored: false },
        { text: "ich", colored: false },
        { text: anchorText + ",", colored: true },
        { text: "werde", colored: false },
        { text: "ich", colored: false },
        { text: habitName + ".", colored: true },
      ]
    : [];

  return (
    <Animated.View entering={FadeInRight.duration(300)} style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ color: WHITE, fontSize: 22, fontWeight: "700", lineHeight: 28 }}>
          Wann tust du es?
        </Text>
        <Text style={{ color: MUTED2, fontSize: 15, lineHeight: 22 }}>
          Verknüpfe deine Gewohnheit mit einem bestehenden Anker.
        </Text>
      </View>

      {/* Anchor chips — horizontal scroll */}
      <View style={{ gap: 10 }}>
        <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
          Nachdem ich ...
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
        >
          {ANCHOR_PRESETS.map((anchor) => {
            const isActive = selectedAnchor === anchor && !showCustomAnchor;
            return (
              <Pressable
                key={anchor}
                onPress={() => {
                  setSelectedAnchor(anchor);
                  setShowCustomAnchor(false);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: isActive ? accentColor : CARD,
                  borderWidth: 1,
                  borderColor: isActive ? accentColor : BORDER2,
                }}
              >
                <Text
                  style={{
                    color: isActive ? WHITE : MUTED2,
                    fontSize: 14,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {anchor}
                </Text>
              </Pressable>
            );
          })}

          {/* Custom anchor chip */}
          <Pressable
            onPress={() => {
              setShowCustomAnchor(true);
              setSelectedAnchor(null);
            }}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: showCustomAnchor ? hexToRgba(accentColor, 0.15) : "transparent",
              borderWidth: 1,
              borderColor: showCustomAnchor ? accentColor : BORDER2,
              borderStyle: "dashed",
            }}
          >
            <Text style={{ color: showCustomAnchor ? accentColor : MUTED, fontSize: 14 }}>
              + Eigener
            </Text>
          </Pressable>
        </ScrollView>

        {showCustomAnchor && (
          <Animated.View entering={ZoomIn.duration(250)}>
            <TextInput
              value={customAnchor}
              onChangeText={setCustomAnchor}
              placeholder="z.B. dem Mittagsspaziergang"
              placeholderTextColor={MUTED}
              autoFocus
              style={{
                backgroundColor: CARD,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: WHITE,
                fontSize: 15,
                borderWidth: 1,
                borderColor: accentColor,
              }}
            />
          </Animated.View>
        )}
      </View>

      {/* Habit-stack preview */}
      {showPreview && (
        <Animated.View
          key={`stack-${showPreview}`}
          entering={ZoomIn.duration(280)}
          style={{
            backgroundColor: CARD,
            borderRadius: 14,
            padding: 16,
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 4,
            alignItems: "baseline",
          }}
        >
          {tokens.map((token, i) => (
            <Animated.Text
              key={`${i}`}
              entering={FadeInDown.delay(i * 60).duration(260)}
              style={{
                color: token.colored ? accentColor : "#E5E5EA",
                fontSize: 16,
                fontWeight: token.colored ? "600" : "500",
                lineHeight: 24,
              }}
            >
              {token.text}{" "}
            </Animated.Text>
          ))}
        </Animated.View>
      )}

      {/* Time segment */}
      <View style={{ gap: 10 }}>
        <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
          Startgröße
        </Text>
        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 12,
            padding: 4,
            flexDirection: "row",
          }}
        >
          {TIME_OPTIONS.map((opt) => {
            const isActive = startSize === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setStartSize(opt.value)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 9,
                  backgroundColor: isActive ? accentColor : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: isActive ? WHITE : MUTED,
                    fontSize: 14,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Step 4: Review + Launch ─────────────────────────────────────────────────
function Step4({
  habitName,
  selectedColor,
  identityText,
  anchorText,
  startSize,
  neverMissTwice,
  setNeverMissTwice,
  accentColor,
}: {
  habitName: string;
  selectedColor: string;
  identityText: string;
  anchorText: string;
  startSize: StartSize;
  neverMissTwice: boolean;
  setNeverMissTwice: (v: boolean) => void;
  accentColor: string;
}) {
  const timeLabelMap: Record<StartSize, string> = {
    "2min": "2 Min",
    "5min": "5 Min",
    "15min": "15 Min",
    "30min": "30 Min",
  };

  return (
    <Animated.View entering={FadeInRight.duration(300)} style={{ gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={{ color: WHITE, fontSize: 22, fontWeight: "700", lineHeight: 28 }}>
          Bereit zum Start?
        </Text>
        <Text style={{ color: MUTED2, fontSize: 15, lineHeight: 22 }}>
          Dein Habit auf einen Blick.
        </Text>
      </View>

      {/* Summary card */}
      <Animated.View
        entering={ZoomIn.duration(280)}
        style={{
          backgroundColor: CARD,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Top gradient bar (simulated without LinearGradient) */}
        <View
          style={{
            height: 5,
            backgroundColor: accentColor,
            opacity: 1,
          }}
        />

        <View style={{ padding: 20, gap: 12 }}>
          {/* Color dot + Name */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: selectedColor,
                shadowColor: selectedColor,
                shadowOpacity: 0.7,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 0 },
                elevation: 4,
              }}
            />
            <Text style={{ color: WHITE, fontSize: 22, fontWeight: "700", flex: 1 }}>
              {habitName}
            </Text>
          </View>

          {/* Identity */}
          <Text style={{ color: MUTED2, fontSize: 15, lineHeight: 22 }}>
            {identityText}
          </Text>

          {/* Hairline */}
          <View style={{ height: 1, backgroundColor: SEPARATOR }} />

          {/* Implementation intention */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3, alignItems: "baseline" }}>
            <Text style={{ color: "#E5E5EA", fontSize: 14, fontWeight: "500" }}>Nachdem ich</Text>
            <Text style={{ color: accentColor, fontSize: 14, fontWeight: "600" }}> {anchorText},</Text>
            <Text style={{ color: "#E5E5EA", fontSize: 14, fontWeight: "500" }}> werde ich</Text>
            <Text style={{ color: accentColor, fontSize: 14, fontWeight: "600" }}> {habitName}</Text>
            <Text style={{ color: "#E5E5EA", fontSize: 14, fontWeight: "500" }}> für</Text>
            <Text style={{ color: MUTED, fontSize: 14, fontWeight: "500" }}> {timeLabelMap[startSize]}.</Text>
          </View>
        </View>
      </Animated.View>

      {/* Never-miss-twice toggle */}
      <View
        style={{
          backgroundColor: CARD,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            gap: 14,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>
              Nie zweimal auslassen
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 3, lineHeight: 18 }}>
              Wenn du einen Tag verpasst, komm am nächsten zurück.
            </Text>
          </View>
          <Switch
            value={neverMissTwice}
            onValueChange={setNeverMissTwice}
            trackColor={{ true: accentColor, false: SURFACE }}
            thumbColor={WHITE}
          />
        </View>
      </View>

      {/* Jemanden hinzufügen — Soon */}
      <View style={{ opacity: 0.6 }}>
        <View
          style={{
            backgroundColor: CARD,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            gap: 14,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>
              Jemanden hinzufügen
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>
              Gemeinsam stärker bleiben
            </Text>
          </View>
          <View
            style={{
              backgroundColor: SURFACE2,
              borderRadius: 6,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ color: MUTED, fontSize: 10, fontWeight: "600" }}>
              SOON
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NewHabitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { mutate: send, isPending } = useDispatch();

  // Form state
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Step 2
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customIdentity, setCustomIdentity] = useState("");
  const [showCustomIdentity, setShowCustomIdentity] = useState(false);

  // Step 3
  const [selectedAnchor, setSelectedAnchor] = useState<string | null>(null);
  const [customAnchor, setCustomAnchor] = useState("");
  const [showCustomAnchor, setShowCustomAnchor] = useState(false);
  const [startSize, setStartSize] = useState<StartSize>("5min");

  // Step 4
  const [neverMissTwice, setNeverMissTwice] = useState(true);

  // Launch state
  const [launched, setLaunched] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // Derived values
  const accentColor = selectedColor ?? HABIT_COLORS[0];
  const identityText = showCustomIdentity
    ? customIdentity.trim()
    : (selectedPreset ?? "");
  const anchorText = showCustomAnchor
    ? customAnchor.trim()
    : (selectedAnchor ?? "");

  // ── Validation ──────────────────────────────────────────────────────────────
  function canProceed(): boolean {
    if (step === 1) return name.trim().length > 0 && selectedColor !== null;
    if (step === 2) {
      if (showCustomIdentity) return customIdentity.trim().length > 0;
      return selectedPreset !== null;
    }
    if (step === 3) {
      if (showCustomAnchor) return customAnchor.trim().length > 0;
      return selectedAnchor !== null;
    }
    return true; // step 4
  }

  const isValid = canProceed();

  // ── Navigation ──────────────────────────────────────────────────────────────
  function handleBack() {
    if (step === 1) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } else {
      setStep((s) => s - 1);
    }
  }

  function handleNext() {
    if (!isValid) return;
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      handleLaunch();
    }
  }

  function handleLaunch() {
    if (launched || isPending) return;
    setDispatchError(null);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    send(
      {
        type: "CREATE_HABIT",
        payload: {
          name: name.trim(),
          color: accentColor,
          identityStatement: identityText || undefined,
          cue: anchorText,
          startSize,
          neverMissTwice,
          frequency: "daily",
          isActive: true,
        },
      },
      {
        onSuccess: (result) => {
          if (result.ok) {
            setLaunched(true);
            setTimeout(() => {
              router.replace("/");
            }, 600);
          } else {
            setDispatchError(result.error ?? "Unbekannter Fehler");
          }
        },
      }
    );
  }

  // ── CTA label ───────────────────────────────────────────────────────────────
  const ctaLabel = launched ? "Gestartet ✓" : step < 4 ? "Weiter →" : "Habit starten →";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: BG }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Frosted header (fallback: solid dark) */}
      <View
        style={{
          backgroundColor: "rgba(10,10,15,0.72)",
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 16,
          gap: 14,
        }}
      >
        {/* Row: back/close + step indicator */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Pressable onPress={handleBack} hitSlop={12}>
            {step === 1 ? (
              <X color={accentColor} size={22} />
            ) : (
              <ChevronLeft color={accentColor} size={24} />
            )}
          </Pressable>
          <StepIndicator currentStep={step} accentColor={accentColor} />
        </View>

        {/* Step label */}
        <View>
          <Text style={{ color: MUTED, fontSize: 12, fontWeight: "600", letterSpacing: 0.8 }}>
            SCHRITT {step} VON 4
          </Text>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
          gap: 0,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <Step1
            name={name}
            setName={setName}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        )}

        {step === 2 && (
          <Step2
            selectedPreset={selectedPreset}
            setSelectedPreset={setSelectedPreset}
            customIdentity={customIdentity}
            setCustomIdentity={setCustomIdentity}
            showCustom={showCustomIdentity}
            setShowCustom={setShowCustomIdentity}
            accentColor={accentColor}
          />
        )}

        {step === 3 && (
          <Step3
            habitName={name}
            selectedAnchor={selectedAnchor}
            setSelectedAnchor={setSelectedAnchor}
            customAnchor={customAnchor}
            setCustomAnchor={setCustomAnchor}
            showCustomAnchor={showCustomAnchor}
            setShowCustomAnchor={setShowCustomAnchor}
            startSize={startSize}
            setStartSize={setStartSize}
            accentColor={accentColor}
          />
        )}

        {step === 4 && (
          <Step4
            habitName={name}
            selectedColor={accentColor}
            identityText={identityText}
            anchorText={anchorText}
            startSize={startSize}
            neverMissTwice={neverMissTwice}
            setNeverMissTwice={setNeverMissTwice}
            accentColor={accentColor}
          />
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 16,
          paddingTop: 12,
          backgroundColor: BG,
          gap: 8,
        }}
      >
        {dispatchError && (
          <Text style={{ color: "#FF6B6B", fontSize: 13, textAlign: "center" }}>
            {dispatchError}
          </Text>
        )}
        <CtaButton
          label={ctaLabel}
          onPress={handleNext}
          disabled={!isValid || launched || isPending}
          accentColor={accentColor}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
