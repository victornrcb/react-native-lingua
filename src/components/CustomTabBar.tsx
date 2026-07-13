import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Maps route names to Ionicons names and display labels
const TAB_CONFIG: Record<
  string,
  {
    label: string;
    iconActive: keyof typeof Ionicons.glyphMap;
    iconInactive: keyof typeof Ionicons.glyphMap;
  }
> = {
  home: { label: "Home", iconActive: "home", iconInactive: "home-outline" },
  learn: { label: "Learn", iconActive: "book", iconInactive: "book-outline" },
  "ai-teacher": {
    label: "AI Teacher",
    iconActive: "people",
    iconInactive: "people-outline",
  },
  chat: {
    label: "Chat",
    iconActive: "chatbubble",
    iconInactive: "chatbubble-outline",
  },
  profile: {
    label: "Profile",
    iconActive: "person",
    iconInactive: "person-outline",
  },
};

const ACTIVE_COLOR = "#6C4EF5";
const INACTIVE_COLOR = "#9CA3AF";
const TAB_BAR_HEIGHT = 68;
const CIRCLE_SIZE = 52;

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const tabCount = state.routes.length;

  // Width of a single tab slot
  const slotWidth = screenWidth / tabCount;

  // The left position of the center of the active circle
  // = slot center - half circle size
  const getCircleLeft = (index: number) =>
    index * slotWidth + slotWidth / 2 - CIRCLE_SIZE / 2;

  // Animated value drives the circle X position
  const circleLeft = useRef(
    new Animated.Value(getCircleLeft(state.index)),
  ).current;

  useEffect(() => {
    Animated.timing(circleLeft, {
      toValue: getCircleLeft(state.index),
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [state.index, screenWidth]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      {/* Animated circle that glides between tabs */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.animatedCircle,
          {
            transform: [{ translateX: circleLeft }],
          },
        ]}
      />

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name] ?? {
          label: route.name,
          iconActive: "help-circle" as keyof typeof Ionicons.glyphMap,
          iconInactive: "help-circle-outline" as keyof typeof Ionicons.glyphMap,
        };

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={
              options.tabBarAccessibilityLabel ?? config.label
            }
            onPress={onPress}
            style={styles.tabItem}
          >
            {isFocused ? (
              // Active: white icon inside the floating circle (no label)
              <View style={styles.iconWrapper}>
                <Ionicons name={config.iconActive} size={22} color="#FFFFFF" />
              </View>
            ) : (
              // Inactive: muted icon + label below
              <View style={styles.inactiveContent}>
                <Ionicons
                  name={config.iconInactive}
                  size={22}
                  color={INACTIVE_COLOR}
                />
                <Text style={styles.label} numberOfLines={1}>
                  {config.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 16,
  },
  animatedCircle: {
    position: "absolute",
    top: (TAB_BAR_HEIGHT - CIRCLE_SIZE) / 2,
    left: 0, // baseline; actual position driven by translateX
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: ACTIVE_COLOR,
    shadowColor: ACTIVE_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1, // rendered above the animated circle
  },
  iconWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
    color: INACTIVE_COLOR,
    textAlign: "center",
  },
});
