import { StatusBar } from "expo-status-bar";
import { Fragment, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuditWidget } from "@xtatistix/mobile-audit";
import { buildAuditDeps } from "./auditDeps";

type Screen = "idea" | "questions" | "spec" | "mentor";

const SCREEN_LABELS: Record<Screen, string> = {
  idea: "HamFikir",
  questions: "MuhendislikSorulari",
  spec: "TekSayfaOzet",
  mentor: "UzmanInceleme",
};

type Suggestion = {
  label: string;
  value: string;
};

const problemSuggestions: Suggestion[] = [
  {
    label: "Dağınık kanallar",
    value:
      "Yoklama ve ödev süreçleri WhatsApp, e-posta ve Excel gibi parçalı kanallarda yürütüldüğü için veri kaybı, gecikme ve tekrarlayan manuel iş yükü oluşuyor.",
  },
  {
    label: "Yoklama hızı",
    value:
      "Ders başında yoklama alma süresi uzuyor; hatalı kayıt ve sahte katılım riskleri kontrol altına alınamıyor.",
  },
  {
    label: "Teslim takibi",
    value:
      "Ödev teslimleri tek bir kanalda toplanmadığı için geç/eksik teslimler ve geri bildirim döngüsü yavaşlıyor.",
  },
  {
    label: "Raporlama eksikliği",
    value:
      "Ders bazlı katılım ve teslim performansını gösteren temel raporlama olmadığı için erken müdahale zorlaşıyor.",
  },
];

const userSuggestions: Suggestion[] = [
  {
    label: "Öğretim üyesi",
    value:
      "Birincil kullanıcı kitlesi, üniversite düzeyinde ders yürüten öğretim üyeleridir (ders sahibi ve operasyonel yönetici).",
  },
  {
    label: "Öğrenci",
    value:
      "Birincil kullanıcı kitlesi, derse kayıtlı üniversite öğrencileridir (katılım ve teslim tarafı).",
  },
  {
    label: "İkisi (MVP)",
    value:
      "MVP kapsamında iki taraf da bulunur: ders yürüten öğretim üyesi ve derse kayıtlı öğrenci.",
  },
  {
    label: "Bölüm sekreterliği",
    value:
      "İkincil kullanıcı olarak bölüm sekreterliği; ders listeleri ve istisnai durumların koordinasyonunu üstlenir (MVP’de opsiyonel).",
  },
];

const mvpSuggestions: Suggestion[] = [
  {
    label: "Çekirdek MVP",
    value:
      "- Ders oluşturma\n- Öğrenci listesi (manuel ekleme)\n- Yoklama oturumu (kod/QR)\n- Ödev oluşturma ve teslim alma\n- Teslimleri listeleme",
  },
  {
    label: "Sadece yoklama",
    value: "- Ders oluşturma\n- Öğrenci listesi\n- Yoklama oturumu\n- Yoklama kayıtları listesi",
  },
  {
    label: "Sadece ödev",
    value: "- Ders bağlamında ödev oluşturma\n- Teslim alma\n- Teslim durumu (bekliyor / teslim edildi)",
  },
  {
    label: "Demo modu",
    value:
      "- Tek demo kullanıcı akışı\n- Örnek ders ve örnek öğrenciler\n- Uçtan uca görünür bir deneyim",
  },
];

const constraintSuggestions: Suggestion[] = [
  {
    label: "Kısa süre",
    value:
      "Zaman kısıtı: kısa teslim döngüsü içinde çalışır bir MVP hedeflenir; kapsam bilinçli olarak dar tutulur.",
  },
  {
    label: "Harici API yok",
    value:
      "Teknik kısıt: harici AI/LLM API entegrasyonu yoktur; dış servislere bağımlılık minimize edilir.",
  },
  {
    label: "Android odak",
    value:
      "Platform kısıtı: teslim Android APK odaklıdır; iOS sürümü MVP kapsamında garanti edilmez.",
  },
  {
    label: "Pilot ölçek",
    value:
      "Ölçek kısıtı: tek kampüs / tek ders pilotu varsayılır; yüksek eşzamanlılık ve kurumsal SSO MVP dışındadır.",
  },
];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");

const letterRatio = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const letters = trimmed.replace(/[^a-zA-ZğüşöçıİĞÜŞÖÇ]/g, "").length;
  return letters / trimmed.length;
};

const shouldPolish = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.length < 55) return true;
  if (letterRatio(trimmed) < 0.55) return true;
  return false;
};

const polishProblem = (raw: string, idea: string) => {
  const t = normalizeText(raw);
  const i = normalizeText(idea);

  if (t.includes("yoklama") && t.includes("odev")) {
    return `${raw.trim()}\n\nNot: Problem ifadesi; yoklama ve ödev süreçlerinin aynı ders bağlamında birlikte yönetilmesi ihtiyacını işaret eder.`;
  }

  if (t.includes("yoklama")) {
    return `${raw.trim()}\n\nNot: Problem ifadesi; ders bazlı katılımın hızlı ve tutarlı biçimde kayda alınması ihtiyacına odaklanır.`;
  }

  if (t.includes("odev")) {
    return `${raw.trim()}\n\nNot: Problem ifadesi; teslimlerin tek kanalda toplanması ve durumlarının izlenmesi ihtiyacına odaklanır.`;
  }

  if (i.includes("universite") && (i.includes("yoklama") || i.includes("odev"))) {
    return `${raw.trim()}\n\nNot: Ham fikir üniversite bağlamında olduğu için problem ifadesi kampüste yürütülen operasyonel süreçlerle ilişkilendirilir.`;
  }

  return `${raw.trim()}\n\nNot: Problem ifadesi kısa tutulmuştur; MVP kapsamında ayrıntılar kullanıcı akışlarıyla somutlaştırılacaktır.`;
};

const polishUser = (raw: string) => {
  const t = normalizeText(raw);
  if (t.includes("hoca") || t.includes("ogretim")) {
    return `${raw.trim()}\n\nRol: Ders yürüten taraf (içerik, yoklama oturumu, ödev tanımı).`;
  }
  if (t.includes("ogrenci")) {
    return `${raw.trim()}\n\nRol: Katılım ve teslim tarafı (yoklamaya katılma, ödev teslimi).`;
  }
  return `${raw.trim()}\n\nRol: Belirtilen kullanıcı kitlesi, MVP akışlarının merkezinde konumlandırılır.`;
};

const polishMvp = (raw: string) => {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length >= 3) {
    return lines.map((l) => `- ${l}`).join("\n");
  }

  return `- ${raw.trim()}\n- Temel listeleme ve durum görünürlüğü\n- Pilot kullanım için sade veri modeli`;
};

const polishConstraints = (raw: string) => {
  return `${raw.trim()}\n\nRisk notu: Kapsam genişlerse teslim tarihi ve test kapsamı risk altına girer; MVP bilinçli biçimde dar tutulur.`;
};

type HumanReviewState =
  | { status: "NONE" }
  | { status: "REQUESTED"; contact: string; note: string; requestedAtIso: string }
  | { status: "SKIPPED" };

const buildSpec = (params: {
  ideaText: string;
  problem: string;
  targetUser: string;
  mvpScope: string;
  constraints: string;
  humanReview: HumanReviewState;
}) => {
  const problemOut = shouldPolish(params.problem)
    ? polishProblem(params.problem, params.ideaText)
    : params.problem.trim();

  const userOut = shouldPolish(params.targetUser) ? polishUser(params.targetUser) : params.targetUser.trim();

  const mvpOut = shouldPolish(params.mvpScope) ? polishMvp(params.mvpScope) : params.mvpScope.trim();

  const constraintsOut = shouldPolish(params.constraints)
    ? polishConstraints(params.constraints)
    : params.constraints.trim();

  const humanReviewBlock =
    params.humanReview.status === "REQUESTED"
      ? `

İnsan Uzman İncelemesi (HITL - talep)
Durum: REQUESTED
İletişim: ${params.humanReview.contact.trim()}
Not: ${params.humanReview.note.trim()}
Talep zamanı (ISO): ${params.humanReview.requestedAtIso}
Açıklama: Bu MVP'de gerçek zamanlı görüşme yoktur; talep kaydı spec içine işlenir ve mentor iletişim bilgisi üzerinden döner.
`
      : params.humanReview.status === "SKIPPED"
        ? `

İnsan Uzman İncelemesi (HITL)
Durum: SKIPPED
Açıklama: Kullanıcı bu teslimde uzman incelemesi talep etmedi.
`
        : "";

  return `## One-Page Spec

Bağlam / Tohum Fikir
${params.ideaText.trim()}

Problem İfadesi
${problemOut}

Hedef Kullanıcı
${userOut}

MVP Kapsamı
${mvpOut}

Kısıtlar
${constraintsOut}

Başarı Ölçütleri
- İlk haftada en az 20 aktif pilot kullanıcı
- İlk denemede görev tamamlama oranı %70+

Varsayımlar
- Pilot kullanımda veri hacmi düşük-orta seviyededir
- Kullanıcılar temel akışı öğrenmek için kısa bir onboarding ile yetinir

MVP Dışı Kapsam
- Kurumsal SSO ve okul ERP entegrasyonu
- Gelişmiş dolandırıcılık tespiti ve cihaz parmak izi gibi güvenlik ürünleri
${humanReviewBlock}`;
};

function SuggestionChips({
  title,
  suggestions,
  onPick,
}: {
  title: string;
  suggestions: Suggestion[];
  onPick: (value: string) => void;
}) {
  return (
    <View style={styles.chipsBlock}>
      <Text style={styles.chipsTitle}>{title}</Text>
      <View style={styles.chipRow}>
        {suggestions.map((s) => (
          <TouchableOpacity key={s.label} style={styles.chip} onPress={() => onPick(s.value)} activeOpacity={0.85}>
            <Text style={styles.chipText}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("idea");
  const [ideaText, setIdeaText] = useState("");
  const [problem, setProblem] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [mvpScope, setMvpScope] = useState("");
  const [constraints, setConstraints] = useState("");
  const [mentorContact, setMentorContact] = useState("");
  const [mentorNote, setMentorNote] = useState("");
  const [humanReview, setHumanReview] = useState<HumanReviewState>({ status: "NONE" });

  const statusBarOffset = Platform.OS === "android" ? RNStatusBar.currentHeight ?? 0 : 0;
  const heroTopPadding = 10 + statusBarOffset;
  const keyboardVerticalOffset = Platform.OS === "ios" ? 8 : 0;

  const generatedSpec = buildSpec({
    ideaText,
    problem,
    targetUser,
    mvpScope,
    constraints,
    humanReview,
  });

  const auditDeps = useMemo(() => buildAuditDeps(SCREEN_LABELS[screen]), [screen]);

  const handleBack = () => {
    if (screen === "questions") {
      setScreen("idea");
      return;
    }
    if (screen === "spec") {
      setScreen("questions");
      return;
    }
    if (screen === "mentor") {
      setScreen("spec");
    }
  };

  const handleToQuestions = () => {
    if (!ideaText.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen önce ham fikrini yaz.");
      return;
    }
    setScreen("questions");
  };

  const handleToSpec = () => {
    if (
      !problem.trim() ||
      !targetUser.trim() ||
      !mvpScope.trim() ||
      !constraints.trim()
    ) {
      Alert.alert("Eksik bilgi", "Lütfen tüm mühendislik sorularını yanıtla.");
      return;
    }
    setScreen("spec");
  };

  const handleSubmitMentorRequest = () => {
    if (!mentorContact.trim() || !mentorNote.trim()) {
      Alert.alert("Eksik bilgi", "Lütfen iletişim bilgisi ve kısa notu doldur.");
      return;
    }
    setHumanReview({
      status: "REQUESTED",
      contact: mentorContact.trim(),
      note: mentorNote.trim(),
      requestedAtIso: new Date().toISOString(),
    });
    Alert.alert("Talep oluşturuldu", "Özet metnine insan uzman incelemesi bölümü eklendi.");
    setScreen("spec");
  };

  const handleSkipMentor = () => {
    setHumanReview({ status: "SKIPPED" });
    setScreen("spec");
  };

  return (
    <Fragment>
    <SafeAreaView style={styles.container}>
      <View style={[styles.hero, { paddingTop: heroTopPadding }]}>
        <View style={styles.heroTopRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>NOKTA</Text>
          </View>
          {screen !== "idea" ? (
            <TouchableOpacity style={styles.backPill} onPress={handleBack} activeOpacity={0.85}>
              <Text style={styles.backPillText}>Geri</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backPillPlaceholder} />
          )}
        </View>

        <Text style={styles.title}>Dot Capture</Text>
        <Text style={styles.subtitle}>
          Track A: ham fikir → spec → audit widget ile müşteri yakalama → forge döngüsü.
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          contentContainerStyle={[styles.content, styles.contentWithFabPad]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {screen === "idea" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1) Ham fikir</Text>
            <Text style={styles.helperText}>
              Kısa ve net yazman yeterli; sonraki adımda önerilerle profesyonel bir dile yaklaştıracağız.
            </Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={7}
              placeholder="Örnek: Üniversite öğrencileri için yoklama ve ödev takibi yapan mobil uygulama..."
              value={ideaText}
              onChangeText={setIdeaText}
              textAlignVertical="top"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />
            <TouchableOpacity style={styles.button} onPress={handleToQuestions} activeOpacity={0.9}>
              <Text style={styles.buttonText}>Sorulara geç</Text>
            </TouchableOpacity>
          </View>
        )}

        {screen === "questions" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2) Mühendislik soruları</Text>
            <Text style={styles.helperText}>
              Öneri chip’lerine dokunarak alanı otomatik doldur; ardından kendi cümlelerinle kısaca düzenle.
            </Text>

            <Text style={styles.label}>Problem nedir?</Text>
            <SuggestionChips title="Öneriler" suggestions={problemSuggestions} onPick={setProblem} />
            <TextInput
              style={styles.inputSmall}
              multiline
              value={problem}
              onChangeText={setProblem}
              textAlignVertical="top"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <Text style={styles.label}>Hedef kullanıcı kim?</Text>
            <SuggestionChips title="Öneriler" suggestions={userSuggestions} onPick={setTargetUser} />
            <TextInput
              style={styles.inputSmall}
              multiline
              value={targetUser}
              onChangeText={setTargetUser}
              textAlignVertical="top"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <Text style={styles.label}>MVP kapsamı (neler var?)</Text>
            <SuggestionChips title="Öneriler" suggestions={mvpSuggestions} onPick={setMvpScope} />
            <TextInput
              style={styles.inputSmall}
              multiline
              value={mvpScope}
              onChangeText={setMvpScope}
              textAlignVertical="top"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <Text style={styles.label}>Kısıtlar (zaman / teknik / bütçe)</Text>
            <SuggestionChips title="Öneriler" suggestions={constraintSuggestions} onPick={setConstraints} />
            <TextInput
              style={styles.inputSmall}
              multiline
              value={constraints}
              onChangeText={setConstraints}
              textAlignVertical="top"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen("idea")} activeOpacity={0.9}>
                <Text style={styles.secondaryButtonText}>Geri</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonFlex} onPress={handleToSpec} activeOpacity={0.9}>
                <Text style={styles.buttonText}>Özeti oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {screen === "spec" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3) Tek sayfa özet</Text>
            <View style={styles.specBox}>
              <Text style={styles.specText}>{generatedSpec}</Text>
            </View>
            {humanReview.status === "NONE" ? (
              <TouchableOpacity style={styles.button} onPress={() => setScreen("mentor")} activeOpacity={0.9}>
                <Text style={styles.buttonText}>Uzman incelemesi (isteğe bağlı)</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 8 }}>
                <Text style={styles.helperText}>
                  İnsan uzman talebi bu oturum için işlendi. Özeti güncellemek için sıfırlayıp yeniden ekleyebilirsin.
                </Text>
                <TouchableOpacity
                  style={styles.ghostButton}
                  onPress={() => {
                    setHumanReview({ status: "NONE" });
                    setMentorContact("");
                    setMentorNote("");
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={styles.ghostButtonText}>Uzman bölümünü sıfırla</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={[styles.footerActions, styles.specFooterActions]}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen("questions")} activeOpacity={0.9}>
                <Text style={styles.secondaryButtonText}>Geri</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButtonFlex}
                onPress={() => {
                  setIdeaText("");
                  setProblem("");
                  setTargetUser("");
                  setMvpScope("");
                  setConstraints("");
                  setMentorContact("");
                  setMentorNote("");
                  setHumanReview({ status: "NONE" });
                  setScreen("idea");
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.specPrimaryButtonText}>Yeni fikir</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.specScrollSpacer} />
          </View>
        )}

        {screen === "mentor" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4) Uzman incelemesi (HITL)</Text>
            <Text style={styles.helperText}>
              Bu adım gerçek bir video görüşme içermez. İletişim bilgini bırak; özet metnine talep kaydı eklenir.
            </Text>

            <Text style={styles.label}>İletişim (e-posta veya telefon)</Text>
            <TextInput
              style={styles.inputSmall}
              value={mentorContact}
              onChangeText={setMentorContact}
              placeholder="ornek@edu.tr veya +90..."
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <Text style={styles.label}>Mentora not (max 2-3 cümle)</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={5}
              value={mentorNote}
              onChangeText={setMentorNote}
              placeholder="Hangi riskler, hangi varsayımlar, hangi kararlar net değil?"
              textAlignVertical="top"
              autoCorrect={false}
              spellCheck={false}
              autoComplete="off"
              textContentType="none"
              importantForAutofill="no"
            />

            <View style={styles.footerActions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setScreen("spec")} activeOpacity={0.9}>
                <Text style={styles.secondaryButtonText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButtonFlex} onPress={handleSubmitMentorRequest} activeOpacity={0.9}>
                <Text style={styles.buttonText}>Talebi kaydet</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.ghostButton} onPress={handleSkipMentor} activeOpacity={0.9}>
              <Text style={styles.ghostButtonText}>Uzman istemiyorum</Text>
            </TouchableOpacity>
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </SafeAreaView>
    <AuditWidget
      appName="Nokta Audit-Forge"
      deps={auditDeps}
      initialPosition={{ bottom: 110, right: 16 }}
    />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070b12",
  },
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#070b12",
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#60a5fa",
  },
  brandText: {
    color: "rgba(255,255,255,0.92)",
    letterSpacing: 3,
    fontSize: 12,
    fontWeight: "800",
  },
  backPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backPillPlaceholder: {
    width: 74,
    height: 34,
  },
  backPillText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
    backgroundColor: "#0b1220",
    flexGrow: 1,
  },
  contentWithFabPad: {
    paddingBottom: 96,
  },
  keyboardAvoider: {
    flex: 1,
  },
  section: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 14 },
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "rgba(255,255,255,0.95)",
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.72)",
    lineHeight: 20,
    marginTop: 6,
  },
  input: {
    minHeight: 150,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 12,
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
  },
  inputSmall: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.86)",
  },
  specBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(0,0,0,0.22)",
    padding: 12,
  },
  specText: {
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.90)",
  },
  helperText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.62)",
    lineHeight: 18,
  },
  chipsBlock: {
    gap: 6,
  },
  chipsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(255,255,255,0.92)",
  },
  button: {
    marginTop: 6,
    backgroundColor: "#3b82f6",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  footerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
    alignItems: "stretch",
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    fontWeight: "800",
  },
  primaryButtonFlex: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  ghostButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "transparent",
  },
  ghostButtonText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "700",
  },
  specFooterActions: {
    marginTop: 10,
  },
  specScrollSpacer: {
    height: 20,
  },
  specPrimaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
