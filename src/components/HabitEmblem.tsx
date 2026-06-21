import { Text, View } from "react-native";

interface HabitEmblemProps {
  emoji?: string;
  color: string;
  /** Visual size of the emoji / dot in logical pixels. */
  size: number;
}

/**
 * Renders `emoji` when present, or a filled color-dot when the habit has no
 * emoji (e.g. habits created via the onboarding wizard in slice 021).
 *
 * The outer footprint is always `size × size` so surrounding card layouts
 * remain stable regardless of which branch is taken.
 */
export function HabitEmblem({ emoji, color, size }: HabitEmblemProps) {
  const hasEmoji = !!(emoji && emoji.trim());

  if (hasEmoji) {
    return (
      <Text
        style={{
          fontSize: size,
          lineHeight: size,
          width: size,
          height: size,
          textAlign: "center",
          textAlignVertical: "center",
          includeFontPadding: false,
        }}
      >
        {emoji}
      </Text>
    );
  }

  const dotSize = Math.round(size * 0.55);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 999,
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.6,
          shadowRadius: dotSize / 2,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        }}
      />
    </View>
  );
}
