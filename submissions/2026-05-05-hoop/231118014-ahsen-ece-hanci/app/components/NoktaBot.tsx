import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

import { theme, monoFont } from "@/constants/theme";

export type BotState = "idle" | "thinking" | "speaking" | "listening";

type Props = {
  state: BotState;
  size?: number;
  testID?: string;
};

/**
 * NoktaBot — detailed terminal-themed mascot.
 * Built from primitive Views: cranial plate, antenna rig, ear modules,
 * brow + eyes with pupils, cheek vents, speaker-grille mouth, neck
 * coupling, chest plate with status LEDs and signal screen, shoulder pads.
 *
 * States:
 *  - idle: slow breathing, soft antenna pulse, occasional blink
 *  - thinking: scanline sweep across visor, mouth dot-loader, screen bars
 *  - speaking: mouth grille bounces, antenna fast pulse, screen waveform
 *  - listening: red rec dot, eyes wide red, mic ring on chest pulses
 */
export const NoktaBot: React.FC<Props> = ({ state, size = 64, testID }) => {
  const breathe = useRef(new Animated.Value(0)).current;
  const antenna = useRef(new Animated.Value(0)).current;
  const mouth = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const blink = useRef(new Animated.Value(1)).current;
  const pupilX = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const wave4 = useRef(new Animated.Value(0)).current;
  const wave5 = useRef(new Animated.Value(0)).current;
  const recBlink = useRef(new Animated.Value(0)).current;

  // Breathing (always on)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  // Blink
  useEffect(() => {
    let mounted = true;
    const run = () => {
      if (!mounted) return;
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.05, duration: 80, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start(() => {
        setTimeout(run, 2400 + Math.random() * 2200);
      });
    };
    const t = setTimeout(run, 1500);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [blink]);

  // Pupil idle drift (looks alive)
  useEffect(() => {
    let mounted = true;
    const run = () => {
      if (!mounted) return;
      const target = (Math.random() - 0.5) * 2; // -1..1
      Animated.timing(pupilX, {
        toValue: target,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(run, 1200 + Math.random() * 1800);
      });
    };
    const t = setTimeout(run, 800);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [pupilX]);

  // Antenna pulse
  useEffect(() => {
    const speed = state === "speaking" ? 380 : state === "listening" ? 280 : state === "thinking" ? 520 : 1100;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(antenna, { toValue: 1, duration: speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(antenna, { toValue: 0, duration: speed, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [antenna, state]);

  // Rec dot blink when listening
  useEffect(() => {
    if (state !== "listening") {
      recBlink.stopAnimation();
      recBlink.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(recBlink, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.timing(recBlink, { toValue: 0, duration: 420, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [recBlink, state]);

  // Mouth animation when speaking
  useEffect(() => {
    if (state !== "speaking") {
      mouth.stopAnimation();
      mouth.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(mouth, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(mouth, { toValue: 0.3, duration: 120, easing: Easing.in(Easing.quad), useNativeDriver: false }),
        Animated.timing(mouth, { toValue: 0.8, duration: 160, useNativeDriver: false }),
        Animated.timing(mouth, { toValue: 0.1, duration: 140, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [mouth, state]);

  // Scanline sweep when thinking
  useEffect(() => {
    if (state !== "thinking") {
      scan.stopAnimation();
      scan.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(scan, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [scan, state]);

  // Thinking dots
  useEffect(() => {
    if (state !== "thinking") {
      [dot1, dot2, dot3].forEach((d) => {
        d.stopAnimation();
        d.setValue(0);
      });
      return;
    }
    const make = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(420 - delay),
        ]),
      );
    const a = make(dot1, 0);
    const b = make(dot2, 140);
    const c = make(dot3, 280);
    a.start();
    b.start();
    c.start();
    return () => {
      a.stop();
      b.stop();
      c.stop();
    };
  }, [dot1, dot2, dot3, state]);

  // Chest waveform bars
  useEffect(() => {
    const active = state === "speaking" || state === "thinking" || state === "listening";
    const values = [wave1, wave2, wave3, wave4, wave5];
    if (!active) {
      values.forEach((v) => {
        v.stopAnimation();
        v.setValue(0.2);
      });
      return;
    }
    const dur = state === "speaking" ? 220 : state === "listening" ? 320 : 420;
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 60),
          Animated.timing(v, { toValue: 1, duration: dur, easing: Easing.out(Easing.quad), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.15, duration: dur, easing: Easing.in(Easing.quad), useNativeDriver: false }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [wave1, wave2, wave3, wave4, wave5, state]);

  const W = size;
  const H = Math.round(size * 1.3);
  const headW = size * 0.82;
  const headH = headW * 0.92;
  const bodyW = size * 0.92;
  const bodyH = size * 0.32;

  const isListening = state === "listening";
  const eyeColor = isListening ? theme.red : theme.accent;
  const glow = isListening ? theme.red : theme.accent;

  return (
    <View style={{ width: W * 1.15, height: H, alignItems: "center", justifyContent: "flex-end" }} testID={testID}>
      {/* Antenna rig */}
      <View style={{ alignItems: "center", marginBottom: -2 }}>
        <Animated.View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: glow,
            shadowColor: glow,
            shadowOpacity: 1,
            shadowRadius: 10,
            opacity: antenna.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }),
            transform: [{ scale: antenna.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.3] }) }],
          }}
        />
        {/* Antenna shaft with cap */}
        <View
          style={{
            width: 2,
            height: size * 0.14,
            backgroundColor: theme.borderStrong,
            marginTop: -1,
          }}
        />
        <View
          style={{
            width: 14,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.borderStrong,
            borderWidth: 1,
            borderColor: theme.border,
            marginTop: -1,
          }}
        />
      </View>

      {/* Head assembly with ears */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Left ear module */}
        <View
          style={{
            width: 10,
            height: headH * 0.42,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.borderStrong,
            backgroundColor: theme.bgElevated,
            marginRight: -2,
            justifyContent: "space-around",
            alignItems: "center",
            paddingVertical: 3,
          }}
        >
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.accentDim, opacity: 0.7 }} />
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.borderStrong }} />
        </View>

        {/* Head */}
        <Animated.View
          style={{
            width: headW,
            height: headH,
            borderRadius: 16,
            borderWidth: 1.4,
            borderColor: theme.accent,
            backgroundColor: theme.bgCard,
            overflow: "hidden",
            shadowColor: theme.accent,
            shadowOpacity: 0.35,
            shadowRadius: 12,
            transform: [
              { translateY: breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -1.5] }) },
              { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] }) },
            ],
          }}
        >
          {/* Top cranial plate seam */}
          <View
            style={{
              position: "absolute",
              top: headH * 0.18,
              left: headW * 0.08,
              right: headW * 0.08,
              height: 1,
              backgroundColor: theme.border,
            }}
          />
          {/* Plate rivets */}
          {[0.16, 0.5, 0.84].map((p) => (
            <View
              key={`rivet-${p}`}
              style={{
                position: "absolute",
                top: headH * 0.18 - 2,
                left: headW * p - 2,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.borderStrong,
              }}
            />
          ))}

          {/* Inner subtle grid */}
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {[1, 2, 3, 4].map((i) => (
              <View
                key={`h${i}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (headH * i) / 5,
                  height: 1,
                  backgroundColor: "rgba(0,255,136,0.04)",
                }}
              />
            ))}
            {[1, 2, 3, 4].map((i) => (
              <View
                key={`v${i}`}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: (headW * i) / 5,
                  width: 1,
                  backgroundColor: "rgba(0,255,136,0.04)",
                }}
              />
            ))}
          </View>

          {/* Visor band behind eyes */}
          <View
            style={{
              position: "absolute",
              top: headH * 0.32,
              left: headW * 0.08,
              right: headW * 0.08,
              height: headH * 0.28,
              borderRadius: 6,
              backgroundColor: "rgba(0,255,136,0.06)",
              borderWidth: 1,
              borderColor: "rgba(0,255,136,0.18)",
            }}
          />

          {/* Scanline sweep */}
          {state === "thinking" && (
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: theme.accent,
                opacity: 0.55,
                shadowColor: theme.accent,
                shadowOpacity: 1,
                shadowRadius: 4,
                transform: [
                  {
                    translateY: scan.interpolate({ inputRange: [0, 1], outputRange: [0, headH - 2] }),
                  },
                ],
              }}
            />
          )}

          {/* Brow ridge */}
          <View
            style={{
              position: "absolute",
              top: headH * 0.3,
              left: headW * 0.18,
              right: headW * 0.18,
              height: 1.5,
              backgroundColor: theme.accentDim,
              opacity: 0.55,
            }}
          />

          {/* Eyes */}
          <View
            style={{
              position: "absolute",
              top: headH * 0.36,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "center",
              gap: headW * 0.16,
            }}
          >
            {[0, 1].map((i) => (
              <Animated.View
                key={`eye-${i}`}
                style={{
                  width: headW * 0.2,
                  height: headW * 0.2,
                  borderRadius: headW * 0.1,
                  backgroundColor: theme.bg,
                  borderWidth: 1.5,
                  borderColor: eyeColor,
                  shadowColor: eyeColor,
                  shadowOpacity: 0.9,
                  shadowRadius: 8,
                  transform: [{ scaleY: blink }],
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Iris glow */}
                <View
                  style={{
                    position: "absolute",
                    width: headW * 0.16,
                    height: headW * 0.16,
                    borderRadius: headW * 0.08,
                    backgroundColor: eyeColor,
                    opacity: 0.18,
                  }}
                />
                {/* Pupil */}
                <Animated.View
                  style={{
                    width: headW * 0.08,
                    height: headW * 0.08,
                    borderRadius: headW * 0.04,
                    backgroundColor: eyeColor,
                    shadowColor: eyeColor,
                    shadowOpacity: 1,
                    shadowRadius: 4,
                    transform: [
                      {
                        translateX: pupilX.interpolate({
                          inputRange: [-1, 1],
                          outputRange: [-headW * 0.03, headW * 0.03],
                        }),
                      },
                    ],
                  }}
                />
                {/* Specular highlight */}
                <View
                  style={{
                    position: "absolute",
                    top: 3,
                    left: 4,
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: "#FFFFFF",
                    opacity: 0.7,
                  }}
                />
              </Animated.View>
            ))}
          </View>

          {/* Cheek vent ticks */}
          <View
            style={{
              position: "absolute",
              top: headH * 0.62,
              left: headW * 0.1,
              flexDirection: "row",
              gap: 2,
            }}
          >
            {[0, 1, 2].map((i) => (
              <View key={`lc-${i}`} style={{ width: 2, height: 6, backgroundColor: theme.borderStrong, opacity: 0.7 }} />
            ))}
          </View>
          <View
            style={{
              position: "absolute",
              top: headH * 0.62,
              right: headW * 0.1,
              flexDirection: "row",
              gap: 2,
            }}
          >
            {[0, 1, 2].map((i) => (
              <View key={`rc-${i}`} style={{ width: 2, height: 6, backgroundColor: theme.borderStrong, opacity: 0.7 }} />
            ))}
          </View>

          {/* Mouth — speaker grille / dots / bar */}
          <View
            style={{
              position: "absolute",
              bottom: headH * 0.1,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: theme.bg,
                borderWidth: 1,
                borderColor: theme.border,
                minWidth: headW * 0.5,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {state === "thinking" ? (
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {[dot1, dot2, dot3].map((d, i) => (
                    <Animated.View
                      key={`d-${i}`}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 2.5,
                        backgroundColor: theme.accent,
                        opacity: d.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
                        transform: [{ scale: d.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] }) }],
                      }}
                    />
                  ))}
                </View>
              ) : state === "speaking" ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Animated.View
                      key={`mb-${i}`}
                      style={{
                        width: 3,
                        height: mouth.interpolate({
                          inputRange: [0, 1],
                          outputRange: [3, 10 + (i % 2 === 0 ? 4 : 0)],
                        }),
                        borderRadius: 1.5,
                        backgroundColor: theme.accent,
                        shadowColor: theme.accent,
                        shadowOpacity: 0.8,
                        shadowRadius: 4,
                      }}
                    />
                  ))}
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <View
                      key={`gr-${i}`}
                      style={{
                        width: 2,
                        height: 6,
                        backgroundColor: isListening ? theme.red : theme.accentDim,
                        opacity: 0.8,
                      }}
                    />
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Side bolts */}
          <View
            style={{
              position: "absolute",
              top: headH * 0.4,
              left: -3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.borderStrong,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: headH * 0.4,
              right: -3,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.borderStrong,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          />

          {/* Model label */}
          <View
            style={{
              position: "absolute",
              top: 4,
              left: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
            }}
          >
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.accent, opacity: 0.8 }} />
            <Animated.Text
              style={{
                fontFamily: monoFont,
                fontSize: 6,
                color: theme.textFaint,
                letterSpacing: 1,
              }}
            >
              NK-01
            </Animated.Text>
          </View>
        </Animated.View>

        {/* Right ear module */}
        <View
          style={{
            width: 10,
            height: headH * 0.42,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: theme.borderStrong,
            backgroundColor: theme.bgElevated,
            marginLeft: -2,
            justifyContent: "space-around",
            alignItems: "center",
            paddingVertical: 3,
          }}
        >
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.borderStrong }} />
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: theme.accentDim, opacity: 0.7 }} />
        </View>
      </View>

      {/* Neck coupling */}
      <View style={{ alignItems: "center", marginTop: -2 }}>
        <View
          style={{
            width: headW * 0.42,
            height: 6,
            backgroundColor: theme.bgElevated,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: theme.borderStrong,
          }}
        />
        <View
          style={{
            width: headW * 0.5,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.borderStrong,
            marginTop: -1,
          }}
        />
      </View>

      {/* Body / chest plate */}
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: -1 }}>
        {/* Left shoulder */}
        <View
          style={{
            width: bodyW * 0.16,
            height: bodyH * 0.7,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 4,
            backgroundColor: theme.bgElevated,
            borderWidth: 1,
            borderColor: theme.borderStrong,
            marginRight: -1,
            marginTop: 4,
          }}
        />

        {/* Chest */}
        <Animated.View
          style={{
            width: bodyW * 0.7,
            height: bodyH,
            borderRadius: 10,
            borderWidth: 1.2,
            borderColor: theme.accent,
            backgroundColor: theme.bgCard,
            overflow: "hidden",
            shadowColor: theme.accent,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            transform: [
              { translateY: breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
            ],
          }}
        >
          {/* Top status row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 6,
              paddingTop: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 2.5,
                  backgroundColor: theme.accent,
                  shadowColor: theme.accent,
                  shadowOpacity: 1,
                  shadowRadius: 4,
                }}
              />
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.amber, opacity: 0.85 }} />
              {state === "listening" ? (
                <Animated.View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: theme.red,
                    opacity: recBlink,
                  }}
                />
              ) : (
                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: theme.borderStrong }} />
              )}
            </View>
            <Animated.Text
              style={{
                fontFamily: monoFont,
                fontSize: 6,
                color: theme.textFaint,
                letterSpacing: 1,
              }}
            >
              {state === "listening" ? "REC" : state === "thinking" ? "PROC" : state === "speaking" ? "TX" : "RDY"}
            </Animated.Text>
          </View>

          {/* Mini screen with waveform */}
          <View
            style={{
              marginTop: 4,
              marginHorizontal: 8,
              height: bodyH * 0.45,
              borderRadius: 4,
              backgroundColor: theme.bg,
              borderWidth: 1,
              borderColor: theme.border,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              paddingHorizontal: 4,
              overflow: "hidden",
            }}
          >
            {[wave1, wave2, wave3, wave4, wave5].map((w, i) => (
              <Animated.View
                key={`w-${i}`}
                style={{
                  width: 3,
                  height: w.interpolate({ inputRange: [0, 1], outputRange: [2, bodyH * 0.38] }),
                  backgroundColor: isListening ? theme.red : theme.accent,
                  opacity: 0.9,
                  borderRadius: 1.5,
                  shadowColor: isListening ? theme.red : theme.accent,
                  shadowOpacity: 0.8,
                  shadowRadius: 3,
                }}
              />
            ))}
          </View>

          {/* Bottom seam + vents */}
          <View
            style={{
              position: "absolute",
              bottom: 4,
              left: 8,
              right: 8,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", gap: 2 }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={`vl-${i}`} style={{ width: 2, height: 4, backgroundColor: theme.borderStrong }} />
              ))}
            </View>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: theme.accentDim,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.accent }} />
            </View>
            <View style={{ flexDirection: "row", gap: 2 }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={`vr-${i}`} style={{ width: 2, height: 4, backgroundColor: theme.borderStrong }} />
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Right shoulder */}
        <View
          style={{
            width: bodyW * 0.16,
            height: bodyH * 0.7,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 4,
            backgroundColor: theme.bgElevated,
            borderWidth: 1,
            borderColor: theme.borderStrong,
            marginLeft: -1,
            marginTop: 4,
          }}
        />
      </View>
    </View>
  );
};
