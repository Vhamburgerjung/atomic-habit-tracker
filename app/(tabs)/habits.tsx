import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { Trash2, ChevronRight, Plus } from "lucide-react-native";
import { useHabitStore } from "../../src/store/useHabitStore";
import { EmptyState } from "../../src/components/EmptyState";
import { getStreak } from "../../src/utils/streaks";
import { COLORS, FONTS } from "../../src/theme";

export default function HabitsScreen() {
  const { habits, checkoffs, deleteHabit } = useHabitStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const activeHabits = habits.filter((h) => h.isActive);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Habit",
      `Delete "${name}" and all its history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteHabit(id),
        },
      ]
    );
  };

  const renderRightActions = (id: string, name: string) => (
    <Pressable
      onPress={() => handleDelete(id, name)}
      style={{
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        width: 72,
        borderRadius: 12,
        marginBottom: 12,
      }}
    >
      <Trash2 color="white" size={20} />
    </Pressable>
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.text }}>
          My Habits
        </Text>
        <Pressable onPress={() => router.push("/habit/new")}>
          <Plus color={COLORS.accent} size={24} />
        </Pressable>
      </View>

      {activeHabits.length === 0 ? (
        <EmptyState onPress={() => router.push("/habit/new")} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
        >
          {activeHabits.map((habit) => {
            const streak = getStreak(habit.id, checkoffs);
            return (
              <Swipeable
                key={habit.id}
                renderRightActions={() => renderRightActions(habit.id, habit.name)}
                overshootRight={false}
              >
                <Pressable
                  onPress={() => router.push(`/habit/${habit.id}`)}
                  style={{
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{habit.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.medium, color: COLORS.text, fontSize: 15 }}>
                      {habit.name}
                    </Text>
                    <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
                      🔥 {streak} day streak
                    </Text>
                  </View>
                  <ChevronRight color={COLORS.muted} size={18} />
                </Pressable>
              </Swipeable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
