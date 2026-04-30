import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { COLORS } from "../theme";
import { enhanceIdea } from "../services/gemini";

export default function SpecScreen({ route, navigation }) {
  const { spec } = route.params;
  const [enhancements, setEnhancements] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const data = await enhanceIdea(spec);
      setEnhancements(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={[COLORS.bg, "#1A0830"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{spec.title}</Text>
        </View>
        <Text style={styles.tagline}>{spec.tagline}</Text>

        {/* Detailed Scores */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBadge}><Text style={styles.scoreLabel}>Clarity</Text><Text style={styles.scoreVal}>{spec.scores?.clarity || 0}/10</Text></View>
          <View style={styles.scoreBadge}><Text style={styles.scoreLabel}>Feasibility</Text><Text style={styles.scoreVal}>{spec.scores?.feasibility || 0}/10</Text></View>
          <View style={styles.scoreBadge}><Text style={styles.scoreLabel}>Impact</Text><Text style={styles.scoreVal}>{spec.scores?.impact || 0}/10</Text></View>
        </View>

        {/* Ambiguity Detector */}
        {spec.ambiguities && spec.ambiguities.length > 0 && (
          <View style={styles.ambiguityBox}>
            <Text style={styles.sectionTitle}>⚡ Ambiguity Detector</Text>
            {spec.ambiguities.map((amb, i) => (
              <Text key={i} style={styles.ambiguityText}>⚠️ {amb}</Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.justification}>"{spec.slop_justification}"</Text>
          
          <Text style={styles.label}>🎯 Problem</Text>
          <Text style={styles.val}>{spec.problem}</Text>
          
          <Text style={styles.label}>👤 Kullanıcı</Text>
          <Text style={styles.val}>{spec.user}</Text>
          
          <Text style={styles.label}>🗺️ Kapsam</Text>
          <Text style={styles.val}>{spec.scope}</Text>

          <Text style={styles.label}>⚙️ Kısıtlar</Text>
          <Text style={styles.val}>{spec.constraints}</Text>

          <Text style={styles.label}>📊 Başarı Metriği</Text>
          <Text style={styles.val}>{spec.success}</Text>
        </View>

        {/* Risk Analizi ve Çözümler */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔴 Risk Analizi</Text>
          {spec.risks?.map((r, i) => <Text key={i} style={styles.riskText}>- {r}</Text>)}
          
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>💡 Çözüm Önerileri (AI)</Text>
          {spec.solutions?.map((s, i) => <Text key={i} style={styles.solutionText}>👉 {s}</Text>)}
        </View>

        {/* Fikri Geliştir Section */}
        {enhancements && (
          <View style={[styles.card, { borderColor: COLORS.pink }]}>
            <Text style={styles.sectionTitle}>✨ Yeni Ufuklar (AI Önerisi)</Text>
            {enhancements.newFeatures?.map((nf, i) => <Text key={i} style={styles.solutionText}>+ {nf}</Text>)}
            <Text style={[styles.label, {marginTop: 15}]}>Alternatif Yaklaşım</Text>
            <Text style={styles.val}>{enhancements.alternativeApproach}</Text>
          </View>
        )}

        {!enhancements ? (
          <TouchableOpacity style={styles.enhanceBtn} onPress={handleEnhance} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.enhanceBtnT}>Fikri Geliştir ✨</Text>}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity 
          style={styles.btn} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("Home");
          }}
        >
          <Text style={styles.btnT}>Yeni Nokta Yakala +</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, paddingBottom: 60 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "900", color: "#fff", flex: 1 },
  tagline: { fontSize: 16, color: COLORS.mint, fontStyle: "italic", marginBottom: 20 },
  
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  scoreBadge: { backgroundColor: "rgba(255,181,217,0.1)", padding: 10, borderRadius: 12, alignItems: "center", flex: 1, marginHorizontal: 4, borderWidth: 1, borderColor: "rgba(255,181,217,0.3)" },
  scoreLabel: { color: COLORS.pink, fontSize: 10, fontWeight: "bold", textTransform: "uppercase", marginBottom: 5 },
  scoreVal: { color: "#fff", fontSize: 18, fontWeight: "900" },

  ambiguityBox: { backgroundColor: "rgba(255,80,80,0.1)", padding: 15, borderRadius: 15, marginBottom: 30, borderWidth: 1, borderColor: "rgba(255,80,80,0.3)" },
  ambiguityText: { color: "#ffb3b3", fontSize: 14, marginBottom: 5, fontWeight: "600" },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold", marginBottom: 10 },

  card: { backgroundColor: "rgba(255,255,255,0.05)", padding: 24, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", marginBottom: 20 },
  justification: { color: "#aaa", fontStyle: "italic", marginBottom: 20, backgroundColor: "rgba(0,0,0,0.3)", padding: 15, borderRadius: 10 },
  label: { fontSize: 12, color: COLORS.mint, fontWeight: "700", marginTop: 20, textTransform: "uppercase", letterSpacing: 1 },
  val: { fontSize: 16, color: "#eee", marginTop: 8, lineHeight: 24 },
  
  riskText: { color: "#ffcccc", fontSize: 15, marginBottom: 8, lineHeight: 22 },
  solutionText: { color: "#ccffcc", fontSize: 15, marginBottom: 8, lineHeight: 22 },

  enhanceBtn: { backgroundColor: "rgba(255,255,255,0.1)", padding: 18, borderRadius: 30, alignItems: "center", marginBottom: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  enhanceBtnT: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  btn: { backgroundColor: COLORS.mint, padding: 18, borderRadius: 30, alignItems: "center", shadowColor: COLORS.mint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  btnT: { fontWeight: "800", color: "#0A0A18", fontSize: 16 }
});
