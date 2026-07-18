// ─────────────────────────────────────────────────────────────────────────────
// app/(tabs)/learn.tsx
// The "Learn" tab — shows units and lessons for the selected language.
// Design: Unit header banner → Lessons/Practice tab → scrollable lesson cards.
// ─────────────────────────────────────────────────────────────────────────────

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonCard, LessonStatus } from "@/components/LessonCard";
import { images } from "@/constants/images";
import { getLessonsForUnit } from "@/data/lessons";
import { unitsByLanguage } from "@/data/units";
import { useLanguageStore } from "@/store/languageStore";
import { useProgressStore } from "@/store/useProgressStore";
import type { Lesson, LanguageCode, Unit } from "@/types/learning";

// ─────────────────────────────────────────────────────────────────────────────

type TabKey = "lessons" | "practice";

// ─────────────────────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const { selectedLanguage, clearLanguage } = useLanguageStore();
  const { completedLessonIds } = useProgressStore();

  const langCode = (selectedLanguage?.code ?? "es") as LanguageCode;
  const units = useMemo(
    () => unitsByLanguage[langCode] ?? [],
    [langCode],
  );

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

  if (units.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No lessons yet</Text>
          <Text style={styles.emptySubtitle}>
            Lessons for this language are coming soon. Switch to another language to continue learning.
          </Text>
          <Pressable
            style={styles.selectLangBtn}
            onPress={async () => {
              await clearLanguage();
              router.push("/language-select");
            }}
          >
            <Text style={styles.selectLangBtnText}>Change Language</Text>
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

            <View style={styles.bannerTitleBlock}>
              <Text style={styles.bannerTitle} numberOfLines={1}>
                {activeUnit?.title ?? ""}
              </Text>
              <Text style={styles.bannerSubtitle}>
                Unit {activeUnitIndex + 1} • {completedCount} /{" "}
                {lessons.length} lessons
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
                <Text style={styles.unitPillIcon}>{unit.icon}</Text>
                <Text
                  style={[
                    styles.unitPillText,
                    idx === activeUnitIndex && styles.unitPillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {unit.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Lessons / Practice tab bar ─────────────────────────────────── */}
        <View style={styles.tabBar}>
          {(["lessons", "practice"] as TabKey[]).map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && <View style={styles.tabUnderline} />}
            </Pressable>
          ))}
        </View>

        {/* ── Lesson list ─────────────────────────────────────────────────── */}
        <View style={styles.lessonList}>
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
              <View style={styles.emptyLessons}>
                <Text style={styles.emptyLessonsText}>
                  No lessons in this unit yet.
                </Text>
              </View>
            )
          ) : (
            /* ── Practice tab placeholder ──────────────────────────────── */
            <View style={styles.practicePlaceholder}>
              <Text style={styles.practiceEmoji}>🏋️</Text>
              <Text style={styles.practiceTitle}>Practice Mode</Text>
              <Text style={styles.practiceSubtitle}>
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
  bannerTitleBlock: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: "#FFFFFF",
    lineHeight: 26,
  },
  bannerSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
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
  unitPillIcon: {
    fontSize: 14,
  },
  unitPillText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#6B7280",
    maxWidth: 120,
  },
  unitPillTextActive: {
    color: "#6C4EF5",
  },

  // ── Tab bar ───────────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabItemActive: {},
  tabText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: "#6B7280",
  },
  tabTextActive: {
    fontFamily: "Poppins_600SemiBold",
    color: "#6C4EF5",
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

  // ── Lesson list ───────────────────────────────────────────────────────────
  lessonList: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // ── Practice placeholder ──────────────────────────────────────────────────
  practicePlaceholder: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  practiceEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  practiceTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#0D132B",
    marginBottom: 8,
  },
  practiceSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Empty lessons ─────────────────────────────────────────────────────────
  emptyLessons: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyLessonsText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#9CA3AF",
  },

  // ── Empty state (no language selected) ───────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 22,
    color: "#0D132B",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  selectLangBtn: {
    backgroundColor: "#6C4EF5",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  selectLangBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#FFFFFF",
  },
});
