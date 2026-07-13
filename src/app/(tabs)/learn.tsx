import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LearnScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-h2 text-lingua-purple">Learn</Text>
        <Text className="text-body-md text-text-secondary mt-2">
          Learn screen — coming soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
