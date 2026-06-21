import "react-native-url-polyfill/auto";
import "../global.css";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../src/lib/supabase";
import { requestPermissions } from "../src/utils/notifications";
import { ONBOARDING_KEY } from "./onboarding";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AuthGuard({ session }: { session: Session | null | undefined }) {
  const segments = useSegments();
  const router = useRouter();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => setOnboardingDone(v === "true"));
  }, []);

  useEffect(() => {
    if (session !== null || signingIn) return;
    setSigningIn(true);
    supabase.auth.signInAnonymously().finally(() => setSigningIn(false));
  }, [session, signingIn]);

  useEffect(() => {
    if (!session || onboardingDone === null) return;
    const inAuthRoute = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    if (inAuthRoute) return;
    if (!onboardingDone && !inOnboarding) { router.replace("/onboarding"); return; }
    if (onboardingDone && inOnboarding) { router.replace("/"); return; }
  }, [session, segments, onboardingDone]);

  return null;
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) queryClient.clear();
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      requestPermissions();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthGuard session={session} />
          <StatusBar style="light" />
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false, animation: "fade" }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen
              name="habit/new"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="habit/[id]"
              options={{ headerShown: false }}
            />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
