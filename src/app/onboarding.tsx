import { images } from "@/constants/images";
import { useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Logo */}
      <View className="flex-row items-center justify-center mt-2">
        <Image
          source={images.mascotLogo}
          style={{ width: 44, height: 44 }}
          resizeMode="contain"
        />
        <Text className="text-h2 ml-2 text-text-primary">lingua</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 px-6 mt-8">
        <Text className="text-[36px] leading-[44px] font-poppins-bold text-text-primary">
          Your AI language{"\n"}
          <Text className="text-lingua-purple">teacher.</Text>
        </Text>

        <Text className="text-body-lg text-text-secondary mt-4 pr-4">
          Real conversations, personalized{"\n"}lessons, anytime, anywhere.
        </Text>

        {/* Mascot Illustration */}
        <View className="flex-1 items-center justify-center my-4 px-2 relative">
          {/* Hello bubble */}
          <View className="absolute top-[10%] left-[0%] bg-[#F0F6FF] px-5 py-3 rounded-3xl -rotate-6 z-10">
            <Text className="text-h3 font-poppins-semibold text-text-primary">
              Hello!
            </Text>
          </View>

          {/* Hola bubble */}
          <View className="absolute top-[0%] right-[10%] bg-[#F5F0FF] px-5 py-3 rounded-3xl rotate-6 z-10">
            <Text className="text-h3 font-poppins-semibold text-lingua-purple">
              ¡Hola!
            </Text>
          </View>

          {/* Ni Hao bubble */}
          <View className="absolute top-[35%] right-[0%] bg-[#FFF0EB] px-5 py-3 rounded-3xl rotate-12 z-10">
            <Text className="text-h3 font-poppins-semibold text-error">
              你好!
            </Text>
          </View>

          <Image
            source={images.mascotWelcome}
            style={{ width: "95%", height: "100%", zIndex: 1 }}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Footer Area */}
      <View className="px-6 pb-8">
        <Pressable
          className="bg-lingua-purple py-4 rounded-2xl flex-row justify-center items-center"
          onPress={() => router.replace("/")}
        >
          <Text className="text-white text-h3 mr-2 font-poppins-semibold">
            Get Started
          </Text>
          <SymbolView
            name="chevron.right"
            size={24}
            tintColor="white"
            style={{ width: 24, height: 24 }}
            fallback={
              <Text className="text-white text-h3 font-poppins-medium">
                &gt;
              </Text>
            }
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
