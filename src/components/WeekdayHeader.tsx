import { View, Text } from "react-native";
import { COLORS, FONTS } from "../theme";
import {
  SQUARE_SIZE,
  SQUARE_GAP,
  ROW_HORIZONTAL_PADDING,
  LIST_OUTER_PADDING,
  SQUARES_AREA_WIDTH,
} from "./habitWeekLayout";

const WEEKDAY_INITIALS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface WeekdayHeaderProps {
  topOffset: number;
}

export const WEEKDAY_HEADER_HEIGHT = 32;

export function WeekdayHeader({ topOffset }: WeekdayHeaderProps) {
  // Monday-based weekday index for today: Mon=0 ... Sun=6.
  const jsDay = new Date().getDay();
  const todayMondayIdx = (jsDay + 6) % 7;

  // Rolling 7-day window: col 0 = 6 days ago, col 6 = today.
  const labels: string[] = Array.from({ length: 7 }, (_, col) => {
    const daysAgo = 6 - col;
    const idx = (todayMondayIdx - daysAgo + 7 * 7) % 7;
    return WEEKDAY_INITIALS[idx];
  });

  return (
    <View
      style={{
        position: "absolute",
        top: topOffset,
        left: 0,
        right: 0,
        zIndex: 9,
        height: WEEKDAY_HEADER_HEIGHT,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: LIST_OUTER_PADDING + ROW_HORIZONTAL_PADDING,
      }}
    >
      {/* Left spacer mirrors row's icon + name area */}
      <View style={{ flex: 1 }} />

      {/* Squares area mirrors row's squares (right-aligned) */}
      <View
        style={{
          width: SQUARES_AREA_WIDTH,
          flexDirection: "row",
        }}
      >
        {labels.map((label, col) => {
          const isToday = col === 6;
          return (
            <View
              key={col}
              style={{
                width: SQUARE_SIZE,
                marginLeft: col === 0 ? 0 : SQUARE_GAP,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 11,
                  textAlign: "center",
                  color: isToday ? COLORS.accent : COLORS.muted,
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
