import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Flame, Trophy, CheckCircle2, Target, Edit2, Check } from "lucide-react-native";
import { useHabits, useHabitStats, useDispatch } from "../../src/data";
import { getWeeklyCompletions } from "../../src/utils/streaks";
import { COLORS, FONTS } from "../../src/theme";
import { ColorPicker } from "../../src/components/ColorPicker";

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  unit,
}: {
  icon: typeof Flame;
  iconColor: string;
  label: string;
  value: number | string;
  unit: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <Icon color={iconColor} size={16} />
        <Text style={{ color: COLORS.muted, fontSize: 11 }}>{label}</Text>
      </View>
      <Text style={{ fontFamily: FONTS.mono, fontSize: 28, color: COLORS.text }}>
        {value}
      </Text>
      <Text style={{ color: COLORS.muted, fontSize: 11 }}>{unit}</Text>
    </View>
  );
}

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { mutate: send } = useDispatch();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const yearStart = `${new Date().getFullYear()}-01-01`;
  const today = new Date().toISOString().split("T")[0];
  const { data: stats, isLoading: statsLoading } = useHabitStats(id ?? "", {
    from: yearStart,
    to: today,
  });

  const habit = habits?.find((h) => h.id === id);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(habit?.name ?? "");
  const [editEmoji, setEditEmoji] = useState(habit?.emoji ?? "");
  const [editColor, setEditColor] = useState(habit?.color ?? '#7C3AED');

  if (habitsLoading || statsLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: COLORS.muted }}>Habit not found</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.accent }}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const streak = stats?.streak.current ?? 0;
  const bestStreak = stats?.streak.record ?? 0;
  const totalCompletions = stats?.totalCheckOffs ?? 0;
  const weeklyCompletions = getWeeklyCompletions(habit.id, stats?.checkoffs ?? []);

  const yearData = Array.from({ length: 365 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (364 - i));
    const dateStr = d.toISOString().split("T")[0];
    return { date: dateStr, completed: !!(stats?.completionByDay[dateStr]) };
  });

  const weeks: { date: string; completed: boolean }[][] = [];
  for (let i = 0; i < yearData.length; i += 7) {
    weeks.push(yearData.slice(i, i + 7));
  }

  const handleSave = () => {
    send({ type: "UPDATE_HABIT", payload: { id: habit.id, name: editName, emoji: editEmoji, color: editColor } });
    setEditMode(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, paddingTop: insets.top }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()}>
            <ChevronLeft color={COLORS.muted} size={24} />
          </Pressable>
          {editMode ? (
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <TextInput
                value={editEmoji}
                onChangeText={setEditEmoji}
                style={{ color: COLORS.text, fontSize: 22 }}
                maxLength={2}
              />
              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={{
                  color: COLORS.text,
                  fontFamily: FONTS.display,
                  fontSize: 18,
                  borderBottomWidth: 1,
                  borderBottomColor: COLORS.accent,
                  minWidth: 120,
                }}
              />
            </View>
          ) : (
            <Text style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.text }}>
              {habit.emoji} {habit.name}
            </Text>
          )}
        </View>
        <Pressable
          onPress={
            editMode
              ? handleSave
              : () => {
                  setEditName(habit.name);
                  setEditEmoji(habit.emoji ?? "");
                  setEditColor(habit.color ?? "#7C3AED");
                  setEditMode(true);
                }
          }
        >
          {editMode ? (
            <Check color={COLORS.success} size={22} />
          ) : (
            <Edit2 color={COLORS.muted} size={20} />
          )}
        </Pressable>
      </View>

      {editMode && (
        <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
          <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13, marginBottom: 8 }}>
            Color
          </Text>
          <ColorPicker value={editColor} onChange={setEditColor} />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <Pressable
              onPress={() => setEditMode(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: COLORS.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.muted, fontFamily: FONTS.medium }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: editColor,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontFamily: FONTS.medium }}>Save</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <StatCard
            icon={Flame}
            iconColor={COLORS.warning}
            label="Current Streak"
            value={streak}
            unit="days"
          />
          <StatCard
            icon={Trophy}
            iconColor={COLORS.warning}
            label="Best Streak"
            value={bestStreak}
            unit="days"
          />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          <StatCard
            icon={CheckCircle2}
            iconColor={COLORS.success}
            label="Total"
            value={totalCompletions}
            unit="completions"
          />
          <StatCard
            icon={Target}
            iconColor={COLORS.accent}
            label="This Week"
            value={`${weeklyCompletions}/7`}
            unit="days"
          />
        </View>

        {/* Year Heatmap */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.medium,
              fontSize: 15,
              color: COLORS.text,
              marginBottom: 14,
            }}
          >
            Year Progress
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {weeks.map((week, wi) => (
                <View key={wi} style={{ flexDirection: "column", gap: 3 }}>
                  {week.map((day, di) => (
                    <View
                      key={di}
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 2,
                        backgroundColor: day.completed ? COLORS.accent : COLORS.border,
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
            <Text style={{ color: COLORS.muted, fontSize: 11 }}>Less</Text>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS.border }} />
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: `${COLORS.accent}80` }} />
              <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: COLORS.accent }} />
            </View>
            <Text style={{ color: COLORS.muted, fontSize: 11 }}>More</Text>
          </View>
        </View>

        {/* Habit Info */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.border,
            borderWidth: 1,
            borderRadius: 12,
            padding: 20,
            gap: 12,
          }}
        >
          <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: COLORS.text }}>
            Habit Details
          </Text>
          {[
            { label: "Cue", value: habit.cue },
            { label: "Craving", value: habit.craving },
            { label: "Response", value: habit.response },
            { label: "Reward", value: habit.reward },
          ]
            .filter((item) => item.value)
            .map((item) => (
              <View key={item.label}>
                <Text style={{ color: COLORS.muted, fontSize: 11, marginBottom: 2 }}>
                  {item.label}
                </Text>
                <Text style={{ color: COLORS.text, fontSize: 14 }}>{item.value}</Text>
              </View>
            ))}
          {habit.identityStatement && (
            <View
              style={{
                backgroundColor: `${COLORS.accent}15`,
                borderRadius: 8,
                padding: 12,
                marginTop: 4,
              }}
            >
              <Text style={{ color: COLORS.accent, fontSize: 13, fontStyle: "italic" }}>
                "I am someone who {habit.identityStatement}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
