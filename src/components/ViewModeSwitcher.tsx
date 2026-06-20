import { View, Pressable } from "react-native";
import { Rows3, LayoutGrid, CalendarDays } from "lucide-react-native";
import { COLORS } from "../theme";
import type { ViewMode } from "../hooks/useViewMode";

type Props = {
  viewMode: ViewMode;
  onChange: (m: ViewMode) => void;
};

const ITEMS: { mode: ViewMode; Icon: typeof Rows3 }[] = [
  { mode: "full", Icon: Rows3 },
  { mode: "compact", Icon: LayoutGrid },
  { mode: "week", Icon: CalendarDays },
];

export function ViewModeSwitcher({ viewMode, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 6,
        gap: 6,
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      }}
    >
      {ITEMS.map(({ mode, Icon }) => {
        const active = viewMode === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            hitSlop={6}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Icon size={20} color={active ? COLORS.accent : COLORS.muted} />
          </Pressable>
        );
      })}
    </View>
  );
}
