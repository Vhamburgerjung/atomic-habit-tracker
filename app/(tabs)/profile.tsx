import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, FONTS, SPACING, RADIUS } from "../../src/theme";
import { useUserXP } from "../../src/data/queries/useUserXP";
import { useUserBadges } from "../../src/data/queries/useUserBadges";
import { supabase } from "../../src/lib/supabase";
import type { Badge } from "../../src/utils/badges";

function XPBar({ progress }: { progress: number }) {
  return (
    <View
      style={{
        height: 6,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 12,
        width: "100%",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${Math.round(progress * 100)}%`,
          backgroundColor: COLORS.accent,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <View
      style={{
        flex: 1,
        margin: 4,
        aspectRatio: 1,
        borderRadius: RADIUS.md,
        backgroundColor: badge.earned ? COLORS.card : "transparent",
        borderWidth: 1,
        borderColor: badge.earned ? COLORS.accent : COLORS.border,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        opacity: badge.earned ? 1 : 0.35,
      }}
    >
      <Text style={{ fontSize: 24 }}>{badge.earned ? badge.emoji : "?"}</Text>
      <Text
        style={{
          color: badge.earned ? COLORS.text : COLORS.muted,
          fontSize: 9,
          textAlign: "center",
          marginTop: 4,
          fontFamily: FONTS.medium,
        }}
        numberOfLines={2}
      >
        {badge.earned ? badge.name : "???"}
      </Text>
    </View>
  );
}

function BadgeGrid({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned).length;
  const rows: Badge[][] = [];
  for (let i = 0; i < badges.length; i += 4) {
    rows.push(badges.slice(i, i + 4));
  }

  return (
    <View
      style={{
        backgroundColor: COLORS.card,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: 16,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontFamily: FONTS.medium, fontSize: 13, color: COLORS.text }}>
          Badges
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>
          {earned} / {badges.length}
        </Text>
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: "row", marginBottom: 0 }}>
          {row.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
          {row.length < 4 &&
            Array.from({ length: 4 - row.length }).map((_, i) => (
              <View key={`spacer-${i}`} style={{ flex: 1, margin: 4 }} />
            ))}
        </View>
      ))}

      {earned > 0 && (
        <View style={{ marginTop: 12 }}>
          {badges
            .filter((b) => b.earned)
            .slice(-1)
            .map((b) => (
              <Text
                key={b.id}
                style={{
                  color: COLORS.accentLight,
                  fontSize: 12,
                  textAlign: "center",
                  fontFamily: FONTS.body,
                }}
              >
                {b.emoji} {b.identityMessage}
              </Text>
            ))}
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: xpData, isLoading: xpLoading } = useUserXP();
  const { data: badges, isLoading: badgesLoading } = useUserBadges();
  const [email, setEmail] = useState<string | null>(null);
  const [isAnon, setIsAnon] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setIsAnon(data.user?.is_anonymous ?? false);
    });
  }, []);

  const totalXP = xpData?.totalXP ?? 0;
  const level = xpData?.level;
  const progress = xpData?.progress ?? 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: SPACING.md,
        paddingBottom: 40,
      }}
    >
      <Text
        style={{
          fontFamily: FONTS.display,
          fontSize: 22,
          color: COLORS.text,
          marginBottom: 32,
        }}
      >
        Profile
      </Text>

      {/* Avatar */}
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
          Every action is a vote for who you're becoming
        </Text>
      </View>

      {/* Level & XP card */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: RADIUS.lg,
          padding: SPACING.md,
          marginBottom: 16,
        }}
      >
        {xpLoading ? (
          <ActivityIndicator color={COLORS.accent} />
        ) : (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <View>
                <Text style={{ color: COLORS.muted, fontSize: 11, marginBottom: 2 }}>
                  LEVEL {level?.level ?? 1}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 28,
                    color: COLORS.accentLight,
                  }}
                >
                  {level?.title ?? "Beginner"}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: COLORS.muted, fontSize: 11, marginBottom: 2 }}>
                  TOTAL XP
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 28,
                    color: COLORS.text,
                  }}
                >
                  {totalXP.toLocaleString()}
                </Text>
              </View>
            </View>

            <XPBar progress={progress} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={{ color: COLORS.muted, fontSize: 11 }}>
                {level?.minXP.toLocaleString()} XP
              </Text>
              <Text style={{ color: COLORS.muted, fontSize: 11 }}>
                {level?.maxXP !== null && level?.maxXP !== undefined
                  ? `${level.maxXP.toLocaleString()} XP`
                  : "∞"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Badges */}
      {badgesLoading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginBottom: 16 }} />
      ) : badges ? (
        <BadgeGrid badges={badges} />
      ) : null}

      {/* XP guide */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: RADIUS.lg,
          padding: SPACING.md,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.medium,
            fontSize: 13,
            color: COLORS.text,
            marginBottom: 12,
          }}
        >
          How you earn XP
        </Text>
        {[
          { label: "Check-off (streak 1–6 days)", xp: "10 XP" },
          { label: "Check-off (streak 7–29 days)", xp: "15 XP" },
          { label: "Check-off (streak 30–89 days)", xp: "20 XP" },
          { label: "Check-off (streak 90+ days)", xp: "30 XP" },
          { label: "First check-off ever", xp: "+50 XP" },
        ].map((row) => (
          <View
            key={row.label}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: COLORS.muted, fontSize: 12, flex: 1 }}>{row.label}</Text>
            <Text
              style={{
                fontFamily: FONTS.mono,
                fontSize: 12,
                color: COLORS.accentLight,
              }}
            >
              {row.xp}
            </Text>
          </View>
        ))}
      </View>

      {/* Account */}
      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Text style={{ color: COLORS.muted, fontSize: 11, marginBottom: 8 }}>
          {isAnon ? "Test-Account (anonym)" : email ?? ""}
        </Text>
        <Pressable
          onPress={async () => {
            if (isAnon) {
              router.push("/auth");
            } else {
              await supabase.auth.signOut();
            }
          }}
        >
          <Text
            style={{
              color: COLORS.accentLight,
              fontSize: 13,
              fontFamily: FONTS.medium,
            }}
          >
            {isAnon ? "Mit E-Mail anmelden" : "Abmelden"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
