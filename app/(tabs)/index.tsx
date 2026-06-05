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
import { xpForCheckOff } from "../../src/utils/xp";
import { COLORS, FONTS } from "../../src/theme";

export default function TodayScreen() {
  useHabitRealtime();
  const { items: activeHabits, isLoading } = useTodayDashboard();
  const { mutate: send } = useDispatch();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [checkOffToast, setCheckOffToast] = useState<{ xp: number; reward: string } | null>(null);

  const completedCount = activeHabits.filter((h) => h.isCompletedToday).length;
  const isAllDone = activeHabits.length > 0 && completedCount === activeHabits.length;

  const [showDoneBanner, setShowDoneBanner] = useState(false);
  const bannerOpacity    = useRef(new Animated.Value(0)).current;
  const bannerTranslateY = useRef(new Animated.Value(16)).current;
  const isAllDoneRef     = useRef(isAllDone);

  useEffect(() => {
    isAllDoneRef.current = isAllDone;
    // Hide banner if a habit gets unchecked
    if (!isAllDone) setShowDoneBanner(false);
  }, [isAllDone]);

  const triggerDoneBanner = () => {
    setShowDoneBanner(true);
    bannerOpacity.setValue(0);
    bannerTranslateY.setValue(16);
    Animated.parallel([
      Animated.timing(bannerOpacity,    { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(bannerTranslateY, { toValue: 0, friction: 7,   useNativeDriver: true }),
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
    <View
      style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: 16, paddingBottom: 8 }}>
          <Text
            style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.text }}
          >
            {greeting}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 2 }}>
            {today}
          </Text>
        </View>

        {/* Progress Ring + All-Done Banner */}
        {activeHabits.length > 0 && (
          <View style={{ alignItems: "center", paddingTop: 32, paddingBottom: 8 }}>
            <ProgressRing
              completed={completedCount}
              total={activeHabits.length}
              isComplete={isAllDone}
            />

            {showDoneBanner && (
              <Animated.View
                style={{
                  opacity: bannerOpacity,
                  transform: [{ translateY: bannerTranslateY }],
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

      {/* Check-off Toast — tap to dismiss; triggers All-Done banner if all habits done */}
      <XPToast
        xp={checkOffToast?.xp ?? null}
        reward={checkOffToast?.reward}
        onDone={() => {
          setCheckOffToast(null);
          if (isAllDoneRef.current) triggerDoneBanner();
        }}
      />

    </View>
  );
}
