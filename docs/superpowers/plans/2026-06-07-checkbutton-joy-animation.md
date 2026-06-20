# CheckButton Joy Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static check circle in HabitCard with an animated CheckButton that plays a ripple fill + sparkle burst on completion, and adds an animated border glow to the card.

**Architecture:** A new `CheckButton` component owns all check-circle animation (ripple fill, 6 sparkle line segments, checkmark scale-in). `HabitCard` imports it, owns haptics + card border-glow animation, and passes `handleToggle` as `onPress`. No new packages required.

**Tech Stack:** react-native-reanimated 4.3.1, expo-haptics (already installed), lucide-react-native (Check icon, already installed)

---

### Task 1: Create `src/components/CheckButton.tsx`

**Files:**
- Create: `atomic-habit-tracker-expo/src/components/CheckButton.tsx`

- [ ] **Step 1: Create the file with the complete implementation**

Create `atomic-habit-tracker-expo/src/components/CheckButton.tsx` with this exact content:

```tsx
import { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { COLORS } from "../theme";

const SPARKLE_RADIUS = 20;
const SPARKLE_ANGLES = [0, 60, 120, 180, 240, 300];

interface SparkleSegmentProps {
  triggerKey: number;
  angleDeg: number;
  color: string;
}

function SparkleSegment({ triggerKey, angleDeg, color }: SparkleSegmentProps) {
  const scale = useSharedValue(0);
  const translate = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    // Reset then animate — cancels any in-flight animation
    scale.value = 0;
    translate.value = 0;
    scale.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 200 })
    );
    translate.value = withSequence(
      withTiming(SPARKLE_RADIUS, { duration: 280 }),
      withTiming(0, { duration: 0 })
    );
  }, [triggerKey]);

  const angle = (angleDeg * Math.PI) / 180;

  const animStyle = useAnimatedStyle(() => ({
    opacity: scale.value,
    transform: [
      { rotate: `${angleDeg}deg` },
      // Translate outward in the direction of angleDeg from 12 o'clock
      { translateX: translate.value * Math.sin(angle) },
      { translateY: -translate.value * Math.cos(angle) },
      { scaleY: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 2,
          height: 8,
          borderRadius: 1,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

interface CheckButtonProps {
  isCompleted: boolean;
  accentColor: string;
  onPress: () => void;
}

export function CheckButton({ isCompleted, accentColor, onPress }: CheckButtonProps) {
  const rippleScale = useSharedValue(isCompleted ? 1 : 0);
  const borderOpacity = useSharedValue(isCompleted ? 0 : 1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handlePress = () => {
    if (!isCompleted) {
      // Completing: ripple expands, border fades, checkmark flies in, sparkles burst
      rippleScale.value = withSpring(1, { damping: 14, stiffness: 180 });
      borderOpacity.value = withTiming(0, { duration: 200 });
      checkScale.value = withDelay(180, withSpring(1, { damping: 12, stiffness: 200 }));
      setSparkleKey((k) => k + 1);
    } else {
      // Uncompleting: reverse — fill fades, border returns, checkmark disappears
      rippleScale.value = withTiming(0, { duration: 200 });
      borderOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withTiming(0, { duration: 150 });
    }
    onPress();
  };

  return (
    <View
      style={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
      }}
    >
      {/* 6 sparkle line segments positioned at center, radiate outward on trigger */}
      {SPARKLE_ANGLES.map((angleDeg) => (
        <SparkleSegment
          key={angleDeg}
          triggerKey={sparkleKey}
          angleDeg={angleDeg}
          color={accentColor}
        />
      ))}

      {/* Circle border — fades out as ripple fill expands */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 2,
            borderColor: accentColor,
          },
          borderStyle,
        ]}
      />

      {/* Ripple fill — scales from 0 to 1 from center */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: COLORS.success,
          },
          rippleStyle,
        ]}
      />

      {/* Checkmark — scales in with a delay after ripple starts */}
      <Animated.View style={checkStyle}>
        <Check color="white" size={22} />
      </Animated.View>

      {/* Pressable tap target on top of everything */}
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        style={{
          position: "absolute",
          width: 44,
          height: 44,
          borderRadius: 22,
        }}
      />
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles (run from the expo project root)**

```bash
cd atomic-habit-tracker-expo && npx tsc --noEmit
```

Expected: no errors in `src/components/CheckButton.tsx`. Ignore pre-existing errors in other files if any.

- [ ] **Step 3: Commit**

```bash
git add atomic-habit-tracker-expo/src/components/CheckButton.tsx
git commit -m "feat: add CheckButton with ripple fill and sparkle burst animation"
```

---

### Task 2: Update `src/components/HabitCard.tsx`

**Files:**
- Modify: `atomic-habit-tracker-expo/src/components/HabitCard.tsx`

This task:
- Removes the card-level scale bounce (`useSharedValue(1)` + `withSpring(0.95→1)`)
- Adds an animated border glow via `interpolateColor` (0 = `COLORS.border`, 1 = `#10B98180`)
- Replaces the static check circle `Pressable` with `<CheckButton>`
- Keeps haptics in `handleToggle` (unchanged)

- [ ] **Step 1: Replace the entire file**

Replace `atomic-habit-tracker-expo/src/components/HabitCard.tsx` with:

```tsx
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "../theme";
import { CheckButton } from "./CheckButton";

interface HabitCardProps {
  id: string;
  name: string;
  emoji: string;
  identityStatement?: string;
  cue: string;
  craving: string;
  response: string;
  reward: string;
  isCompletedToday: boolean;
  streak: number;
  isStreakFrozen: boolean;
  recentDays: boolean[];
  onToggle: (id: string) => void;
  onChecked: (id: string) => void;
}

export function HabitCard({
  id,
  name,
  emoji,
  identityStatement,
  cue,
  craving,
  response,
  reward,
  isCompletedToday,
  streak,
  isStreakFrozen,
  recentDays,
  onToggle,
  onChecked,
}: HabitCardProps) {
  const router = useRouter();

  // Animated border: 0 = COLORS.border (incomplete), 1 = success glow (complete)
  const borderProgress = useSharedValue(isCompletedToday ? 1 : 0);

  const cardBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.border, `${COLORS.success}80`]
    ),
  }));

  const handleToggle = () => {
    borderProgress.value = withTiming(!isCompletedToday ? 1 : 0, { duration: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isCompletedToday) onChecked(id);
    onToggle(id);
  };

  const streakColor = isStreakFrozen ? "#60A5FA" : COLORS.warning;
  const streakEmoji = isStreakFrozen ? "🧊" : "🔥";

  return (
    <Animated.View
      style={[
        {
          marginBottom: 12,
          borderRadius: 12,
          borderWidth: 1,
        },
        cardBorderStyle,
      ]}
    >
      <Pressable
        onPress={() => router.push(`/habit/${id}`)}
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 28, marginTop: 2 }}>{emoji}</Text>

        <View style={{ flex: 1, gap: 0 }}>
          {/* Name + streak */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.medium,
                color: isCompletedToday ? COLORS.muted : COLORS.text,
                textDecorationLine: isCompletedToday ? "line-through" : "none",
                fontSize: 15,
                flex: 1,
              }}
            >
              {name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={{ fontSize: 11 }}>{streakEmoji}</Text>
              <Text
                style={{
                  fontSize: 12,
                  color: streakColor,
                  fontFamily: FONTS.mono,
                }}
              >
                {streak}d
              </Text>
            </View>
          </View>

          {/* Freeze indicator */}
          {isStreakFrozen && !isCompletedToday && (
            <Text
              style={{
                color: "#60A5FA",
                fontSize: 11,
                marginBottom: 6,
              }}
            >
              🧊 Streak protected — don't miss twice
            </Text>
          )}

          {/* Identity statement */}
          {identityStatement ? (
            <Text
              style={{
                color: COLORS.accent,
                fontSize: 12,
                fontStyle: "italic",
                marginBottom: 10,
              }}
            >
              "I am someone who {identityStatement}"
            </Text>
          ) : null}

          {/* Detail rows */}
          <View style={{ gap: 5, marginBottom: 10 }}>
            {(
              [
                { label: "Cue", value: cue },
                { label: "Craving", value: craving },
                { label: "Response", value: response },
                { label: "Reward", value: reward },
              ] as { label: string; value: string }[]
            )
              .filter((item) => item.value)
              .map((item) => (
                <View key={item.label} style={{ flexDirection: "row", gap: 8 }}>
                  <Text
                    style={{
                      color: COLORS.muted,
                      fontSize: 11,
                      width: 58,
                      marginTop: 1,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{ color: COLORS.text, fontSize: 12, flex: 1, lineHeight: 17 }}
                  >
                    {item.value}
                  </Text>
                </View>
              ))}
          </View>

          {/* 30-day dot grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2, maxWidth: 220 }}>
            {recentDays.map((done, i) => (
              <View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: done ? COLORS.accent : COLORS.border,
                }}
              />
            ))}
          </View>
        </View>

        <CheckButton
          isCompleted={isCompletedToday}
          accentColor={COLORS.accent}
          onPress={handleToggle}
        />
      </Pressable>
    </Animated.View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Start Expo and visually verify in Expo Go**

```bash
npx expo start --clear
```

Open in Expo Go on your Android phone. Verify all of the following:

1. **Ripple fill** — tapping the check circle causes a green fill to expand from the center (not an instant color switch)
2. **Checkmark fly-in** — the white ✓ scales in ~180ms after the ripple starts, with a slight overshoot
3. **Sparkle burst** — 6 short line segments radiate outward from the circle and fade out
4. **Card border glow** — the card border transitions from dark (`#1E1E2E`) to a translucent green
5. **No card squish** — the whole card no longer compresses on tap
6. **Uncomplete** — tapping a completed habit reverses: fill fades, border returns, no sparkles
7. **No red error screen** — app starts cleanly

- [ ] **Step 4: Commit**

```bash
git add atomic-habit-tracker-expo/src/components/HabitCard.tsx
git commit -m "feat: wire CheckButton into HabitCard, add animated border glow"
```
