import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "../data";

export function useHabitActions() {
  const router = useRouter();
  const { mutate: send } = useDispatch();

  const openActions = (id: string, name: string) => {
    Alert.alert(name, undefined, [
      { text: "Abbrechen", style: "cancel" },
      {
        text: "Bearbeiten",
        onPress: () => router.push(`/habit/${id}`),
      },
      {
        text: "Archivieren",
        style: "destructive",
        onPress: () =>
          Alert.alert(
            "Gewohnheit archivieren",
            `"${name}" archivieren?`,
            [
              { text: "Abbrechen", style: "cancel" },
              {
                text: "Archivieren",
                style: "destructive",
                onPress: () =>
                  send({ type: "ARCHIVE_HABIT", payload: { id } }),
              },
            ]
          ),
      },
    ]);
  };

  return { openActions };
}
