import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { Trash2, ChevronRight, Plus } from "lucide-react-native";
import { useHabitList, useDispatch } from "../../src/data";
import { EmptyState } from "../../src/components/EmptyState";
import { HabitEmblem } from "../../src/components/HabitEmblem";
import { COLORS, FONTS } from "../../src/theme";
import { HABIT_COLORS } from "../../src/theme/habitColors";

export default function HabitsScreen() {
  const { active: activeHabits, isLoading } = useHabitList();
  const { mutate: send } = useDispatch();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleArchive = (id: string, name: string) => {
    Alert.alert(
      "Gewohnheit archivieren",
      `"${name}" archivieren?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Archivieren",
          style: "destructive",
          onPress: () => send({ type: "ARCHIVE_HABIT", payload: { id } }),
        },
      ]
    );
  };

  const renderRightActions = (id: string, name: string) => (
    <Pressable
      onPress={() => handleArchive(id, name)}
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

  if (isLoading) {
    return <ActivityIndicator color={COLORS.accent} style={{ flex: 1, marginTop: 100 }} />;
  }

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
          {activeHabits.map((habit) => (
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
                <View style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center" }}>
                  <HabitEmblem emoji={habit.emoji} color={habit.color || HABIT_COLORS[0]} size={28} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONTS.medium, color: COLORS.text, fontSize: 15 }}>
                    {habit.name}
                  </Text>
                  {habit.category && habit.category !== "other" && (
                    <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
                      {habit.category}
                    </Text>
                  )}
                </View>
                <ChevronRight color={COLORS.muted} size={18} />
              </Pressable>
            </Swipeable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
