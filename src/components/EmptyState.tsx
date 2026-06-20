import { View, Text, Pressable } from "react-native";
import { COLORS, FONTS } from "../theme";

interface EmptyStateProps {
  onPress: () => void;
}

export function EmptyState({ onPress }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 64,
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          color: COLORS.text,
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        Nothing here yet
      </Text>
      <Text
        style={{
          fontFamily: FONTS.body,
          fontSize: 14,
          color: COLORS.muted,
          textAlign: "center",
          marginBottom: 40,
          lineHeight: 20,
        }}
      >
        Add your first habit to get started.
      </Text>
      <Pressable
        onPress={onPress}
        style={{
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: COLORS.border,
          backgroundColor: "transparent",
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.medium,
            fontSize: 14,
            color: COLORS.text,
          }}
        >
          Add habit
        </Text>
      </Pressable>
    </View>
  );
}
