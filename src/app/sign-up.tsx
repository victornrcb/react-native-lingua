import { images } from "@/constants/images";
import { Stack, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const inputRef = useRef<TextInput>(null);
  // Animated value that tracks the keyboard height inside the Modal.
  // KeyboardAvoidingView is broken inside Modal (its node measurement returns 0
  // because Modal renders in a separate native UIWindow), which causes the
  // flicker. Manual Keyboard listeners give us the exact height and duration
  // so we can animate paddingBottom to match the keyboard precisely.
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (code.length === 6) {
      // automatically navigate to home when the last digit is entered
      setShowModal(false);
      router.replace("/");
    }
  }, [code, router]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: e.endCoordinates.height,
        duration: e.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });

    const onHide = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: e.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [keyboardPadding]);

  const handleSignUp = () => {
    Keyboard.dismiss();
    setShowModal(true);
  };

  const handleModalShow = () => {
    // Reset padding before focusing so the animation starts from 0
    keyboardPadding.setValue(0);
    // Focus the hidden input once the modal is fully visible so the keyboard appears
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 justify-center"
        >
          <SymbolView
            name="chevron.left"
            size={24}
            tintColor="#0D132B"
            style={{ width: 24, height: 24 }}
            fallback={<Text className="text-h2 text-text-primary">&lt;</Text>}
          />
        </Pressable>

        <Text
          className="text-h1 text-text-primary mt-4"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Create your account
        </Text>
        <Text className="text-body-lg text-text-secondary mt-1">
          Start your language journey today ✨
        </Text>

        {/* Mascot Image */}
        <View className="items-center mt-6 h-32">
          <Image
            source={images.mascotAuth}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        {/* Form */}
        <View className="mt-6">
          <View className="border border-border rounded-2xl px-4 py-3">
            <Text className="text-caption text-text-secondary font-poppins-medium">
              Email
            </Text>
            <TextInput
              placeholder="alex@gmail.com"
              className="text-body-lg text-text-primary font-poppins-medium pt-1 p-0 m-0"
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#A1A1AA"
            />
          </View>

          <View className="border border-border rounded-2xl px-4 py-3 flex-row items-center mt-4">
            <View className="flex-1">
              <Text className="text-caption text-text-secondary font-poppins-medium">
                Password
              </Text>
              <TextInput
                placeholder="••••••••"
                secureTextEntry
                className="text-body-lg text-text-primary font-poppins-medium pt-1 p-0 m-0"
                placeholderTextColor="#A1A1AA"
              />
            </View>
            <SymbolView
              name="eye"
              size={20}
              tintColor="#6B7280"
              fallback={<Text className="text-text-secondary">👁</Text>}
            />
          </View>
        </View>

        <Pressable
          className="bg-lingua-purple py-4 rounded-2xl flex-row justify-center items-center mt-6"
          onPress={handleSignUp}
        >
          <Text className="text-white text-h3 font-poppins-semibold">
            Sign Up
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-[1px] bg-border" />
          <Text className="text-body-sm text-text-secondary px-4">
            or continue with
          </Text>
          <View className="flex-1 h-[1px] bg-border" />
        </View>

        <View>
          <Pressable className="border border-border py-3.5 rounded-2xl flex-row justify-center items-center">
            <Text className="font-poppins-bold text-[#EA4335] text-[20px] absolute left-6">
              G
            </Text>
            <Text className="text-text-primary text-body-lg font-poppins-medium">
              Continue with Google
            </Text>
          </Pressable>

          <Pressable className="border border-border py-3.5 rounded-2xl flex-row justify-center items-center mt-3">
            <Text className="font-poppins-bold text-[#1877F2] text-[20px] absolute left-6">
              f
            </Text>
            <Text className="text-text-primary text-body-lg font-poppins-medium">
              Continue with Facebook
            </Text>
          </Pressable>

          <Pressable className="border border-border py-3.5 rounded-2xl flex-row justify-center items-center mt-3">
            <Text className="font-poppins-bold text-[#000000] text-[22px] absolute left-6">
              
            </Text>
            <Text className="text-text-primary text-body-lg font-poppins-medium">
              Continue with Apple
            </Text>
          </Pressable>
        </View>

        <View className="mt-6 flex-row justify-center items-center">
          <Text className="text-body-md text-text-secondary">
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/sign-in")}>
            <Text className="text-body-md text-lingua-purple font-poppins-semibold">
              Log in
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Verification Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onShow={handleModalShow}
      >
        {/* Backdrop — absolute so it sits behind the sheet independently */}
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.5)" },
          ]}
          onPress={() => setShowModal(false)}
        />
        {/* Outer container pins the sheet to the bottom of the screen */}
        <View style={styles.modalContainer} pointerEvents="box-none">
          {/*
            Animated.View tracks keyboard height via Keyboard listeners.
            paddingBottom lifts the sheet above the keyboard when shown,
            and drops it back to the bottom when dismissed — no flicker.
          */}
          <Animated.View style={{ paddingBottom: keyboardPadding }}>
            <View style={styles.sheet}>
              <Text className="text-h2 text-text-primary mb-2">
                Check your email
              </Text>
              <Text className="text-body-md text-text-secondary text-center mb-8 px-4">
                We've sent a 6-digit verification code to your email.
              </Text>

              {/* Code Inputs Display */}
              <Pressable
                className="flex-row gap-x-2 relative"
                onPress={() => inputRef.current?.focus()}
              >
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    className={`w-12 h-14 border rounded-xl justify-center items-center bg-surface ${
                      code.length === index
                        ? "border-lingua-purple"
                        : "border-border"
                    }`}
                  >
                    <Text className="text-h2 text-text-primary">
                      {code[index] || ""}
                    </Text>
                    <TextInput
                      ref={inputRef}
                      value={code}
                      onChangeText={(text) => {
                        const numericText = text.replace(/[^0-9]/g, "");
                        if (numericText.length <= 6) setCode(numericText);
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      caretHidden
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0,
                      }}
                    />
                  </View>
                ))}
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: "center",
  },
});
