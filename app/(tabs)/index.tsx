import { useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useTodayDashboard, useHabitRealtime } from "../../src/data";
import { HabitCard } from "../../src/components/HabitCard";
import { HabitCardCompact } from "../../src/components/HabitCardCompact";
import { EmptyState } from "../../src/components/EmptyState";
import { XPToast } from "../../src/components/XPToast";
import { ViewModeSwitcher } from "../../src/components/ViewModeSwitcher";
import { WeekdayHeader, WEEKDAY_HEADER_HEIGHT } from "../../src/components/WeekdayHeader";
import { HabitWeekRow } from "../../src/components/HabitWeekRow";
import { COLORS, FONTS } from "../../src/theme";
import { useViewMode } from "../../src/hooks/useViewMode";

const TAB_BAR_HEIGHT = 64;
const TOP_BAR_HEIGHT = 52;

export default function TodayScreen() {
  useHabitRealtime();
  const { items: activeHabits, isLoading } = useTodayDashboard();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { viewMode, setViewMode } = useViewMode();

  const [checkOffToast, setCheckOffToast] = useState<{ xp: number; reward: string } | null>(null);

  if (isLoading) {
    return <ActivityIndicator color={COLORS.accent} style={{ flex: 1, marginTop: 100 }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Fixed Top App Bar */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingTop: insets.top,
          backgroundColor: COLORS.background,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View
          style={{
            height: TOP_BAR_HEIGHT,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ fontFamily: FONTS.display, fontSize: 21, color: COLORS.text }}>
            ⚡ Atomic
          </Text>
          <Pressable onPress={() => router.push("/habit/new")} hitSlop={8}>
            <Plus color={COLORS.text} size={24} />
          </Pressable>
        </View>
      </View>

      {viewMode === "week" && activeHabits.length > 0 && (
        <WeekdayHeader topOffset={insets.top + TOP_BAR_HEIGHT} />
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 100,
          paddingTop:
            insets.top +
            TOP_BAR_HEIGHT +
            (viewMode === "week" && activeHabits.length > 0
              ? WEEKDAY_HEADER_HEIGHT
              : 0),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Habit List or Empty State */}
        {activeHabits.length === 0 ? (
          <EmptyState onPress={() => router.push("/habit/new")} />
        ) : viewMode === "week" ? (
          <View style={{ paddingTop: 16 }}>
            {activeHabits.map((habit) => (
              <HabitWeekRow
                key={habit.id}
                id={habit.id}
                name={habit.name}
                emoji={habit.emoji ?? ""}
                color={habit.color}
                recentDays={habit.recentDays}
                createdAt={habit.createdAt}
                onCheckedToast={(info) => setCheckOffToast(info)}
              />
            ))}
          </View>
        ) : viewMode === "compact" ? (
          <View
            style={{
              paddingTop: 16,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {activeHabits.map((habit) => (
              <View key={habit.id} style={{ width: "31.5%" }}>
                <HabitCardCompact
                  id={habit.id}
                  name={habit.name}
                  emoji={habit.emoji ?? ""}
                  color={habit.color}
                  recentDays={habit.recentDays}
                  createdAt={habit.createdAt}
                  isCompletedToday={habit.isCompletedToday}
                  onCheckedToast={(info) => setCheckOffToast(info)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={{ paddingTop: 16 }}>
            {activeHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                id={habit.id}
                name={habit.name}
                emoji={habit.emoji ?? ""}
                color={habit.color}
                recentDays={habit.recentDays}
                createdAt={habit.createdAt}
                isCompletedToday={habit.isCompletedToday}
                onCheckedToast={(info) => setCheckOffToast(info)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: insets.bottom + TAB_BAR_HEIGHT + 12,
          alignItems: "center",
        }}
      >
        <ViewModeSwitcher viewMode={viewMode} onChange={setViewMode} />
      </View>

      <XPToast
        xp={checkOffToast?.xp ?? null}
        reward={checkOffToast?.reward}
        onDone={() => setCheckOffToast(null)}
      />
    </View>
  );
}
