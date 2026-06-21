import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react-native";
import { useDispatch } from "../../src/data";
import type { Habit } from "../../src/store/useHabitStore";
import { COLORS, FONTS } from "../../src/theme";
import { ColorPicker } from "../../src/components/ColorPicker";
import { HABIT_COLORS } from "../../src/theme/habitColors";

// Only imported on native — web falls back to TextInput
let DateTimePicker: React.ComponentType<any> | null = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

const STEPS = [
  {
    id: 1,
    title: "Cue",
    subtitle: "Make it obvious",
    law: "1st Law",
  },
  {
    id: 2,
    title: "Craving",
    subtitle: "Make it attractive",
    law: "2nd Law",
  },
  {
    id: 3,
    title: "Response",
    subtitle: "Make it easy",
    law: "3rd Law",
  },
  {
    id: 4,
    title: "Reward",
    subtitle: "Make it satisfying",
    law: "4th Law",
  },
];

type FormData = {
  name: string;
  emoji: string;
  color: string;
  category: NonNullable<Habit["category"]>;
  cue: string;
  when: string;
  reminderTime: string;
  identityStatement: string;
  craving: string;
  response: string;
  twoMinuteEnabled: boolean;
  twoMinuteVersion: string;
  reward: string;
};

const INITIAL_FORM: FormData = {
  name: "",
  emoji: "✨",
  color: HABIT_COLORS[0],
  category: "health",
  cue: "",
  when: "",
  reminderTime: "",
  identityStatement: "",
  craving: "",
  response: "",
  twoMinuteEnabled: false,
  twoMinuteVersion: "",
  reward: "",
};

const CATEGORIES: { value: NonNullable<Habit["category"]>; label: string; emoji: string }[] = [
  { value: "health", label: "Health", emoji: "💪" },
  { value: "learning", label: "Learning", emoji: "📚" },
  { value: "mindfulness", label: "Mind", emoji: "🧘" },
  { value: "social", label: "Social", emoji: "🤝" },
  { value: "other", label: "Other", emoji: "⭐" },
];

function StyledInput({
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.muted}
      multiline={multiline}
      style={{
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: COLORS.text,
        fontFamily: FONTS.body,
        fontSize: 15,
        minHeight: multiline ? 80 : undefined,
        textAlignVertical: multiline ? "top" : undefined,
      }}
    />
  );
}

export default function NewHabitScreen() {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const { mutate: send, isPending } = useDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const progress = (currentStep / STEPS.length) * 100;
  const step = STEPS[currentStep - 1];

  // Identity statement is required on step 2
  const canProceed = currentStep !== 2 || form.identityStatement.trim() !== "";

  const update = (key: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCreate = () => {
    send(
      {
        type: "CREATE_HABIT",
        payload: {
          name: form.name || form.response || "New Habit",
          emoji: form.emoji,
          color: form.color,
          category: form.category,
          cue: form.cue,
          craving: form.craving,
          response: form.response,
          reward: form.reward,
          identityStatement: form.identityStatement || undefined,
          twoMinuteVersion: form.twoMinuteEnabled ? form.twoMinuteVersion : undefined,
          frequency: "daily",
          reminderTime: form.reminderTime || undefined,
          isActive: true,
        },
      },
      {
        onSuccess: (result) => {
          if (result.ok) router.back();
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <Pressable onPress={() => router.back()}>
            <ChevronLeft color={COLORS.muted} size={24} />
          </Pressable>
          <Text style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.text }}>
            New Habit
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 4,
            backgroundColor: COLORS.border,
            borderRadius: 2,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              height: 4,
              width: `${progress}%`,
              backgroundColor: COLORS.accent,
              borderRadius: 2,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
          {STEPS.map((s) => (
            <Text
              key={s.id}
              style={{
                fontSize: 11,
                color: s.id <= currentStep ? COLORS.accent : COLORS.muted,
                fontFamily: FONTS.medium,
              }}
            >
              {s.title}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step Card */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 11, color: COLORS.accent, fontFamily: FONTS.medium, marginBottom: 4 }}>
            {step.law}
          </Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.text, marginBottom: 2 }}>
            {step.title}
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>
            {step.subtitle}
          </Text>

          {/* Step 1: Cue */}
          {currentStep === 1 && (
            <View style={{ gap: 16 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  Habit name
                </Text>
                <StyledInput
                  value={form.name}
                  onChangeText={(t) => update("name", t)}
                  placeholder="e.g., Morning meditation"
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  Emoji
                </Text>
                <StyledInput
                  value={form.emoji}
                  onChangeText={(t) => update("emoji", t)}
                  placeholder="✨"
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  Color
                </Text>
                <ColorPicker
                  value={form.color}
                  onChange={(hex) => update("color", hex)}
                />
              </View>
              <View style={{ gap: 8 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  Category
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.value}
                      onPress={() => update("category", cat.value)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor:
                          form.category === cat.value ? COLORS.accent : COLORS.border,
                        backgroundColor:
                          form.category === cat.value ? `${COLORS.accent}20` : "transparent",
                      }}
                    >
                      <Text style={{ color: COLORS.text, fontSize: 13 }}>
                        {cat.emoji} {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  What triggers this habit?
                </Text>
                <StyledInput
                  value={form.cue}
                  onChangeText={(t) => update("cue", t)}
                  placeholder="e.g., After I pour my morning coffee..."
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  When and where?
                </Text>
                <StyledInput
                  value={form.when}
                  onChangeText={(t) => update("when", t)}
                  placeholder="e.g., 7:00 AM in the kitchen"
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  Erinnerung{" "}
                  <Text style={{ color: COLORS.muted, fontStyle: "italic" }}>(optional)</Text>
                </Text>
                {Platform.OS === "web" ? (
                  <StyledInput
                    value={form.reminderTime}
                    onChangeText={(t) => update("reminderTime", t)}
                    placeholder="HH:MM"
                  />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Pressable
                      onPress={() => setShowTimePicker(true)}
                      style={{
                        flex: 1,
                        backgroundColor: COLORS.background,
                        borderColor: COLORS.border,
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: form.reminderTime ? COLORS.text : COLORS.muted,
                          fontFamily: FONTS.body,
                          fontSize: 15,
                        }}
                      >
                        {form.reminderTime || "Keine Erinnerung"}
                      </Text>
                    </Pressable>
                    {form.reminderTime ? (
                      <Pressable onPress={() => update("reminderTime", "")}>
                        <X color={COLORS.muted} size={20} />
                      </Pressable>
                    ) : null}
                  </View>
                )}
                {showTimePicker && DateTimePicker ? (
                  <DateTimePicker
                    value={reminderDate}
                    mode="time"
                    is24Hour
                    onChange={(_: unknown, date?: Date) => {
                      setShowTimePicker(false);
                      if (date) {
                        setReminderDate(date);
                        const h = date.getHours().toString().padStart(2, "0");
                        const m = date.getMinutes().toString().padStart(2, "0");
                        update("reminderTime", `${h}:${m}`);
                      }
                    }}
                  />
                ) : null}
              </View>
            </View>
          )}

          {/* Step 2: Craving */}
          {currentStep === 2 && (
            <View style={{ gap: 16 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  I am someone who...{" "}
                  <Text style={{ color: COLORS.accent, fontStyle: "italic" }}>(Pflichtfeld)</Text>
                </Text>
                <StyledInput
                  value={form.identityStatement}
                  onChangeText={(t) => update("identityStatement", t)}
                  placeholder="e.g., moves their body every day"
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  What makes this appealing?
                </Text>
                <StyledInput
                  value={form.craving}
                  onChangeText={(t) => update("craving", t)}
                  placeholder="e.g., I'll feel calm and focused"
                  multiline
                />
              </View>
            </View>
          )}

          {/* Step 3: Response */}
          {currentStep === 3 && (
            <View style={{ gap: 16 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  What's the habit?
                </Text>
                <StyledInput
                  value={form.response}
                  onChangeText={(t) => update("response", t)}
                  placeholder="e.g., Meditate for 10 minutes"
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: COLORS.background,
                  borderColor: COLORS.border,
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <View>
                  <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 14 }}>
                    2-Minute Version
                  </Text>
                  <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 2 }}>
                    Start smaller if needed
                  </Text>
                </View>
                <Switch
                  value={form.twoMinuteEnabled}
                  onValueChange={(v) => update("twoMinuteEnabled", v)}
                  trackColor={{ true: COLORS.accent, false: COLORS.border }}
                  thumbColor={COLORS.text}
                />
              </View>
              {form.twoMinuteEnabled && (
                <View style={{ gap: 6 }}>
                  <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                    2-Minute version
                  </Text>
                  <StyledInput
                    value={form.twoMinuteVersion}
                    onChangeText={(t) => update("twoMinuteVersion", t)}
                    placeholder="e.g., Sit and breathe for 2 minutes"
                  />
                </View>
              )}
            </View>
          )}

          {/* Step 4: Reward */}
          {currentStep === 4 && (
            <View style={{ gap: 16 }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: COLORS.text, fontFamily: FONTS.medium, fontSize: 13 }}>
                  How will you celebrate?
                </Text>
                <StyledInput
                  value={form.reward}
                  onChangeText={(t) => update("reward", t)}
                  placeholder="e.g., Check it off and smile"
                  multiline
                />
              </View>
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {currentStep > 1 && (
            <Pressable
              onPress={() => setCurrentStep((s) => s - 1)}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.card,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <ChevronLeft color={COLORS.text} size={18} />
              <Text style={{ color: COLORS.text, fontFamily: FONTS.medium }}>Back</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (!canProceed || isPending) return;
              if (currentStep < STEPS.length) {
                setCurrentStep((s) => s + 1);
              } else {
                handleCreate();
              }
            }}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 12,
              backgroundColor: COLORS.accent,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: canProceed && !isPending ? 1 : 0.4,
              shadowColor: COLORS.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canProceed ? 0.4 : 0,
              shadowRadius: 10,
              elevation: canProceed ? 6 : 0,
            }}
          >
            {isPending ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Text style={{ color: "white", fontFamily: FONTS.medium }}>
                  {currentStep === STEPS.length ? "Create Habit" : "Next"}
                </Text>
                {currentStep < STEPS.length ? (
                  <ChevronRight color="white" size={18} />
                ) : (
                  <Check color="white" size={18} />
                )}
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
