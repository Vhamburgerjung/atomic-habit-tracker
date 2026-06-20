import { useRouter } from "expo-router";
import { useEffect } from "react";
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

const ROWS = 7; // Mon..Sun
const COLS = 11; // weeks; rightmost = current week

/**
 * Returns the Monday of the week containing `d` (local time), at 00:00:00.
 */
function mondayOf(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  // JS: Sun=0, Mon=1, ... Sat=6. We want Mon=0..Sun=6
  const jsDay = out.getDay();
  const mondayOffset = jsDay === 0 ? 6 : jsDay - 1;
  out.setDate(out.getDate() - mondayOffset);
  return out;
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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
  const todayCellProgress = useSharedValue(isCompletedToday ? 1 : 0);

  const cardBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderProgress.value,
      [0, 1],
      [COLORS.border, `${renderColor}80`]
    ),
  }));

  const todayCellStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + (1 - 0.08) * todayCellProgress.value,
  }));

  useEffect(() => {
    borderProgress.value = withTiming(isCompletedToday ? 1 : 0, { duration: 300 });
    todayCellProgress.value = withTiming(isCompletedToday ? 1 : 0, { duration: 300 });
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

  // Build grid date map.
  const today = new Date();
  const todayYmd = toYmd(today);
  const monday = mondayOf(today);
  const todayJsDay = today.getDay();
  const todayRow = todayJsDay === 0 ? 6 : todayJsDay - 1;

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
          padding: 10,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${renderColor}33`,
              borderWidth: 1,
              borderColor: `${renderColor}4D`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>{emoji}</Text>
          </View>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: FONTS.medium,
              fontSize: 14,
              color: COLORS.text,
            }}
          >
            {name}
          </Text>
        </View>

        {/* Heatmap 7 rows × 11 cols */}
        <View style={{ gap: 3 }}>
          {Array.from({ length: ROWS }, (_, row) => (
            <View key={row} style={{ flexDirection: "row", gap: 3 }}>
              {Array.from({ length: COLS }, (_, col) => {
                // Date for (row, col): monday + (col - (COLS-1)) weeks + row days
                const cellDate = new Date(monday);
                cellDate.setDate(
                  monday.getDate() + (col - (COLS - 1)) * 7 + row
                );
                const cellYmd = toYmd(cellDate);

                const isToday = cellYmd === todayYmd;
                const isFuture = cellYmd > todayYmd;
                const isBeforeCreation = cellYmd < createdDateStr;

                // Compute offset days for recentDays lookup.
                const offsetDays = Math.round(
                  (today.getTime() - cellDate.getTime()) / 86_400_000
                );
                const idx = 111 - offsetDays;
                const isDone =
                  idx >= 0 && idx < recentDays.length
                    ? recentDays[idx] === true
                    : false;

                let bg: string;
                let opacity: number;
                if (isFuture) {
                  bg = renderColor;
                  opacity = 0.08;
                } else if (isBeforeCreation) {
                  bg = COLORS.border;
                  opacity = 1;
                } else if (isDone) {
                  bg = renderColor;
                  opacity = 1;
                } else {
                  bg = renderColor;
                  opacity = 0.08;
                }

                if (isToday) {
                  // Animate today's cell opacity between 0.08 and 1.
                  return (
                    <Animated.View
                      key={col}
                      style={[
                        {
                          flex: 1,
                          aspectRatio: 1,
                          borderRadius: 2,
                          backgroundColor: renderColor,
                        },
                        todayCellStyle,
                      ]}
                    />
                  );
                }

                return (
                  <View
                    key={col}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      borderRadius: 2,
                      backgroundColor: bg,
                      opacity,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}
