import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";
import Svg, { Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";
import { ASSISTANT_STATES, ASSISTANT_STATE_LABELS } from "../constants/assistantStates";
import { useAssistantStore } from "../store/assistantStore";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getAvatarMood = (state) => {
  switch (state) {
    case ASSISTANT_STATES.SLEEP:
      return {
        emoji: "💤",
        faceColor: "#243044",
        eyeType: "sleep",
        mouthType: "sleep",
        auraText: "Uyuyor"
      };

    case ASSISTANT_STATES.LISTENING:
      return {
        emoji: "🎧",
        faceColor: "#1D4ED8",
        eyeType: "open",
        mouthType: "smile",
        auraText: "Dinliyor"
      };

    case ASSISTANT_STATES.THINKING:
      return {
        emoji: "🧠",
        faceColor: "#7C3AED",
        eyeType: "focus",
        mouthType: "flat",
        auraText: "Düşünüyor"
      };

    case ASSISTANT_STATES.SPEAKING:
      return {
        emoji: "🔊",
        faceColor: "#0891B2",
        eyeType: "open",
        mouthType: "talk",
        auraText: "Konuşuyor"
      };

    case ASSISTANT_STATES.ANGRY:
      return {
        emoji: "💢",
        faceColor: "#DC2626",
        eyeType: "angry",
        mouthType: "angry",
        auraText: "Kızgın"
      };

    case ASSISTANT_STATES.LOVE:
      return {
        emoji: "💙",
        faceColor: "#DB2777",
        eyeType: "love",
        mouthType: "smile",
        auraText: "Mutlu"
      };

    case ASSISTANT_STATES.HAPPY:
      return {
        emoji: "✨",
        faceColor: "#16A34A",
        eyeType: "open",
        mouthType: "smile",
        auraText: "Neşeli"
      };

    case ASSISTANT_STATES.ERROR:
      return {
        emoji: "⚠️",
        faceColor: "#EA580C",
        eyeType: "focus",
        mouthType: "flat",
        auraText: "Hata"
      };

    case ASSISTANT_STATES.IDLE:
    default:
      return {
        emoji: "●",
        faceColor: "#0EA5E9",
        eyeType: "open",
        mouthType: "smile",
        auraText: "Hazır"
      };
  }
};

const Eyes = ({ type }) => {
  if (type === "sleep") {
    return (
      <>
        <Path
          d="M70 92 Q84 102 98 92"
          stroke="#EAF6FF"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M142 92 Q156 102 170 92"
          stroke="#EAF6FF"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (type === "angry") {
    return (
      <>
        <Path d="M70 78 L100 92" stroke="#EAF6FF" strokeWidth="7" strokeLinecap="round" />
        <Path d="M170 78 L140 92" stroke="#EAF6FF" strokeWidth="7" strokeLinecap="round" />
        <Circle cx="88" cy="104" r="6" fill="#EAF6FF" />
        <Circle cx="152" cy="104" r="6" fill="#EAF6FF" />
      </>
    );
  }

  if (type === "love") {
    return (
      <>
        <SvgText x="77" y="106" fill="#FFFFFF" fontSize="27" fontWeight="bold">
          ♥
        </SvgText>
        <SvgText x="147" y="106" fill="#FFFFFF" fontSize="27" fontWeight="bold">
          ♥
        </SvgText>
      </>
    );
  }

  if (type === "focus") {
    return (
      <>
        <Circle cx="88" cy="98" r="10" fill="#EAF6FF" />
        <Circle cx="152" cy="98" r="10" fill="#EAF6FF" />
        <Circle cx="88" cy="98" r="4" fill="#111827" />
        <Circle cx="152" cy="98" r="4" fill="#111827" />
      </>
    );
  }

  return (
    <>
      <Circle cx="88" cy="98" r="11" fill="#EAF6FF" />
      <Circle cx="152" cy="98" r="11" fill="#EAF6FF" />
    </>
  );
};

const Mouth = ({ type }) => {
  if (type === "sleep") {
    return (
      <Path
        d="M105 143 Q120 151 135 143"
        stroke="#EAF6FF"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  if (type === "angry") {
    return (
      <Path
        d="M100 154 Q120 139 140 154"
        stroke="#EAF6FF"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    );
  }

  if (type === "talk") {
    return <Ellipse cx="120" cy="148" rx="18" ry="12" fill="#EAF6FF" />;
  }

  if (type === "flat") {
    return <Path d="M100 148 L140 148" stroke="#EAF6FF" strokeWidth="7" strokeLinecap="round" />;
  }

  return (
    <Path
      d="M96 142 Q120 168 144 142"
      stroke="#EAF6FF"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
  );
};

export const NoktaAvatar = () => {
  const assistantState = useAssistantStore((state) => state.assistantState);
  const handleAvatarTap = useAssistantStore((state) => state.handleAvatarTap);
  const handleAvatarLongPress = useAssistantStore((state) => state.handleAvatarLongPress);
  const handleAvatarSwipe = useAssistantStore((state) => state.handleAvatarSwipe);

  const pulse = useSharedValue(1);
  const rotate = useSharedValue(0);
  const floatY = useSharedValue(0);

  const mood = getAvatarMood(assistantState);

  useEffect(() => {
    if (assistantState === ASSISTANT_STATES.SLEEP) {
      pulse.value = withRepeat(
        withSequence(withTiming(0.94, { duration: 1200 }), withTiming(1, { duration: 1200 })),
        -1,
        true
      );
      floatY.value = withRepeat(
        withSequence(withTiming(8, { duration: 1400 }), withTiming(0, { duration: 1400 })),
        -1,
        true
      );
      rotate.value = withTiming(0, { duration: 200 });
      return;
    }

    if (assistantState === ASSISTANT_STATES.ANGRY) {
      pulse.value = withSequence(
        withTiming(1.08, { duration: 80 }),
        withTiming(0.95, { duration: 80 }),
        withTiming(1.08, { duration: 80 }),
        withTiming(1, { duration: 80 })
      );
      rotate.value = withSequence(
        withTiming(-5, { duration: 70 }),
        withTiming(5, { duration: 70 }),
        withTiming(-4, { duration: 70 }),
        withTiming(0, { duration: 70 })
      );
      return;
    }

    if (
      assistantState === ASSISTANT_STATES.LISTENING ||
      assistantState === ASSISTANT_STATES.THINKING ||
      assistantState === ASSISTANT_STATES.SPEAKING
    ) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      floatY.value = withRepeat(
        withSequence(withTiming(-8, { duration: 900 }), withTiming(0, { duration: 900 })),
        -1,
        true
      );
      rotate.value = withTiming(0, { duration: 200 });
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    floatY.value = withRepeat(
      withSequence(withTiming(-5, { duration: 1600 }), withTiming(0, { duration: 1600 })),
      -1,
      true
    );

    rotate.value = withTiming(0, { duration: 200 });
  }, [assistantState, floatY, pulse, rotate]);

  const avatarAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: pulse.value },
        { translateY: floatY.value },
        { rotate: `${rotate.value}deg` }
      ]
    };
  });

  const onPress = async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Sessiz geç.
    }

    handleAvatarTap();
  };

  const onLongPress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Sessiz geç.
    }

    handleAvatarLongPress();
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.statusPill}>
        <Text style={styles.statusDot}>●</Text>
        <Text style={styles.statusText}>{ASSISTANT_STATE_LABELS[assistantState] || "Hazır"}</Text>
      </View>

      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={450}
        onTouchMove={handleAvatarSwipe}
        style={[styles.avatarButton, avatarAnimatedStyle]}
      >
        <View style={[styles.glow, { backgroundColor: mood.faceColor }]} />

        <Svg width={240} height={240} viewBox="0 0 240 240">
          <Circle cx="120" cy="120" r="92" fill={mood.faceColor} />
          <Circle cx="120" cy="120" r="78" fill="rgba(255,255,255,0.08)" />
          <Circle cx="82" cy="72" r="13" fill="rgba(255,255,255,0.22)" />
          <Circle cx="98" cy="58" r="7" fill="rgba(255,255,255,0.18)" />
          <Eyes type={mood.eyeType} />
          <Mouth type={mood.mouthType} />
        </Svg>

        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
      </AnimatedPressable>

      <Text style={styles.auraText}>{mood.auraText}</Text>
      <Text style={styles.hintText}>Dokun, basılı tut veya konuş.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 18
  },
  statusDot: {
    color: "#34D399",
    fontSize: 12
  },
  statusText: {
    color: "#EAF6FF",
    fontSize: 13,
    fontWeight: "700"
  },
  avatarButton: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center"
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.24
  },
  moodEmoji: {
    position: "absolute",
    right: 34,
    top: 36,
    fontSize: 28
  },
  auraText: {
    marginTop: 8,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800"
  },
  hintText: {
    marginTop: 6,
    color: "rgba(234,246,255,0.62)",
    fontSize: 13
  }
});