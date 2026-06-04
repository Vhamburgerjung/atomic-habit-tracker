import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabitStore } from "../../src/store/useHabitStore";
import { COLORS, FONTS } from "../../src/theme";

export default function ProfileScreen() {
  const { checkoffs } = useHabitStore();
  const insets = useSafeAreaInsets();
  const totalXP = checkoffs.length * 10;

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top, paddingHorizontal: 24 }}
    >
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          color: COLORS.text,
          paddingTop: 16,
          marginBottom: 32,
        }}
      >
        Profile
      </Text>

      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.accent,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.text }}>
          You
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>
          Building better habits, one day at a time
        </Text>
      </View>

      <View
        style={{
          backgroundColor: COLORS.card,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>Total XP</Text>
        <Text
          style={{
            fontFamily: FONTS.mono,
            fontSize: 40,
            color: COLORS.text,
            marginTop: 4,
          }}
        >
          {totalXP.toLocaleString()}
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 4 }}>
          Gamification coming in Phase 2
        </Text>
      </View>
    </View>
  );
}
