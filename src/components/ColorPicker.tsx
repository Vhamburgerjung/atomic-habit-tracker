import { View, Pressable, StyleSheet } from 'react-native';
import { HABIT_COLORS } from '../theme/habitColors';
import { SPACING, RADIUS } from '../theme';

const SWATCH_SIZE = 48;
const SWATCH_MARGIN = SPACING.sm;
const NUM_COLUMNS = 4;

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <View style={styles.grid}>
      {HABIT_COLORS.map((hex) => {
        const isSelected = hex.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={hex}
            onPress={() => onChange(hex)}
            style={({ pressed }) => [
              styles.swatch,
              { backgroundColor: hex },
              isSelected && styles.swatchSelected,
              pressed && styles.swatchPressed,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={hex}
          >
            {isSelected && <View style={styles.checkDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Negative margin trick so outer edges align flush
    marginHorizontal: -SWATCH_MARGIN / 2,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: RADIUS.md,
    margin: SWATCH_MARGIN / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 2.5,
  },
  swatchPressed: {
    opacity: 0.75,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    opacity: 0.9,
  },
});
