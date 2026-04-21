import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, LayoutAnimation } from 'react-native';

type Phase = 'DOT_CAPTURE' | 'SLOP_CHECK' | 'ENGINEERING_PROBE' | 'ARTIFACT';

export default function App() {
  const [phase, setPhase] = useState<Phase>('DOT_CAPTURE');
  const [ideaDot, setIdeaDot] = useState('');
  const [slopMetric, setSlopMetric] = useState(0);
  const [probeIndex, setProbeIndex] = useState(0);
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  const probes = [
    { id: 'problem', label: 'PROBLEM DEFINITION', hint: 'What specific friction does this solve? Do not say "makes life easier".' },
    { id: 'user', label: 'TARGET PERSONA', hint: 'Who explicitly pays for or uses this today? Be precise.' },
    { id: 'scope', label: 'MVP BOUNDARIES', hint: 'List 3 things you will explicitly NOT build in v1.' },
    { id: 'constraint', label: 'HARD CONSTRAINTS', hint: 'Compliance, API limits, or budget ceilings?' }
  ];

  const handleDotSubmit = () => {
    if (ideaDot.trim().length < 10) return;
    setPhase('SLOP_CHECK');
    
    // Simulate AI Slop Check
    setTimeout(() => setSlopMetric(25), 600);
    setTimeout(() => setSlopMetric(60), 1200);
    setTimeout(() => {
      setSlopMetric(100);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setPhase('ENGINEERING_PROBE');
    }, 1800);
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
      setPhase('ARTIFACT');
    }
  };

  const restartProcess = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPhase('DOT_CAPTURE');
    setIdeaDot('');
    setProbeIndex(0);
    setAnswers({});
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Text style={styles.logo}>NOKTA_</Text>
        <Text style={styles.statusLabel}>
          STATUS // {phase.replace('_', ' ')}
        </Text>
      </View>

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
          <TouchableOpacity 
            style={[styles.btnTrigger, ideaDot.length < 10 && styles.btnDisabled]} 
            onPress={handleDotSubmit}
            disabled={ideaDot.length < 10}
          >
            <Text style={styles.btnText}>INITIATE SLOP-CHECK</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* PHASE 2: SLOP CHECK (Transition) */}
      {phase === 'SLOP_CHECK' && (
        <View style={styles.contentCore}>
          <Text style={styles.moduleTitle}>ANALYZING DENSITY...</Text>
          <Text style={styles.moduleSub}>Running vector similarity against known buzzwords.</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${slopMetric}%` }]} />
          </View>
          <Text style={styles.metricText}>FILTERING SLOP: {slopMetric}%</Text>
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
            <Text style={styles.artifactMeta}>SLOP RATIO: 0.00% | STATUS: READY FOR AI AGENTS</Text>
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
            <Text style={styles.artifactValue}>
              PHASE 1: Stick strictly to the MVP boundaries. Do NOT build: {answers.scope || 'unnecessary features'}.{'\n\n'}
              PHASE 2: Adopt infrastructure that respects the hard constraints: {answers.constraint || 'system limits'}. Ensure compliance from day zero.
            </Text>
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
  
  bigInput: { backgroundColor: '#13131A', borderWidth: 1, borderColor: '#262633', color: '#E0E0E5', fontSize: 17, borderRadius: 12, padding: 20, minHeight: 180, textAlignVertical: 'top', marginBottom: 20, lineHeight: 26 },
  
  btnTrigger: { backgroundColor: '#7A32DD', paddingVertical: 18, borderRadius: 10, alignItems: 'center' },
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
