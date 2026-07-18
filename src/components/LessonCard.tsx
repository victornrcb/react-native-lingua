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
  index: number;           // 1-based lesson number
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
      <View style={styles.left}>
        {/* Lesson number + title */}
        <Text style={[styles.lessonNumber, isInProgress && styles.lessonNumberActive]}>
          Lesson {index}
        </Text>
        <Text
          style={[
            styles.lessonTitle,
            isInProgress && styles.lessonTitleActive,
            isLocked && styles.lessonTitleLocked,
          ]}
          numberOfLines={1}
        >
          {lesson.title}
        </Text>

        {/* Sub-info row */}
        {isInProgress && (
          <Text style={styles.inProgressLabel}>In progress</Text>
        )}
        {isLocked && (
          <Text style={styles.subLabel}>0 / {lesson.activities.length} lessons</Text>
        )}
      </View>

      {/* Right indicator */}
      <View style={styles.right}>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={28} color="#21C16B" />
          </View>
        )}
        {isInProgress && (
          <Text style={styles.progressEmoji}>
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
  left: {
    flex: 1,
    paddingRight: 12,
  },
  lessonNumber: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  lessonNumberActive: {
    color: "#6C4EF5",
    fontFamily: "Poppins_600SemiBold",
  },
  lessonTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#0D132B",
  },
  lessonTitleActive: {
    color: "#0D132B",
  },
  lessonTitleLocked: {
    color: "#6B7280",
  },
  inProgressLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#6C4EF5",
    marginTop: 2,
  },
  subLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  right: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 32,
  },
  completedBadge: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  progressEmoji: {
    fontSize: 28,
  },
});
