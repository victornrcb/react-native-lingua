// ─────────────────────────────────────────────────────────────────────────────
// app/(tabs)/home.tsx
// Home screen — shows user greeting, daily XP goal, current lesson banner,
// today's plan, and the next-up activity card.
// ─────────────────────────────────────────────────────────────────────────────

import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { getLanguageByCode } from "@/data/languages";
import { allLessons } from "@/data/lessons";
import { unitsByLanguage } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { useProgressStore } from "@/store/useProgressStore";
import type { LanguageCode } from "@/types/learning";

// ── Today's plan items (hardcoded for now, driven by lesson data) ─────────────

const TODAYS_PLAN = [
  {
    id: "lesson",
    icon: "book" as const,
    iconBg: "#6C4EF5",
    title: "Lesson",
    subtitle: "At the café",
    done: true,
  },
  {
    id: "ai-conversation",
    icon: "headset" as const,
    iconBg: "#6C4EF5",
    title: "AI Conversation",
    subtitle: "Talk about your day",
    done: false,
  },
  {
    id: "new-words",
    icon: "chatbubble" as const,
    iconBg: "#FF4D4F",
    title: "New words",
    subtitle: "10 words",
    done: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────────

// "Hello" in each supported language
const GREETINGS: Record<string, string> = {
  es: "Hola",
  fr: "Bonjour",
  de: "Guten tag",
  ja: "こんにちは",
  it: "Ciao",
};

export default function HomeScreen() {
  const { user } = useUser();
  const { selectedLanguage } = useLanguageStore();
  const { todayXP, dailyGoalXP, streak } = useProgressStore();

  // Derive language info
  const langCode = (selectedLanguage?.code ?? "es") as LanguageCode;
  const language = selectedLanguage ?? getLanguageByCode("es")!;
  const units = unitsByLanguage[langCode] ?? [];
  const currentUnit = units[0];

  // Find the first unlocked lesson for "continue learning"
  const unitLessonIds = currentUnit?.lessonIds ?? [];
  const currentLesson = unitLessonIds
    .map((id) => allLessons.find((l) => l.id === id))
    .find((l) => l && !l.isLocked);

  const firstName = user?.firstName ?? "Friend";
  const greeting = GREETINGS[langCode] ?? "Hola";
  const xpPercent = Math.min((todayXP / dailyGoalXP) * 100, 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-5 pt-3">
          {/* User avatar + greeting */}
          <View className="flex-row items-center gap-3">
            {selectedLanguage?.flag ? (
              <Image
                source={{ uri: selectedLanguage.flag }}
                style={styles.flagAvatar}
                contentFit="cover"
              />
            ) : (
              // flagPlaceholder → View: full NativeWind support
              <View className="w-10 h-10 rounded-full bg-border items-center justify-center">
                <Text className="text-2xl">🌍</Text>
              </View>
            )}
            <Text className="text-h4 text-text-primary">
              {greeting}, {firstName}! 👋
            </Text>
          </View>

          {/* Streak + bell */}
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Image source={images.streakFire} style={styles.streakIcon} />
              {/* streak text — inline style kept: font family not a standard Tailwind class */}
              <Text
                style={{
                  fontFamily: "Poppins_700Bold",
                  fontSize: 15,
                  color: "#FF8A00",
                }}
              >
                {streak}
              </Text>
            </View>
            <Pressable onPress={() => {}}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#6B7280"
              />
            </Pressable>
          </View>
        </View>

        {/* ── Daily goal card ─────────────────────────────────────────────── */}
        <View
          className="mx-5 mt-2 mb-4 rounded-2xl overflow-hidden"
          style={styles.goalCard}
        >
          <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
            {/* Left: text + progress */}
            <View className="flex-1 pr-3">
              <Text className="text-body-sm text-text-secondary mb-1">
                Daily goal
              </Text>
              {/* xpText → Text: marginBottom converted to className */}
              <Text className="mb-[10px]">
                {/* xpCurrent → Text: font, size, color */}
                <Text
                  className="text-[28px] text-text-primary"
                  style={{ fontFamily: "Poppins_700Bold" }}
                >
                  {todayXP}
                </Text>
                {/* xpGoal → Text: font, size, color */}
                <Text
                  className="text-body-lg text-text-secondary"
                  style={{ fontFamily: "Poppins_400Regular" }}
                >
                  {" "}
                  / {dailyGoalXP} XP
                </Text>
              </Text>
              {/* progressTrack → View: full NativeWind support */}
              <View className="h-[10px] rounded-[5px] bg-border overflow-hidden">
                {/* progressFill — dynamic width at runtime → must keep StyleSheet */}
                <View
                  style={[styles.progressFill, { width: `${xpPercent}%` }]}
                />
              </View>
            </View>
            {/* Right: treasure chest — expo-image size via StyleSheet */}
            <Image source={images.treasure} style={styles.treasureImg} />
          </View>
        </View>

        {/* ── Continue learning banner ────────────────────────────────────── */}
        <View
          className="mx-5 mb-6 rounded-2xl overflow-hidden"
          style={styles.bannerCard}
        >
          {/* palace image — absolute positioning with specific coords → StyleSheet */}
          <Image
            source={images.palace}
            style={styles.palaceImg}
            contentFit="cover"
          />
          <View className="inset-0 flex-row">
            <View className="flex-1 pl-5 pt-5 pb-5 justify-end">
              {/* continueLabel → Text: full NativeWind support */}
              <Text
                className="text-body-sm mb-1"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "Poppins_400Regular",
                }}
              >
                Continue learning
              </Text>
              {/* bannerLang → Text: font, size, color, lineHeight, marginBottom */}
              <Text
                className="text-[26px] text-white mb-[2px]"
                style={{ fontFamily: "Poppins_700Bold", lineHeight: 32 }}
              >
                {language.name}
              </Text>
              {/* bannerUnit → Text */}
              <Text
                className="text-[13px] mb-[14px]"
                style={{
                  fontFamily: "Poppins_400Regular",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                A1 • Unit {currentUnit?.order ?? 1}
              </Text>
              {/* continueBtn — Pressable with pressed state → StyleSheet per AGENTS.md */}
              <Pressable
                style={({ pressed }) => [
                  styles.continueBtn,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => router.push("/(tabs)/learn")}
              >
                {/* continueBtnText → Text: full NativeWind support */}
                <Text
                  className="text-[14px] text-lingua-purple"
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  Continue
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── Today's plan ────────────────────────────────────────────────── */}
        <View className="px-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-h4 text-text-primary">Today's plan</Text>
            <Pressable onPress={() => router.push("/(tabs)/learn")}>
              {/* viewAll → Text: full NativeWind support */}
              <Text
                className="text-[14px] text-lingua-purple"
                style={{ fontFamily: "Poppins_600SemiBold" }}
              >
                View all
              </Text>
            </Pressable>
          </View>

          {TODAYS_PLAN.map((item) => (
            // planRow — Pressable with pressed state + shadow → StyleSheet per AGENTS.md
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.planRow,
                pressed && { opacity: 0.75 },
              ]}
              onPress={() => {}}
            >
              {/* planIconBox — dynamic backgroundColor (runtime value) → StyleSheet */}
              <View
                style={[styles.planIconBox, { backgroundColor: item.iconBg }]}
              >
                <Ionicons name={item.icon} size={20} color="#FFFFFF" />
              </View>

              {/* Texts */}
              <View className="flex-1 pl-4">
                {/* planTitle → Text: full NativeWind support */}
                <Text
                  className="text-[14px] text-text-primary mb-[2px]"
                  style={{ fontFamily: "Poppins_600SemiBold" }}
                >
                  {item.title}
                </Text>
                {/* planSubtitle → Text: full NativeWind support */}
                <Text
                  className="text-[13px] text-text-secondary"
                  style={{ fontFamily: "Poppins_400Regular" }}
                >
                  {item.subtitle}
                </Text>
              </View>

              {/* Completion indicator */}
              {item.done ? (
                // checkDone → View: full NativeWind support
                <View className="w-7 h-7 rounded-full bg-lingua-purple items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              ) : (
                // checkEmpty → View: full NativeWind support
                <View className="w-7 h-7 rounded-full border-2 border-border" />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StyleSheet — only for:
//   • SafeAreaView / ScrollView (AGENTS.md exception)
//   • expo-image sizing (partial NativeWind support)
//   • Shadow properties (platform-specific, no NativeWind equivalent)
//   • Absolute positioning with specific coordinates
//   • Pressable pressed-state styles (AGENTS.md exception)
//   • Dynamic / runtime-computed values (e.g. xpPercent width)
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // SafeAreaView + ScrollView — AGENTS.md exception
  safe: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },

  // expo-image — sizing only (partial NativeWind support)
  flagAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  streakIcon: {
    width: 22,
    height: 22,
  },
  treasureImg: {
    width: 80,
    height: 80,
  },

  // Daily goal card — shadow (platform-specific)
  goalCard: {
    backgroundColor: "#FFF8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  // Dynamic runtime value — cannot be a className
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#FF8A00",
  },

  // Continue learning banner — shadow + fixed height
  bannerCard: {
    height: 170,
    backgroundColor: "#6C4EF5",
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    position: "relative",
  },
  // expo-image absolute position with specific coords
  palaceImg: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 150,
    height: 160,
    opacity: 0.9,
  },

  // Pressable — AGENTS.md exception (pressed state)
  continueBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },

  // Pressable — AGENTS.md exception (pressed state + shadow)
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  // Dynamic backgroundColor (runtime value from item.iconBg)
  planIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
