import { Modal, View, Text, Pressable } from "react-native";
import { COLORS, FONTS } from "../theme";

interface RewardModalProps {
  visible: boolean;
  habitName: string;
  habitEmoji: string;
  reward: string;
  xp?: number | null;
  onClose: () => void;
}

export function RewardModal({
  visible,
  habitName,
  habitEmoji,
  reward,
  xp,
  onClose,
}: RewardModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.75)",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.border,
            borderWidth: 1,
            borderRadius: 20,
            padding: 32,
            width: "100%",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Text style={{ fontSize: 52 }}>🎉</Text>
          <Text style={{ color: COLORS.muted, fontSize: 13 }}>Habit completed!</Text>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: 22,
              color: COLORS.text,
              textAlign: "center",
            }}
          >
            {habitEmoji} {habitName}
          </Text>
          <View
            style={{
              backgroundColor: `${COLORS.accent}18`,
              borderRadius: 10,
              padding: 16,
              width: "100%",
              gap: 4,
            }}
          >
            <Text style={{ color: COLORS.muted, fontSize: 11 }}>Your reward</Text>
            <Text
              style={{
                color: COLORS.accentLight,
                fontSize: 15,
                fontFamily: FONTS.medium,
              }}
            >
              {reward}
            </Text>
          </View>
          {xp != null && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${COLORS.accent}22`,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                gap: 6,
              }}
            >
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 18,
                  color: COLORS.accent,
                  letterSpacing: 0.5,
                }}
              >
                +{xp} XP
              </Text>
            </View>
          )}

          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: COLORS.accent,
              borderRadius: 12,
              height: 50,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
              shadowColor: COLORS.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text style={{ color: "white", fontFamily: FONTS.medium, fontSize: 16 }}>
              Weiter
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
