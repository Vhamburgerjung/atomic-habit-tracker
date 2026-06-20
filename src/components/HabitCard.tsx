import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS, FONTS } from "../theme";
import { CheckButton } from "./CheckButton";
import { useHabitToggle, type CheckedToastInfo } from "../hooks/useHabitToggle";
import { computeActiveWeekSet, heatmapCellOpacity } from "../utils/heatmap";

interface HabitCardProps {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  recentDays: boolean[];
  createdAt: string;
  isCompletedToday: boolean;
  onCheckedToast?: (info: CheckedToastInfo) => void;
}

const COLS = 52;
const ROWS = 7;
const CELL_SIZE = 12;
const CELL_GAP = 3;
const HEATMAP_HORIZONTAL_PADDING = 12;

function toYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function HabitCard({
  id,
  name,
  emoji,
  color,
  recentDays,
  createdAt,
  isCompletedToday,
  onCheckedToast,
}: HabitCardProps) {
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

  const handleToggle = () => {
    borderProgress.value = withTiming(!isCompletedToday ? 1 : 0, { duration: 300 });
    const todayStr = new Date().toISOString().split("T")[0];
    toggle(id, todayStr);
  };

  const createdDateStr = createdAt.slice(0, 10);

  // Build the 7×52 GitHub-style grid.
  // Today is at row = today's Mon-based weekday, col = COLS-1 (rightmost).
  // Cell (row, col) date = currentWeekMonday + (col - (COLS-1)) weeks + row days.
  const { columns, todayCol, todayRow, todayYmd } = useMemo(() => {
    const today = new Date();
    const todayYmdStr = toYmd(today);
    const jsDay = today.getDay();
    const todayMondayIdx = (jsDay + 6) % 7; // Mon=0..Sun=6
    const monday = new Date(today);
    monday.setDate(today.getDate() - todayMondayIdx);

    const cols: { dones: boolean[]; ymds: string[] }[] = [];
    for (let col = 0; col < COLS; col++) {
      const dones: boolean[] = [];
      const ymds: string[] = [];
      for (let row = 0; row < ROWS; row++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + (col - (COLS - 1)) * 7 + row);
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
      cols.push({ dones, ymds });
    }

    return {
      columns: cols,
      todayCol: COLS - 1,
      todayRow: todayMondayIdx,
      todayYmd: todayYmdStr,
    };
  }, [recentDays]);

  const activeWeeks = useMemo(
    () => computeActiveWeekSet(columns.map((c) => c.dones)),
    [columns]
  );

  // Scroll the heatmap to the rightmost column on first layout.
  const scrollRef = useRef<ScrollView>(null);
  const didInitialScroll = useRef(false);

  return (
    <Animated.View
      style={[
        {
          marginBottom: 12,
          borderRadius: 12,
          borderWidth: 1,
          backgroundColor: COLORS.card,
        },
        cardBorderStyle,
      ]}
    >
      <Pressable
        onLongPress={() => router.push(`/habit/${id}`)}
        delayLongPress={350}
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 12,
          paddingTop: 1,
          paddingBottom: 12,
        }}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
            paddingHorizontal: 12,
          }}
        >
          {/* Icon box */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: `${renderColor}33`,
              borderWidth: 1,
              borderColor: `${renderColor}4D`,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20 }}>{emoji}</Text>
          </View>

          {/* Name */}
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              fontFamily: FONTS.medium,
              fontSize: 15,
              color: COLORS.text,
            }}
          >
            {name}
          </Text>

          {/* CheckButton */}
          <CheckButton
            isCompleted={isCompletedToday}
            accentColor={renderColor}
            onPress={handleToggle}
          />
        </View>

        {/* Heatmap: 7 rows × 52 cols, horizontal-scrollable, bleed-to-edge */}
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: HEATMAP_HORIZONTAL_PADDING,
          }}
          onContentSizeChange={() => {
            if (!didInitialScroll.current) {
              scrollRef.current?.scrollToEnd({ animated: false });
              didInitialScroll.current = true;
            }
          }}
        >
          <View style={{ flexDirection: "row", gap: CELL_GAP }}>
            {columns.map((column, col) => {
              const isActiveWeek = activeWeeks.has(col);
              return (
                <View key={col} style={{ gap: CELL_GAP }}>
                  {column.dones.map((isDone, row) => {
                    const cellYmd = column.ymds[row];
                    const isBeforeCreation = cellYmd < createdDateStr;
                    const isToday = col === todayCol && row === todayRow;
                    const opacity = heatmapCellOpacity({
                      isDone,
                      isInActiveWeek: isActiveWeek && !isBeforeCreation,
                    });
                    return (
                      <View
                        key={row}
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
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
                              width: 4,
                              height: 4,
                              borderRadius: 2,
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
        </ScrollView>
      </Pressable>
    </Animated.View>
  );
}
