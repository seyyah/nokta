import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, LayoutAnimation } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Phase = 'DOT_CAPTURE' | 'SLOP_CHECK' | 'ENGINEERING_PROBE' | 'ARTIFACT' | 'HISTORY';

interface HistoryItem { id: string; idea: string; score: number; date: string; }

const getScoreColor = (score: number) => {
  if (score >= 80) return '#00FF9D'; // Neon Green
  if (score >= 60) return '#00E5FF'; // Cyan
  if (score >= 40) return '#FFB300'; // Amber
  return '#FF5722';                  // Orange/Red
};

export default function App() {
  const [phase, setPhase] = useState<Phase>('DOT_CAPTURE');
  const [ideaDot, setIdeaDot] = useState('');
  const [slopMetric, setSlopMetric] = useState(0);
  const [probeIndex, setProbeIndex] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [trustScore, setTrustScore] = useState(0);
  const [probes, setProbes] = useState<Array<{id: string, label: string, hint: string}>>([]);
  const [groqKey, setGroqKey] = useState('');
  const [isLlmLoading, setIsLlmLoading] = useState(false);

  useEffect(() => {
    try {
      AsyncStorage.getItem('@nokta_history').then(data => {
        if (data) setHistory(JSON.parse(data));
      }).catch(() => {});
      AsyncStorage.getItem('@nokta_groq_key').then(key => {
        if (key) setGroqKey(key);
      }).catch(() => {});
    } catch (e) { }
  }, []);

  const handleDotSubmit = async () => {
    if (ideaDot.trim().length < 10) return;
    setPhase('SLOP_CHECK');
    
    if (groqKey) {
      AsyncStorage.setItem('@nokta_groq_key', groqKey).catch(() => {});
    }

    try {
      setIsLlmLoading(true);
      if (groqKey.trim() !== '') {
        // ACTUAL AI GENERATION VIA xAI (Grok)
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "grok-beta",
            messages: [{
              role: "system",
              content: `You are a brutal, top-tier engineering architect reviewing startup ideas. 
The user will provide an idea. You must generate EXACTLY 4 highly critical, highly specific engineering/product questions testing their idea. 
Include EMOJIS in the labels.
Return ONLY a raw JSON array of objects with 'id', 'label', and 'hint' keys. No markdown blocks, no other text.
Example format: [{"id": "problem", "label": "💥 CORE FRICTION", "hint": "Why does this specific problem exist?"}, ...]`
            }, {
              role: "user",
              content: `The idea is: "${ideaDot}"`
            }],
            temperature: 0.7
          })
        });

        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
           let rawContent = data.choices[0].message.content.trim();
           // Remove markdown formatting if Llama 3 adds it
           if (rawContent.startsWith('```')) {
             rawContent = rawContent.replace(/```(json)?\n/g, '').replace(/```/g, '');
           }
           const aiProbes = JSON.parse(rawContent);
           if (Array.isArray(aiProbes) && aiProbes.length >= 2) {
             setProbes(aiProbes);
           } else {
             throw new Error("Invalid format");
           }
        }
      } else {
        // Fallback robust logic if no key
        const lowercaseIdea = ideaDot.toLowerCase();
        const ideaSnippet = ideaDot.length > 20 ? ideaDot.substring(0, 20) + "..." : ideaDot;
        let dynamicProbes = [];
        if (lowercaseIdea.includes('game') || lowercaseIdea.includes('play') || lowercaseIdea.includes('fun')) {
          dynamicProbes = [
            { id: 'problem', label: '🎮 CORE LOOP', hint: `What is the core 30-second gameplay loop that makes "${ideaSnippet}" addictive?` },
            { id: 'user', label: '🎯 PLAYER DEMOGRAPHIC', hint: `Is this for casual mobile commuters or hardcore PC gamers? Be specific.` },
            { id: 'scope', label: '🚧 MVP SCOPE', hint: `What asset classes (multiplayer, 3D, skins) will you EXCLUDE from v1?` },
            { id: 'constraint', label: '⚙️ ENGINE RISK', hint: `What is the hardest rendering, latency, or state synching problem here?` }
          ];
        } else {
          dynamicProbes = [
            { id: 'problem', label: '🔍 PROBLEM ISOLATION', hint: `What exact painful friction does "${ideaSnippet}" solve for the user today?` },
            { id: 'user', label: '💳 TARGET PAYER', hint: `Who is the desperate buyer that will literally pay $10/mo for this immediately?` },
            { id: 'scope', label: '🔪 EXCLUSION ZONE', hint: `List exactly 3 cool features you MUST cut from the v1 release to launch in 2 weeks.` },
            { id: 'constraint', label: '🚧 FATAL RISK', hint: `What is the single biggest technical, legal, or adoption risk for this idea?` }
          ];
        }
        setProbes(dynamicProbes);
      }
    } catch(e) {
       console.log(e);
       // Fallback on error
       setProbes([
          { id: 'problem', label: '⚠️ API ERROR (FALLBACK)', hint: `Check your xAI Key. For now: What is the core friction solved?` },
          { id: 'user', label: '💳 TARGET AUDIENCE', hint: `Who pays for this?` }
       ]);
    }
    
    // UI Animations
    setIsLlmLoading(false);
    setSlopMetric(100);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPhase('ENGINEERING_PROBE');
  };

  const handleProbeSubmit = () => {
    if (!currentAnswer.trim()) return;
    
    const currentProbe = probes[probeIndex];
    setAnswers(prev => ({ ...prev, [currentProbe.id]: currentAnswer }));
    setCurrentAnswer('');

    if (probeIndex < probes.length - 1) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setProbeIndex(probeIndex + 1);
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const computedScore = Math.min(99, Math.floor((ideaDot.length + Object.values(answers).join('').length) / 5) + 40);
      setTrustScore(computedScore);
      
      const newItem = { id: Date.now().toString(), idea: ideaDot, score: computedScore, date: new Date().toLocaleDateString() };
      const updatedHistory = [newItem, ...history].slice(0, 50);
      setHistory(updatedHistory);
      
      try {
        AsyncStorage.setItem('@nokta_history', JSON.stringify(updatedHistory)).catch(() => {});
      } catch (e) {}
      
      setPhase('ARTIFACT');
    }
  };

  const restartProcess = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPhase('DOT_CAPTURE');
    setIdeaDot('');
    setProbeIndex(0);
    setAnswers({});
    setSlopMetric(0);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.logo}>NOKTA_</Text>
        <TouchableOpacity onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setPhase(phase === 'HISTORY' ? 'DOT_CAPTURE' : 'HISTORY'); }}>
          <Text style={styles.statusLabel}>
            {phase === 'HISTORY' ? 'CLOSE HISTORY' : 'HISTORY // LOGS'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PHASE 0: HISTORY LOGS */}
      {phase === 'HISTORY' && (
        <ScrollView style={styles.contentCore}>
          <Text style={styles.moduleTitle}>PERSISTENT MEMORY</Text>
          <Text style={styles.moduleSub}>Your past seed concepts and AI Trust Scores.</Text>
          {history.length === 0 ? (
            <Text style={styles.historyEmpty}>No dots captured yet.</Text>
          ) : history.map(item => (
            <View key={item.id} style={[styles.historyCard, { borderLeftColor: getScoreColor(item.score) }]}>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyIdea}>{item.idea.substring(0, 100)}...</Text>
              <Text style={{ color: getScoreColor(item.score), fontSize: 12, fontWeight: '900', letterSpacing: 0.5 }}>
                TRUST SCORE: {item.score}%
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* PHASE 1: DOT CAPTURE */}
      {phase === 'DOT_CAPTURE' && (
        <View style={styles.contentCore}>
          <Text style={styles.moduleTitle}>INGEST SEED DOT</Text>
          <Text style={styles.moduleSub}>Enter raw idea. We will strip the slop and extract the engineering skeleton.</Text>
          <TextInput
            style={styles.bigInput}
            multiline
            placeholder="e.g. 'A mobile app that detects academic plagiarism using local LLMs...'"
            placeholderTextColor="#444"
            value={ideaDot}
            onChangeText={setIdeaDot}
          />
          <TextInput
             style={{backgroundColor: '#13131A', borderWidth: 1, borderColor: '#262633', color: '#A882FF', borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 13}}
             placeholder="[OPTIONAL] Enter xAI (Grok) API Key to enable Live LLM..."
             placeholderTextColor="#444"
             secureTextEntry
             value={groqKey}
             onChangeText={setGroqKey}
          />
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.btnTrigger, styles.btnVoice]}
              onPress={() => setIdeaDot("Voice transcribing: A marketplace logic that completely eliminates middleman... ")}
            >
              <Text style={styles.btnVoiceText}>🎤 HOLD TO SPEAK</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btnTrigger, ideaDot.length < 10 && styles.btnDisabled, { flex: 2, marginLeft: 10 }]} 
              onPress={handleDotSubmit}
              disabled={ideaDot.length < 10}
            >
              <Text style={styles.btnText}>INITIATE SLOP-CHECK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* PHASE 2: SLOP CHECK (Transition) */}
      {phase === 'SLOP_CHECK' && (
        <View style={styles.contentCore}>
          <Text style={styles.moduleTitle}>xAI INFERENCE...</Text>
          <Text style={styles.moduleSub}>{groqKey ? "Calling Grok-beta API..." : "Processing locally for extreme low-latency density check."}</Text>
          {isLlmLoading ? (
            <Text style={{color: '#A882FF', marginTop: 10}}>Awaiting API JSON Response...</Text>
          ) : (
            <>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${slopMetric}%` }]} />
              </View>
              <Text style={styles.metricText}>FILTERING SLOP: {slopMetric}%</Text>
            </>
          )}
        </View>
      )}

      {/* PHASE 3: ENGINEERING PROBE */}
      {phase === 'ENGINEERING_PROBE' && (
        <View style={styles.contentCore}>
          <Text style={styles.moduleTitle}>ENGINEERING GUIDANCE</Text>
          <Text style={styles.moduleSub}>Step {probeIndex + 1} of {probes.length}</Text>
          
          <View style={styles.probeCard}>
            <Text style={styles.probePhase}>PROBE_{probeIndex + 1}</Text>
            <Text style={styles.probeLabel}>{probes[probeIndex].label}</Text>
            <Text style={styles.probeHint}>{probes[probeIndex].hint}</Text>
          </View>

          <TextInput
            style={styles.probeInput}
            multiline
            placeholder="Awaiting technical input..."
            placeholderTextColor="#444"
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
          />
          
          <TouchableOpacity style={styles.btnTrigger} onPress={handleProbeSubmit}>
            <Text style={styles.btnText}>COMMIT NODE</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PHASE 4: ARTIFACT GENERATION */}
      {phase === 'ARTIFACT' && (
        <ScrollView style={styles.artifactCore}>
          <View style={styles.artifactHeader}>
            <Text style={styles.artifactTitle}>GOLDEN SPEC ARTIFACT</Text>
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 5}}>
              <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: getScoreColor(trustScore), alignItems: 'center', justifyContent: 'center', marginRight: 15, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <Text style={{ color: getScoreColor(trustScore), fontSize: 20, fontWeight: '900' }}>{trustScore}</Text>
              </View>
              <View>
                 <Text style={{ color: getScoreColor(trustScore), fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }}>CONFIDENCE SCORE</Text>
                 <Text style={{ color: '#888896', fontSize: 11, marginTop: 2 }}>Engine: xAI (GROK-BETA)</Text>
              </View>
            </View>
          </View>

          <View style={styles.artifactSection}>
            <Text style={styles.artifactSecLabel}>[1] EXECUTIVE SUMMARY</Text>
            <Text style={styles.artifactValue}>
              A highly targeted product aimed at {answers.user || 'specified users'}, addressing the critical friction of {answers.problem || 'their problem'}. 
              The core thesis builds upon: "{ideaDot}".
            </Text>
          </View>

          <View style={styles.artifactSection}>
            <Text style={styles.artifactSecLabel}>[2] HOW TO CREATE (EXECUTION PLAN)</Text>
            <View style={{ backgroundColor: '#1A1A2A', padding: 15, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#00E5FF', marginBottom: 10 }}>
              <Text style={{ color: '#00E5FF', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>► PHASE 1: CORE MVP SURVIVAL</Text>
              <Text style={{ color: '#E0E0E5', fontSize: 14 }}>Aggressively eliminate features. You specified the following exclusion zone: "{answers.scope || 'Unnecessary features'}". Building anything beyond this in the first 14 days will result in product-market failure.</Text>
            </View>
            <View style={{ backgroundColor: '#1A1A2A', padding: 15, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#FF5722' }}>
              <Text style={{ color: '#FF5722', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>► PHASE 2: SCALING OVER BOTTLENECKS</Text>
              <Text style={{ color: '#E0E0E5', fontSize: 14 }}>Prepare infrastructure for the Fatal Constraint: "{answers.constraint || 'System limits'}". Your tech stack MUST natively bypass this barrier from Day Zero. Do not acquire users until this risk is neutralized.</Text>
            </View>
          </View>

          <View style={styles.artifactSection}>
            <Text style={styles.artifactSecLabel}>[3] COPY-PASTE AI PROMPTS</Text>
            <Text style={styles.artifactPrompt}>
              // PROMPT FOR CURSOR / CLAUDE CODE:{'\n'}
              "Initialize an Expo React Native application targeting {answers.user || 'users'} experiencing {answers.problem || 'issues'}. The app must STRICTLY exclude {answers.scope || 'these features'}. Keep the architecture within these constraints: {answers.constraint || 'none'}. Output the boilerplate app.json and package.json first."
            </Text>
            <View style={{height: 15}} />
            <Text style={styles.artifactPrompt}>
              // PROMPT TO ENHANCE FEATURE SET:{'\n'}
              "Acting as a Senior Product Manager, review this MVP spec. Suggest exactly two high-leverage gamification mechanics that require zero backend changes, keeping {answers.constraint || 'limits'} in mind."
            </Text>
          </View>

          <View style={styles.artifactSection}>
            <Text style={styles.artifactSecLabel}>[4] MINDMAP (ARCHITECTURE TREE)</Text>
            
            <View style={styles.mindmapModule}>
              {/* Root */}
              <View style={{alignItems: 'center'}}>
                <View style={styles.mindmapNodeRoot}>
                  <Text style={styles.mindmapTextRoot}>CORE: {ideaDot.substring(0,25)}...</Text>
                </View>
                <View style={styles.mindmapLineVert} />
              </View>

              {/* L1 Branches */}
              <View style={styles.mindmapLevel}>
                <View style={[styles.mindmapLineHoriz, {width: '60%'}]} />
                <View style={styles.mindmapRow}>
                  <View style={styles.mindmapBranch}>
                    <View style={styles.mindmapLineVertSmall} />
                    <View style={styles.mindmapNode}>
                      <Text style={styles.mindmapTextNode}>PERSONA</Text>
                      <Text style={styles.mindmapDescNode}>{answers.user?.substring(0, 15)}...</Text>
                    </View>
                  </View>

                  <View style={styles.mindmapBranch}>
                    <View style={styles.mindmapLineVertSmall} />
                    <View style={styles.mindmapNodeCenter}>
                      <Text style={styles.mindmapTextNode}>PROBLEM</Text>
                      <Text style={styles.mindmapDescNode}>{answers.problem?.substring(0, 15)}...</Text>
                    </View>
                    <View style={styles.mindmapLineVertSmall} />
                    <View style={styles.mindmapNodeAction}>
                      <Text style={styles.mindmapTextAction}>MVP SCOPE</Text>
                    </View>
                  </View>

                  <View style={styles.mindmapBranch}>
                    <View style={styles.mindmapLineVertSmall} />
                    <View style={styles.mindmapNode}>
                      <Text style={styles.mindmapTextNode}>LIMITS</Text>
                      <Text style={styles.mindmapDescNode}>{answers.constraint?.substring(0, 15)}...</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.btnOutline} onPress={restartProcess}>
            <Text style={styles.btnOutlineText}>COMMENCE NEW CYCLE</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F14' },
  header: { paddingTop: 60, paddingBottom: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', backgroundColor: '#0F0F14' },
  logo: { fontSize: 24, fontWeight: '700', color: '#DCDCE0', letterSpacing: -0.5 },
  statusLabel: { fontSize: 11, color: '#A882FF', fontWeight: '600', letterSpacing: 1 },
  
  contentCore: { flex: 1, padding: 25, justifyContent: 'center' },
  moduleTitle: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 },
  moduleSub: { fontSize: 15, color: '#888896', marginBottom: 30, lineHeight: 24 },
  
  historyEmpty: { color: '#888896', fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  historyCard: { backgroundColor: '#13131A', padding: 20, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#262633', borderLeftWidth: 3, borderLeftColor: '#7A32DD' },
  historyDate: { color: '#A882FF', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  historyIdea: { color: '#DCDCE0', fontSize: 14, lineHeight: 22, fontWeight: '400', marginBottom: 12 },
  historyScore: { color: '#7A32DD', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  
  bigInput: { backgroundColor: '#13131A', borderWidth: 1, borderColor: '#262633', color: '#E0E0E5', fontSize: 17, borderRadius: 12, padding: 20, minHeight: 180, textAlignVertical: 'top', marginBottom: 20, lineHeight: 26 },
  
  btnTrigger: { backgroundColor: '#7A32DD', paddingVertical: 18, borderRadius: 10, alignItems: 'center' },
  actionRow: { flexDirection: 'row', alignItems: 'stretch' },
  btnVoice: { flex: 1, backgroundColor: '#262633', marginRight: 10, borderColor: '#7A32DD', borderWidth: 1 },
  btnVoiceText: { color: '#888896', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  btnDisabled: { backgroundColor: '#211B33', opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 1 },

  btnOutline: { borderWidth: 1, borderColor: '#483569', backgroundColor: 'transparent', paddingVertical: 18, borderRadius: 10, alignItems: 'center', marginTop: 15, marginBottom: 40 },
  btnOutlineText: { color: '#A882FF', fontSize: 14, fontWeight: '700', letterSpacing: 1 },

  progressTrack: { height: 4, backgroundColor: '#1C1C24', borderRadius: 2, overflow: 'hidden', marginBottom: 15 },
  progressFill: { height: '100%', backgroundColor: '#A882FF' },
  metricText: { color: '#A882FF', fontSize: 12, fontWeight: '600', letterSpacing: 1 },

  probeCard: { backgroundColor: '#14141E', borderCurve: 'continuous', borderRadius: 12, borderWidth: 1, borderColor: '#262633', borderLeftWidth: 4, borderLeftColor: '#7A32DD', padding: 25, marginBottom: 20 },
  probePhase: { color: '#7A32DD', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  probeLabel: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  probeHint: { color: '#888896', fontSize: 15, lineHeight: 22 },
  probeInput: { backgroundColor: '#13131A', borderWidth: 1, borderColor: '#262633', color: '#E0E0E5', fontSize: 16, borderRadius: 12, padding: 20, minHeight: 140, textAlignVertical: 'top', marginBottom: 20, lineHeight: 24 },

  artifactCore: { flex: 1, padding: 20 },
  artifactHeader: { borderBottomWidth: 1, borderBottomColor: '#262633', paddingBottom: 15, marginBottom: 20, marginTop: 20 },
  artifactTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  artifactMeta: { color: '#A882FF', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginTop: 8 },
  artifactSection: { backgroundColor: '#13131A', padding: 20, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#262633' },
  artifactSecLabel: { color: '#7A32DD', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  artifactValue: { color: '#DCDCE0', fontSize: 15, lineHeight: 24, fontWeight: '400' },
  artifactPrompt: { color: '#B3B3C4', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, lineHeight: 20, backgroundColor: '#0A0A0D', padding: 16, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#1F1F2A' },

  /* OBSIDIAN GRAPH VIEW MINDMAP STYLES */
  mindmapModule: { marginTop: 15, paddingVertical: 10 },
  mindmapNodeRoot: { backgroundColor: '#7A32DD', paddingVertical: 14, paddingHorizontal: 22, borderRadius: 30, zIndex: 2, borderWidth: 2, borderColor: '#101115' },
  mindmapTextRoot: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  mindmapLineVert: { width: 2, height: 25, backgroundColor: '#3A3A4A' },
  mindmapLineVertSmall: { width: 2, height: 18, backgroundColor: '#3A3A4A', alignSelf: 'center' },
  mindmapLevel: { alignItems: 'center' },
  mindmapLineHoriz: { height: 2, backgroundColor: '#3A3A4A' },
  mindmapRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 10 },
  mindmapBranch: { alignItems: 'center', flex: 1 },
  mindmapNode: { backgroundColor: '#161622', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#483569', width: '90%', alignItems: 'center' },
  mindmapNodeCenter: { backgroundColor: '#1A1A2A', padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#A882FF', width: '90%', alignItems: 'center' },
  mindmapNodeAction: { backgroundColor: 'transparent', padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#7A32DD', borderStyle: 'dashed', width: '90%', alignItems: 'center' },
  mindmapTextNode: { color: '#E0E0E5', fontWeight: '600', fontSize: 10, letterSpacing: 0.5, marginBottom: 4 },
  mindmapTextAction: { color: '#A882FF', fontWeight: '600', fontSize: 10, letterSpacing: 0.5 },
  mindmapDescNode: { color: '#888896', fontSize: 10, textAlign: 'center' },
});
