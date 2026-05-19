import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { COLORS } from "../theme";
import { enhanceIdea, refineSpecWithExpertFeedback } from "../services/gemini";

export default function SpecScreen({ route, navigation }) {
  const { spec } = route.params;
  const [currentSpec, setCurrentSpec] = useState(spec);
  const [enhancements, setEnhancements] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Expert Mode States
  const [expertMode, setExpertMode] = useState(false);
  const [expertFeedback, setExpertFeedback] = useState("");
  const [refining, setRefining] = useState(false);

  const handleExpertRefine = async () => {
    if (!expertFeedback.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setRefining(true);
    try {
      const updatedSpec = await refineSpecWithExpertFeedback(currentSpec, expertFeedback);
      setCurrentSpec({ ...updatedSpec, isExpertReviewed: true });
      setExpertMode(false);
      setExpertFeedback("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setRefining(false);
  };

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
          <Text style={styles.title}>{currentSpec.title}</Text>
          {currentSpec.isExpertReviewed && (
            <View style={styles.expertBadge}><Text style={styles.expertBadgeText}>✓ Uzman Onaylı</Text></View>
          )}
        </View>
        <Text style={styles.tagline}>{currentSpec.tagline}</Text>

        {/* Detailed Scores */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreBadge}><Text style={styles.scoreLabel}>Clarity</Text><Text style={styles.scoreVal}>{currentSpec.scores?.clarity || 0}/10</Text></View>
          <View style={styles.scoreBadge}><Text style={styles.scoreLabel}>Feasibility</Text><Text style={styles.scoreVal}>{currentSpec.scores?.feasibility || 0}/10</Text></View>
          <View style={styles.scoreBadge}><Text style={styles.scoreLabel}>Impact</Text><Text style={styles.scoreVal}>{currentSpec.scores?.impact || 0}/10</Text></View>
        </View>

        {/* Ambiguity Detector */}
        {currentSpec.ambiguities && currentSpec.ambiguities.length > 0 && (
          <View style={styles.ambiguityBox}>
            <Text style={styles.sectionTitle}>⚡ Ambiguity Detector</Text>
            {currentSpec.ambiguities.map((amb, i) => (
              <Text key={i} style={styles.ambiguityText}>⚠️ {amb}</Text>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.justification}>"{currentSpec.slop_justification}"</Text>
          
          <Text style={styles.label}>🎯 Problem</Text>
          <Text style={styles.val}>{currentSpec.problem}</Text>
          
          <Text style={styles.label}>👤 Kullanıcı</Text>
          <Text style={styles.val}>{currentSpec.user}</Text>
          
          <Text style={styles.label}>🗺️ Kapsam</Text>
          <Text style={styles.val}>{currentSpec.scope}</Text>

          <Text style={styles.label}>⚙️ Kısıtlar</Text>
          <Text style={styles.val}>{currentSpec.constraints}</Text>

          <Text style={styles.label}>📊 Başarı Metriği</Text>
          <Text style={styles.val}>{currentSpec.success}</Text>
        </View>

        {/* Risk Analizi ve Çözümler */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔴 Risk Analizi</Text>
          {currentSpec.risks?.map((r, i) => <Text key={i} style={styles.riskText}>- {r}</Text>)}
          
          <Text style={[styles.sectionTitle, {marginTop: 20}]}>💡 Çözüm Önerileri (AI)</Text>
          {currentSpec.solutions?.map((s, i) => <Text key={i} style={styles.solutionText}>👉 {s}</Text>)}
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
          <TouchableOpacity style={styles.enhanceBtn} onPress={handleEnhance} disabled={loading || refining}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.enhanceBtnT}>Fikri Geliştir ✨</Text>}
          </TouchableOpacity>
        ) : null}

        {/* HUMAN-IN-THE-LOOP SECTION */}
        <View style={[styles.card, { borderColor: COLORS.mint, marginTop: 10 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>👨‍🏫 Uzman Görüşü (Human-in-the-Loop)</Text>
          </View>
          
          {!expertMode ? (
            <TouchableOpacity 
              style={styles.expertBtn} 
              onPress={() => {
                Haptics.selectionAsync();
                setExpertMode(true);
              }}
            >
              <Text style={styles.expertBtnT}>Eleştiri veya Yönlendirme Ekle</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <TextInput
                style={styles.expertInput}
                placeholder="Örn: Bütçe kısıtlarını çok abartmışsın, hedef kitleye lise öğrencilerini de dahil et..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                numberOfLines={4}
                value={expertFeedback}
                onChangeText={setExpertFeedback}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.expertSubmitBtn, { flex: 1, backgroundColor: refining ? "#555" : COLORS.pink }]} 
                  onPress={handleExpertRefine} 
                  disabled={refining}
                >
                  {refining ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "bold" }}>AI'a Gönder ve Güncelle</Text>}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.expertSubmitBtn, { backgroundColor: "rgba(255,255,255,0.1)" }]} 
                  onPress={() => setExpertMode(false)}
                  disabled={refining}
                >
                  <Text style={{ color: "#fff" }}>İptal</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

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

  expertBtn: { backgroundColor: "rgba(0, 255, 170, 0.15)", padding: 15, borderRadius: 15, alignItems: "center", borderWidth: 1, borderColor: "rgba(0, 255, 170, 0.3)" },
  expertBtnT: { color: COLORS.mint, fontWeight: "bold", fontSize: 14 },
  expertInput: { backgroundColor: "rgba(0,0,0,0.4)", color: "#fff", borderRadius: 15, padding: 15, fontSize: 15, minHeight: 100, textAlignVertical: "top", marginBottom: 15, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  expertSubmitBtn: { padding: 15, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  expertBadge: { backgroundColor: COLORS.mint, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 5, alignSelf: "flex-start" },
  expertBadgeText: { color: "#0A0A18", fontSize: 10, fontWeight: "900", textTransform: "uppercase" },

  btn: { backgroundColor: COLORS.mint, padding: 18, borderRadius: 30, alignItems: "center", shadowColor: COLORS.mint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, marginTop: 10 },
  btnT: { fontWeight: "800", color: "#0A0A18", fontSize: 16 }
});
