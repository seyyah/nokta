import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import * as FileSystem from 'expo-file-system/legacy';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';
import { transcribeAudio } from '../services/geminiService';
import { colors } from '../constants/colors';

// ─── CANVAS ERROR BOUNDARY ──────────────────────────────────────────────────
class CanvasErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('[VoiceScreen] 3D Model render failed, falling back to Stylized 3D Face:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ─── 3D FALLBACK MODEL (Cyberpunk AI Holographic Core) ──────────────────────────
function Fallback3DModel({ volumeRef, isSpeaking, persona }) {
  const groupRef = useRef();
  const ringRef = useRef();
  const coreRef = useRef();
  const barsRef = useRef([]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    // Smooth floating animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.08 - 0.1;
      groupRef.current.rotation.y = elapsed * 0.2;
    }

    // Outer ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.x = elapsed * 0.8;
      ringRef.current.rotation.y = elapsed * 0.5;
    }

    // Core pulsing scale
    const vol = volumeRef.current || 0;
    const voiceFactor = isSpeaking ? (0.8 + Math.sin(elapsed * 15) * 0.2) : vol;
    
    if (coreRef.current) {
      const coreScale = 1.0 + voiceFactor * 0.25;
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
    }

    // Pulse bars
    barsRef.current.forEach((bar, idx) => {
      if (bar) {
        const offset = idx * 0.5;
        const heightScale = 0.2 + (isSpeaking ? (Math.sin(elapsed * 18 + offset) * 0.5 + 0.5) : vol * 1.8);
        bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, heightScale, 0.2);
      }
    });
  });

  const neonColor = persona === 'junior-sen' ? '#10B981' : '#F59E0B'; // Rich Emerald vs Amber (Cyberpunk style)
  const darkChrome = '#1F2937'; // Sleek slate grey/chrome

  return (
    <group ref={groupRef}>
      {/* Outer Dark Chrome Cage / Shell */}
      <mesh>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshStandardMaterial 
          color={darkChrome} 
          roughness={0.15} 
          metalness={0.9} 
          wireframe={true}
          opacity={0.3}
          transparent={true}
        />
      </mesh>

      {/* Holographic Glowing Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial 
          color={neonColor} 
          emissive={neonColor} 
          emissiveIntensity={0.6}
          roughness={0.2} 
          metalness={0.8} 
        />
      </mesh>

      {/* Floating Holographic Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.2, 0.03, 8, 48]} />
        <meshStandardMaterial 
          color={neonColor} 
          emissive={neonColor} 
          emissiveIntensity={0.8}
          transparent={true}
          opacity={0.6}
        />
      </mesh>

      {/* Futuristic 3D Visualizer Bars (acting as mouth/wave inside core) */}
      <group position={[0, 0, 0.65]} rotation={[0, 0, 0]}>
        {[-0.3, -0.15, 0, 0.15, 0.3].map((xPos, idx) => (
          <mesh 
            key={idx} 
            position={[xPos, 0, 0]} 
            ref={el => barsRef.current[idx] = el}
          >
            <boxGeometry args={[0.07, 0.5, 0.05]} />
            <meshStandardMaterial 
              color={neonColor} 
              emissive={neonColor} 
              emissiveIntensity={1.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ─── 3D AVATAR GLB MODEL ────────────────────────────────────────────────────
function AvatarGLB({ volumeRef, isSpeaking, persona, onNoMorphTargets }) {
  const groupRef = useRef();
  const [headMesh, setHeadMesh] = useState(null);
  const headBoneRef = useRef(null);

  // Load the glb asset from the root folder
  const { scene } = useGLTF(require('../assets/avatar.glb'));

  useEffect(() => {
    if (scene) {
      let foundHead = null;

      scene.traverse((child) => {
        // ── TANI: Tüm mesh + morph target isimlerini konsola yaz ──────────────
        if (child.isMesh && child.morphTargetDictionary) {
          console.log(
            '[Avatar] Mesh:', child.name,
            '| MorphTargets:', Object.keys(child.morphTargetDictionary)
          );

          const d = child.morphTargetDictionary;
          const keys = Object.keys(d).map((k) => k.toLowerCase());

          // Herhangi bir ağız/çene/viseme morph target varsa bu mesh'i kullan
          const hasMouth = keys.some((k) =>
            k.includes('jaw') || k.includes('mouth') || k.includes('viseme') || k.includes('lip')
          );
          if (hasMouth && !foundHead) {
            console.log('[Avatar] LipSync mesh bulundu:', child.name);
            foundHead = child;
          }
        }

        // T-Pose Fix: Rotate arms down naturally (using X-axis rotation)
        if (child.isBone) {
          const name = child.name.toLowerCase();
          
          // Head bone reference
          if (name.includes('head') && !name.includes('forehead')) {
            headBoneRef.current = child;
          }

          // Check for left upper arm bones
          if (
            name.includes('leftupperarm') ||
            name.includes('leftarm') ||
            name.includes('l_arm') ||
            name.includes('l_upperarm') ||
            name.includes('mixamorigleftarm')
          ) {
            if (!name.includes('forearm') && !name.includes('shoulder')) {
              child.rotation.x = 1.25;
            }
          }
          // Check for right upper arm bones
          if (
            name.includes('rightupperarm') ||
            name.includes('rightarm') ||
            name.includes('r_arm') ||
            name.includes('r_upperarm') ||
            name.includes('mixamorigrightarm')
          ) {
            if (!name.includes('forearm') && !name.includes('shoulder')) {
              child.rotation.x = 1.25;
            }
          }

          // Left Forearm (Elbow bend)
          if (
            name.includes('leftforearm') ||
            name.includes('l_forearm') ||
            name.includes('mixamorigleftforearm')
          ) {
            child.rotation.y = 1.3;
          }

          // Right Forearm (Elbow bend)
          if (
            name.includes('rightforearm') ||
            name.includes('r_forearm') ||
            name.includes('mixamorigrightforearm')
          ) {
            child.rotation.y = -1.3;
          }
        }
      });

      // Fallback: blendshape olmasa bile ilk morphTargetDictionary'li mesh'i al
      if (!foundHead) {
        scene.traverse((child) => {
          if (child.isMesh && child.morphTargetDictionary && !foundHead) {
            console.log('[Avatar] Fallback mesh (morph targets):', child.name, Object.keys(child.morphTargetDictionary));
            foundHead = child;
          }
        });
      }

      if (!foundHead) {
        console.warn('[Avatar] UYARI: Modelde hiç morph target bulunamadı! Ağız hareketi çalışmaz.');
        console.warn('[Avatar] Avaturn export ayarlarında Blendshapes/ReadyPlayerMe seçili mi kontrol et.');
        if (onNoMorphTargets) {
          onNoMorphTargets();
        }
      }

      setHeadMesh(foundHead);
    }
  }, [scene]);

  useFrame((state) => {
    // Idle body movements
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.08;
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.2) * 0.02 - 1.5;
    }

    const vol = volumeRef.current || 0;
    let mouthOpenVal = 0;
    if (isSpeaking) {
      mouthOpenVal = Math.max(0, Math.sin(state.clock.getElapsedTime() * 13) * 0.35 + 0.35);
    } else {
      mouthOpenVal = vol * 1.5;
    }

    // Lipsync morph animation — strict undefined check so index=0 works!
    if (headMesh) {
      const dict = headMesh.morphTargetDictionary;
      const influences = headMesh.morphTargetInfluences;

      // Find first available mouth morph target (case-insensitive search)
      let mouthIdx;
      for (const [key, idx] of Object.entries(dict)) {
        const k = key.toLowerCase();
        if (k.includes('jaw') || k.includes('mouthopen') || k === 'viseme_aa' || k === 'viseme_o') {
          mouthIdx = idx;
          break;
        }
      }
      if (mouthIdx !== undefined && influences) {
        influences[mouthIdx] = THREE.MathUtils.lerp(influences[mouthIdx], mouthOpenVal, 0.22);
      }

      // Dynamic Eye Blinking
      if (influences) {
        const isBlinking = Math.sin(state.clock.getElapsedTime() * 0.6) > 0.97;
        const blinkVal = isBlinking ? 1 : 0;
        if (dict.eyeBlinkLeft !== undefined) {
          influences[dict.eyeBlinkLeft] = THREE.MathUtils.lerp(influences[dict.eyeBlinkLeft], blinkVal, 0.3);
        }
        if (dict.eyeBlinkRight !== undefined) {
          influences[dict.eyeBlinkRight] = THREE.MathUtils.lerp(influences[dict.eyeBlinkRight], blinkVal, 0.3);
        }
      }
    }

    // Head-nodding animation when speaking (works even if model lacks morph targets!)
    if (headBoneRef.current) {
      if (isSpeaking) {
        headBoneRef.current.rotation.x = THREE.MathUtils.lerp(
          headBoneRef.current.rotation.x,
          Math.sin(state.clock.getElapsedTime() * 14) * 0.06 + 0.04,
          0.2
        );
        headBoneRef.current.rotation.y = THREE.MathUtils.lerp(
          headBoneRef.current.rotation.y,
          Math.sin(state.clock.getElapsedTime() * 6) * 0.03,
          0.2
        );
      } else {
        // Natural idle breathing rotation or centering
        headBoneRef.current.rotation.x = THREE.MathUtils.lerp(headBoneRef.current.rotation.x, 0, 0.1);
        headBoneRef.current.rotation.y = THREE.MathUtils.lerp(headBoneRef.current.rotation.y, 0, 0.1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.4} />
    </group>
  );
}

// ─── MAIN SCREEN ────────────────────────────────────────────────────────────
export default function VoiceScreen({ navigation }) {
  const [persona, setPersona] = useState('senior-sen'); // 'junior-sen' or 'senior-sen'
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState('');
  const [recording, setRecording] = useState(null);
  const recordingRef = useRef(null);

  // Fallback toggles: auto-detect missing blendshapes or manually toggle Cyberpunk AI Core
  const [showCyberpunkFallback, setShowCyberpunkFallback] = useState(false);
  const [manualCoreToggle, setManualCoreToggle] = useState(false); // Default false: Show the 3D Character by default!

  // References for animation and 3D loop
  const volumeRef = useRef(0);
  const isSpeakingRef = useRef(false);

  // Animated heights for the 5-bar visualizer
  const barHeights = [
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
    useRef(new Animated.Value(4)).current,
  ];

  // Configure Audio Mode on mount
  useEffect(() => {
    async function setupAudio() {
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.warn('Audio setup error:', e);
      }
    }
    setupAudio();
    return () => {
      // Clean up TTS on unmount
      Speech.stop();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch((err) => {
          console.warn('Clean up recording on unmount failed:', err);
        });
      }
    };
  }, []);

  // Update animated bars based on current normalized volume (0 to 1)
  const animateBars = (normalizedVal) => {
    const targetHeight = 4 + normalizedVal * 60; // Max height 64px
    Animated.parallel([
      Animated.spring(barHeights[0], { toValue: targetHeight * 0.4, useNativeDriver: false, tension: 50, friction: 5 }),
      Animated.spring(barHeights[1], { toValue: targetHeight * 0.7, useNativeDriver: false, tension: 50, friction: 5 }),
      Animated.spring(barHeights[2], { toValue: targetHeight * 1.0, useNativeDriver: false, tension: 50, friction: 5 }),
      Animated.spring(barHeights[3], { toValue: targetHeight * 0.7, useNativeDriver: false, tension: 50, friction: 5 }),
      Animated.spring(barHeights[0], { toValue: targetHeight * 0.4, useNativeDriver: false, tension: 50, friction: 5 }),
    ]).start();
  };

  // Reset visualizer bars to minimal state
  const resetBars = () => {
    Animated.parallel(
      barHeights.map((bar) => Animated.spring(bar, { toValue: 4, useNativeDriver: false, friction: 6 }))
    ).start();
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      }

      // Safeguard: Unload previous recording if it exists
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (unloadErr) {
          console.warn('Unloading previous recording in startRecording failed:', unloadErr);
        }
        recordingRef.current = null;
      }

      const rec = new Audio.Recording();
      recordingRef.current = rec;

      await rec.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
        android: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
        },
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        },
      });

      // Metering updates every 60ms for low latency animation (<200ms target)
      rec.setProgressUpdateInterval(60);
      rec.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          const db = status.metering || -160;
          // Normalize volume level (-60dB to 0dB scale)
          const norm = Math.max(0, Math.min(1, (db + 60) / 60));
          volumeRef.current = norm;
          animateBars(norm);
        }
      });

      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      recordingRef.current = null;
      setRecording(null);
      Alert.alert('Hata', 'Mikrofon kaydı başlatılamadı: ' + err.message);
    }
  };

  // Stop Recording & Send to Gemini for STT + Markdown creation
  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;

    setIsRecording(false);
    resetBars();
    volumeRef.current = 0;

    try {
      setLoading(true);
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();

      recordingRef.current = null;
      setRecording(null);

      if (!uri) throw new Error('No recording URI found');

      // Convert audio recording to Base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to Gemini STT dictation pipeline
      const markdownReport = await transcribeAudio(base64Audio, 'audio/m4a');
      setReportText(markdownReport);

      // Trigger Avatar to read report summary
      speakReport(markdownReport);
    } catch (e) {
      console.error(e);
      recordingRef.current = null;
      setRecording(null);
      Alert.alert('Transcription Hatası', 'Dikte çözümlenemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Persona TTS playback using expo-speech
  const speakReport = (text) => {
    Speech.stop();
    setIsSpeaking(true);
    isSpeakingRef.current = true;

    // Standardize input: extract title or first few lines of markdown
    const plainText = text
      .replace(/[#*`_-]/g, '') // remove markdown symbols
      .substring(0, 200) + '... Rapor hazırlandı, kod döngüsüne gönderilebilir.';

    // Pitch & rate matching Track B specs
    const options = {
      language: 'tr-TR',
      pitch: persona === 'junior-sen' ? 1.3 : 0.85,
      rate: persona === 'junior-sen' ? 1.15 : 0.9,
      onDone: () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      },
      onError: () => {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      },
    };

    // Inject persona verbal intro
    const intro =
      persona === 'junior-sen'
        ? 'Şey, hata raporunu çıkardım galiba. Şöyle diyor: '
        : 'Sistem denetimini tamamladım. Mimari bulgular şu şekildedir: ';

    Speech.speak(intro + plainText, options);
  };

  // Persona color configurations
  const personaColor = persona === 'junior-sen' ? '#4ade80' : '#fbbf24';
  const glowShadowColor = persona === 'junior-sen' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)';

  return (
    <LinearGradient colors={['#080814', '#0D0B24', '#080814']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nokta Ses Modu</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Persona Selectors */}
        <View style={styles.personaRow}>
          <TouchableOpacity
            style={[
              styles.personaBtn,
              persona === 'junior-sen' && { borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)' },
            ]}
            onPress={() => {
              Speech.stop();
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              setPersona('junior-sen');
            }}
          >
            <Text style={[styles.personaText, persona === 'junior-sen' && { color: '#4ade80' }]}>
              🟢 Junior-Sen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.personaBtn,
              persona === 'senior-sen' && { borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)' },
            ]}
            onPress={() => {
              Speech.stop();
              setIsSpeaking(false);
              isSpeakingRef.current = false;
              setPersona('senior-sen');
            }}
          >
            <Text style={[styles.personaText, persona === 'senior-sen' && { color: '#fbbf24' }]}>
              🟡 Senior-Sen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mode & Switch Row */}
        <View style={styles.switchRow}>
          <TouchableOpacity
            style={[
              styles.switchBtn,
              manualCoreToggle && { borderColor: '#A855F7', backgroundColor: 'rgba(168,85,247,0.1)' },
            ]}
            onPress={() => setManualCoreToggle(true)}
          >
            <Text style={[styles.switchText, manualCoreToggle && { color: '#A855F7' }]}>
              🔮 Siberpunk Çekirdek
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.switchBtn,
              !manualCoreToggle && { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' },
            ]}
            onPress={() => setManualCoreToggle(false)}
          >
            <Text style={[styles.switchText, !manualCoreToggle && { color: '#3b82f6' }]}>
              👤 3D Karakter
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3D Scene View */}
        <View style={[styles.canvasContainer, { shadowColor: personaColor }]}>
          {manualCoreToggle ? (
            // Holographic Cyberpunk visualizer core (Works 100% and changes neon color instantly!)
            <Canvas camera={{ position: [0, 0, 2.7] }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[1, 2, 3]} intensity={1.2} />
              <pointLight
                position={[-2, 1, 2]}
                color={persona === 'junior-sen' ? '#10B981' : '#F59E0B'}
                intensity={1.5}
              />
              <Fallback3DModel volumeRef={volumeRef} isSpeaking={isSpeaking} persona={persona} />
            </Canvas>
          ) : (
            // standard avatar loader rendering your custom GLB character model
            <CanvasErrorBoundary
              fallback={
                <Canvas camera={{ position: [0, 0, 2.7] }}>
                  <ambientLight intensity={0.4} />
                  <directionalLight position={[1, 2, 3]} intensity={1.2} />
                  <pointLight
                    position={[-2, 1, 2]}
                    color={persona === 'junior-sen' ? '#10B981' : '#F59E0B'}
                    intensity={1.5}
                  />
                  <Fallback3DModel volumeRef={volumeRef} isSpeaking={isSpeaking} persona={persona} />
                </Canvas>
              }
            >
              <Canvas camera={{ position: [0, 0.15, 2.0] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 3, 4]} intensity={1.5} />
                <pointLight
                  position={[-2, 1.5, 2]}
                  color={persona === 'junior-sen' ? '#4ade80' : '#fbbf24'}
                  intensity={2}
                />
                <AvatarGLB 
                  volumeRef={volumeRef} 
                  isSpeaking={isSpeaking} 
                  persona={persona} 
                  onNoMorphTargets={() => {
                    console.log('[VoiceScreen] Morph targets missing in GLB. Kept rendering character model.');
                  }}
                />
              </Canvas>
            </CanvasErrorBoundary>
          )}
          
          {/* Avatar Persona Label Overlay */}
          <View style={[styles.overlayLabel, { borderColor: personaColor }]}>
            <Text style={[styles.overlayText, { color: personaColor }]}>
              {manualCoreToggle
                ? `🔮 AI CORE — ${persona === 'junior-sen' ? 'JUNIOR' : 'SENIOR'}`
                : `👤 3D MODEL — ${persona === 'junior-sen' ? 'JUNIOR' : 'SENIOR'}`}
            </Text>
          </View>
        </View>

        {/* Visualizer and Record Controls */}
        <View style={styles.bottomControlCard}>
          {/* Waveform Visualizer */}
          <View style={styles.visualizerContainer}>
            {barHeights.map((bh, idx) => (
              <Animated.View
                key={idx}
                style={[
                  styles.visualizerBar,
                  {
                    height: bh,
                    backgroundColor: personaColor,
                  },
                ]}
              />
            ))}
          </View>

          {/* Record Dictation Button */}
          <View style={styles.recordRow}>
            {isRecording ? (
              <TouchableOpacity style={[styles.micBtn, styles.recordingActive]} onPress={stopRecording}>
                <Text style={styles.micText}>⏹️ Kaydı Bitir</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.micBtn, { borderColor: personaColor }]}
                onPress={startRecording}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={personaColor} />
                ) : (
                  <Text style={[styles.micText, { color: personaColor }]}>🎙️ Rapor Dikte Et</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Transcription Display */}
          <ScrollView style={styles.reportPreview} contentContainerStyle={{ paddingBottom: 16 }}>
            {reportText ? (
              <View>
                <Text style={styles.reportHeader}>Çözümlenen Markdown Raporu:</Text>
                <Text style={styles.reportContent}>{reportText}</Text>
              </View>
            ) : (
              <Text style={styles.reportPlaceholder}>
                Mikrofona dokunun ve bir hata veya geliştirme talebi söyleyin. Örneğin: "Ekranın altındaki buton görünmüyor, rengini yeşil yap."
              </Text>
            )}
          </ScrollView>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#bbb',
    fontSize: 13,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  personaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 12,
  },
  personaBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  personaText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '700',
  },
  canvasContainer: {
    flex: 1.1,
    marginHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  switchBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  switchText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
  },
  overlayLabel: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(8, 8, 20, 0.7)',
  },
  overlayText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  bottomControlCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 64,
    width: '100%',
  },
  visualizerBar: {
    width: 6,
    borderRadius: 3,
    minHeight: 4,
  },
  recordRow: {
    marginVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  recordingActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  micText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  reportPreview: {
    flex: 1,
    width: '100%',
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  reportHeader: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    opacity: 0.7,
  },
  reportContent: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 18,
  },
  reportPlaceholder: {
    color: colors.textDim,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 12,
  },
});
