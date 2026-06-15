import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ForgeCycle {
  id: string;
  title: string;
  description: string;
  status: 'SUCCESS' | 'FAIL' | 'ROLLBACK' | 'STUCK';
  date: string;
  contextSource?: string;
  contextSummary?: string;
}

interface ExpertBridge {
  id: string;
  date: string;
  issue: string;
  duration: string;
  roomUrl: string;
}

const SEEDED_CYCLES: ForgeCycle[] = [
  { id: '1', title: 'Cycle #4: SUCCESS', description: 'Autonomous Spec Builder integration verified.', status: 'SUCCESS', date: '2026-05-27 15:42' },
  { id: '2', title: 'Cycle #3: FAIL', description: 'Hermes engine stack overflow during base64 buffer parse.', status: 'FAIL', date: '2026-05-27 13:20' },
  { id: '3', title: 'Cycle #2: ROLLBACK', description: 'Reverted native custom dev clients to preserve Expo Go compatibility.', status: 'ROLLBACK', date: '2026-05-26 22:58' },
  { id: '4', title: 'Cycle #1: STUCK', description: 'Waiting for human-in-the-loop validation response.', status: 'STUCK', date: '2026-05-12 17:05' }
];

const SEEDED_BRIDGES: ExpertBridge[] = [
  {
    id: 'b1',
    date: '2026-05-27 13:45',
    issue: 'Hermes engine stack overflow during base64 buffer parse.',
    duration: '2m 14s',
    roomUrl: 'https://meet.jit.si/NoktaExpertBridge_b1'
  }
];

const TRANSCRIPT_POOL = [
  { sender: 'Ravza', message: 'Three.js skinned mesh rendering pipeline is fully active on mobile.' },
  { sender: 'Expert', message: 'Perfect. Did you verify that the detached texture mappings are loading correctly?' },
  { sender: 'Ravza', message: 'Yes, texture file structures have been completely validated against AAPT constraints.' },
  { sender: 'Expert', message: 'Outstanding. Make sure to check morphTargetDictionary bindings for viseme synchronization.' },
  { sender: 'Ravza', message: 'We are mapping mouthOpen and jawOpen shapes under the custom speech update loop.' },
  { sender: 'Expert', message: 'Excellent! Keep the audio visualizer low-latency real-time FFT feed active during speech.' },
  { sender: 'Ravza', message: 'Verified. The next autonomous Forge cycle will inject these parameters directly.' },
  { sender: 'Expert', message: 'Great! Proceed with compiling the Android release via EAS once verified.' }
];

export default function ProfileScreen() {
  const [persona, setPersona] = useState<'junior' | 'senior'>('junior');
  const [cycles, setCycles] = useState<ForgeCycle[]>([]);
  const [bridges, setBridges] = useState<ExpertBridge[]>([]);
  const [loading, setLoading] = useState(true);

  // Expert Escalation Modal States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('Connecting...');
  const [activeSessionId, setActiveSessionId] = useState('');
  const [blink, setBlink] = useState(true);

  // Transcription & Context States
  const [activeTranscript, setActiveTranscript] = useState<string[]>([]);
  const [latestContext, setLatestContext] = useState<string>('');
  const [latestTranscriptList, setLatestTranscriptList] = useState<string[]>([]);

  const callTimerRef = useRef<any>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load active persona
        const savedPersona = await AsyncStorage.getItem('@avatar_persona');
        if (savedPersona === 'junior' || savedPersona === 'senior') {
          setPersona(savedPersona);
        }

        // Load or seed Forge Cycles
        const savedCycles = await AsyncStorage.getItem('@forge_cycles');
        if (savedCycles) {
          setCycles(JSON.parse(savedCycles));
        } else {
          await AsyncStorage.setItem('@forge_cycles', JSON.stringify(SEEDED_CYCLES));
          setCycles(SEEDED_CYCLES);
        }

        // Load or seed Expert Bridges
        const savedBridges = await AsyncStorage.getItem('@expert_bridges');
        if (savedBridges) {
          setBridges(JSON.parse(savedBridges));
        } else {
          await AsyncStorage.setItem('@expert_bridges', JSON.stringify(SEEDED_BRIDGES));
          setBridges(SEEDED_BRIDGES);
        }

        // Load latest transcript and context
        const savedTranscript = await AsyncStorage.getItem('@bridge_transcript');
        if (savedTranscript) {
          setLatestTranscriptList(JSON.parse(savedTranscript));
        }

        const savedContext = await AsyncStorage.getItem('@bridge_context_feed');
        if (savedContext) {
          setLatestContext(savedContext);
        }
      } catch (err) {
        console.warn('Profile initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  // Blinking Live indicator effect
  useEffect(() => {
    let blinkInterval: any = null;
    if (showCallModal) {
      blinkInterval = setInterval(() => {
        setBlink(prev => !prev);
      }, 850);
    }
    return () => {
      if (blinkInterval) clearInterval(blinkInterval);
    };
  }, [showCallModal]);

  const checkStuckCondition = (cycleList: ForgeCycle[]) => {
    if (cycleList.length < 2) return false;
    const first = cycleList[0];
    const second = cycleList[1];

    // Stuck condition 1: 2 successive FAILs
    if (first.status === 'FAIL' && second.status === 'FAIL') return true;

    // Stuck condition 2: 2 successive ROLLBACKs
    if (first.status === 'ROLLBACK' && second.status === 'ROLLBACK') return true;

    return false;
  };

  const handleAddCycle = async () => {
    const statuses: ForgeCycle['status'][] = ['SUCCESS', 'FAIL', 'ROLLBACK', 'STUCK'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const cycleNum = cycles.length + 1;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const savedContext = await AsyncStorage.getItem('@bridge_context_feed');
    const newCycle: ForgeCycle = {
      id: String(Date.now()),
      title: `Cycle #${cycleNum}: ${randomStatus}`,
      description: `Automatically generated simulation log for ${randomStatus.toLowerCase()} state.`,
      status: randomStatus,
      date: dateStr,
      contextSource: savedContext ? "Latest Expert Bridge Session" : undefined,
      contextSummary: savedContext || undefined
    };

    const updated = [newCycle, ...cycles];
    setCycles(updated);
    try {
      await AsyncStorage.setItem('@forge_cycles', JSON.stringify(updated));
      
      // STUCK Detection Trigger check
      if (checkStuckCondition(updated)) {
        setShowWarningModal(true);
      }
    } catch (err) {
      console.warn('Failed to save new cycle log:', err);
    }
  };

  const handleForceStuckTrigger = async () => {
    // Triggers stuck warning modal by appending 2 mock FAIL cycles to demonstrate easily
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const fail1: ForgeCycle = {
      id: String(Date.now()),
      title: `Cycle #${cycles.length + 1}: FAIL`,
      description: `Repeated compilation crash in JNI buffers.`,
      status: 'FAIL',
      date: dateStr
    };
    const fail2: ForgeCycle = {
      id: String(Date.now() + 1),
      title: `Cycle #${cycles.length + 2}: FAIL`,
      description: `Repeated compilation crash in JNI buffers.`,
      status: 'FAIL',
      date: dateStr
    };

    const updated = [fail2, fail1, ...cycles];
    setCycles(updated);
    try {
      await AsyncStorage.setItem('@forge_cycles', JSON.stringify(updated));
      setShowWarningModal(true);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleResetTimeline = async () => {
    setCycles(SEEDED_CYCLES);
    try {
      await AsyncStorage.setItem('@forge_cycles', JSON.stringify(SEEDED_CYCLES));
    } catch (err) {
      console.warn('Failed to reset cycles:', err);
    }
  };

  // Expert Connection Actions
  const startExpertCall = () => {
    setShowWarningModal(false);
    setActiveSessionId(String(Math.floor(100000 + Math.random() * 900000)));
    setCallDuration(0);
    setCallStatus('Connecting...');
    setActiveTranscript([]);
    setShowCallModal(true);

    // Dynamic Connection status updates
    setTimeout(() => setCallStatus('Securing Tunnel...'), 1500);
    setTimeout(() => setCallStatus('Expert Connected: Ravza (Senior Advisor)'), 3500);

    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => {
        const nextSeconds = prev + 1;
        
        // Generate simulated transcription segment every 4 seconds
        if (nextSeconds % 4 === 0) {
          const index = Math.floor(nextSeconds / 4) - 1;
          if (index < TRANSCRIPT_POOL.length) {
            const segment = TRANSCRIPT_POOL[index];
            const timestamp = formatTimer(nextSeconds);
            const line = `[${timestamp}] ${segment.sender}: ${segment.message}`;
            setActiveTranscript(curr => [...curr, line]);
          }
        }
        
        return nextSeconds;
      });
    }, 1000);
  };

  const launchJitsiRoom = () => {
    const url = `https://meet.jit.si/NoktaExpertBridge_${activeSessionId}`;
    Linking.openURL(url).catch(err => console.warn('Could not launch URL:', err));
  };

  const endExpertCall = async () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setShowCallModal(false);

    // Save active session
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    const durationStr = `${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;

    const newBridge: ExpertBridge = {
      id: activeSessionId,
      date: dateStr,
      issue: cycles[0]?.description || 'Repeated compilation failures in Forge timeline.',
      duration: durationStr,
      roomUrl: `https://meet.jit.si/NoktaExpertBridge_${activeSessionId}`
    };

    const updatedBridges = [newBridge, ...bridges];
    setBridges(updatedBridges);

    // Generate simulated recommendation summary
    const recommendation = "Expert recommended morphTargetDictionary viseme synchronization and AAPT compliance checks.";
    setLatestContext(recommendation);
    setLatestTranscriptList(activeTranscript);

    // BRIDGE.md Autogenerator
    const md = `# Expert Bridge Session

## Session Summary
- **Timestamp**: ${dateStr}
- **Bridge ID**: ${activeSessionId}
- **Trigger Issue**: ${newBridge.issue}
- **Duration**: ${durationStr}
- **Jitsi Room URL**: ${newBridge.roomUrl}
- **Status**: Escalated and Resolved via Jitsi Peer-to-Peer Bridge.

## Transcript
${activeTranscript.map(line => `- ${line}`).join('\n')}

## Recommended Next Actions
- Verify morphTargetDictionary viseme synchronization.
- Stabilize low-latency FFT voice visualizer stream.
- Rerun autonomous Forge repair cycle.`;

    console.log('--- BRIDGE.md AUTO-GENERATED ---');
    console.log(md);

    try {
      await AsyncStorage.setItem('@expert_bridges', JSON.stringify(updatedBridges));
      await AsyncStorage.setItem('@latest_bridge_md', md);
      await AsyncStorage.setItem('@bridge_transcript', JSON.stringify(activeTranscript));
      await AsyncStorage.setItem('@bridge_context_feed', recommendation);
    } catch (err) {
      console.warn('Failed to save expert bridges:', err);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const accentColor = persona === 'junior' ? '#00f2fe' : '#a855f7';

  const getStatusColor = (status: ForgeCycle['status']) => {
    switch (status) {
      case 'SUCCESS': return '#10b981'; // Green
      case 'FAIL': return '#ef4444'; // Red
      case 'ROLLBACK': return '#f97316'; // Orange
      case 'STUCK': return '#3b82f6'; // Blue
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00f2fe" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      {/* Header Profile Info Card */}
      <View style={[styles.profileHeaderCard, { borderColor: `rgba(${persona === 'junior' ? '0, 242, 254' : '168, 85, 247'}, 0.15)` }]}>
        <View style={[styles.avatarGlowContainer, { shadowColor: accentColor }]}>
          <View style={[styles.avatarBorder, { borderColor: accentColor }]}>
            <Text style={styles.avatarEmoji}>{persona === 'junior' ? '🧑‍💻' : '🦸'}</Text>
          </View>
        </View>
        <Text style={styles.userName}>Ravza</Text>
        <Text style={[styles.userRole, { color: accentColor }]}>
          {persona === 'junior' ? 'Junior Assistant • UI Specialist' : 'Senior Assistant • Core Architect'}
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: accentColor }]}>{persona === 'junior' ? '1,420' : '8,950'}</Text>
          <Text style={styles.statLabel}>Commands</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: accentColor }]}>{persona === 'junior' ? '94%' : '99.9%'}</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: accentColor }]}>Active</Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>

      {/* Info Card List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>ravza@nokta.ai</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role Scope</Text>
          <Text style={persona === 'junior' ? styles.infoValueJunior : styles.infoValueSenior}>
            {persona === 'junior' ? 'Junior Spec Builder' : 'Senior System Architect'}
          </Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device Environment</Text>
          <Text style={styles.infoValue}>Android Mobile Client</Text>
        </View>
      </View>

      {/* Latest Expert Transcript & Context Feed Preview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>LATEST EXPERT CONTEXT FEED</Text>
      </View>

      <View style={styles.infoCard}>
        {latestContext ? (
          <View style={styles.contextPreviewRow}>
            <Text style={styles.contextPreviewLabel}>Latest Recommendation:</Text>
            <Text style={styles.contextPreviewText}>{latestContext}</Text>
            
            {latestTranscriptList.length > 0 && (
              <View style={styles.transcriptPreviewContainer}>
                <Text style={styles.transcriptPreviewHeader}>Transcript Snapshot:</Text>
                {latestTranscriptList.slice(0, 3).map((line, idx) => (
                  <Text key={idx} style={styles.transcriptPreviewLine}>{line}</Text>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyContextRow}>
            <Text style={styles.emptyContextText}>No active Expert Context Feed present. Complete an Expert Bridge session to stream real-time transcription context.</Text>
          </View>
        )}
      </View>

      {/* Expert Bridges Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>EXPERT BRIDGES HISTORY</Text>
      </View>

      <View style={styles.infoCard}>
        {bridges.map((b, idx) => (
          <View key={b.id}>
            {idx > 0 && <View style={styles.infoDivider} />}
            <View style={styles.bridgeRow}>
              <View style={styles.bridgeInfo}>
                <Text style={styles.bridgeTitle}>Session ID: {b.id}</Text>
                <Text style={styles.bridgeDate}>{b.date} • Duration: {b.duration}</Text>
                <Text style={styles.bridgeIssue}>{b.issue}</Text>
              </View>
              <Pressable style={styles.jitsiTinyBtn} onPress={() => Linking.openURL(b.roomUrl)}>
                <Text style={styles.jitsiTinyBtnText}>Room</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* Forge Cycles Timeline Header */}
      <View style={styles.timelineHeaderRow}>
        <Text style={styles.sectionTitle}>FORGE TIMELINE CYCLES</Text>
        <View style={styles.timelineActions}>
          <Pressable style={styles.actionButton} onPress={handleForceStuckTrigger}>
            <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>⚡ Force Stuck</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleAddCycle}>
            <Text style={[styles.actionButtonText, { color: accentColor }]}>+ Add Cycle</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleResetTimeline}>
            <Text style={styles.actionButtonTextGrey}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* Timeline List */}
      <View style={styles.timelineContainer}>
        {cycles.map((item, index) => {
          const isLast = index === cycles.length - 1;
          const statusColor = getStatusColor(item.status);
          return (
            <View key={item.id} style={styles.timelineRow}>
              <View style={styles.indicatorContainer}>
                <View style={[styles.indicatorDot, { backgroundColor: statusColor, shadowColor: statusColor }]} />
                {!isLast && <View style={[styles.indicatorLine, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />}
              </View>

              <View style={styles.cycleCard}>
                <View style={styles.cycleHeader}>
                  <Text style={styles.cycleTitle}>{item.title}</Text>
                  <View style={[styles.badge, { backgroundColor: `${statusColor}22`, borderColor: `${statusColor}66` }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.cycleDescription}>{item.description}</Text>
                
                {item.contextSource && (
                  <View style={styles.contextFeedContainer}>
                    <Text style={styles.contextFeedSource}>🔗 {item.contextSource}</Text>
                    <Text style={styles.contextFeedSummary}>{item.contextSummary}</Text>
                  </View>
                )}

                <Text style={styles.cycleDate}>{item.date}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* MODAL 1: STUCK Escalation Warning Modal */}
      <Modal visible={showWarningModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.escalationCard}>
            <View style={styles.warningGlowDot} />
            <Text style={styles.escalationHeading}>Uzman Yardımı Öneriliyor</Text>
            <Text style={styles.escalationSub}>Repeated cycle failures or rollback loop detected inside your active Forge timeline.</Text>
            
            <View style={styles.escalationStats}>
              <Text style={styles.escalationStatText}>Failed Cycle Count: 2 successive fails</Text>
              <Text style={styles.escalationStatText}>Issue: {cycles[0]?.description}</Text>
            </View>

            <View style={styles.modalButtonRow}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setShowWarningModal(false)}>
                <Text style={styles.modalCancelText}>Daha Sonra</Text>
              </Pressable>
              <Pressable style={[styles.modalConfirmBtn, { backgroundColor: accentColor }]} onPress={startExpertCall}>
                <Text style={styles.modalConfirmText}>Uzmana Bağlan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: Fullscreen Expert Jitsi Call Session Screen */}
      <Modal visible={showCallModal} transparent animationType="slide">
        <View style={styles.callScreenContainer}>
          <View style={styles.callHeader}>
            <View style={styles.liveIndicatorRow}>
              <View style={[styles.liveDot, blink && { opacity: 0.2 }]} />
              <Text style={styles.liveText}>LIVE EXPERT BRIDGE</Text>
            </View>
            <Text style={styles.callTimer}>{formatTimer(callDuration)}</Text>
          </View>

          <View style={styles.callBody}>
            <View style={styles.avatarCircleSim}>
              <Text style={styles.avatarEmojiSim}>📞</Text>
            </View>
            <Text style={styles.callName}>P2P Expert Escalation Room</Text>
            <Text style={styles.callStatusText}>{callStatus}</Text>
          </View>

          {/* Real-time Transcription Stream Feed */}
          <View style={styles.transcriptStreamContainer}>
            <Text style={styles.transcriptStreamHeader}>Real-Time Transcription Stream</Text>
            <ScrollView 
              style={styles.transcriptStreamScroll}
              contentContainerStyle={styles.transcriptStreamContent}
              ref={(ref) => ref?.scrollToEnd({ animated: true })}
            >
              {activeTranscript.length === 0 ? (
                <Text style={styles.emptyStreamText}>Waiting for speech transcription feed...</Text>
              ) : (
                activeTranscript.map((line, idx) => {
                  const parts = line.split(': ');
                  const meta = parts[0];
                  const message = parts.slice(1).join(': ');
                  return (
                    <View key={idx} style={styles.transcriptLineBubble}>
                      <Text style={styles.transcriptMetaText}>{meta}</Text>
                      <Text style={styles.transcriptMsgText}>{message}</Text>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>

          <View style={styles.callControls}>
            <Pressable style={styles.jitsiActionBtn} onPress={launchJitsiRoom}>
              <Text style={styles.jitsiActionBtnText}>Launch Jitsi Video Room</Text>
            </Pressable>
            
            <Pressable style={styles.endCallBtn} onPress={endExpertCall}>
              <Text style={styles.endCallBtnText}>End Session</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  profileHeaderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarGlowContainer: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    marginBottom: 16,
    elevation: 6,
  },
  avatarBorder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#161622',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 42,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 0.2,
  },
  sectionHeader: {
    marginLeft: 4,
    marginBottom: 10,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 4,
    marginBottom: 14,
    marginTop: 10,
  },
  timelineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtonTextGrey: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: 1.5,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  infoLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  infoValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  infoValueJunior: {
    fontSize: 15,
    color: '#00f2fe',
    fontWeight: '600',
  },
  infoValueSenior: {
    fontSize: 15,
    color: '#a855f7',
    fontWeight: '600',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  bridgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  bridgeInfo: {
    flex: 1,
    paddingRight: 12,
  },
  bridgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  bridgeDate: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
  bridgeIssue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  jitsiTinyBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  jitsiTinyBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  timelineContainer: {
    alignItems: 'stretch',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  indicatorContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  indicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  indicatorLine: {
    width: 2,
    position: 'absolute',
    top: 18,
    bottom: -16,
  },
  cycleCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cycleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cycleDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 16,
    marginBottom: 8,
  },
  cycleDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.25)',
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  escalationCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#111118',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 8,
  },
  warningGlowDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
    marginBottom: 16,
  },
  escalationHeading: {
    fontSize: 19,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  escalationSub: {
    fontSize: 12.5,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  escalationStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    marginBottom: 20,
  },
  escalationStatText: {
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 16,
    marginBottom: 4,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00f2fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modalConfirmText: {
    color: '#0e0e12',
    fontSize: 13,
    fontWeight: '700',
  },

  // Call Screen Styling
  callScreenContainer: {
    flex: 1,
    backgroundColor: '#0a0a0c',
    padding: 30,
    justifyContent: 'space-between',
  },
  callHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  liveIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  liveText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  callTimer: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  callBody: {
    alignItems: 'center',
  },
  avatarCircleSim: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarEmojiSim: {
    fontSize: 54,
  },
  callName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  callStatusText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  callControls: {
    marginBottom: 40,
    gap: 16,
  },
  jitsiActionBtn: {
    backgroundColor: '#3b82f6',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  jitsiActionBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  endCallBtn: {
    backgroundColor: '#ef4444',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  endCallBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  transcriptStreamContainer: {
    flex: 1.8,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 16,
    marginVertical: 14,
  },
  transcriptStreamHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00f2fe',
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  transcriptStreamScroll: {
    flex: 1,
  },
  transcriptStreamContent: {
    paddingBottom: 10,
  },
  emptyStreamText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  transcriptLineBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  transcriptMetaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a855f7',
    marginBottom: 2,
  },
  transcriptMsgText: {
    fontSize: 12,
    color: '#ffffff',
    lineHeight: 16,
  },
  contextPreviewRow: {
    paddingVertical: 16,
    width: '100%',
  },
  contextPreviewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  contextPreviewText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 14,
  },
  transcriptPreviewContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  transcriptPreviewHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00f2fe',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  transcriptPreviewLine: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 15,
    marginBottom: 4,
  },
  emptyContextRow: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContextText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    lineHeight: 18,
  },
  contextFeedContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.03)',
  },
  contextFeedSource: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a855f7',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  contextFeedSummary: {
    fontSize: 11,
    color: '#ffffff',
    lineHeight: 15,
  },
});
