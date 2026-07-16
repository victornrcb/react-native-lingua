// ─────────────────────────────────────────────────────────────────────────────
// app/language-select.tsx
// Language selection screen — lets users pick their target learning language.
// ─────────────────────────────────────────────────────────────────────────────

import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { posthog } from "@/lib/posthog";
import { useLanguageStore } from "@/store/languageStore";
import { Language } from "@/types/learning";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// ─── Learner counts displayed alongside each language ────────────────────────
const LEARNER_COUNTS: Record<string, string> = {
  es: "28.4M learners",
  fr: "19.4M learners",
  de: "8.1M learners",
  ja: "12.7M learners",
  it: "6.3M learners",
  pt: "5.2M learners",
};

// ─── Sub-component: single language row ──────────────────────────────────────
interface LanguageRowProps {
  language: Language;
  isSelected: boolean;
  onPress: () => void;
}

function LanguageRow({ language, isSelected, onPress }: LanguageRowProps) {
  const learners = LEARNER_COUNTS[language.code] ?? "—";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, isSelected ? styles.rowSelected : styles.rowDefault]}
    >
      {/* Flag */}
      <Image
        source={{ uri: language.flag }}
        style={styles.flag}
        resizeMode="cover"
      />

      {/* Name + learner count */}
      <View style={styles.rowText}>
        <Text className="text-h4 text-text-primary">{language.name}</Text>
        <Text className="text-body-sm text-text-secondary">{learners}</Text>
      </View>

      {/* Right indicator: checkmark when selected, chevron otherwise */}
      {isSelected ? (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </Pressable>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function LanguageSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Language | null>(null);

  const setLanguage = useLanguageStore((s) => s.setLanguage);

  // Filter languages by search query
  const filtered = query.trim()
    ? languages.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.nativeName.toLowerCase().includes(query.toLowerCase()),
      )
    : languages;

  async function handleConfirm() {
    if (!selected) return;
    await setLanguage(selected);
    posthog.capture("language_selected", {
      language_code: selected.code,
      language_name: selected.name,
    });
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View className="flex-row items-center px-5 pt-2 pb-4">
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={20} color="#0D132B" />
        </Pressable>
        <Text className="flex-1 text-center text-h3 text-text-primary">
          Choose a language
        </Text>
        {/* Spacer to keep title centred */}
        <View style={styles.backButton} />
      </View>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
      <View className="px-5 mb-5">
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#9CA3AF"
            style={{ marginRight: 8 }}
          />
          <TextInput
            placeholder="Search languages"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ── Language list ───────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text className="text-h4 text-text-primary mb-3 px-5">Popular</Text>
        }
        renderItem={({ item }) => (
          <View className="px-5 mb-2">
            <LanguageRow
              language={item}
              isSelected={selected?.code === item.code}
              onPress={() => setSelected(item)}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* ── Confirm button ──────────────────────────────────────────────── */}
      <View className="px-5 pt-3 bg-background">
        <Pressable
          testID="language-confirm-button"
          onPress={handleConfirm}
          disabled={!selected}
          style={[
            styles.confirmButton,
            !selected && styles.confirmButtonDisabled,
          ]}
        >
          <Text className="text-white text-h4 font-poppins-semibold">
            {selected ? `Start learning ${selected.name}` : "Select a language"}
          </Text>
        </Pressable>
      </View>

      {/* ── Earth illustration (full-width, below button) ───────────────── */}
      <View style={{ overflow: "hidden" }}>
        <Image
          source={images.earth}
          style={styles.earthImage}
          resizeMode="stretch"
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // Header
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F7FB",
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#0D132B",
    paddingVertical: 0,
  },

  // List
  listContent: {
    paddingTop: 4,
    paddingBottom: 16,
  },

  // Language row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  rowDefault: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  rowSelected: {
    backgroundColor: "#F0EDFF",
    borderColor: "#6C4EF5",
  },
  flag: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  rowText: {
    flex: 1,
    gap: 1,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6C4EF5",
    alignItems: "center",
    justifyContent: "center",
  },

  // Earth illustration
  earthImage: {
    width: "100%",
    height: 250,
    marginTop: -30,
    marginBottom: -65,
  },

  // Confirm button
  confirmButton: {
    backgroundColor: "#6C4EF5",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#C4BAF9",
  },
});
