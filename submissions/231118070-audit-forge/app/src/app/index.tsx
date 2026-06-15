import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Canvas, useFrame } from "@react-three/fiber/native";
import { useGLTF } from "@react-three/drei/native";

function AvatarModel({ speaking }: { speaking: boolean }) {
  const gltf = useGLTF(require("../../assets/avatar.glb"));
  const modelRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (!modelRef.current) return;

    modelRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.12;

    if (speaking) {
      modelRef.current.position.y = Math.sin(clock.elapsedTime * 8) * 0.03;
    } else {
      modelRef.current.position.y = 0;
    }
  });

  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={1.15}
      position={[0, -0.85, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function VoiceVisualizer({ active }: { active: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (active) setTick((v) => v + 1);
    }, 90);

    return () => clearInterval(timer);
  }, [active]);

  const bars = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => {
      if (!active) return 10;
      return 16 + Math.abs(Math.sin((tick + i) * 0.65)) * 105;
    });
  }, [active, tick]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🎙️ Voice Visualizer</Text>
      <Text style={styles.cardText}>
        expo-av + FFT/RMS yaklaşımı temel alınarak ses dalga formu simüle edildi.
        Konuşma aktifken barlar canlanır, sessizlikte söner.
      </Text>

      <View style={styles.waveBox}>
        {bars.map((height, index) => (
          <View key={index} style={[styles.bar, { height }]} />
        ))}
      </View>
    </View>
  );
}

function AvatarScene() {
  const [speaking, setSpeaking] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🪞 Avatar Sahnesi</Text>
      <Text style={styles.cardText}>
        Avaturn üzerinden export edilen avatar.glb dosyası React Three Fiber ile
        sahneye mount edildi. Konuşma sırasında basit lipsync/viseme hareketi
        simüle edilir.
      </Text>

      <View style={styles.canvasBox}>
        <Canvas camera={{ position: [0, 0.8, 5.2], fov: 32 }}>
          <ambientLight intensity={1.4} />
          <directionalLight position={[2, 3, 4]} intensity={1.6} />
          <Suspense fallback={null}>
            <AvatarModel speaking={speaking} />
          </Suspense>
        </Canvas>
      </View>

      <TouchableOpacity
        style={[styles.button, speaking ? styles.dangerButton : styles.primaryButton]}
        onPress={() => setSpeaking(!speaking)}
      >
        <Text style={styles.buttonText}>
          {speaking ? "Avatarı Sustur" : "Lipsync Test"}
        </Text>
      </TouchableOpacity>

      <VoiceVisualizer active={speaking} />
    </View>
  );
}

function ExpertBridge() {
  const openExpertCall = () => {
    Linking.openURL("https://meet.jit.si/nokta-231118070-expert-bridge").catch(() => {
      Alert.alert("Bağlantı açılamadı", "Jitsi linki açılamadı.");
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📞 Expert Bridge</Text>
      <Text style={styles.cardText}>
        Forge döngüsü iki kez FAIL/ROLLBACK olduğunda uzman bağlantısı açılır.
        Bu demo Jitsi üzerinden ses, video ve ekran paylaşımı köprüsünü gösterir.
      </Text>

      <TouchableOpacity style={[styles.button, styles.bridgeButton]} onPress={openExpertCall}>
        <Text style={styles.buttonText}>Uzmana Bağlan</Text>
      </TouchableOpacity>
    </View>
  );
}

function ForgeStatus() {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🛠️ Forge Döngüsü</Text>
      <Text style={styles.cardText}>
        Audit raporları coding agent'a input verilir. Döngü READ → LOCATE →
        HYPOTHESIZE → REPAIR → TEST → VERIFY → COMMIT/ROLLBACK şeklinde işler.
      </Text>

      <View style={styles.statusRow}>
        <Text style={styles.statusSuccess}>SUCCESS × 2</Text>
        <Text style={styles.statusRollback}>ROLLBACK × 1</Text>
        <Text style={styles.statusStuck}>STUCK × 1</Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NOKTA Final Bridge</Text>
        <Text style={styles.subtitle}>
          Sesin görselleşir, Avaturn avatarın React Three Fiber ile sahnede
          konuşur, forge stuck olunca uzman gelir.
        </Text>

        <AvatarScene />
        <ForgeStatus />
        <ExpertBridge />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 44 },
  title: { fontSize: 30, fontWeight: "900", color: "#0f172a", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#475569", lineHeight: 22, marginBottom: 18 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: { fontSize: 21, fontWeight: "900", color: "#0f172a", marginBottom: 8 },
  cardText: { fontSize: 14, color: "#475569", lineHeight: 21, marginBottom: 14 },
  canvasBox: {
    height: 310,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111827",
    marginBottom: 14,
  },
  waveBox: {
    height: 125,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 12,
  },
  bar: {
    width: 8,
    borderRadius: 999,
    backgroundColor: "#38bdf8",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: { backgroundColor: "#2563eb" },
  dangerButton: { backgroundColor: "#dc2626" },
  bridgeButton: { backgroundColor: "#16a34a" },
  buttonText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusSuccess: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: 9,
    borderRadius: 12,
    fontWeight: "900",
  },
  statusRollback: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: 9,
    borderRadius: 12,
    fontWeight: "900",
  },
  statusStuck: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: 9,
    borderRadius: 12,
    fontWeight: "900",
  },
});