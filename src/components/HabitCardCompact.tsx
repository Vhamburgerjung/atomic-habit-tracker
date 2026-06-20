import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { Pressable, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS, FONTS } from "../theme";
import { useHabitToggle, type CheckedToastInfo } from "../hooks/useHabitToggle";
import { computeActiveWeekSet, heatmapCellOpacity } from "../utils/heatmap";

interface HabitCardCompactProps {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  recentDays: boolean[];
  createdAt: string;
  isCompletedToday: boolean;
  onCheckedToast?: (info: CheckedToastInfo) => void;
}

const COLS = 7; // Mon..Sun
const CELL_GAP = 2;

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function mondayOf(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const jsDay = out.getDay();
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;
  out.setDate(out.getDate() - mondayOffset);
  return out;
}

export function HabitCardCompact({
  id,
  name,
  emoji,
  color,
  recentDays,
  createdAt,
  isCompletedToday,
  onCheckedToast,
}: HabitCardCompactProps) {
  const router = useRouter();
  const renderColor = color ?? "#7C3AED";

  const borderProgress = useSharedValue(isCompletedToday ? 1 : 0);

  const cardBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.border, `${renderColor}80`]
    ),
  }));

  useEffect(() => {
    borderProgress.value = withTiming(isCompletedToday ? 1 : 0, { duration: 300 });
  }, [isCompletedToday]);

  const { toggle } = useHabitToggle({ onChecked: onCheckedToast });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const todayStr = toYmd(new Date());
    toggle(id, todayStr);
  };

  const handleLongPress = () => {
    router.push(`/habit/${id}`);
  };

  const createdDateStr = createdAt.slice(0, 10);

  // Build the calendar grid for the current month.
  // Rows are weeks (5 or 6), columns are Mon..Sun.
  const { weeks, todayYmd, monthLabel } = useMemo(() => {
    const today = new Date();
    const todayYmdStr = toYmd(today);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const gridStart = mondayOf(firstOfMonth);
    const lastSunday = (() => {
      const jsDay = lastOfMonth.getDay(); // Sun=0..Sat=6
      const daysAhead = jsDay === 0 ? 0 : 7 - jsDay;
      const d = new Date(lastOfMonth);
      d.setDate(lastOfMonth.getDate() + daysAhead);
      return d;
    })();
    const totalDays =
      Math.round((lastSunday.getTime() - gridStart.getTime()) / 86_400_000) + 1;
    const rowCount = totalDays / 7;

    const rows: { dones: boolean[]; ymds: string[] }[] = [];
    for (let row = 0; row < rowCount; row++) {
      const dones: boolean[] = [];
      const ymds: string[] = [];
      for (let col = 0; col < COLS; col++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + row * 7 + col);
        const ymd = toYmd(d);
        const offsetDays = Math.round(
          (today.getTime() - d.getTime()) / 86_400_000
        );
        const idx = recentDays.length - 1 - offsetDays;
        const isDone =
          idx >= 0 && idx < recentDays.length ? recentDays[idx] === true : false;
        ymds.push(ymd);
        dones.push(isDone);
      }
      rows.push({ dones, ymds });
    }

    const monthStr = today.toLocaleDateString("de-DE", {
      month: "long",
      year: "numeric",
    });

    return { weeks: rows, todayYmd: todayYmdStr, monthLabel: monthStr };
  }, [recentDays]);

  const activeWeeks = useMemo(
    () => computeActiveWeekSet(weeks.map((w) => w.dones)),
    [weeks]
  );

  return (
    <Animated.View
      style={[
        {
          borderRadius: 12,
          borderWidth: 1,
          backgroundColor: COLORS.card,
        },
        cardBorderStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={{
          borderRadius: 12,
          padding: 8,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              backgroundColor: `${renderColor}33`,
              borderWidth: 1,
              borderColor: `${renderColor}4D`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 14 }}>{emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: FONTS.medium,
                fontSize: 12,
                color: COLORS.text,
              }}
            >
              {name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: FONTS.medium,
                fontSize: 10,
                color: COLORS.muted,
                marginTop: 1,
              }}
            >
              {monthLabel}
            </Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={{ gap: CELL_GAP }}>
          {weeks.map((week, row) => {
            const isActiveWeek = activeWeeks.has(row);
            return (
              <View key={row} style={{ flexDirection: "row", gap: CELL_GAP }}>
                {week.dones.map((isDone, col) => {
                  const cellYmd = week.ymds[col];
                  const isBeforeCreation = cellYmd < createdDateStr;
                  const isToday = cellYmd === todayYmd;
                  const opacity = heatmapCellOpacity({
                    isDone,
                    isInActiveWeek: isActiveWeek && !isBeforeCreation,
                  });
                  return (
                    <View
                      key={col}
                      style={{
                        flex: 1,
                        aspectRatio: 1,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <View
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 2,
                          backgroundColor: renderColor,
                          opacity,
                        }}
                      />
                      {isToday && (
                        <View
                          style={{
                            width: 3,
                            height: 3,
                            borderRadius: 1.5,
                            backgroundColor: COLORS.accent,
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </Pressable>
    </Animated.View>
  );
}
