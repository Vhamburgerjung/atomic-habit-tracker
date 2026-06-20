# All-Done Celebration Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When all habits are completed, trigger a multi-layer celebration after XPToast dismiss: 12 ring burst lines, crown 👑 drop, gold SVG pulse, 14 confetti particles, and a scale-pop banner.

**Architecture:** Three files change. `ConfettiBlast.tsx` (new) renders 14 full-screen Reanimated particles from the ring area. `ProgressRing.tsx` gains a `celebrationKey` prop that fires a `BurstLine` sub-component (12 radial lines), a crown drop, and a gold SVG pulse. `index.tsx` renames `triggerDoneBanner` → `triggerCelebration`, adds `celebrationKey` state, wires both components.

**Tech Stack:** react-native-reanimated v4 (`useSharedValue`, `useAnimatedStyle`, `withSpring`, `withTiming`, `withDelay`, `withSequence`, `Easing`), React Native `Animated` (SVG gold pulse, existing scale pulse), react-native-svg (`AnimatedCircle`)

---

### Task 1: Create `src/components/ConfettiBlast.tsx`

**Files:**
- Create: `atomic-habit-tracker-expo/src/components/ConfettiBlast.tsx`

- [ ] **Step 1: Create the file with the complete implementation**

Create `atomic-habit-tracker-expo/src/components/ConfettiBlast.tsx`:

```tsx
import { useEffect, useMemo } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ORIGIN_X = SCREEN_WIDTH / 2;
const ORIGIN_Y = 300;

const PALETTE = ["#FFD700", "#7C3AED", "#10B981", "#9F67FF", "#06B6D4"];

interface ParticleConfig {
  color: string;
  tx: number;
  ty: number;
  rotation: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
}

function makeParticles(): ParticleConfig[] {
  return [
    { tx: -140, ty: 320, rotation: 200, delay: 0,   duration: 1100, width: 8,  height: 10 },
    { tx:  120, ty: 280, rotation: 520, delay: 30,  duration: 900,  width: 6,  height: 8  },
    { tx: -60,  ty: 400, rotation: 360, delay: 60,  duration: 1200, width: 8,  height: 6  },
    { tx:  80,  ty: 380, rotation: 180, delay: 20,  duration: 1000, width: 6,  height: 10 },
    { tx: -110, ty: 260, rotation: 440, delay: 90,  duration: 1050, width: 8,  height: 8  },
    { tx:  150, ty: 350, rotation: 300, delay: 10,  duration: 950,  width: 6,  height: 6  },
    { tx: -30,  ty: 420, rotation: 600, delay: 75,  duration: 1150, width: 8,  height: 10 },
    { tx:  60,  ty: 240, rotation: 160, delay: 45,  duration: 1000, width: 6,  height: 8  },
    { tx: -160, ty: 300, rotation: 480, delay: 100, duration: 1100, width: 8,  height: 6  },
    { tx:  100, ty: 420, rotation: 240, delay: 55,  duration: 1050, width: 6,  height: 10 },
    { tx: -80,  ty: 360, rotation: 720, delay: 130, duration: 1200, width: 8,  height: 8  },
    { tx:  40,  ty: 310, rotation: 400, delay: 15,  duration: 900,  width: 6,  height: 6  },
    { tx: -120, ty: 200, rotation: 280, delay: 80,  duration: 1000, width: 8,  height: 10 },
    { tx:  130, ty: 230, rotation: 560, delay: 40,  duration: 1100, width: 6,  height: 8  },
  ].map((p, i) => ({ ...p, color: PALETTE[i % PALETTE.length] }));
}

function ConfettiParticle({ config, triggerKey }: { config: ParticleConfig; triggerKey: number }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    translateX.value = 0;
    translateY.value = 0;
    rotate.value = 0;
    opacity.value = 0;

    const holdMs = Math.max(config.duration - 400, 100);
    translateX.value = withDelay(config.delay, withTiming(config.tx, { duration: config.duration, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(config.delay, withTiming(config.ty, { duration: config.duration, easing: Easing.out(Easing.quad) }));
    rotate.value = withDelay(config.delay, withTiming(config.rotation, { duration: config.duration, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(
      config.delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(1, { duration: holdMs }),
        withTiming(0, { duration: 300 })
      )
    );
  }, [triggerKey]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: ORIGIN_Y,
          left: ORIGIN_X,
          width: config.width,
          height: config.height,
          borderRadius: 2,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  );
}

interface ConfettiBlastProps {
  triggerKey: number;
}

export function ConfettiBlast({ triggerKey }: ConfettiBlastProps) {
  const particles = useMemo(() => makeParticles(), []);

  return (
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      pointerEvents="none"
    >
      {particles.map((config, i) => (
        <ConfettiParticle key={i} config={config} triggerKey={triggerKey} />
      ))}
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd atomic-habit-tracker-expo && npx tsc --noEmit
```

Expected: no errors in `src/components/ConfettiBlast.tsx`.

---

### Task 2: Update `src/components/ProgressRing.tsx`

**Files:**
- Modify: `atomic-habit-tracker-expo/src/components/ProgressRing.tsx`

Changes:
- Add `celebrationKey?: number` prop
- Add `BurstLine` sub-component: 12 Reanimated radial lines shooting from center outward through ring
- Add gold SVG pulse: second `AnimatedCircle` with animated opacity (React Native `Animated`)
- Add crown 👑 drop: Reanimated `withSpring` bounce-in, auto-fades after 2s via `withSequence`
- Expand outer wrapper to 300px so burst lines at 140px max radius don't clip

- [ ] **Step 1: Replace the entire file**

Replace `atomic-habit-tracker-expo/src/components/ProgressRing.tsx` with:

```tsx
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
  Easing,
} from "react-native-reanimated";
import { COLORS, FONTS } from "../theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GOLD = "#FFD700";
const BURST_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const BURST_RADIUS = 140;

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
        {
          position: "absolute",
          width: 4,
          height: 22,
          borderRadius: 2,
          backgroundColor: color,
        },
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

  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const goldPulseOpacity = useRef(new Animated.Value(0)).current;
  const prevComplete = useRef(false);

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
    if (isComplete && !prevComplete.current) {
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.12, duration: 220, useNativeDriver: true }),
        Animated.spring(pulseScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
      ]).start();
    }
    prevComplete.current = isComplete;
  }, [isComplete]);

  useEffect(() => {
    if (celebrationKey === 0) return;

    // Gold SVG ring flash
    goldPulseOpacity.setValue(0);
    Animated.sequence([
      Animated.timing(goldPulseOpacity, { toValue: 0.8, duration: 200, useNativeDriver: false }),
      Animated.timing(goldPulseOpacity, { toValue: 0, duration: 500, useNativeDriver: false }),
    ]).start();

    // Crown: bounce in, hold, fade out
    crownY.value = -50;
    crownOpacity.value = 0;
    crownY.value = withDelay(150, withSpring(0, { damping: 8, stiffness: 120 }));
    crownOpacity.value = withDelay(
      150,
      withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 300 })
      )
    );
  }, [celebrationKey]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const strokeColor = isComplete ? GOLD : COLORS.accent;
  const textColor = isComplete ? GOLD : COLORS.text;
  const subColor = isComplete ? GOLD : COLORS.muted;

  const crownStyle = useAnimatedStyle(() => ({
    opacity: crownOpacity.value,
    transform: [{ translateY: crownY.value }],
  }));

  return (
    // 300px outer wrapper so burst lines at max 140px don't clip
    <View style={{ width: 300, height: 300, alignItems: "center", justifyContent: "center" }}>
      {/* 12 burst lines — shoot from center outward on celebrationKey */}
      {BURST_ANGLES.map((angleDeg) => (
        <BurstLine
          key={angleDeg}
          triggerKey={celebrationKey}
          angleDeg={angleDeg}
          color={angleDeg % 60 === 0 ? GOLD : COLORS.accentLight}
        />
      ))}

      {/* Ring + center text with existing scale pulse */}
      <Animated.View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pulseScale }],
        }}
      >
        <Svg
          width={size}
          height={size}
          style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
        >
          {/* Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.border}
            strokeWidth={10}
            fill="none"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
          {/* Gold pulse — full circle, flashes on celebration */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={GOLD}
            strokeWidth={14}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={0}
            opacity={goldPulseOpacity}
          />
        </Svg>

        <Text style={{ fontFamily: FONTS.display, fontSize: 48, color: textColor }}>
          {completed}
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 13 }}>of {total}</Text>
        <Text style={{ color: subColor, fontSize: 11 }}>
          {Math.round(percentage * 100)}%
        </Text>

        {/* Crown overlay — centered over text, bounces in then fades */}
        <ReAnimated.View
          style={[
            { position: "absolute", alignItems: "center", justifyContent: "center" },
            crownStyle,
          ]}
        >
          <Text style={{ fontSize: 44 }}>👑</Text>
        </ReAnimated.View>
      </Animated.View>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors in `src/components/ProgressRing.tsx`.

---

### Task 3: Update `app/(tabs)/index.tsx`

**Files:**
- Modify: `atomic-habit-tracker-expo/app/(tabs)/index.tsx`

Changes:
- Add `celebrationKey` state (`useState<number>(0)`)
- Add `bannerScale` Animated value
- Rename `triggerDoneBanner` → `triggerCelebration`; add `setCelebrationKey(k => k + 1)` and `bannerScale` spring
- Pass `celebrationKey` to `<ProgressRing>`
- Import and render `<ConfettiBlast triggerKey={celebrationKey} />`

- [ ] **Step 1: Replace the entire file**

Replace `atomic-habit-tracker-expo/app/(tabs)/index.tsx` with:

```tsx
import { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useTodayDashboard, useDispatch, useHabitRealtime } from "../../src/data";
import { ProgressRing } from "../../src/components/ProgressRing";
import { HabitCard } from "../../src/components/HabitCard";
import { EmptyState } from "../../src/components/EmptyState";
import { XPToast } from "../../src/components/XPToast";
import { ConfettiBlast } from "../../src/components/ConfettiBlast";
import { xpForCheckOff } from "../../src/utils/xp";
import { COLORS, FONTS } from "../../src/theme";

export default function TodayScreen() {
  useHabitRealtime();
  const { items: activeHabits, isLoading } = useTodayDashboard();
  const { mutate: send } = useDispatch();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [checkOffToast, setCheckOffToast] = useState<{ xp: number; reward: string } | null>(null);
  const [celebrationKey, setCelebrationKey] = useState(0);

  const completedCount = activeHabits.filter((h) => h.isCompletedToday).length;
  const isAllDone = activeHabits.length > 0 && completedCount === activeHabits.length;

  const [showDoneBanner, setShowDoneBanner] = useState(false);
  const bannerOpacity    = useRef(new Animated.Value(0)).current;
  const bannerTranslateY = useRef(new Animated.Value(16)).current;
  const bannerScale      = useRef(new Animated.Value(0.85)).current;
  const isAllDoneRef     = useRef(isAllDone);

  useEffect(() => {
    isAllDoneRef.current = isAllDone;
    if (!isAllDone) setShowDoneBanner(false);
  }, [isAllDone]);

  const triggerCelebration = () => {
    setCelebrationKey((k) => k + 1);
    setShowDoneBanner(true);
    bannerOpacity.setValue(0);
    bannerTranslateY.setValue(16);
    bannerScale.setValue(0.85);
    Animated.parallel([
      Animated.timing(bannerOpacity,    { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(bannerTranslateY, { toValue: 0, friction: 7,   useNativeDriver: true }),
      Animated.spring(bannerScale,      { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
    ]).start();
  };

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
      ? "Good afternoon"
      : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleToggle = (habitId: string) => {
    const dateStr = new Date().toISOString().split("T")[0];
    send({ type: "TOGGLE_CHECKOFF", payload: { habitId, date: dateStr } });
  };

  const handleChecked = (id: string) => {
    const habit = activeHabits.find((h) => h.id === id);
    if (!habit) return;
    const newStreak = habit.currentStreak + 1;
    setCheckOffToast({ xp: xpForCheckOff(newStreak), reward: habit.reward });
  };

  if (isLoading) {
    return <ActivityIndicator color={COLORS.accent} style={{ flex: 1, marginTop: 100 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.text }}>
            {greeting}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>{today}</Text>
        </View>

        {/* Progress Ring + All-Done Banner */}
        {activeHabits.length > 0 && (
          <View style={{ alignItems: "center", paddingTop: 32, paddingBottom: 8 }}>
            <ProgressRing
              completed={completedCount}
              total={activeHabits.length}
              isComplete={isAllDone}
              celebrationKey={celebrationKey}
            />

            {showDoneBanner && (
              <Animated.View
                style={{
                  opacity: bannerOpacity,
                  transform: [{ translateY: bannerTranslateY }, { scale: bannerScale }],
                  marginTop: 20,
                  width: "100%",
                  backgroundColor: "#1A1A2E",
                  borderColor: "#FFD70040",
                  borderWidth: 1,
                  borderRadius: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 28, marginBottom: 4 }}>🏆</Text>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 17,
                    color: "#FFD700",
                    textAlign: "center",
                  }}
                >
                  All done for today.
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.body,
                    fontSize: 13,
                    color: COLORS.muted,
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  You're becoming someone who follows through.
                </Text>
              </Animated.View>
            )}

            <View style={{ height: 24 }} />
          </View>
        )}

        {/* Habit List or Empty State */}
        {activeHabits.length === 0 ? (
          <EmptyState onPress={() => router.push("/habit/new")} />
        ) : (
          <View>
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 16,
                color: COLORS.text,
                marginBottom: 12,
              }}
            >
              Today's Habits
            </Text>
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                name={habit.name}
                emoji={habit.emoji ?? ""}
                identityStatement={habit.identityStatement}
                cue={habit.cue}
                craving={habit.craving}
                response={habit.response}
                reward={habit.reward}
                isCompletedToday={habit.isCompletedToday}
                streak={habit.currentStreak}
                isStreakFrozen={habit.isStreakFrozen}
                recentDays={habit.recentDays}
                onToggle={handleToggle}
                onChecked={handleChecked}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      {activeHabits.length > 0 && (
        <Pressable
          onPress={() => router.push("/habit/new")}
          style={{
            position: "absolute",
            bottom: insets.bottom + 80,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: COLORS.accent,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: COLORS.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Plus color="white" size={26} />
        </Pressable>
      )}

      {/* Confetti — full-screen pointer-events-none overlay */}
      <ConfettiBlast triggerKey={celebrationKey} />

      {/* XP Toast — triggers celebration after dismiss if all done */}
      <XPToast
        xp={checkOffToast?.xp ?? null}
        reward={checkOffToast?.reward}
        onDone={() => {
          setCheckOffToast(null);
          if (isAllDoneRef.current) triggerCelebration();
        }}
      />
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start Expo and verify on device**

```bash
npx expo start --clear
```

Open in Expo Go on Android. Test checklist:
1. Complete all habits one by one — each check-off works normally
2. Last habit checked → XPToast appears
3. Dismiss XPToast → all animations fire simultaneously:
   - 12 burst lines radiate from ring center outward and fade
   - Ring flashes gold for ~700ms
   - 👑 bounces into ring center (spring overshoot)
   - 14 confetti particles fan out from ring area and fade
   - "All done" banner pops in with scale + slide
4. Crown fades away after ~2.5s, normal counter text reappears
5. Unchecking any habit hides banner, no crash
6. Re-checking to all-done again: dismiss XPToast → celebration fires again
7. No red error screen on launch
