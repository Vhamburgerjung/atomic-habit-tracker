import { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS, FONTS } from "../theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const GOLD = "#FFD700";

interface ProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  isComplete?: boolean;
}

export function ProgressRing({ completed, total, size = 200, isComplete = false }: ProgressRingProps) {
  const percentage = total > 0 ? completed / total : 0;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const prevComplete = useRef(false);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  useEffect(() => {
    if (isComplete && !prevComplete.current) {
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.12, duration: 220, useNativeDriver: true }),
        Animated.spring(pulseScale, { toValue: 1, friction: 3, tension: 80, useNativeDriver: true }),
      ]).start();
    }
    prevComplete.current = isComplete;
  }, [isComplete]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const strokeColor = isComplete ? GOLD : COLORS.accent;
  const textColor   = isComplete ? GOLD : COLORS.text;
  const subColor    = isComplete ? GOLD : COLORS.muted;

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: pulseScale }],
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={10}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <Text style={{ fontFamily: FONTS.display, fontSize: 48, color: textColor }}>
        {completed}
      </Text>
      <Text style={{ color: COLORS.muted, fontSize: 13 }}>of {total}</Text>
      <Text style={{ color: subColor, fontSize: 11 }}>
        {Math.round(percentage * 100)}%
      </Text>
    </Animated.View>
  );
}
