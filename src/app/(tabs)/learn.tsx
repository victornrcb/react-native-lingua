// ─────────────────────────────────────────────────────────────────────────────
// app/(tabs)/learn.tsx
// The "Learn" tab — shows units and lessons for the selected language.
// Design: Unit header banner → Lessons/Practice tab → scrollable lesson cards.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonCard, LessonStatus } from "@/components/LessonCard";
import { images } from "@/constants/images";
import { getLessonsForUnit } from "@/data/lessons";
import { unitsByLanguage } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { useProgressStore } from "@/store/useProgressStore";
import type { LanguageCode, Lesson, Unit } from "@/types/learning";

// ─────────────────────────────────────────────────────────────────────────────

type TabKey = "lessons" | "practice";

// ─────────────────────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const { selectedLanguage, clearLanguage } = useLanguageStore();
  const { completedLessonIds } = useProgressStore();

  const langCode = (selectedLanguage?.code ?? "es") as LanguageCode;
  const units = useMemo(() => unitsByLanguage[langCode] ?? [], [langCode]);

  // Active unit index — default to first unit
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("lessons");

  const activeUnit: Unit | undefined = units[activeUnitIndex];
  const lessons: Lesson[] = useMemo(
    () => (activeUnit ? getLessonsForUnit(activeUnit.id) : []),
    [activeUnit],
  );

  // ── Derive per-lesson status ─────────────────────────────────────────────

  const getLessonStatus = useCallback(
    (lesson: Lesson, lessonIndex: number): LessonStatus => {
      if (completedLessonIds.includes(lesson.id)) return "completed";

      // First non-completed lesson is "in_progress" if previous one is done
      const prevLesson = lessons[lessonIndex - 1];
      if (
        lessonIndex === 0 ||
        (prevLesson && completedLessonIds.includes(prevLesson.id))
      ) {
        // It's the current active lesson
        return "in_progress";
      }

      return "locked";
    },
    [completedLessonIds, lessons],
  );

  // ── Unit progress counters ────────────────────────────────────────────────

  const completedCount = lessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;

  // ── Header cover image ─────────────────────────────────────────────────────
  // Use unit's coverImage if set, otherwise fall back to a Picsum seed
  const coverImageUri =
    activeUnit?.coverImage ??
    `https://picsum.photos/seed/${activeUnit?.id ?? "unit"}/800/400`;

  // ── Render ─────────────────────────────────────────────────────────────────

  // if (!selectedLanguage) return <Redirect href="/language-select" />

  if (units.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="font-[Poppins_700Bold] text-[22px] text-[#0D132B] mb-2">
            No lessons yet
          </Text>
          <Text className="font-[Poppins_400Regular] text-[14px] text-[#6B7280] text-center mb-6">
            Lessons for this language are coming soon. Switch to another
            language to continue learning.
          </Text>
          <Pressable
            style={styles.selectLangBtn}
            onPress={async () => {
              await clearLanguage();
              router.push("/language-select");
            }}
          >
            <Text className="font-[Poppins_600SemiBold] text-[15px] text-white">
              Change Language
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Unit banner ────────────────────────────────────────────────── */}
        <View style={styles.bannerContainer}>
          {/* Background scene image */}
          <Image
            source={{ uri: coverImageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />

          {/* Gradient overlay for readability */}
          <View style={styles.bannerOverlay} />

          {/* Header row: back + title + bookmark */}
          <View style={styles.bannerHeader}>
            <Pressable
              style={styles.backBtn}
              onPress={() => router.back()}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </Pressable>

            <View className="flex-1">
              <Text
                className="font-[Poppins_700Bold] text-[20px] text-white leading-[26px]"
                numberOfLines={1}
              >
                {activeUnit?.title ?? ""}
              </Text>
              <Text className="font-[Poppins_400Regular] text-[13px] text-white/85 mt-0.5">
                Unit {activeUnitIndex + 1} • {completedCount} {lessons.length}{" "}
                lessons
              </Text>
            </View>

            <Pressable style={styles.bookmarkBtn} hitSlop={12}>
              <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Mascot floating on the banner */}
          <Image
            source={images.mascotWelcome}
            style={styles.mascotImage}
            contentFit="contain"
          />
        </View>

        {/* ── Unit pills (scroll sideways if many units) ──────────────────── */}
        {units.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.unitPillsScroll}
            contentContainerStyle={styles.unitPillsContent}
          >
            {units.map((unit, idx) => (
              <Pressable
                key={unit.id}
                style={[
                  styles.unitPill,
                  idx === activeUnitIndex && styles.unitPillActive,
                ]}
                onPress={() => {
                  setActiveUnitIndex(idx);
                  setActiveTab("lessons");
                }}
              >
                <Text className="text-[14px]">{unit.icon}</Text>
                <Text
                  className={`font-[Poppins_500Medium] text-[13px] max-w-[120px] ${idx === activeUnitIndex ? "text-[#6C4EF5]" : "text-[#6B7280]"}`}
                  numberOfLines={1}
                >
                  {unit.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Lessons / Practice tab bar ─────────────────────────────────── */}
        <View className="flex-row bg-white px-5 mb-1 border-b border-[#F3F4F6]">
          {(["lessons", "practice"] as TabKey[]).map((tab) => (
            <Pressable
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-[15px] ${activeTab === tab ? "font-[Poppins_600SemiBold] text-[#6C4EF5]" : "font-[Poppins_500Medium] text-[#6B7280]"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </Pressable>
          ))}
        </View>

        {/* ── Lesson list ─────────────────────────────────────────────────── */}
        <View className="px-4 pt-3">
          {activeTab === "lessons" ? (
            lessons.length > 0 ? (
              lessons.map((lesson, idx) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={idx + 1}
                  status={getLessonStatus(lesson, idx)}
                  onPress={() => {
                    router.push(`/lesson/${lesson.id}` as never);
                  }}
                />
              ))
            ) : (
              <View className="items-center py-8">
                <Text className="font-[Poppins_400Regular] text-[14px] text-[#9CA3AF]">
                  No lessons in this unit yet.
                </Text>
              </View>
            )
          ) : (
            /* ── Practice tab placeholder ──────────────────────────────── */
            <View className="items-center py-12 px-6">
              <Text className="text-[52px] mb-3">🏋️</Text>
              <Text className="font-[Poppins_600SemiBold] text-[18px] text-[#0D132B] mb-2">
                Practice Mode
              </Text>
              <Text className="font-[Poppins_400Regular] text-[14px] text-[#6B7280] text-center leading-[22px]">
                Coming soon — review vocabulary and sharpen your skills.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const BANNER_HEIGHT = 240;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // ── Banner ────────────────────────────────────────────────────────────────
  bannerContainer: {
    height: BANNER_HEIGHT,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#6C4EF5",
    position: "relative",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(20, 10, 60, 0.35)",
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 14,
    zIndex: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  mascotImage: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 160,
    height: 185,
  },

  // ── Unit pills ────────────────────────────────────────────────────────────
  unitPillsScroll: {
    backgroundColor: "#FFFFFF",
  },
  unitPillsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  unitPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  unitPillActive: {
    backgroundColor: "#F0EDFF",
    borderColor: "#6C4EF5",
  },

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabUnderline: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#6C4EF5",
  },

  // ── Empty state (no language selected) ───────────────────────────────────
  selectLangBtn: {
    backgroundColor: "#6C4EF5",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
});
