import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "../../constants/color";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onContinue: () => void;
}

const SplashScreen = ({ onContinue }: SplashScreenProps) => {
  // Main animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const backgroundProgress = useRef(new Animated.Value(0)).current;

  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandTranslateY = useRef(new Animated.Value(15)).current;

  const locationOpacity = useRef(new Animated.Value(0)).current;
  const locationScale = useRef(new Animated.Value(0.7)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.sequence([
      // ------------------------------------------------
      // SPLY 1 → SPLY 2
      // Small logo appears
      // ------------------------------------------------
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 0.45,
          friction: 8,
          tension: 45,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(350),

      // ------------------------------------------------
      // SPLY 2 → SPLY 3
      // Logo grows
      // ------------------------------------------------
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),

      Animated.delay(450),

      // ------------------------------------------------
      // SPLY 3 → SPLY 4
      // Large background appears
      // ------------------------------------------------
      Animated.parallel([
        Animated.timing(backgroundProgress, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),

        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),

        Animated.timing(brandTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(350),

      // ------------------------------------------------
      // SPLY 4 → SPLY 5
      // Location icon + Continue button
      // ------------------------------------------------
      Animated.parallel([
        Animated.timing(locationOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),

        Animated.spring(locationScale, {
          toValue: 1,
          friction: 7,
          tension: 45,
          useNativeDriver: true,
        }),

        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),

        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  /*
   * The background starts at scaleY = 0 and expands
   * downward to create the large curved shape.
   */
  const backgroundScaleY = backgroundProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  /*
   * The logo disappears once the large background starts.
   */
  const logoFade = backgroundProgress.interpolate({
    inputRange: [0, 0.65, 1],
    outputRange: [1, 0.4, 0],
  });

  return (
    <View style={styles.container}>
      {/* --------------------------------------------- */}
      {/* SPLY 1 / 2 / 3 — WHITE BACKGROUND             */}
      {/* --------------------------------------------- */}

      <View style={styles.whiteBackground} />

      {/* Expanding curved background */}
      <Animated.View
        style={[
          styles.backgroundWrapper,
          {
            transform: [{ scaleY: backgroundScaleY }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.peach, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
      </Animated.View>

      {/* --------------------------------------------- */}
      {/* CENTER LOGO — SPLY 2 → SPLY 3                 */}
      {/* --------------------------------------------- */}

      <Animated.View
        style={[
          styles.logo,
          {
            opacity: Animated.multiply(logoOpacity, logoFade),
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={styles.logoText}>Fieldwork Cam</Text>
      </Animated.View>

      {/* --------------------------------------------- */}
      {/* BRAND NAME — SPLY 4                           */}
      {/* --------------------------------------------- */}

      <Animated.View
        style={[
          styles.brandContainer,
          {
            opacity: brandOpacity,
            transform: [{ translateY: brandTranslateY }],
          },
        ]}
      >
        <Text style={styles.brandText}>Fieldwork Cam</Text>
      </Animated.View>

      {/* --------------------------------------------- */}
      {/* LOCATION ICON — SPLY 5                        */}
      {/* --------------------------------------------- */}

      <Animated.View
        style={[
          styles.locationContainer,
          {
            opacity: locationOpacity,
            transform: [{ scale: locationScale }],
          },
        ]}
      >
        <Ionicons
          name="location-outline"
          size={72}
          color={Colors.primary}
        />

        <View style={styles.locationTarget}>
          <Ionicons
            name="locate-outline"
            size={28}
            color={Colors.primary}
          />
        </View>
      </Animated.View>

      {/* --------------------------------------------- */}
      {/* CONTINUE BUTTON — SPLY 5                      */}
      {/* --------------------------------------------- */}

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}
      >
        <Pressable
          style={styles.continueButton}
          onPress={onContinue}
        >
          <Text style={styles.continueText}>Continue</Text>

          <Ionicons
            name="arrow-forward"
            size={18}
            color={Colors.white}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    overflow: "hidden",
  },

  whiteBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
  },

  /*
   * Large peach/gray shape from SPLY 4.
   */
  backgroundWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width,
    height: height * 0.66,

    borderBottomLeftRadius: width * 0.65,
    borderBottomRightRadius: width * 0.65,

    overflow: "hidden",
    transformOrigin: "top",
  },

  backgroundGradient: {
    flex: 1,
  },

  /*
   * Small → large Fieldwork Cam circle.
   */
  logo: {
    position: "absolute",

    width: 124,
    height: 124,

    borderRadius: 62,

    backgroundColor: Colors.peach,

    alignItems: "center",
    justifyContent: "center",

    left: width / 2 - 62,
    top: height * 0.38,
  },

  logoText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600",
  },

  /*
   * Fieldwork Cam text in SPLY 4 / 5.
   */
  brandContainer: {
    position: "absolute",

    width: "100%",

    alignItems: "center",

    top: height * 0.37,
  },

  brandText: {
    color: Colors.primary,
    fontSize: 21,
    fontWeight: "700",
  },

  /*
   * Location marker in SPLY 5.
   */
  locationContainer: {
    position: "absolute",

    top: height * 0.17,

    width: "100%",

    alignItems: "center",
    justifyContent: "center",
  },

  locationTarget: {
    position: "absolute",

    top: 22,
  },

  /*
   * Continue button.
   */
  buttonContainer: {
    position: "absolute",

    top: height * 0.54,

    width: "100%",

    alignItems: "center",
  },

  continueButton: {
    width: width * 0.48,
    height: 44,

    borderRadius: 9,

    backgroundColor: Colors.primary,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 12,
  },

  continueText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
});