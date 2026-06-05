import { useEffect, useRef } from "react";
import { Animated, Text, Pressable, View } from "react-native";
import { COLORS, FONTS } from "../theme";

interface XPToastProps {
  xp: number | null;
  reward?: string;
  onDone: () => void;
}

export function XPToast({ xp, reward, onDone }: XPToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!xp) return;
    opacity.setValue(0);
    translateY.setValue(0);
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1,   duration: 220, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: -14, friction: 6,   useNativeDriver: true }),
    ]).start();
  }, [xp]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 8,  friction: 6,   useNativeDriver: true }),
    ]).start(() => onDone());
  };

  if (!xp) return null;

  return (
    <Pressable
      onPress={handleDismiss}
      style={{ position: "absolute", bottom: 140, alignSelf: "center", zIndex: 999 }}
    >
      <Animated.View
        style={{
          opacity,
          transform: [{ translateY }],
          backgroundColor: COLORS.card,
          borderColor: `${COLORS.accent}55`,
          borderWidth: 1,
          borderRadius: 16,
          paddingHorizontal: 20,
          paddingVertical: 14,
          alignItems: "center",
          gap: 6,
          minWidth: 220,
          maxWidth: 300,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        {/* XP row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 16 }}>⚡</Text>
          <Text style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.accent, letterSpacing: 0.5 }}>
            +{xp} XP
          </Text>
        </View>

        {/* Reward */}
        {!!reward && (
          <>
            <View style={{ height: 1, width: "100%", backgroundColor: COLORS.border }} />
            <Text style={{ color: COLORS.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Deine Belohnung
            </Text>
            <Text
              style={{
                fontFamily: FONTS.medium,
                fontSize: 14,
                color: COLORS.text,
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {reward}
            </Text>
          </>
        )}

        <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>Tippen zum Schließen</Text>
      </Animated.View>
    </Pressable>
  );
}
