import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useHabitStore } from "../../src/store/useHabitStore";
import { ProgressRing } from "../../src/components/ProgressRing";
import { HabitCard } from "../../src/components/HabitCard";
import { EmptyState } from "../../src/components/EmptyState";
import { RewardModal } from "../../src/components/RewardModal";
import { isCompletedToday } from "../../src/utils/streaks";
import { COLORS, FONTS } from "../../src/theme";

export default function TodayScreen() {
  const { habits, checkoffs, toggleCheckOff } = useHabitStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [rewardHabit, setRewardHabit] = useState<{
    name: string;
    emoji: string;
    reward: string;
  } | null>(null);

  const activeHabits = habits.filter((h) => h.isActive);
  const completedCount = activeHabits.filter((h) =>
    isCompletedToday(h.id, checkoffs)
  ).length;

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

  const handleChecked = (id: string) => {
    const habit = habits.find((h) => h.id === id);
    if (habit) {
      setRewardHabit({ name: habit.name, emoji: habit.emoji, reward: habit.reward });
    }
  };

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

        {/* Progress Ring */}
        {activeHabits.length > 0 && (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <ProgressRing completed={completedCount} total={activeHabits.length} />
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
                emoji={habit.emoji}
                identityStatement={habit.identityStatement}
                cue={habit.cue}
                craving={habit.craving}
                response={habit.response}
                reward={habit.reward}
                checkoffs={checkoffs}
                onToggle={toggleCheckOff}
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

      {/* Reward Modal */}
      <RewardModal
        visible={rewardHabit !== null}
        habitName={rewardHabit?.name ?? ""}
        habitEmoji={rewardHabit?.emoji ?? ""}
        reward={rewardHabit?.reward ?? ""}
        onClose={() => setRewardHabit(null)}
      />
    </View>
  );
}
