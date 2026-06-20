import * as Haptics from "expo-haptics";
import { useDispatch, useTodayDashboard } from "../data";
import { xpForCheckOff } from "../utils/xp";

export interface CheckedToastInfo {
  xp: number;
  reward: string;
}

export interface UseHabitToggleOptions {
  /**
   * Called when a toggle turns a habit ON for today.
   * Not called for off-toggles, and not called for past-day on-toggles
   * (retroactive edits do not award the XP toast).
   */
  onChecked?: (info: CheckedToastInfo) => void;
}

export interface UseHabitToggleResult {
  toggle: (habitId: string, date: string) => void;
}

/**
 * Shared habit-toggle logic: fires haptic, dispatches TOGGLE_CHECKOFF, and
 * surfaces XPToast info via the `onChecked` callback when (and only when)
 * the toggle turns TODAY's check on.
 */
export function useHabitToggle(opts: UseHabitToggleOptions = {}): UseHabitToggleResult {
  const { items } = useTodayDashboard();
  const { mutate: send } = useDispatch();

  const toggle = (habitId: string, date: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const todayStr = new Date().toISOString().split("T")[0];
    const habit = items.find((h) => h.id === habitId);

    if (!habit) {
      // Defensive: dispatch anyway so the data layer can decide.
      send({ type: "TOGGLE_CHECKOFF", payload: { habitId, date } });
      return;
    }

    // Determine prior completion state on `date`.
    let wasCompleted = false;
    if (date === todayStr) {
      wasCompleted = habit.isCompletedToday;
    } else {
      // recentDays last entry = today; offset back from there.
      const today = new Date(todayStr + "T00:00:00Z");
      const target = new Date(date + "T00:00:00Z");
      const offsetDays = Math.round(
        (today.getTime() - target.getTime()) / 86_400_000
      );
      const idx = habit.recentDays.length - 1 - offsetDays;
      wasCompleted = idx >= 0 && idx < habit.recentDays.length
        ? habit.recentDays[idx] === true
        : false;
    }

    send({ type: "TOGGLE_CHECKOFF", payload: { habitId, date } });

    // Toast only when turning ON, and only for today.
    if (!wasCompleted && date === todayStr) {
      opts.onChecked?.({
        xp: xpForCheckOff(habit.currentStreak + 1),
        reward: habit.reward,
      });
    }
  };

  return { toggle };
}
