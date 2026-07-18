// ─────────────────────────────────────────────────────────────────────────────
// components/LessonCard.tsx
// Displays a single lesson row in the Learn screen list.
// Shows completed ✅, in-progress (highlighted + emoji), or locked 🔒 state.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Lesson } from "@/types/learning";

// ── Status helpers ─────────────────────────────────────────────────────────────

export type LessonStatus = "completed" | "in_progress" | "locked" | "available";

interface Props {
  lesson: Lesson;
  index: number; // 1-based lesson number
  status: LessonStatus;
  onPress: () => void;
}

// Map lesson type to a friendly emoji used for the "in progress" badge
const LESSON_TYPE_EMOJI: Record<string, string> = {
  vocabulary: "📚",
  grammar: "✏️",
  conversation: "💬",
  audio: "🎧",
  ai_teacher: "🤖",
};

export function LessonCard({ lesson, index, status, onPress }: Props) {
  const isInProgress = status === "in_progress";
  const isCompleted = status === "completed";
  const isLocked = status === "locked";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isInProgress && styles.cardActive,
        pressed && styles.cardPressed,
      ]}
    >
      <View className="flex-1 pr-3">
        {/* Lesson number + title */}
        <Text
          className={`text-[12px] mb-0.5 ${isInProgress ? "font-[Poppins_600SemiBold] text-[#6C4EF5]" : "font-[Poppins_400Regular] text-[#6B7280]"}`}
        >
          Lesson {index}
        </Text>
        <Text
          className={`font-[Poppins_600SemiBold] text-[15px] ${isLocked ? "text-[#6B7280]" : "text-[#0D132B]"}`}
          numberOfLines={1}
        >
          {lesson.title}
        </Text>

        {/* Sub-info row */}
        {isInProgress && (
          <Text className="font-[Poppins_400Regular] text-[12px] text-[#6C4EF5] mt-0.5">
            In progress
          </Text>
        )}
        {isLocked && (
          <Text className="font-[Poppins_400Regular] text-[12px] text-[#9CA3AF] mt-0.5">
            0 / {lesson.activities.length} activities
          </Text>
        )}
      </View>

      {/* Right indicator */}
      <View className="items-center justify-center min-w-[32px]">
        {isCompleted && (
          <View className="w-8 h-8 items-center justify-center">
            <Ionicons name="checkmark-circle" size={28} color="#21C16B" />
          </View>
        )}
        {isInProgress && (
          <Text className="text-[28px]">
            {LESSON_TYPE_EMOJI[lesson.type] ?? "📖"}
          </Text>
        )}
        {isLocked && (
          <Ionicons name="lock-closed-outline" size={22} color="#9CA3AF" />
        )}
        {status === "available" && (
          <Ionicons name="chevron-forward" size={20} color="#6C4EF5" />
        )}
      </View>
    </Pressable>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardActive: {
    backgroundColor: "#F0EDFF",
    borderWidth: 2,
    borderColor: "#6C4EF5",
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
