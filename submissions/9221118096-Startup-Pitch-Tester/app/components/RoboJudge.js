import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const C = {
  body: "#1E2A44",
  bodyLight: "#2C3E5F",
  bodyDark: "#0F172A",
  gold: "#D4AF37",
  goldSoft: "#F2D26C",
  red: "#E53935",
  green: "#10B981",
  blueCalm: "#60A5FA",
  screen: "#0B1220",
  ink: "#F9FAFB",
  wood: "#8B4513",
  woodLight: "#A0522D",
};

const CALLOUT = {
  idle: "AWAITING THE PITCH",
  analyzing: "EXAMINING THE EVIDENCE…",
  grounded: "VERDICT — GROUNDED",
  skeptical: "VERDICT — MIXED SIGNALS",
  outraged: "VERDICT — PURE SLOP",
  disturbed: "OBJECTION NOTED.",
  incontempt: "IN CONTEMPT OF COURT!",
  sleeping: "DOZED OFF — TAP TO WAKE",
  speaking: "READING THE OPINION…",
};

const IDLE_SLEEP_MS = 15000;
const DISTURBED_MS = 900;
const CONTEMPT_MS = 2800;
const TRIPLE_TAP_WINDOW_MS = 1000;

export default function RoboJudge({
  mood = "idle",
  score = null,
  speaking = false,
}) {
  const [transient, setTransient] = useState(null);
  const transientTimer = useRef(null);
  const tapCount = useRef(0);
  const tapResetTimer = useRef(null);
  const idleTimer = useRef(null);

  const displayMood = transient || (speaking ? "speaking" : mood);

  const breathe = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const eyeFlicker = useRef(new Animated.Value(1)).current;
  const gavel = useRef(new Animated.Value(0)).current;
  const talk = useRef(new Animated.Value(0)).current;
  const zzzFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    let cancelled = false;
    const blinkLoop = () => {
      if (cancelled) return;
      const wait = 1800 + Math.random() * 2400;
      Animated.sequence([
        Animated.delay(wait),
        Animated.timing(blink, { toValue: 0.1, duration: 90, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 110, useNativeDriver: true }),
      ]).start(blinkLoop);
    };
    blinkLoop();
    return () => {
      cancelled = true;
    };
  }, [blink, breathe]);

  useEffect(() => {
    if (mood !== "idle") {
      clearTimeout(transientTimer.current);
      clearTimeout(idleTimer.current);
      setTransient(null);
      return;
    }
    if (transient === "sleeping") return;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setTransient("sleeping");
    }, IDLE_SLEEP_MS);
    return () => clearTimeout(idleTimer.current);
  }, [mood, transient]);

  useEffect(
    () => () => {
      clearTimeout(transientTimer.current);
      clearTimeout(tapResetTimer.current);
      clearTimeout(idleTimer.current);
    },
    []
  );

  useEffect(() => {
    scan.stopAnimation();
    shake.stopAnimation();
    glow.stopAnimation();
    eyeFlicker.stopAnimation();
    gavel.stopAnimation();
    talk.stopAnimation();
    zzzFloat.stopAnimation();
    scan.setValue(0);
    shake.setValue(0);
    glow.setValue(0);
    eyeFlicker.setValue(1);
    gavel.setValue(0);
    talk.setValue(0);
    zzzFloat.setValue(0);

    if (displayMood === "analyzing") {
      Animated.loop(
        Animated.timing(scan, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(eyeFlicker, { toValue: 0.35, duration: 220, useNativeDriver: true }),
          Animated.timing(eyeFlicker, { toValue: 1, duration: 220, useNativeDriver: true }),
        ])
      ).start();
    } else if (displayMood === "outraged" || displayMood === "incontempt") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 320, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0.25, duration: 320, useNativeDriver: false }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(gavel, {
            toValue: 1,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(gavel, {
            toValue: 0,
            duration: 500,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
          Animated.delay(600),
        ])
      ).start();
    } else if (displayMood === "grounded") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(glow, {
            toValue: 0.3,
            duration: 1300,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else if (displayMood === "disturbed") {
      Animated.sequence([
        Animated.timing(shake, { toValue: 0.6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -0.6, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.4, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -0.4, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    } else if (displayMood === "speaking") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(talk, { toValue: 1, duration: 140, useNativeDriver: true }),
          Animated.timing(talk, { toValue: 0.2, duration: 140, useNativeDriver: true }),
        ])
      ).start();
    } else if (displayMood === "sleeping") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(zzzFloat, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(zzzFloat, {
            toValue: 0,
            duration: 1600,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [displayMood, scan, shake, glow, eyeFlicker, gavel, talk, zzzFloat]);

  const triggerTransient = (m, duration) => {
    clearTimeout(transientTimer.current);
    setTransient(m);
    transientTimer.current = setTimeout(() => {
      setTransient(null);
    }, duration);
  };

  const onPress = () => {
    if (transient === "sleeping") {
      clearTimeout(transientTimer.current);
      setTransient(null);
      return;
    }
    if (mood === "analyzing") return;

    tapCount.current += 1;
    clearTimeout(tapResetTimer.current);
    tapResetTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, TRIPLE_TAP_WINDOW_MS);

    if (tapCount.current >= 3) {
      tapCount.current = 0;
      triggerTransient("incontempt", CONTEMPT_MS);
    } else {
      triggerTransient("disturbed", DISTURBED_MS);
    }
  };

  const headBob = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: displayMood === "sleeping" ? [-1, -3] : [0, -3],
  });
  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-4, 4] });
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [0, 118] });
  const gavelRot = gavel.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-55deg"] });
  const glowRadius = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 24] });
  const zzzY = zzzFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const zzzOpacity = zzzFloat.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  const mouthScaleY = talk.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });

  const glowColor =
    displayMood === "outraged" || displayMood === "incontempt"
      ? C.red
      : displayMood === "speaking"
      ? C.blueCalm
      : C.gold;
  const eyeColor =
    displayMood === "outraged" || displayMood === "incontempt"
      ? C.red
      : displayMood === "analyzing"
      ? C.green
      : displayMood === "speaking"
      ? C.blueCalm
      : displayMood === "disturbed"
      ? C.goldSoft
      : C.gold;
  const antennaLit = displayMood === "outraged" || displayMood === "incontempt";

  const mouth = mouthStyleFor(displayMood);
  const scoreLabel =
    displayMood === "analyzing"
      ? "···"
      : displayMood === "disturbed" || displayMood === "incontempt"
      ? "!?"
      : displayMood === "sleeping"
      ? "ZZ"
      : score == null
      ? "--"
      : String(score);

  const showGavel = displayMood === "outraged" || displayMood === "incontempt";
  const eyesClosed = displayMood === "sleeping";

  return (
    <View style={S.wrap}>
      {showGavel && (
        <Animated.View
          style={[
            S.gavelWrap,
            { transform: [{ rotate: gavelRot }, { translateX: 4 }, { translateY: -6 }] },
          ]}
        >
          <View style={S.gavelHandle} />
          <View style={S.gavelHead} />
        </Animated.View>
      )}

      {displayMood === "sleeping" && (
        <Animated.View
          style={[S.zzzWrap, { transform: [{ translateY: zzzY }], opacity: zzzOpacity }]}
          pointerEvents="none"
        >
          <Text style={S.zzzText}>Zzz</Text>
        </Animated.View>
      )}

      <Pressable onPress={onPress} hitSlop={6}>
        <Animated.View
          style={{
            shadowColor: glowColor,
            shadowOpacity: glow,
            shadowRadius: glowRadius,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          }}
        >
          <Animated.View
            style={{
              transform: [{ translateY: headBob }, { translateX: shakeX }],
            }}
          >
            <View style={S.antennaRow}>
              <Antenna lit={antennaLit} dim={eyesClosed} />
              <View style={{ width: 56 }} />
              <Antenna lit={antennaLit} dim={eyesClosed} />
            </View>

            <View style={S.head}>
              <View style={S.scorePanel}>
                <Text style={S.scoreText}>{scoreLabel}</Text>
              </View>

              <View style={S.eyeRow}>
                {eyesClosed ? (
                  <View style={[S.eye, S.eyeClosed]} />
                ) : (
                  <Animated.View
                    style={[
                      S.eye,
                      {
                        backgroundColor: eyeColor,
                        opacity: eyeFlicker,
                        transform: [{ scaleY: blink }],
                      },
                    ]}
                  />
                )}
                <View style={S.monocleWrap}>
                  {eyesClosed ? (
                    <View style={[S.eye, S.eyeClosed]} />
                  ) : (
                    <Animated.View
                      style={[
                        S.eye,
                        {
                          backgroundColor: eyeColor,
                          opacity: eyeFlicker,
                          transform: [{ scaleY: blink }],
                        },
                      ]}
                    />
                  )}
                  <View style={[S.monocleRing, eyesClosed && S.monocleDangle]} />
                  <View style={[S.monocleChain, eyesClosed && S.monocleChainDangle]} />
                </View>
              </View>

              <View style={S.mouthRow}>
                <Animated.View
                  style={[
                    mouth,
                    displayMood === "speaking" && { transform: [{ scaleY: mouthScaleY }] },
                  ]}
                />
              </View>

              {displayMood === "analyzing" && (
                <Animated.View style={[S.scanLine, { transform: [{ translateY: scanY }] }]} />
              )}
            </View>

            <View style={S.namePlate}>
              <Text style={S.namePlateText}>JUDGE-7 · PITCH AUDITOR</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>

      <Text style={S.callout}>{CALLOUT[displayMood] || CALLOUT.idle}</Text>
    </View>
  );
}

function Antenna({ lit, dim }) {
  return (
    <View style={S.antennaPair}>
      <View style={S.antennaStem} />
      <View
        style={[
          S.antennaBulb,
          {
            backgroundColor: lit ? C.red : C.gold,
            shadowColor: lit ? C.red : C.gold,
            opacity: dim ? 0.3 : 1,
          },
        ]}
      />
    </View>
  );
}

function mouthStyleFor(mood) {
  if (mood === "outraged" || mood === "incontempt") return [S.mouth, S.mouthFrown];
  if (mood === "grounded") return [S.mouth, S.mouthSmile];
  if (mood === "skeptical") return [S.mouth, S.mouthSmirk];
  if (mood === "analyzing") return [S.mouth, S.mouthScan];
  if (mood === "disturbed") return [S.mouth, S.mouthSurprise];
  if (mood === "speaking") return [S.mouth, S.mouthOpen];
  if (mood === "sleeping") return [S.mouth, S.mouthIdle];
  return [S.mouth, S.mouthIdle];
}

const S = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 4 },
  antennaRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: -2,
  },
  antennaPair: { alignItems: "center" },
  antennaStem: { width: 3, height: 20, backgroundColor: C.bodyLight, borderRadius: 2 },
  antennaBulb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: -2,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  head: {
    width: 178,
    height: 138,
    borderRadius: 22,
    backgroundColor: C.body,
    borderWidth: 2,
    borderColor: C.bodyLight,
    alignItems: "center",
    paddingTop: 12,
    overflow: "hidden",
  },
  scorePanel: {
    width: 76,
    height: 24,
    borderRadius: 6,
    backgroundColor: C.screen,
    borderWidth: 1,
    borderColor: C.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    color: C.goldSoft,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },
  eyeRow: {
    flexDirection: "row",
    marginTop: 16,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 26,
  },
  eye: {
    width: 28,
    height: 9,
    borderRadius: 2,
  },
  eyeClosed: {
    height: 2,
    backgroundColor: C.gold,
    opacity: 0.6,
  },
  monocleWrap: { position: "relative", alignItems: "center", justifyContent: "center" },
  monocleRing: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: C.gold,
    top: -15,
    left: -5,
  },
  monocleDangle: {
    top: 6,
    left: -3,
    transform: [{ rotate: "15deg" }],
  },
  monocleChain: {
    position: "absolute",
    top: 22,
    left: 22,
    width: 1.5,
    height: 16,
    backgroundColor: C.gold,
  },
  monocleChainDangle: {
    top: 10,
    left: 18,
    height: 22,
    transform: [{ rotate: "20deg" }],
  },
  mouthRow: { marginTop: 18, alignItems: "center", justifyContent: "center" },
  mouth: { width: 50, height: 6, borderRadius: 3 },
  mouthIdle: { width: 38, height: 5, backgroundColor: C.gold },
  mouthScan: { width: 32, height: 8, backgroundColor: C.green },
  mouthSmirk: { width: 30, height: 4, backgroundColor: C.goldSoft, transform: [{ rotate: "-8deg" }] },
  mouthSurprise: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.goldSoft,
  },
  mouthOpen: {
    width: 28,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.blueCalm,
  },
  mouthSmile: {
    width: 54,
    height: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    backgroundColor: C.gold,
  },
  mouthFrown: {
    width: 54,
    height: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: C.red,
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: C.green,
    shadowColor: C.green,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  namePlate: {
    marginTop: 6,
    alignSelf: "center",
    backgroundColor: C.bodyDark,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: C.gold,
  },
  namePlateText: {
    color: C.goldSoft,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  gavelWrap: {
    position: "absolute",
    top: 6,
    right: 22,
    zIndex: 5,
    alignItems: "center",
  },
  gavelHandle: { width: 6, height: 34, backgroundColor: C.wood, borderRadius: 2 },
  gavelHead: { width: 30, height: 14, backgroundColor: C.woodLight, borderRadius: 4, marginTop: -4 },
  zzzWrap: {
    position: "absolute",
    top: -6,
    right: 30,
    zIndex: 4,
  },
  zzzText: {
    color: C.blueCalm,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 3,
  },
  callout: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "800",
    color: "#374151",
    letterSpacing: 1.4,
  },
});
