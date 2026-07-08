import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const router = useRouter();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/onboarding" />;

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
            Choose a Language
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
