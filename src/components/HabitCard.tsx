import { View, Text, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "../theme";
import { CheckOff } from "../store/useHabitStore";
import { isCompletedToday, getStreak, getRecentCheckoffs } from "../utils/streaks";

interface HabitCardProps {
  id: string;
  name: string;
  emoji: string;
  identityStatement?: string;
  cue: string;
  craving: string;
  response: string;
  reward: string;
  checkoffs: CheckOff[];
  onToggle: (id: string) => void;
  onChecked: (id: string) => void;
}

export function HabitCard({
  id,
  name,
  emoji,
  identityStatement,
  cue,
  craving,
  response,
  reward,
  checkoffs,
  onToggle,
  onChecked,
}: HabitCardProps) {
  const completed = isCompletedToday(id, checkoffs);
  const streak = getStreak(id, checkoffs);
  const recentDays = getRecentCheckoffs(id, checkoffs, 30);
  const router = useRouter();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggle = () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!completed) {
      onChecked(id);
    }
    onToggle(id);
  };

  return (
    <Animated.View style={[{ marginBottom: 12 }, animatedStyle]}>
      <Pressable
        onPress={() => router.push(`/habit/${id}`)}
        style={{
          backgroundColor: COLORS.card,
          borderColor: completed ? `${COLORS.success}40` : COLORS.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <Text style={{ fontSize: 28, marginTop: 2 }}>{emoji}</Text>

        <View style={{ flex: 1, gap: 0 }}>
          {/* Name + streak */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.medium,
                color: completed ? COLORS.muted : COLORS.text,
                textDecorationLine: completed ? "line-through" : "none",
                fontSize: 15,
                flex: 1,
              }}
            >
              {name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Text style={{ fontSize: 11 }}>🔥</Text>
              <Text style={{ fontSize: 12, color: COLORS.warning, fontFamily: FONTS.mono }}>
                {streak}d
              </Text>
            </View>
          </View>

          {/* Identity statement */}
          {identityStatement ? (
            <Text
              style={{
                color: COLORS.accent,
                fontSize: 12,
                fontStyle: "italic",
                marginBottom: 10,
              }}
            >
              "I am someone who {identityStatement}"
            </Text>
          ) : null}

          {/* Detail rows */}
          <View style={{ gap: 5, marginBottom: 10 }}>
            {(
              [
                { label: "Cue", value: cue },
                { label: "Craving", value: craving },
                { label: "Response", value: response },
                { label: "Reward", value: reward },
              ] as { label: string; value: string }[]
            )
              .filter((item) => item.value)
              .map((item) => (
                <View key={item.label} style={{ flexDirection: "row", gap: 8 }}>
                  <Text
                    style={{
                      color: COLORS.muted,
                      fontSize: 11,
                      width: 58,
                      marginTop: 1,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text style={{ color: COLORS.text, fontSize: 12, flex: 1, lineHeight: 17 }}>
                    {item.value}
                  </Text>
                </View>
              ))}
          </View>

          {/* 30-day dot grid */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2, maxWidth: 220 }}>
            {recentDays.map((done, i) => (
              <View
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1,
                  backgroundColor: done ? COLORS.accent : COLORS.border,
                }}
              />
            ))}
          </View>
        </View>

        {/* Check button — separate pressable, does NOT navigate */}
        <Pressable
          onPress={(e) => {
            handleToggle();
          }}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 2,
            borderColor: completed ? COLORS.success : COLORS.accent,
            backgroundColor: completed ? COLORS.success : "transparent",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: completed ? COLORS.success : COLORS.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: completed ? 0.4 : 0,
            shadowRadius: 8,
            elevation: completed ? 4 : 0,
            marginTop: 2,
          }}
        >
          {completed && <Check color="white" size={22} />}
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}
