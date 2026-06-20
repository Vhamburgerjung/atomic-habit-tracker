import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SPARKLE_RADIUS = 32;
const SPARKLE_ANGLES = [0, 60, 120, 180, 240, 300];

interface SparkleSegmentProps {
  triggerKey: number;
  angleDeg: number;
  color: string;
}

function SparkleSegment({ triggerKey, angleDeg, color }: SparkleSegmentProps) {
  const scale = useSharedValue(0);
  const translate = useSharedValue(0);

  useEffect(() => {
    if (triggerKey === 0) return;
    // Reset then animate — cancels any in-flight animation
    scale.value = 0;
    translate.value = 0;
    scale.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 200 })
    );
    translate.value = withSequence(
      withTiming(SPARKLE_RADIUS, { duration: 280 }),
      withTiming(0, { duration: 0 })
    );
  }, [triggerKey]);

  const angle = (angleDeg * Math.PI) / 180;

  const animStyle = useAnimatedStyle(() => ({
    opacity: scale.value,
    transform: [
      { translateX: translate.value * Math.sin(angle) },
      { translateY: -translate.value * Math.cos(angle) },
      { scaleY: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 2,
          height: 8,
          borderRadius: 1,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

interface CheckButtonProps {
  isCompleted: boolean;
  accentColor?: string;
  onPress: () => void;
}

export function CheckButton({ isCompleted, accentColor = '#7C3AED', onPress }: CheckButtonProps) {
  const rippleScale = useSharedValue(isCompleted ? 1 : 0);
  const borderOpacity = useSharedValue(isCompleted ? 0 : 1);
  const checkScale = useSharedValue(isCompleted ? 1 : 0);
  const [sparkleKey, setSparkleKey] = useState(0);

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  useEffect(() => {
    rippleScale.value = isCompleted ? 1 : 0;
    borderOpacity.value = isCompleted ? 0 : 1;
    checkScale.value = isCompleted ? 1 : 0;
  }, [isCompleted]);

  const handlePress = () => {
    if (!isCompleted) {
      // Completing: ripple expands, border fades, checkmark flies in, sparkles burst
      rippleScale.value = withSpring(1, { damping: 14, stiffness: 180 });
      borderOpacity.value = withTiming(0, { duration: 200 });
      checkScale.value = withDelay(180, withSpring(1, { damping: 12, stiffness: 200 }));
      setSparkleKey((k) => k + 1);
    } else {
      // Uncompleting: reverse — fill fades, border returns, checkmark disappears
      rippleScale.value = withTiming(0, { duration: 200 });
      borderOpacity.value = withTiming(1, { duration: 200 });
      checkScale.value = withTiming(0, { duration: 150 });
    }
    onPress();
  };

  return (
    <View
      style={{
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10, 
        marginBottom: 10,  
        marginRight: 5,

      }}
    >
      {/* 6 sparkle line segments positioned at center, radiate outward on trigger */}
      {SPARKLE_ANGLES.map((angleDeg) => (
        <SparkleSegment
          key={angleDeg}
          triggerKey={sparkleKey}
          angleDeg={angleDeg}
          color={accentColor}
        />
      ))}

      {/* Circle border — fades out as ripple fill expands */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 44,
            height: 44,
            borderRadius: 22,
            borderWidth: 2,
            borderColor: accentColor,
          },
          borderStyle,
        ]}
      />

      {/* Ripple fill — scales from 0 to 1 from center */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: accentColor,
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
          },
          rippleStyle,
        ]}
      />

      {/* Checkmark — scales in with a delay after ripple starts */}
      <Animated.View style={checkStyle}>
        <Check color="white" size={22} />
      </Animated.View>

      {/* Pressable tap target on top of everything */}
      <Pressable
        onPress={handlePress}
        hitSlop={8}
        style={{
          position: "absolute",
          width: 44,
          height: 44,
          borderRadius: 22,
        }}
      />
    </View>
  );
}
