import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { COLORS, FONTS } from "../theme";
import { useHabitToggle, type CheckedToastInfo } from "../hooks/useHabitToggle";
import {
  SQUARE_SIZE,
  SQUARE_GAP,
  ROW_HORIZONTAL_PADDING,
  SQUARES_AREA_WIDTH,
} from "./habitWeekLayout";

interface HabitWeekRowProps {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  recentDays: boolean[];
  createdAt: string;
  onCheckedToast?: (info: CheckedToastInfo) => void;
}

export function HabitWeekRow({
  id,
  name,
  emoji,
  color,
  recentDays,
  createdAt,
  onCheckedToast,
}: HabitWeekRowProps) {
  const router = useRouter();
  const renderColor = color ?? "#7C3AED";
  const { toggle } = useHabitToggle({ onChecked: onCheckedToast });

  const createdDateStr = createdAt.slice(0, 10);

  // Rolling 7-day window: col 0 = 6 days ago, col 6 = today.
  const today = new Date();
  const cellDates: string[] = Array.from({ length: 7 }, (_, col) => {
    const daysAgo = 6 - col;
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  });

  return (
    <View
      style={{
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: ROW_HORIZONTAL_PADDING,
        paddingVertical: 10,
        gap: 10,
      }}
    >
      {/* Left: icon + name (tap → detail) */}
      <Pressable
        onPress={() => router.push(`/habit/${id}`)}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: `${renderColor}33`,
            borderWidth: 1,
            borderColor: `${renderColor}4D`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 14 }}>{emoji}</Text>
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
      </Pressable>

      {/* Right: 7 squares — Mon..Sun of current week */}
      <View
        style={{
          width: SQUARES_AREA_WIDTH,
          flexDirection: "row",
        }}
      >
        {Array.from({ length: 7 }, (_, col) => {
          const dateStr = cellDates[col];
          const daysAgo = 6 - col;
          const idx = recentDays.length - 1 - daysAgo;
          const isBeforeCreation = dateStr < createdDateStr;
          const isDone = idx >= 0 && idx < recentDays.length && recentDays[idx] === true;
          const isToday = col === 6;

          const commonStyle = {
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            marginLeft: col === 0 ? 0 : SQUARE_GAP,
            borderRadius: 5,
          } as const;

          if (isBeforeCreation) {
            return (
              <View
                key={col}
                style={{
                  ...commonStyle,
                  backgroundColor: COLORS.border,
                }}
              />
            );
          }

          const opacity = isDone ? 1 : 0.08;

          return (
            <Pressable
              key={col}
              onPress={() => toggle(id, dateStr)}
              style={{
                ...commonStyle,
                backgroundColor: renderColor,
                opacity,
                borderWidth: isToday ? 1 : 0,
                borderColor: isToday ? `${COLORS.accent}4D` : "transparent",
              }}
            />
          );
        })}
      </View>
    </View>
  );
}
