import { View, Text, Pressable } from "react-native";
import { Sparkles } from "lucide-react-native";
import { COLORS, FONTS } from "../theme";

interface EmptyStateProps {
  onPress: () => void;
}

export function EmptyState({ onPress }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6"
        style={{ backgroundColor: `${COLORS.accent}20` }}
      >
        <Sparkles color={COLORS.accent} size={36} />
      </View>
      <Text
        className="text-2xl text-foreground text-center mb-2"
        style={{ fontFamily: FONTS.display }}
      >
        No habits yet
      </Text>
      <Text className="text-muted text-center mb-8 text-sm">
        Build your first habit using the{"\n"}4 Laws of Behavior Change
      </Text>
      <Pressable
        onPress={onPress}
        className="px-6 py-3 rounded-xl"
        style={{ backgroundColor: COLORS.accent }}
      >
        <Text
          className="text-foreground font-medium"
          style={{ fontFamily: FONTS.medium }}
        >
          Create your first habit
        </Text>
      </Pressable>
    </View>
  );
}
