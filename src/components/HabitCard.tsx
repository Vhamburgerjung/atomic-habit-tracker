import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS, FONTS } from "../theme";
import { CheckButton } from "./CheckButton";
import { useHabitToggle, type CheckedToastInfo } from "../hooks/useHabitToggle";

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

  // Compute the creation date as a yyyy-mm-dd string for comparison
  const createdDateStr = createdAt.slice(0, 10);

  // Build cell date strings: cell i → today minus (111 - i) days
  const today = new Date();
  const cellDates: string[] = Array.from({ length: 112 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (111 - i));
    return d.toISOString().slice(0, 10);
  });

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
        onPress={() => router.push(`/habit/${id}`)}
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 12,
          paddingHorizontal: 12,
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
            marginBottom: 1,
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

        {/* Heatmap: 4 rows × 28 columns = 112 cells */}
        <View style={{ gap: 3 }}>
          {Array.from({ length: 4 }, (_, row) => (
            <View key={row} style={{ flexDirection: "row", gap: 3 }}>
              {Array.from({ length: 28 }, (_, col) => {
                const idx = row * 28 + col;
                const cellDate = cellDates[idx];
                const isBeforeCreation = cellDate < createdDateStr;
                const isDone = recentDays[idx] === true;

                let bg: string;
                let opacity: number;
                if (isBeforeCreation) {
                  bg = COLORS.border;
                  opacity = 1;
                } else if (isDone) {
                  bg = renderColor;
                  opacity = 1;
                } else {
                  bg = renderColor;
                  opacity = 0.08;
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
