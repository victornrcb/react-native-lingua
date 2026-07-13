import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLanguageStore } from "@/store/languageStore";

export default function Index() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const router = useRouter();

  const { selectedLanguage, isHydrating, clearLanguage } = useLanguageStore();

  // Wait for Clerk and AsyncStorage to finish loading.
  if (!isLoaded || isHydrating) return null;

  // Not authenticated → onboarding
  if (!isSignedIn) return <Redirect href="/onboarding" />;

  // Authenticated but no language chosen → language selection
  if (!selectedLanguage) return <Redirect href="/language-select" />;

  return (
    <View className="flex-1 justify-center items-center bg-background px-4">
      <Text className="text-h1 text-lingua-purple mb-4">Lingua App</Text>
      <Text className="text-body-lg text-text-primary mb-2">
        Learn new languages quickly!
      </Text>
      <View className="bg-surface p-4 rounded-xl border border-border w-full">
        <Text className="text-h3 text-lingua-deep-purple mb-2">
          Design System Setup
        </Text>
        <Text className="text-body-md text-text-secondary">
          Colors, typographies, and fonts are successfully configured.
        </Text>

        {/* Selected language badge */}
        <Text className="text-body-sm text-text-secondary mt-3">
          Learning:{" "}
          <Text className="text-lingua-purple font-poppins-semibold">
            {selectedLanguage.name}
          </Text>
        </Text>

        {/* Language selection link */}
        <Pressable
          className="mt-4 bg-lingua-purple px-4 py-3 rounded-lg flex-row items-center justify-center"
          onPress={() => router.push("/language-select")}
        >
          <SymbolView
            name="globe"
            size={20}
            tintColor="#FFFFFF"
            style={{ width: 20, height: 20, marginRight: 8 }}
            fallback={<Text className="text-white mr-2">🌍</Text>}
          />
          <Text className="text-body-lg text-background font-poppins-semibold">
            Change Language
          </Text>
        </Pressable>

        {/* Clear AsyncStorage — for testing language selection flow */}
        <Pressable
          className="mt-3 px-4 py-3 rounded-lg items-center border border-border"
          onPress={async () => {
            await clearLanguage();
            // After clearing, the guard above will redirect to language-select
          }}
        >
          <Text className="text-body-lg text-text-secondary font-poppins-semibold">
            Clear Language (Test)
          </Text>
        </Pressable>

        <Pressable
          className="mt-3 bg-error px-4 py-3 rounded-lg items-center"
          onPress={async () => {
            await signOut();
            router.replace("/onboarding");
          }}
        >
          <Text className="text-body-lg text-background font-poppins-semibold">
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
