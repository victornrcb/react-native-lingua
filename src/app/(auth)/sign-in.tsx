import { images } from "@/constants/images";
import { posthog } from "@/lib/posthog";
import { useOAuth, useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInScreen() {
  useWarmUpBrowser();
  const { signIn } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const { startOAuthFlow: startGoogleFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startFacebookFlow } = useOAuth({
    strategy: "oauth_facebook",
  });
  const { startOAuthFlow: startAppleFlow } = useOAuth({
    strategy: "oauth_apple",
  });
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);

  const keyboardPadding = useRef(new Animated.Value(0)).current;

  const handleCode = async (numericText: string) => {
    setCode(numericText);
    if (numericText.length === 6) {
      try {
        const { error: verifyError } = await signIn!.emailCode.verifyCode({
          code: numericText,
        });

        if (verifyError) {
          console.error("Verification error:", verifyError.message);
          return;
        }

        if (signIn!.status === "complete") {
          posthog.capture("user_signed_in", { sign_in_method: "email" });
          await signIn!.finalize({
            navigate: () => router.replace("/"),
          });
          setShowModal(false);
        }
      } catch (err) {
        console.error("Verification error:", JSON.stringify(err, null, 2));
      }
    }
  };

  const handleOAuth = async (
    strategy: "oauth_google" | "oauth_facebook" | "oauth_apple",
  ) => {
    try {
      const flow =
        strategy === "oauth_google"
          ? startGoogleFlow
          : strategy === "oauth_facebook"
            ? startFacebookFlow
            : startAppleFlow;
      const { createdSessionId, setActive } = await flow();
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        posthog.capture("oauth_sign_in_completed", { provider: strategy });
        router.replace("/");
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  };

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

  const handleSignIn = async () => {
    if (!signIn || !emailAddress) return;
    Keyboard.dismiss();
    setError("");
    try {
      const { error: createError } = await signIn.create({
        identifier: emailAddress,
      });
      if (createError) {
        createError.message === "Identifier is invalid."
          ? setError("Email is invalid.")
          : setError(
              createError.message ?? "Something went wrong. Please try again.",
            );
        console.error("Create sign in error", createError);
        return;
      }

      const { error: sendError } = await signIn.emailCode.sendCode();

      if (sendError) {
        setError(sendError.message ?? "Failed to send verification code.");
        console.error("Send code error", sendError);
        return;
      }

      setShowModal(true);
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      const message =
        clerkError?.errors?.[0]?.message ??
        "Something went wrong. Please try again.";
      setError(message);
      console.error("Sign-in error:", JSON.stringify(err, null, 2));
    }
  };

  const handleModalShow = () => {
    // Reset padding before focusing so the animation starts from 0
    keyboardPadding.setValue(0);
    // Focus the hidden input once the modal is fully visible so the keyboard appears
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="px-6 flex-1 bg-background pt-2">
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#0D132B" />
        </Pressable>

        <Text className="text-h1 text-text-primary mt-4">Welcome back</Text>
        <Text className="text-body-lg text-text-secondary mt-1">
          Continue your language journey ✨
        </Text>

        {/* Mascot Image */}
        <View className="items-center mt-6 h-32">
          <Image
            source={images.mascotAuth}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        </View>

        {/* Form — email only, no password */}
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
              value={emailAddress}
              onChangeText={setEmailAddress}
            />
          </View>
        </View>

        {!!error && (
          <Text className="text-red-500 text-body-sm font-poppins-medium mt-3">
            {error}
          </Text>
        )}

        <Pressable
          className="bg-lingua-purple disabled:opacity-50 py-4 rounded-2xl flex-row justify-center items-center mt-4"
          onPress={handleSignIn}
          disabled={!emailAddress || !signIn}
        >
          <Text className="text-white text-h3 font-poppins-semibold">
            Sign In
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

        {/* Social Buttons */}
        <View>
          <Pressable
            onPress={() => handleOAuth("oauth_google")}
            className="border border-border py-3.5 rounded-2xl flex-row justify-center items-center"
            testID="google-oauth-sign-in"
          >
            <Text className="font-poppins-bold text-[#EA4335] text-[20px] absolute left-6">
              G
            </Text>
            <Text className="text-text-primary text-body-lg font-poppins-medium">
              Continue with Google
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleOAuth("oauth_facebook")}
            className="border border-border py-3.5 rounded-2xl flex-row justify-center items-center mt-3"
          >
            <Text className="font-poppins-bold text-[#1877F2] text-[20px] absolute left-6">
              f
            </Text>
            <Text className="text-text-primary text-body-lg font-poppins-medium">
              Continue with Facebook
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleOAuth("oauth_apple")}
            className="border border-border py-3.5 rounded-2xl flex-row justify-center items-center mt-3"
          >
            <Text className="font-poppins-bold text-[#000000] text-[22px] absolute left-6"></Text>
            <Text className="text-text-primary text-body-lg font-poppins-medium">
              Continue with Apple
            </Text>
          </Pressable>
        </View>

        <View className="mt-auto mb-6 flex-row justify-center items-center">
          <Text className="text-body-md text-text-secondary">
            Don't have an account?{" "}
          </Text>
          <Pressable onPress={() => router.replace("/sign-up")}>
            <Text className="text-body-md text-lingua-purple font-poppins-semibold">
              Sign up
            </Text>
          </Pressable>
        </View>
      </View>

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
                  </View>
                ))}
                <TextInput
                  testID="sign-in-code"
                  ref={inputRef}
                  value={code}
                  onChangeText={(text) => {
                    const numericText = text.replace(/[^0-9]/g, "");
                    if (numericText.length <= 6) handleCode(numericText);
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
