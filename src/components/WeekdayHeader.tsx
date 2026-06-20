import { View, Text } from "react-native";
import { COLORS, FONTS } from "../theme";
import { SQUARE_SIZE, SQUARE_GAP, ROW_HORIZONTAL_PADDING, SQUARES_AREA_WIDTH } from "./habitWeekLayout";

const WEEKDAY_INITIALS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface WeekdayHeaderProps {
  topOffset: number;
}

export const WEEKDAY_HEADER_HEIGHT = 32;

export function WeekdayHeader({ topOffset }: WeekdayHeaderProps) {
  // JS Date getDay(): 0 = Sun, 1 = Mon, ... 6 = Sat.
  // We want Monday-based index: Mon=0 ... Sun=6.
  const today = new Date();
  const jsDay = today.getDay();
  const todayMondayIdx = (jsDay + 6) % 7;

  // Build a sequence of 7 weekday initials with today as the LAST (rightmost) element.
  // Going from oldest (6 days ago) on the left to today on the right.
  const labels: string[] = [];
  for (let col = 0; col < 7; col++) {
    const daysAgo = 6 - col;
    const idx = (todayMondayIdx - daysAgo + 7 * 7) % 7;
    labels.push(WEEKDAY_INITIALS[idx]);
  }

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
        paddingHorizontal: ROW_HORIZONTAL_PADDING,
      }}
    >
      {/* Left spacer mirrors row's label area */}
      <View style={{ flex: 1 }} />

      {/* Squares area mirrors row layout */}
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
