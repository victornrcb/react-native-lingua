import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-background px-4">
      <Text className="text-h1 text-lingua-purple mb-4">
        Lingua App
      </Text>
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
        <View className="mt-4 bg-success px-4 py-2 rounded-lg items-center">
          <Text className="text-body-lg text-background font-poppins-semibold">Get Started</Text>
        </View>
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
