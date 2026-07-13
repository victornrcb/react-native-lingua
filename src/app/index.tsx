import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

import { useLanguageStore } from "@/store/languageStore";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { selectedLanguage, isHydrating } = useLanguageStore();

  // Wait for Clerk and AsyncStorage to finish loading.
  if (!isLoaded || isHydrating) return null;

  // Not authenticated → onboarding
  if (!isSignedIn) return <Redirect href="/onboarding" />;

  // Authenticated but no language chosen → language selection
  if (!selectedLanguage) return <Redirect href="/language-select" />;

  // Authenticated + language selected → main app tabs
  return <Redirect href="/(tabs)/home" />;
}
