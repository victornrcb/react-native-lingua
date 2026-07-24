// ─────────────────────────────────────────────────────────────────────────────
// app/lesson/[id].tsx
// AI Teacher audio lesson screen.
// Full-screen, non-scrollable. The teacher visual fills the entire screen.
// Controls and feedback are overlaid at the bottom of the visual area.
//
// Stream call type: audio_room
//   - Lesson context (language, goals, vocab, phrases, aiTeacherPrompt) is
//     packed into the call's custom data before joining so the Vision Agent
//     can read it on join.
//   - The agent is started via POST /api/agent/start after the user joins.
//   - The agent is stopped via POST /api/agent/stop when the user ends the
//     call or when the screen unmounts.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUser } from "@clerk/expo";
import {
  Call,
  CallingState,
  ParticipantView,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";
import Constants from "expo-constants";

import { images } from "@/constants/images";
import { getLessonById } from "@/data/lessons";
import { useLanguageStore } from "@/store/languageStore";
import type { Lesson } from "@/types/learning";

const API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY || "bvcdbc4de524";

// Call type — audio_room lets the Vision Agent publish audio via go_live().
const CALL_TYPE = "audio_room";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FeedbackScore = "Excellent" | "Great" | "Good" | "Fair";

interface LessonFeedback {
  speaking: FeedbackScore;
  pronunciation: FeedbackScore;
  grammar: FeedbackScore;
}

/**
 * Connection state of the Vision Agent.
 * idle      — not yet started (waiting for call to join)
 * connecting — start request in flight
 * connected — agent is live on the call
 * failed    — start request failed
 */
type AgentStatus = "idle" | "connecting" | "connected" | "failed";

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
  {
    target: "¡Hola! ¿Cómo te llamas?",
    translation: "Hello! What's your name? 👋",
  },
  {
    target: "¡Muy bien! That was great! 👏",
    translation: "Keep going, you're doing amazing!",
  },
  { target: "¿De dónde eres?", translation: "Where are you from? 🌍" },
  {
    target: "¡Excelente pronunciación!",
    translation: "Excellent pronunciation! ⭐",
  },
  {
    target: "Ahora, repite después de mí.",
    translation: "Now, repeat after me.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mic pulse animation hook
// ─────────────────────────────────────────────────────────────────────────────

function usePulse(active: boolean) {
  // Lazy initialisers give stable Animated.Value identities without useRef.
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1.5,
              duration: 700,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.4,
              duration: 350,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 700,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
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
// Agent status badge config
// ─────────────────────────────────────────────────────────────────────────────

const AGENT_STATUS_CONFIG: Record<
  AgentStatus,
  { label: string; color: string }
> = {
  idle: { label: "AI Teacher: idle", color: "#9CA3AF" },
  connecting: { label: "AI Teacher: connecting…", color: "#FFC800" },
  connected: { label: "AI Teacher: live", color: "#21C16B" },
  failed: { label: "AI Teacher: failed", color: "#FF4D4F" },
};

// ─────────────────────────────────────────────────────────────────────────────
// API helpers (client → Expo API routes)
// ─────────────────────────────────────────────────────────────────────────────

function buildApiBase(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri ? `http://${hostUri}` : "";
}

async function startAgent(
  callType: string,
  callId: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${buildApiBase()}/api/agent/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callType, callId }),
    });
    const data = (await res.json()) as { ok: boolean; sessionId?: string };
    if (data.ok && data.sessionId) return data.sessionId;
    console.warn("[startAgent] Unexpected response:", data);
    return null;
  } catch (err) {
    console.error("[startAgent] Request failed:", err);
    return null;
  }
}

async function stopAgent(callId: string, sessionId: string): Promise<void> {
  try {
    await fetch(`${buildApiBase()}/api/agent/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId, sessionId }),
    });
  } catch (err) {
    console.warn("[stopAgent] Stop request failed (non-fatal):", err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inner UI Component
// ─────────────────────────────────────────────────────────────────────────────

interface LessonInnerUIProps {
  lesson: Lesson;
  agentStatus: AgentStatus;
  onEndCall: () => Promise<void>;
}

function LessonInnerUI({ lesson, agentStatus, onEndCall }: LessonInnerUIProps) {
  const call = useCall();
  const {
    useCallCallingState,
    useMicrophoneState,
    useCameraState,
    useLocalParticipant,
  } = useCallStateHooks();
  const callingState = useCallCallingState();
  const { isMute, status: micStatus } = useMicrophoneState();
  const isMicOn = !isMute && micStatus === "enabled";
  const { isMute: isCameraMute, status: cameraStatus } = useCameraState();
  const isCameraOn = !isCameraMute && cameraStatus === "enabled";
  const localParticipant = useLocalParticipant();

  const [isSubtitlesOn, setIsSubtitlesOn] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);
  const [sessionDurationSecs, setSessionDurationSecs] = useState(0);

  const [feedback] = useState<LessonFeedback>({
    speaking: "Excellent",
    pronunciation: "Great",
    grammar: "Good",
  });

  const { scale: micPulseScale, opacity: micPulseOpacity } = usePulse(isMicOn);
  const { width: windowWidth } = useWindowDimensions();

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
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleMicToggle = async () => {
    if (!call) return;
    try {
      if (isMicOn) {
        await call.microphone.disable();
      } else {
        await call.microphone.enable();
      }
    } catch (err) {
      console.error("Failed to toggle mic", err);
    }
  };

  const handleCameraToggle = async () => {
    if (!call) return;
    try {
      if (isCameraOn) {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
    } catch (err) {
      console.error("Failed to toggle camera", err);
    }
  };

  const currentMessage = TEACHER_MESSAGES[messageIndex];

  // Helper to format calling state for the UI badge
  const getStatusLabel = () => {
    switch (callingState) {
      case CallingState.JOINING:
        return { label: "Connecting", color: "#FFC800" };
      case CallingState.JOINED:
        return { label: "Connected", color: "#21C16B" };
      case CallingState.RECONNECTING:
        return { label: "Reconnecting", color: "#FFC800" };
      case CallingState.LEFT:
        return { label: "Ended", color: "#FF4D4F" };
      case CallingState.OFFLINE:
        return { label: "Offline", color: "#6B7280" };
      default:
        return { label: "Connecting", color: "#FFC800" };
    }
  };

  const statusInfo = getStatusLabel();
  const agentStatusInfo = AGENT_STATUS_CONFIG[agentStatus];

  return (
    <View className="flex-1 relative">
      {/* Room background fills the whole scene */}
      <View className="absolute inset-0 bg-[#C8CDD8]" />

      {/* ── Header — floats at the top of the scene ─────────────────────── */}
      <View style={styles.header}>
        <View className="w-9 h-9 items-center justify-center">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#0D132B" />
          </Pressable>
        </View>

        <View className="flex-1 items-center">
          <Text className="font-[Poppins_600SemiBold] text-[16px] text-[#0D132B]">
            AI Teacher
          </Text>
          {/* Stream call status */}
          <View className="flex-row items-center gap-1">
            <View
              className={`w-[7px] h-[7px] rounded-full`}
              style={{ backgroundColor: statusInfo.color }}
            />
            <Text
              className="font-[Poppins_400Regular] text-[12px]"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.label}
            </Text>
          </View>
          {/* Agent status — shown below the call status */}
          <View className="flex-row items-center gap-1 mt-[1px]">
            <View
              style={[
                styles.agentDot,
                { backgroundColor: agentStatusInfo.color },
              ]}
            />
            <Text
              className="font-[Poppins_400Regular] text-[11px]"
              style={{ color: agentStatusInfo.color }}
            >
              {agentStatusInfo.label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-[10px] w-20 justify-end">
          <View className="flex-row items-center gap-[3px] bg-[#F3EFFF] rounded-xl px-2 py-[3px]">
            <Ionicons name="flash" size={12} color="#6C4EF5" />
            <Text className="font-[Poppins_600SemiBold] text-[12px] text-[#6C4EF5]">
              {lesson.totalXP}
            </Text>
          </View>
          <Pressable
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={22} color="#0D132B" />
          </Pressable>
        </View>
      </View>

      {/* Session timer — top left, below header */}
      <View style={styles.timerBadge}>
        <Ionicons name="time-outline" size={12} color="#FFFFFF" />
        <Text className="font-[Poppins_500Medium] text-[12px] text-white">
          {formatTime(sessionDurationSecs)}
        </Text>
      </View>

      {/* Student thumbnail — top right */}
      <View style={styles.studentThumbnail}>
        {isCameraOn && localParticipant ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: 14, overflow: "hidden" },
            ]}
          >
            <ParticipantView
              participant={localParticipant}
              style={StyleSheet.absoluteFill}
              objectFit="cover"
            />
          </View>
        ) : (
          <Ionicons name="person" size={32} color="#6C4EF5" />
        )}
        {isMicOn && (
          <View className="absolute top-1 right-1 bg-[#21C16B] rounded-full p-[2px] z-10">
            <Ionicons name="mic" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Mascot — centered in the scene */}
      <Image
        source={images.mascotWelcome}
        style={styles.mascotImage}
        contentFit="contain"
      />

      {/* Speech bubble — above the bottom panel */}
      {isSubtitlesOn && (
        <View
          style={[
            styles.speechBubble,
            { left: Math.round(windowWidth * 0.52) },
          ]}
        >
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Text className="font-[Poppins_600SemiBold] text-[14px] text-[#0D132B]">
                {currentMessage.target}
              </Text>
              <Text className="font-[Poppins_400Regular] text-[12px] text-[#6B7280] mt-[2px]">
                {currentMessage.translation}
              </Text>
            </View>
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Play audio"
            >
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
        <View className="flex-row justify-center items-start gap-7 pt-5 pb-4 px-4">
          {/* Camera */}
          <View className="items-center gap-1.5">
            <Pressable
              style={[
                styles.controlBtn,
                isCameraOn
                  ? styles.controlBtnActive
                  : styles.controlBtnInactive,
              ]}
              onPress={handleCameraToggle}
              accessibilityRole="button"
              accessibilityLabel={isCameraOn ? "Camera off" : "Camera on"}
              accessibilityState={{ checked: isCameraOn }}
            >
              <Ionicons
                name={isCameraOn ? "videocam" : "videocam-off"}
                size={22}
                color={isCameraOn ? "#FFFFFF" : "#6B7280"}
              />
            </Pressable>
            <Text className="font-[Poppins_400Regular] text-[11px] text-[#6B7280] text-center">
              Camera
            </Text>
          </View>

          {/* Mic */}
          <View className="items-center gap-1.5">
            <View>
              <Animated.View
                style={[
                  styles.micPulse,
                  {
                    transform: [{ scale: micPulseScale }],
                    opacity: micPulseOpacity,
                  },
                ]}
              />
              <Pressable
                style={[styles.controlBtn, isMicOn && styles.controlBtnActive]}
                onPress={handleMicToggle}
                accessibilityRole="button"
                accessibilityLabel={
                  isMicOn ? "Mute microphone" : "Unmute microphone"
                }
                accessibilityState={{ checked: isMicOn }}
              >
                <Ionicons
                  name={isMicOn ? "mic" : "mic-off"}
                  size={22}
                  color={isMicOn ? "#FFFFFF" : "#6B7280"}
                />
              </Pressable>
            </View>
            <Text className="font-[Poppins_400Regular] text-[11px] text-[#6B7280] text-center">
              Mic
            </Text>
          </View>

          {/* Subtitles */}
          <View className="items-center gap-1.5">
            <Pressable
              style={[
                styles.controlBtn,
                isSubtitlesOn && styles.controlBtnActive,
              ]}
              onPress={() => setIsSubtitlesOn((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                isSubtitlesOn ? "Hide subtitles" : "Show subtitles"
              }
              accessibilityState={{ checked: isSubtitlesOn }}
            >
              <Ionicons
                name="text"
                size={22}
                color={isSubtitlesOn ? "#FFFFFF" : "#6B7280"}
              />
            </Pressable>
            <Text className="font-[Poppins_400Regular] text-[11px] text-[#6B7280] text-center">
              Subtitles
            </Text>
          </View>

          {/* End Call */}
          <View className="items-center gap-1.5">
            <Pressable
              style={[styles.controlBtn, styles.controlBtnEndCall]}
              onPress={onEndCall}
              accessibilityRole="button"
              accessibilityLabel="End call"
            >
              <Ionicons
                name="call"
                size={22}
                color="#FFFFFF"
                style={{ transform: [{ rotate: "135deg" }] }}
              />
            </Pressable>
            <Text className="font-[Poppins_400Regular] text-[11px] text-[#6B7280] text-center">
              End Call
            </Text>
          </View>
        </View>

        {/* Feedback strip */}
        <View className="flex-row border-t border-[#F3F4F6] pb-2">
          {(
            [
              { label: "Speaking", score: feedback.speaking },
              { label: "Pronunciation", score: feedback.pronunciation },
              { label: "Grammar", score: feedback.grammar },
            ] as { label: string; score: FeedbackScore }[]
          ).map((item, index) => (
            <View
              key={item.label}
              className={`flex-1 items-center py-[14px] gap-1 ${index < 2 ? "border-r border-[#E5E7EB]" : ""}`}
            >
              <Text className="font-[Poppins_500Medium] text-[13px] text-[#0D132B]">
                {item.label}
              </Text>
              <Text
                className="font-[Poppins_600SemiBold] text-[13px]"
                style={{ color: scoreColor(item.score) }}
              >
                {item.score}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lesson: Lesson | undefined = getLessonById(id ?? "");
  const { user } = useUser();
  const { selectedLanguage } = useLanguageStore();

  const [client, setClient] = useState<StreamVideoClient>();
  const [call, setCall] = useState<Call>();
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");

  // Track the agent session ID so we can stop it later.
  // Using a ref keeps this value stable across renders without triggering re-renders.
  const agentSessionIdRef = useRef<string | null>(null);
  // Track the call ID in a ref for unmount cleanup (state may be stale in cleanup).
  const callIdRef = useRef<string | null>(null);

  // ── Stream client ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const tokenProvider = async () => {
      const apiUrl = Constants.expoConfig?.hostUri
        ? `http://${Constants.expoConfig.hostUri}/api/stream/token`
        : `/api/stream/token`;
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      return data.token;
    };

    const streamUser = {
      id: user.id,
      name: user.fullName || user.firstName || "User",
      image: user.imageUrl,
    };

    const c = StreamVideoClient.getOrCreateInstance({
      apiKey: API_KEY,
      user: streamUser,
      tokenProvider,
    });
    setClient(c);

    return () => {
      c.disconnectUser().catch((err) => console.error(err));
      setClient(undefined);
    };
  }, [user]);

  // ── Call setup + agent start ─────────────────────────────────────────────
  useEffect(() => {
    if (!client || !id || !lesson) return;

    const c = client.call(CALL_TYPE, id as string, { reuseInstance: true });
    callIdRef.current = id;
    setCall(c);

    let mounted = true;

    (async () => {
      // ── 1. Join first — this creates the call on Stream's server ───────────
      // call.update() requires the call to exist server-side, so join must
      // come before we write custom data.
      try {
        await c.join({ create: true });
      } catch (err) {
        console.error("[LessonScreen] Failed to join call:", err);
        return;
      }

      if (!mounted) return;

      // ── 2. Write lesson context as custom data now that the call exists ────
      // The Vision Agent reads these fields on join (agent.py → join_call).
      // We do this after joining but before starting the agent so the data
      // is guaranteed to be present when the agent calls call.get().
      try {
        await c.update({
          custom: {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            language:
              selectedLanguage?.name ??
              lesson.aiTeacherPrompt?.targetLanguage ??
              "Spanish",
            languageCode: selectedLanguage?.code ?? "es",
            goals: lesson.goals.map((g) => g.description),
            vocabulary: lesson.vocabulary.map(
              (v) => `${v.word} — ${v.translation}`,
            ),
            phrases: lesson.phrases.map(
              (p) => `${p.phrase} — ${p.translation}`,
            ),
            aiTeacherPersona: lesson.aiTeacherPrompt?.teacherPersona,
            aiTeacherTopic: lesson.aiTeacherPrompt?.lessonTopic,
            aiTeacherDifficulty: lesson.aiTeacherPrompt?.difficulty,
            aiTeacherKeyVocab: lesson.aiTeacherPrompt?.keyVocabulary,
            aiTeacherOpeningScript: lesson.aiTeacherPrompt?.openingScript,
            aiTeacherNotes: lesson.aiTeacherPrompt?.teachingNotes,
          },
        });
      } catch (err) {
        console.warn("[LessonScreen] Could not write custom data:", err);
      }

      if (!mounted) return;

      // ── 3. Start the Vision Agent ─────────────────────────────────────────
      setAgentStatus("connecting");
      const sessionId = await startAgent(CALL_TYPE, id as string);

      if (!mounted) {
        // Screen unmounted while we were starting — clean up immediately.
        if (sessionId) {
          await stopAgent(id as string, sessionId);
        }
        return;
      }

      if (sessionId) {
        agentSessionIdRef.current = sessionId;
        setAgentStatus("connected");
      } else {
        setAgentStatus("failed");
      }
    })();

    return () => {
      mounted = false;
      // Unmount cleanup — stop the agent and leave the call.
      const currentSessionId = agentSessionIdRef.current;
      const currentCallId = callIdRef.current;

      if (currentSessionId && currentCallId) {
        stopAgent(currentCallId, currentSessionId).catch(() => {});
        agentSessionIdRef.current = null;
      }

      if (c.state.callingState !== CallingState.LEFT) {
        c.leave().catch((err) => console.error(err));
      }
      setCall(undefined);
      setAgentStatus("idle");
    };
  }, [client, id, lesson]);

  // ── End call handler (called by the End Call button) ─────────────────────
  const handleEndCall = useCallback(async () => {
    // Stop the agent first, then leave the call, then navigate back.
    const sessionId = agentSessionIdRef.current;
    const callId = callIdRef.current;

    if (sessionId && callId) {
      await stopAgent(callId, sessionId);
      agentSessionIdRef.current = null;
    }

    if (call && call.state.callingState !== CallingState.LEFT) {
      try {
        await call.leave();
      } catch (err) {
        console.error("[LessonScreen] Failed to leave call:", err);
      }
    }

    router.back();
  }, [call]);

  // ── Not found ───────────────────────────────────────────────────────────
  if (!lesson) {
    return (
      <SafeAreaView style={styles.safe}>
        <View className="flex-1 items-center justify-center gap-4 p-8">
          <Text className="font-[Poppins_500Medium] text-[16px] text-[#6B7280]">
            Lesson not found.
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text className="font-[Poppins_600SemiBold] text-[15px] text-white">
              Go Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      {!client || !call ? (
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="font-[Poppins_500Medium] text-[16px] text-[#6B7280]">
            Connecting to lesson...
          </Text>
        </View>
      ) : (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <LessonInnerUI
              lesson={lesson}
              agentStatus={agentStatus}
              onEndCall={handleEndCall}
            />
          </StreamCall>
        </StreamVideo>
      )}
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

  // ── Agent status dot ────────────────────────────────────────────────────────
  agentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // ── Timer badge ─────────────────────────────────────────────────────────────
  timerBadge: {
    position: "absolute",
    top: 88, // just below the taller header
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

  // ── Student thumbnail ───────────────────────────────────────────────────────
  studentThumbnail: {
    position: "absolute",
    top: 88, // just below the taller header
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
    bottom: 260, // sits above the bottom panel
    left: -10,
    width: 280,
    height: 280,
  },

  // ── Speech bubble ───────────────────────────────────────────────────────────
  // speechBubble left is computed at render time from windowWidth (see JSX)
  // to avoid overflowing on narrow screens (< 340 px).
  speechBubble: {
    position: "absolute",
    bottom: 220,
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
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 16,
    zIndex: 15,
  },

  // ── Control buttons (Pressable — keep in StyleSheet) ────────────────────────
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

  // ── Not found — backButton Pressable ────────────────────────────────────────
  backButton: {
    backgroundColor: "#6C4EF5",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
