// ─────────────────────────────────────────────────────────────────────────────
// app/lesson/[id].tsx
// AI Teacher audio lesson screen.
// Full-screen, non-scrollable. The teacher visual fills the entire screen.
// Controls and feedback are overlaid at the bottom of the visual area.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getLessonById } from "@/data/lessons";
import type { Lesson } from "@/types/learning";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FeedbackScore = "Excellent" | "Great" | "Good" | "Fair";

interface LessonFeedback {
  speaking: FeedbackScore;
  pronunciation: FeedbackScore;
  grammar: FeedbackScore;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SCORE_COLORS: Record<FeedbackScore, string> = {
  Excellent: "#21C16B",
  Great: "#6C4EF5",
  Good: "#6C4EF5",
  Fair: "#FFC800",
};

function scoreColor(score: FeedbackScore): string {
  return SCORE_COLORS[score];
}

// ─────────────────────────────────────────────────────────────────────────────
// Teacher response messages
// ─────────────────────────────────────────────────────────────────────────────

const TEACHER_MESSAGES = [
  { target: "¡Hola! ¿Cómo te llamas?", translation: "Hello! What's your name? 👋" },
  { target: "¡Muy bien! That was great! 👏", translation: "Keep going, you're doing amazing!" },
  { target: "¿De dónde eres?", translation: "Where are you from? 🌍" },
  { target: "¡Excelente pronunciación!", translation: "Excellent pronunciation! ⭐" },
  { target: "Ahora, repite después de mí.", translation: "Now, repeat after me." },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mic pulse animation hook
// ─────────────────────────────────────────────────────────────────────────────

function usePulse(active: boolean) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.5, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: 350, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 700, easing: Easing.in(Easing.ease), useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 350, useNativeDriver: true }),
          ]),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      scale.setValue(1);
      opacity.setValue(0);
    }
  }, [active]);

  return { scale, opacity };
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson: Lesson | undefined = getLessonById(id ?? "");

  const [isMicOn, setIsMicOn] = useState(false);
  const [isSubtitlesOn, setIsSubtitlesOn] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [sessionDurationSecs, setSessionDurationSecs] = useState(0);

  const [feedback] = useState<LessonFeedback>({
    speaking: "Excellent",
    pronunciation: "Great",
    grammar: "Good",
  });

  const { scale: micPulseScale, opacity: micPulseOpacity } = usePulse(isMicOn);

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDurationSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Advance teacher message every 6 s when mic is active
  useEffect(() => {
    if (!isMicOn) return;
    const timeout = setTimeout(() => {
      setMessageIndex((i) => (i + 1) % TEACHER_MESSAGES.length);
    }, 6000);
    return () => clearTimeout(timeout);
  }, [isMicOn, messageIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const currentMessage = TEACHER_MESSAGES[messageIndex];

  // ── Not found ───────────────────────────────────────────────────────────────
  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Lesson not found.</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Full-screen scene — flex:1 fills everything below SafeAreaView ── */}
      <View style={styles.scene}>

        {/* Room background fills the whole scene */}
        <View style={styles.roomBackground} />

        {/* ── Header — floats at the top of the scene ─────────────────────── */}
        <View style={styles.header}>
          <Pressable style={styles.headerBack} onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={22} color="#0D132B" />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>AI Teacher</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineLabel}>Online</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.xpBadge}>
              <Ionicons name="flash" size={12} color="#6C4EF5" />
              <Text style={styles.xpBadgeText}>{lesson.totalXP}</Text>
            </View>
            <Pressable hitSlop={12}>
              <Ionicons name="notifications-outline" size={22} color="#0D132B" />
            </Pressable>
          </View>
        </View>

        {/* Session timer — top left, below header */}
        <View style={styles.timerBadge}>
          <Ionicons name="time-outline" size={12} color="#FFFFFF" />
          <Text style={styles.timerText}>{formatTime(sessionDurationSecs)}</Text>
        </View>

        {/* Student thumbnail — top right */}
        <View style={styles.studentThumbnail}>
          <Ionicons name="person" size={32} color="#6C4EF5" />
        </View>

        {/* Mascot — centered in the scene */}
        <Image
          source={images.mascotWelcome}
          style={styles.mascotImage}
          contentFit="contain"
        />

        {/* Speech bubble — above the bottom panel */}
        {isSubtitlesOn && (
          <View style={styles.speechBubble}>
            <View style={styles.speechBubbleContent}>
              <View style={styles.speechBubbleText}>
                <Text style={styles.speechTarget}>{currentMessage.target}</Text>
                <Text style={styles.speechTranslation}>{currentMessage.translation}</Text>
              </View>
              <Pressable hitSlop={8}>
                <Ionicons name="volume-high" size={22} color="#6C4EF5" />
              </Pressable>
            </View>
            {/* Bubble tail pointing left toward the mascot */}
            <View style={styles.bubbleTail} />
          </View>
        )}

        {/* ── Bottom panel: controls + feedback, overlaid on the scene ──────── */}
        <View style={styles.bottomPanel}>

          {/* Controls row */}
          <View style={styles.controls}>
            {/* Camera (visual placeholder — audio-only) */}
            <View style={styles.controlItem}>
              <Pressable style={[styles.controlBtn, styles.controlBtnInactive]}>
                <Ionicons name="videocam-off" size={22} color="#6B7280" />
              </Pressable>
              <Text style={styles.controlLabel}>Camera</Text>
            </View>

            {/* Mic */}
            <View style={styles.controlItem}>
              <View>
                <Animated.View
                  style={[
                    styles.micPulse,
                    { transform: [{ scale: micPulseScale }], opacity: micPulseOpacity },
                  ]}
                />
                <Pressable
                  style={[styles.controlBtn, isMicOn && styles.controlBtnActive]}
                  onPress={() => setIsMicOn((v) => !v)}
                >
                  <Ionicons
                    name={isMicOn ? "mic" : "mic-off"}
                    size={22}
                    color={isMicOn ? "#FFFFFF" : "#6B7280"}
                  />
                </Pressable>
              </View>
              <Text style={styles.controlLabel}>Mic</Text>
            </View>

            {/* Subtitles */}
            <View style={styles.controlItem}>
              <Pressable
                style={[styles.controlBtn, isSubtitlesOn && styles.controlBtnActive]}
                onPress={() => setIsSubtitlesOn((v) => !v)}
              >
                <Ionicons
                  name="text"
                  size={22}
                  color={isSubtitlesOn ? "#FFFFFF" : "#6B7280"}
                />
              </Pressable>
              <Text style={styles.controlLabel}>Subtitles</Text>
            </View>

            {/* End Call */}
            <View style={styles.controlItem}>
              <Pressable
                style={[styles.controlBtn, styles.controlBtnEndCall]}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="call"
                  size={22}
                  color="#FFFFFF"
                  style={{ transform: [{ rotate: "135deg" }] }}
                />
              </Pressable>
              <Text style={styles.controlLabel}>End Call</Text>
            </View>
          </View>

          {/* Feedback strip */}
          <View style={styles.feedbackCard}>
            {(
              [
                { label: "Speaking", score: feedback.speaking },
                { label: "Pronunciation", score: feedback.pronunciation },
                { label: "Grammar", score: feedback.grammar },
              ] as { label: string; score: FeedbackScore }[]
            ).map((item, index) => (
              <View
                key={item.label}
                style={[styles.feedbackItem, index < 2 && styles.feedbackItemBorder]}
              >
                <Text style={styles.feedbackLabel}>{item.label}</Text>
                <Text style={[styles.feedbackScore, { color: scoreColor(item.score) }]}>
                  {item.score}
                </Text>
              </View>
            ))}
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Root ───────────────────────────────────────────────────────────────────
  safe: {
    flex: 1,
    backgroundColor: "#C8CDD8",
  },

  // ── Full-screen scene ───────────────────────────────────────────────────────
  scene: {
    flex: 1,
    position: "relative",
  },
  roomBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#C8CDD8",
  },

  // ── Header (floats at the top of the scene) ────────────────────────────────
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    zIndex: 20,
  },
  headerBack: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#0D132B",
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#21C16B",
  },
  onlineLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#21C16B",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: 80,
    justifyContent: "flex-end",
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F3EFFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  xpBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#6C4EF5",
  },

  // ── Timer badge ─────────────────────────────────────────────────────────────
  timerBadge: {
    position: "absolute",
    top: 76,          // just below the header
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  timerText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#FFFFFF",
  },

  // ── Student thumbnail ───────────────────────────────────────────────────────
  studentThumbnail: {
    position: "absolute",
    top: 76,          // just below the header
    right: 16,
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: "#E8EBFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },

  // ── Mascot ──────────────────────────────────────────────────────────────────
  mascotImage: {
    position: "absolute",
    bottom: 260,      // sits above the bottom panel
    left: -10,
    width: 280,
    height: 280,
  },

  // ── Speech bubble ───────────────────────────────────────────────────────────
  speechBubble: {
    position: "absolute",
    bottom: 220,      // just above the controls row
    left: 200,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 10,
  },
  speechBubbleContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  speechBubbleText: {
    flex: 1,
  },
  speechTarget: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#0D132B",
  },
  speechTranslation: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  bubbleTail: {
    position: "absolute",
    bottom: 14,
    left: -8,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderRightColor: "#FFFFFF",
  },

  // ── Bottom panel (controls + feedback) — absolute, anchored to the bottom ──
  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 15,
  },

  // ── Controls row ────────────────────────────────────────────────────────────
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 28,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  controlItem: {
    alignItems: "center",
    gap: 6,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  controlBtnInactive: {
    backgroundColor: "#F3F4F6",
  },
  controlBtnActive: {
    backgroundColor: "#6C4EF5",
    shadowColor: "#6C4EF5",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  controlBtnEndCall: {
    backgroundColor: "#FF4D4F",
    shadowColor: "#FF4D4F",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  controlLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  micPulse: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#6C4EF5",
    zIndex: -1,
  },

  // ── Feedback strip ──────────────────────────────────────────────────────────
  feedbackCard: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: 8,
  },
  feedbackItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 4,
  },
  feedbackItemBorder: {
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
  },
  feedbackLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#0D132B",
  },
  feedbackScore: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
  },

  // ── Not found ───────────────────────────────────────────────────────────────
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  notFoundText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#6B7280",
  },
  backButton: {
    backgroundColor: "#6C4EF5",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
