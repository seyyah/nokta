import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// HTML content for Three.js 3D model viewer with integrated OpenAI Voice Mode Visualizer inside WebView
const webViewHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #0f172a; }
    #c { display: block; width: 100%; height: 100%; }
    #viz { position: absolute; bottom: 10px; left: 5%; width: 90%; height: 80px; pointer-events: none; z-index: 2; }
    #msg { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); color: #94a3b8; font: 14px sans-serif; z-index: 3; }
    #mouth-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="canvas-container" style="width: 100%; height: 100%;"></div>
  <canvas id="mouth-overlay"></canvas>
  <div id="loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #94a3b8; font-family: sans-serif; font-size: 14px; font-weight: 500; transition: opacity 0.5s;">Avatar Yükleniyor...</div>
  <div id="viz" style="position: absolute; bottom: 10px; left: 5%; width: 90%; height: 80px; pointer-events: none; z-index: 2;">
    <canvas id="visualizer-canvas" style="width: 100%; height: 100%;"></canvas>
  </div>
  <script>
    let scene, camera, renderer, model, controls;
    let headBone = null;
    let neckBone = null;
    let spineBone = null;
    let leftArm = null;
    let rightArm = null;
    let leftForeArm = null;
    let rightForeArm = null;
    let ambientLight, hemiLight, dirLight, pointLight;
    let clock = new THREE.Clock();
    let isSpeaking = false;
    let micRms = 0;
    let targetRms = 0;
    let currentPersona = 'junior';
    let cameraTargetY = 1.5;
    let initialHeadRotQ = new THREE.Quaternion();
    let initialNeckRotQ = new THREE.Quaternion();
    let jawOpen = 0;  // current jaw open amount 0-1
    let targetJawOpen = 0;
    let animMixer = null;
    let visemeTimer = 0;

    // Canvas visualizer details
    const vizCanvas = document.getElementById('visualizer-canvas');
    const ctx = vizCanvas.getContext('2d');
    let waveOffset = 0;

    // Mouth overlay canvas
    const mouthCanvas = document.getElementById('mouth-overlay');
    const mouthCtx = mouthCanvas.getContext('2d');
    let mouthOpenAmount = 0; // smoothed 0-1

    function logToRN(msg) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: msg }));
      } else {
        window.parent.postMessage(JSON.stringify({ type: 'log', message: msg }), '*');
      }
    }

    function init() {
      const container = document.getElementById('canvas-container');
      
      // Setup visualizer canvas pixel density
      const dpr = window.devicePixelRatio || 1;
      vizCanvas.width = vizCanvas.clientWidth * dpr;
      vizCanvas.height = vizCanvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);

      // Setup mouth overlay canvas
      mouthCanvas.width = container.clientWidth * dpr;
      mouthCanvas.height = container.clientHeight * dpr;
      mouthCtx.scale(dpr, dpr);

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
      camera.position.set(0, 1.5, 0.65);

      ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
      hemiLight.position.set(0, 20, 0);
      scene.add(hemiLight);

      dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(3, 10, 10);
      scene.add(dirLight);

      pointLight = new THREE.PointLight(0x00ffff, 1.5, 10);
      pointLight.position.set(-3, 3, -3);
      scene.add(pointLight);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 0.1;
      controls.maxDistance = 5;
      controls.enablePan = true;

      window.addEventListener('resize', onWindowResize);
      logToRN("Three.js & Canvas Visualizer & OrbitControls Initialized");

      animate();
    }

    function onWindowResize() {
      const container = document.getElementById('canvas-container');
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      
      const dpr = window.devicePixelRatio || 1;
      vizCanvas.width = vizCanvas.clientWidth * dpr;
      vizCanvas.height = vizCanvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);

      mouthCanvas.width = container.clientWidth * dpr;
      mouthCanvas.height = container.clientHeight * dpr;
      mouthCtx.scale(dpr, dpr);
    }

    function updateCameraPosition(persona) {
      if (!model) return;
      
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      
      if (persona === 'junior') {
        // Closer portrait view of the face
        camera.position.set(center.x, cameraTargetY + 0.05, center.z + 0.65);
        if (controls) {
          controls.target.set(center.x, cameraTargetY, center.z);
        } else {
          camera.lookAt(center.x, cameraTargetY, center.z);
        }
      } else {
        // Wider upper body view
        camera.position.set(center.x, cameraTargetY + 0.12, center.z + 0.90);
        if (controls) {
          controls.target.set(center.x, cameraTargetY - 0.05, center.z);
        } else {
          camera.lookAt(center.x, cameraTargetY - 0.05, center.z);
        }
      }
      if (controls) {
        controls.update();
      }
    }

    function setupModel(gltf) {
      model = gltf.scene;
      model.position.set(0, 0, 0);
      // Face the camera directly
      model.rotation.y = 0;
      scene.add(model);
      
      headBone = null;
      neckBone = null;
      spineBone = null;
      leftArm = null;
      rightArm = null;
      leftForeArm = null;
      rightForeArm = null;

      model.traverse(function(child) {
        if (!child.isBone) return;
        const name = child.name; // exact name
        logToRN('[BONE] ' + name);
        if (name === 'Head') {
          headBone = child;
          initialHeadRotQ.copy(child.quaternion);
        } else if (name === 'Neck') {
          neckBone = child;
          initialNeckRotQ.copy(child.quaternion);
        } else if (name === 'Spine' || name === 'Spine1' || name === 'Spine2') {
          spineBone = child; // last one wins (Spine2)
        } else if (name === 'LeftArm') {
          leftArm = child;
        } else if (name === 'RightArm') {
          rightArm = child;
        } else if (name === 'LeftForeArm') {
          leftForeArm = child;
        } else if (name === 'RightForeArm') {
          rightForeArm = child;
        }
      });

      logToRN('headBone found: ' + (headBone ? 'YES ' + headBone.name : 'NO'));
      logToRN('neckBone found: ' + (neckBone ? 'YES ' + neckBone.name : 'NO'));

      // Initial arm pose
      if (leftArm) { leftArm.rotation.z = -1.2; leftArm.rotation.y = 0.1; }
      if (rightArm) { rightArm.rotation.z = 1.2; rightArm.rotation.y = -0.1; }
      if (leftForeArm) { leftForeArm.rotation.z = -0.15; }
      if (rightForeArm) { rightForeArm.rotation.z = 0.15; }

      // Play built-in idle animation (Action.004)
      if (gltf.animations && gltf.animations.length > 0) {
        animMixer = new THREE.AnimationMixer(model);
        const action = animMixer.clipAction(gltf.animations[0]);
        action.play();
        logToRN('Playing animation: ' + gltf.animations[0].name);
      }

      // Camera auto-framing
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      logToRN('Model size=' + size.x.toFixed(2) + 'x' + size.y.toFixed(2) + 'x' + size.z.toFixed(2));

      // Head is about 91% height of model
      cameraTargetY = box.min.y + size.y * 0.91;
      if (headBone) {
        const headPos = new THREE.Vector3();
        headBone.getWorldPosition(headPos);
        cameraTargetY = headPos.y;
        logToRN('headBone world Y: ' + headPos.y.toFixed(3));
      }

      updateCameraPosition(currentPersona);

      document.getElementById('loading').style.opacity = 0;
      setTimeout(() => { document.getElementById('loading').style.display = 'none'; }, 500);
    }

    function loadModelFromBase64(base64Data) {
      logToRN("Loading model from Base64 string...");
      try {
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const loader = new THREE.GLTFLoader();
        loader.parse(bytes.buffer, '', function(gltf) {
          logToRN("GLTF parsed successfully!");
          setupModel(gltf);
        }, function(error) {
          logToRN("GLTF loader error: " + error.message);
        });
      } catch (err) {
        logToRN("GLTF base64 parser error: " + err.message);
      }
    }

    function loadModelFromUrl(url) {
      logToRN("Loading model from URL: " + url);
      try {
        const loader = new THREE.GLTFLoader();
        loader.load(url, function(gltf) {
          logToRN("GLTF loaded from URL successfully!");
          setupModel(gltf);
        }, undefined, function(error) {
          logToRN("GLTF loader URL error: " + (error ? error.message : "unknown error"));
        });
      } catch (err) {
        logToRN("GLTF URL loader error: " + err.message);
      }
    }

    function updatePersonaColors(persona) {
      currentPersona = persona;
      if (persona === 'junior') {
        ambientLight.color.setHex(0x38bdf8);
        ambientLight.intensity = 0.6;
        dirLight.color.setHex(0xec4899);
        dirLight.intensity = 1.1;
        pointLight.color.setHex(0x06b6d4);
        pointLight.position.set(-1.5, 2.0, 1.0);
        pointLight.intensity = 1.4;
      } else { // Senior
        ambientLight.color.setHex(0xffffff);
        ambientLight.intensity = 0.5;
        dirLight.color.setHex(0xfba924);
        dirLight.intensity = 1.0;
        pointLight.color.setHex(0xffedd5);
        pointLight.position.set(-2.0, 1.8, -1.0);
        pointLight.intensity = 0.6;
      }
      updateCameraPosition(persona);
    }

    // Render OpenAI Voice Mode Siri-like Canvas Waves
    function drawVoiceVisualizer(rms) {
      const w = vizCanvas.clientWidth;
      const h = vizCanvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Sönük/Quiet vs Tepkisel/Active styling
      const isActive = rms > 0.02 || isSpeaking;
      const waveCount = currentPersona === 'junior' ? 4 : 3;
      const baseAmp = isActive ? (30 * rms + 8) : 2.5; // Faded small amplitude when quiet
      const baseSpeed = currentPersona === 'junior' ? (isActive ? 0.22 : 0.04) : (isActive ? 0.12 : 0.02);

      waveOffset += baseSpeed;

      // Draw glowing waves
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        const factor = (i + 1) / waveCount;
        
        // Select color gradients depending on persona
        let strokeColor;
        if (currentPersona === 'junior') {
          // Cyan, magenta, neon violet
          const hue = 180 + i * 40;
          strokeColor = 'hsla(' + hue + ', 90%, 60%, ' + (isActive ? (0.7 - i * 0.1) : 0.25) + ')';
        } else {
          // Golden, amber, warm yellow
          const hue = 35 + i * 15;
          strokeColor = 'hsla(' + hue + ', 85%, 55%, ' + (isActive ? (0.65 - i * 0.1) : 0.25) + ')';
        }

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = isActive ? (2.5 - i * 0.4) : 1.2;
        
        // Siri-like smooth curve
        for (let x = 0; x < w; x++) {
          // Compute wave curve responsive to RMS
          const sinParam = (x / w) * Math.PI * 2.5 + waveOffset + i * 1.5;
          const envelope = Math.sin((x / w) * Math.PI); // Pin ends to zero for clean screen edges
          const y = h / 2 + Math.sin(sinParam) * baseAmp * factor * envelope;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();
      const delta = clock.getDelta();
      
      // Update animation mixer (built-in idle animation)
      if (animMixer) animMixer.update(delta);

      // Maintain natural arm pose on every frame (override animation mixer)
      if (leftArm) { leftArm.rotation.z = -1.2; leftArm.rotation.y = 0.1; }
      if (rightArm) { rightArm.rotation.z = 1.2; rightArm.rotation.y = -0.1; }
      if (leftForeArm) { leftForeArm.rotation.z = -0.15; }
      if (rightForeArm) { rightForeArm.rotation.z = 0.15; }
      
      // Lerp RMS value
      micRms = THREE.MathUtils.lerp(micRms, targetRms, 0.25);

      // Canvas wave visualizer
      drawVoiceVisualizer(micRms);

      // Body subtle sway (additive on top of animation)
      if (model) {
        if (currentPersona === 'junior') {
          model.position.y = Math.sin(time * 1.5) * 0.004;
        } else {
          model.position.y = Math.sin(time * 0.8) * 0.002;
        }
        model.rotation.y = 0 + Math.sin(time * 0.35) * 0.04;
      }

      // === MOUTH OVERLAY ===
      // This avatar has NO morph targets and NO jaw bone.
      // Draw a 2D mouth overlay on a transparent canvas positioned over the 3D scene.
      // Project the head bone world position to 2D, then draw mouth slightly below it.
      if (headBone && renderer) {
        let mouthTarget = 0;

        if (isSpeaking) {
          // TTS speaking: fast oscillating mouth
          mouthTarget = 0.3 + Math.abs(Math.sin(time * 12)) * 0.7;
        } else if (micRms > 0.01) {
          // Microphone input: map RMS to mouth opening
          mouthTarget = Math.min(micRms * 3.0, 1.0);
        } else {
          // Idle: mouth closed
          mouthTarget = 0;
        }

        // Smooth lerp
        mouthOpenAmount = mouthOpenAmount + (mouthTarget - mouthOpenAmount) * (isSpeaking ? 0.4 : 0.2);

        // Project head bone position to 2D screen coordinates
        const headWorldPos = new THREE.Vector3();
        headBone.getWorldPosition(headWorldPos);

        // Offset down from head center to where the mouth approximately is
        // (mouth is about 8-10% of head height below center)
        headWorldPos.y -= 0.045;

        const screenPos = headWorldPos.clone().project(camera);
        const cw = renderer.domElement.clientWidth;
        const ch = renderer.domElement.clientHeight;
        const sx = (screenPos.x * 0.5 + 0.5) * cw;
        const sy = (-screenPos.y * 0.5 + 0.5) * ch;

        // Clear the mouth overlay canvas
        mouthCtx.clearRect(0, 0, cw, ch);

        // Only draw if mouth is open (speaking or mic active)
        if (mouthOpenAmount > 0.02) {
          const mouthW = 12 + mouthOpenAmount * 4; // width grows slightly when open
          const mouthH = 2 + mouthOpenAmount * 10; // height from thin line to open

          // Choose mouth color based on persona
          const mouthColor = currentPersona === 'junior'
            ? 'rgba(30, 10, 15, ' + (0.6 + mouthOpenAmount * 0.3) + ')'
            : 'rgba(25, 12, 8, ' + (0.6 + mouthOpenAmount * 0.3) + ')';

          mouthCtx.save();
          mouthCtx.fillStyle = mouthColor;
          mouthCtx.beginPath();
          // Draw an elliptical mouth shape
          mouthCtx.ellipse(sx, sy, mouthW / 2, mouthH / 2, 0, 0, Math.PI * 2);
          mouthCtx.fill();

          // Add a subtle inner dark for depth when mouth is more open
          if (mouthOpenAmount > 0.3) {
            const innerColor = 'rgba(10, 2, 5, ' + (mouthOpenAmount * 0.5) + ')';
            mouthCtx.fillStyle = innerColor;
            mouthCtx.beginPath();
            mouthCtx.ellipse(sx, sy, mouthW * 0.35, mouthH * 0.4, 0, 0, Math.PI * 2);
            mouthCtx.fill();
          }
          mouthCtx.restore();
        }
      }

      if (controls) controls.update();
      renderer.render(scene, camera);
    }

    // Message handler from React Native
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'loadModel') {
          loadModelFromBase64(data.base64);
        } else if (data.type === 'loadModelUrl') {
          loadModelFromUrl(data.url);
        } else if (data.type === 'rms') {
          targetRms = data.value;
        } else if (data.type === 'speaking') {
          isSpeaking = data.value;
          logToRN('isSpeaking set to: ' + isSpeaking);
        } else if (data.type === 'persona') {
          updatePersonaColors(data.value);
        }
      } catch (err) {
        logToRN("WebView Message parse error: " + err.message);
      }
    });

    window.onload = function() {
      init();
      // Signal React that Three.js is fully initialized and ready for messages
      const readyMsg = JSON.stringify({ type: 'ready' });
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(readyMsg);
      } else {
        window.parent.postMessage(readyMsg, '*');
      }
    };
  </script>
</body>
</html>
`;

export default function AvatarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  
  const webViewRef = useRef<WebView>(null);
  
  // App States
  const [activePersona, setActivePersona] = useState<'junior' | 'senior'>('junior');
  const [isRecording, setIsRecording] = useState(false);
  const [rms, setRms] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [dictatedText, setDictatedText] = useState('');
  
  // Reports & Demo States
  const [selectedScenario, setSelectedScenario] = useState('mic');
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [isSimulatingSTT, setIsSimulatingSTT] = useState(false);

  // References for Web Audio API & Web Speech API
  const recordingRef = useRef<Audio.Recording | null>(null);
  const meterIntervalRef = useRef<any>(null);
  const webAudioStreamRef = useRef<any>(null);
  const webAudioContextRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // Helper to post messages to WebView / iframe
  const postToWebView = (data: any) => {
    const message = JSON.stringify(data);
    if (Platform.OS === 'web') {
      const iframe = document.getElementById('avatar-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(message, '*');
      }
    } else {
      webViewRef.current?.postMessage(message);
    }
  };

  // Read bundled avatar.glb and push to WebView
  const sendModelToWebView = async () => {
    try {
      console.log('Resolving avatar.glb file path...');
      const { Asset } = require('expo-asset');
      
      // Load GLB asset
      const asset = Asset.fromModule(require('../../assets/avatar.glb'));
      await asset.downloadAsync();
      
      if (Platform.OS === 'web') {
        const rawUrl = asset.localUri || asset.uri;
        // Build absolute URL so the iframe (different origin context) can fetch it
        let url = rawUrl;
        if (rawUrl && !rawUrl.startsWith('http') && typeof window !== 'undefined') {
          url = `${window.location.origin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
        }
        console.log('Model URL for iframe:', url);
        postToWebView({ type: 'loadModelUrl', url });
        setModelLoaded(true);
        postToWebView({ type: 'persona', value: activePersona });
        return;
      }
      
      if (!asset.localUri) {
        console.warn('Local model path not available. Activating fallback renderer.');
        setModelLoaded(true);
        postToWebView({ type: 'persona', value: activePersona });
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Model parsed. Sending Base64 to renderer...');
      postToWebView({ type: 'loadModel', base64: base64 });
      setModelLoaded(true);
      postToWebView({ type: 'persona', value: activePersona });
    } catch (err) {
      console.error('Failed to load asset GLB:', err);
      setModelLoaded(true);
      postToWebView({ type: 'persona', value: activePersona });
    }
  };

  // onWebViewLoad is only used as a fallback for native WebView.
  // For web iframe, we rely on the 'ready' postMessage from Three.js.
  const onWebViewLoad = () => {
    if (Platform.OS !== 'web') {
      // Native: wait for WebView to fully initialize JS context
      setTimeout(() => {
        sendModelToWebView();
      }, 1200);
    }
    // Web: model is sent when iframe posts {type:'ready'} — see useEffect handler
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'log') {
        console.log('[ThreeJS WebView]', data.message);
      } else if (data.type === 'ready') {
        // Three.js initialized in native WebView — now safe to send model
        console.log('[ThreeJS] Native WebView ready, loading model...');
        sendModelToWebView();
      }
    } catch (e) {
      console.log('WebView unparsed log:', event.nativeEvent?.data);
    }
  };

  // Microphone Audio Setup
  const requestPermissions = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });
      }
    } catch (e) {
      console.warn('Audio driver permissions refused:', e);
    }
  };

  useEffect(() => {
    requestPermissions();
    
    // Register message handler for Web iframe
    let handleWebMessage: any;
    if (Platform.OS === 'web') {
      handleWebMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log') {
            console.log('[ThreeJS WebIFrame]', data.message);
          } else if (data.type === 'ready') {
            // Three.js initialized in iframe — NOW safe to send model URL
            console.log('[ThreeJS] Web iframe ready, loading model...');
            sendModelToWebView();
          }
        } catch (e) {
          // ignore non-JSON messages from other iframes
        }
      };
      window.addEventListener('message', handleWebMessage);
    }

    return () => {
      stopRecording();
      Speech.stop();
      // Also cancel browser native speechSynthesis on web
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (Platform.OS === 'web' && handleWebMessage) {
        window.removeEventListener('message', handleWebMessage);
      }
    };
  }, []);

  // Speak welcome prompt depending on selected Persona
  // Uses native browser SpeechSynthesis on web for reliable speaking state,
  // falls back to expo-speech on native platforms.
  const triggerPersonaTTS = (persona: 'junior' | 'senior') => {
    // Stop any ongoing speech first
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    Speech.stop();
    
    // Config pitch & rate from PERSONAS.md
    const rate = persona === 'junior' ? 1.15 : 0.80;
    const pitch = persona === 'junior' ? 1.30 : 0.85;

    const speechText = persona === 'junior'
      ? 'Hey, selam! Ben Junior Sibel. Onboarding ve arayüzdeki hataları hemen otonom olarak çözelim mi? Haydi mikrofona konuş!'
      : 'Merhaba. Ben Senior Sibel. Sistemin durumunu ve mimari tutarsızlıkları analiz etmek için hazırım. Dinliyorum.';

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      // Use native browser SpeechSynthesis API directly for reliable event callbacks
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = 'tr-TR';
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Safety timeout: if speech doesn't end within 30s, force stop
      let safetyTimer: any = null;

      utterance.onstart = () => {
        console.log('[TTS] Speech started — enabling mouth animation');
        postToWebView({ type: 'speaking', value: true });
      };

      utterance.onend = () => {
        console.log('[TTS] Speech ended — disabling mouth animation');
        postToWebView({ type: 'speaking', value: false });
        if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      };

      utterance.onerror = (e) => {
        console.warn('[TTS] Speech error:', e);
        postToWebView({ type: 'speaking', value: false });
        if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
      };

      // Set speaking immediately so mouth starts moving right away
      postToWebView({ type: 'speaking', value: true });
      window.speechSynthesis.speak(utterance);

      // Safety fallback: stop mouth animation after 30 seconds max
      safetyTimer = setTimeout(() => {
        postToWebView({ type: 'speaking', value: false });
      }, 30000);

    } else {
      // Native platforms: use expo-speech
      postToWebView({ type: 'speaking', value: true });

      Speech.speak(speechText, {
        language: 'tr-TR',
        rate: rate,
        pitch: pitch,
        onDone: () => {
          postToWebView({ type: 'speaking', value: false });
        },
        onStopped: () => {
          postToWebView({ type: 'speaking', value: false });
        },
        onError: () => {
          postToWebView({ type: 'speaking', value: false });
        },
      });
    }
  };

  const handlePersonaSwitch = (persona: 'junior' | 'senior') => {
    setActivePersona(persona);
    postToWebView({ type: 'persona', value: persona });
    triggerPersonaTTS(persona);
  };

  // Real Web Speech Recognition (STT) and Web Audio API (RMS) for Browser
  const startWebSpeechAndAudio = async () => {
    try {
      Speech.stop();
      setIsRecording(true);
      setDictatedText('');
      setAuditReport(null);

      // 1. Web Audio API for real-time RMS
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      webAudioStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      webAudioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.2;
      analyser.fftSize = 256;

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioCtx.destination);

      processor.onaudioprocess = () => {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;
        const length = array.length;
        for (let i = 0; i < length; i++) {
          values += array[i];
        }
        const average = values / length;
        const rmsValue = average / 128; // Scale to 0 - 1.0 range
        // Apply noise gate filter (noise floor ~0.065) to prevent mouth twitching in silence
        const filteredRms = rmsValue < 0.065 ? 0 : (rmsValue - 0.065) * 1.25;
        const clampedRms = Math.min(Math.max(filteredRms, 0), 1.0);
        setRms(clampedRms);
        postToWebView({ type: 'rms', value: clampedRms });
      };

      // 2. Web Speech API for real Speech-to-Text
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        console.log("Initializing Web Speech API...");
        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let textResult = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            textResult += event.results[i][0].transcript;
          }
          if (textResult) {
            setDictatedText(textResult);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        console.warn("Web Speech API not supported in this browser. Falling back to scenario STT.");
      }

    } catch (err) {
      console.warn("Web speech/audio initialization failed. Using simulated STT fallback.", err);
      setIsRecording(false);
      startMockRms();
    }
  };

  // Low latency voice recording & visualizer meter for native devices
  const startRecordingNative = async () => {
    try {
      Speech.stop();
      setIsRecording(true);
      setDictatedText('Ses dinleniyor, dikte ediliyor...');
      setAuditReport(null);

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });

      recordingRef.current = recording;
      await recording.startAsync();

      // Read RMS metering every 30ms (sub-50ms latency target!)
      meterIntervalRef.current = setInterval(async () => {
        if (recording) {
          const status = await recording.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            const db = status.metering;
            const normalized = Math.max(0, (db + 60) / 60); 
            // Apply noise gate filter (noise floor ~0.065) to prevent mouth twitching in silence
            const filteredRms = normalized < 0.065 ? 0 : (normalized - 0.065) * 1.25;
            const clampedRms = Math.min(Math.max(filteredRms, 0), 1.0);
            setRms(clampedRms);

            // Post RMS value directly to WebView Three.js script
            postToWebView({ type: 'rms', value: clampedRms });
          }
        }
      }, 30);

    } catch (err) {
      console.error('Recording initialization failed, fallback to simulated metering:', err);
      setIsRecording(false);
      startMockRms();
    }
  };

  // Unified start button handler
  const handleStartRecording = () => {
    if (Platform.OS === 'web') {
      startWebSpeechAndAudio();
    } else {
      startRecordingNative();
    }
  };

  // Simulated low-latency RMS metering for web and emulator fallbacks
  const startMockRms = () => {
    setIsRecording(true);
    setDictatedText('Ses dinleniyor (Simülasyon Aktif)...');
    
    let count = 0;
    meterIntervalRef.current = setInterval(() => {
      count++;
      // Natural speech rhythm simulation
      const baseRms = Math.abs(Math.sin(count * 0.4)) * 0.6;
      const noise = Math.random() * 0.25;
      const simulatedRms = Math.min(baseRms + noise, 0.85);

      setRms(simulatedRms);
      postToWebView({ type: 'rms', value: simulatedRms });
    }, 30); // 30ms fast updates
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setRms(0);
    postToWebView({ type: 'rms', value: 0 });

    // Release Web Audio and Web Speech instances
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (webAudioStreamRef.current) {
      try {
        webAudioStreamRef.current.getTracks().forEach((track: any) => track.stop());
      } catch (e) {}
      webAudioStreamRef.current = null;
    }
    if (webAudioContextRef.current) {
      try { webAudioContextRef.current.close(); } catch (e) {}
      webAudioContextRef.current = null;
    }

    if (meterIntervalRef.current) {
      clearInterval(meterIntervalRef.current);
      meterIntervalRef.current = null;
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        console.warn('Audio stop error:', e);
      }
      recordingRef.current = null;
    }

    // Trigger STT transcription simulation/formatting
    triggerSTTTranscription();
  };

  // Convert speech transcription or simulated scenario to standard Markdown format
  const triggerSTTTranscription = () => {
    setIsSimulatingSTT(true);
    
    setTimeout(() => {
      const dateStr = new Date().toISOString().slice(0, 10);
      let title = '';
      let body = '';

      // If user typed/spoke something through Web Speech API, encapsulate it in Markdown report format!
      if (Platform.OS === 'web' && dictatedText && dictatedText !== 'Ses dinleniyor, dikte ediliyor...') {
        title = `voice-report-${selectedScenario}.md`;
        body = `# Voice Audit Report - ${selectedScenario === 'mic' ? 'Mikrofon Hatası' : selectedScenario === 'avatar' ? 'Lipsync Gecikmesi' : 'Lottie Çökmesi'}
Tarih: ${new Date().toLocaleString()}
Dikte Eden: Sibel Yeter (Gerçek Web STT Dikte)
Öncelik: Yüksek
İlişkili Dosya: app/app/(tabs)/avatar.tsx

## Deşifre Edilen Konuşma Kaydı
"${dictatedText}"

## Önerilen Çözüm
Kullanıcı bildirimine göre ilgili bileşenin onarım döngüsünü otonom Forge sisteminde başlatmak.`;
      } else {
        // Fallback to simulated scenario texts
        if (selectedScenario === 'mic') {
          title = `voice-report-mic.md`;
          body = `# Voice Audit Report - Mikrofon Donanım Hatası
Tarih: ${new Date().toLocaleString()}
Dikte Eden: Sibel Yeter (Dikte Fallback)
Öncelik: Kritik (Tıkanıklık)
İlişkili Dosya: app/app/(tabs)/avatar.tsx

## Problem Özeti
Mikrofon metering verisi okunurken iOS/Android asenkron izin kilitlenmesi oluşuyor ve uygulama ses başlatırken donuyor.

## Tavsiye Edilen Çözüm
Kilitlenme durumunda exception fırlatmak yerine catch bloğunda mock-metering LFO dalga jeneratörünü devreye almak.`;
        } else if (selectedScenario === 'avatar') {
          title = `voice-report-avatar.md`;
          body = `# Voice Audit Report - Lipsync Gecikme Sorunu
Tarih: ${new Date().toLocaleString()}
Dikte Eden: Sibel Yeter (Dikte Fallback)
Öncelik: Yüksek
İlişkili Dosya: app/app/(tabs)/avatar.tsx

## Problem Özeti
Three.js canvas sahnesindeki blender shape mesh blend süreleri çok yüksek (damping > 0.40) olduğu için ağız hareketleri seste 250ms geriden geliyor.

## Tavsiye Edilen Çözüm
Junior personada lipsync sönümleme katsayısını 0.15'e çekip, model.glb yüklenirken meshler arası gecikmeyi minimize etmek.`;
        } else {
          title = `bug-report-lottie.md`;
          body = `# Voice Audit Report - Karşılama Lottie Hatası
Tarih: ${new Date().toLocaleString()}
Dikte Eden: Sibel Yeter (Dikte Fallback)
Öncelik: Orta
İlişkili Dosya: app/app/(tabs)/index.tsx

## Problem Özeti
Karşılama ekranına entegre edilen Lottie animasyonu yerel kütüphane eksikliğinden dolayı Android simülatöründe crash veriyor.

## Tavsiye Edilen Çözüm
Lottie yerine yerel SVG ve CSS animasyonlarını kullanacak şekilde onarım döngüsünü tetiklemek.`;
        }
      }

      setDictatedText(body);
      setAuditReport(title);
      setIsSimulatingSTT(false);
      Alert.alert('Rapor Hazır', `Dikte başarıyla deşifre edildi: ${title}`);
    }, 1200);
  };

  const handleSendToForge = () => {
    if (!auditReport) {
      Alert.alert('Hata', 'Önce bir ses kaydı alıp rapor üretmelisiniz.');
      return;
    }
    router.push({
      pathname: '/agent',
    });
  };

  // Render vertical bars in React Native with real-time responsive styling
  const renderRNVoiceVisualizer = () => {
    const barScales = [0.4, 0.7, 1.0, 0.7, 0.4];
    return (
      <View style={styles.voiceBarsContainer}>
        {barScales.map((scale, index) => {
          const minHeight = 8;
          const maxHeight = 70;
          const dynamicHeight = minHeight + rms * (maxHeight - minHeight) * scale;
          
          // Color patterns depending on persona
          let barColor = '#475569';
          if (rms > 0.02) {
            if (activePersona === 'junior') {
              const colors = ['#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1'];
              barColor = colors[index];
            } else {
              const colors = ['#f59e0b', '#d97706', '#b45309', '#fba924', '#fef08a'];
              barColor = colors[index];
            }
          }

          return (
            <View
              key={index}
              style={[
                styles.voiceBar,
                {
                  height: dynamicHeight,
                  backgroundColor: barColor,
                  opacity: rms > 0.02 ? 0.95 : 0.4,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0f1115' : '#f8fafc' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Scenario Selector */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#0f172a' }]}>
            Dikte Kayıt Senaryosu
          </Text>
          <View style={styles.scenarioRow}>
            {[
              { id: 'mic', label: 'Mikrofon Hatası' },
              { id: 'avatar', label: 'Lipsync Gecikmesi' },
              { id: 'lottie', label: 'Lottie Çökmesi' },
            ].map(sc => (
              <TouchableOpacity
                key={sc.id}
                style={[
                  styles.scenarioBadge,
                  selectedScenario === sc.id && styles.scenarioBadgeActive,
                  { borderColor: isDark ? '#2d3748' : '#e2e8f0' }
                ]}
                onPress={() => setSelectedScenario(sc.id)}>
                <Text style={[
                  styles.scenarioText,
                  selectedScenario === sc.id && { color: '#fff' },
                  { color: isDark ? '#cbd5e1' : '#475569' }
                ]}>
                  {sc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3D Model Webview viewport */}
        <View style={[styles.avatarBox, { borderColor: isDark ? '#2d3748' : '#e2e8f0' }]}>
          {Platform.OS === 'web' ? (
            <iframe
              id="avatar-iframe"
              srcDoc={webViewHtml}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: 'transparent',
              }}
              onLoad={onWebViewLoad}
            />
          ) : (
            <WebView
              ref={webViewRef}
              source={{ html: webViewHtml }}
              onLoad={onWebViewLoad}
              onMessage={handleWebViewMessage}
              style={styles.webView}
              scrollEnabled={false}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          )}
          {!modelLoaded && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#a855f7" />
              <Text style={styles.loadingText}>avatar.glb yükleniyor ve parse ediliyor...</Text>
            </View>
          )}
        </View>

        {/* OpenAI style Voice Visualizer status text */}
        <View style={styles.vizSection}>
          {renderRNVoiceVisualizer()}
          <Text style={[styles.vizStatus, { color: isRecording ? (activePersona === 'junior' ? '#ec4899' : '#fba924') : '#64748b' }]}>
            {isRecording ? 'Mikrofon Dinleniyor (Canlı/Tepkisel)' : 'Sessiz Modda (Sönük)'}
          </Text>
        </View>

        {/* Persona triggers */}
        <View style={styles.controlsGrid}>
          <TouchableOpacity
            style={[
              styles.controlBtn,
              { backgroundColor: activePersona === 'junior' ? '#ec4899' : isDark ? '#1a1d24' : '#fff' },
            ]}
            onPress={() => handlePersonaSwitch('junior')}>
            <Ionicons name="sparkles" size={18} color={activePersona === 'junior' ? '#fff' : '#64748b'} />
            <Text style={[styles.btnText, { color: activePersona === 'junior' ? '#fff' : isDark ? '#cbd5e1' : '#475569' }]}>
              Junior Sibel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlBtn,
              { backgroundColor: activePersona === 'senior' ? '#fba924' : isDark ? '#1a1d24' : '#fff' },
            ]}
            onPress={() => handlePersonaSwitch('senior')}>
            <Ionicons name="ribbon" size={18} color={activePersona === 'senior' ? '#fff' : '#64748b'} />
            <Text style={[styles.btnText, { color: activePersona === 'senior' ? '#fff' : isDark ? '#cbd5e1' : '#475569' }]}>
              Senior Sibel
            </Text>
          </TouchableOpacity>
        </View>

        {/* Interactive recording controller */}
        <View style={[styles.recordPanel, { backgroundColor: isDark ? '#1a1d24' : '#fff' }]}>
          <Text style={[styles.panelTitle, { color: isDark ? '#fff' : '#0f172a' }]}>
            Sesli Dikte ve Raporlama (Voice-to-Markdown)
          </Text>
          <Text style={styles.panelDesc}>
            Mikrofon tuşuna basarak denetim raporu dikte edebilirsiniz. {Platform.OS === 'web' ? 'Gerçek Web Speech API ile sesiniz yazıya çevrilecektir.' : 'Seçtiğiniz senaryoya göre anında Markdown kod bloğu üretilecektir.'}
          </Text>

          <View style={styles.recordActionRow}>
            <TouchableOpacity
              style={[
                styles.micBtn,
                { backgroundColor: isRecording ? '#ef4444' : '#a855f7' },
              ]}
              onPress={isRecording ? stopRecording : handleStartRecording}>
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.dictateStatusWrapper}>
              <Text style={[styles.dictateLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Durum:</Text>
              <Text style={[styles.dictateValue, { color: isDark ? '#fff' : '#0f172a' }]} numberOfLines={1}>
                {isRecording ? 'Deşifre Yapılıyor...' : isSimulatingSTT ? 'STT İşleniyor...' : auditReport ? `Rapor Hazır: ${auditReport}` : 'Kayda Hazır'}
              </Text>
            </View>
          </View>

          {isSimulatingSTT && (
            <View style={styles.sttLoader}>
              <ActivityIndicator size="small" color="#a855f7" />
              <Text style={{ color: '#a855f7', fontSize: 12, fontWeight: 'bold' }}>Deşifre ediliyor...</Text>
            </View>
          )}

          {dictatedText !== '' && !isSimulatingSTT && (
            <View style={[styles.transcriptBox, { backgroundColor: isDark ? '#0f1115' : '#f8fafc' }]}>
              <Text style={[styles.transcriptText, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                {dictatedText}
              </Text>
              <TouchableOpacity style={styles.sendForgeBtn} onPress={handleSendToForge}>
                <Ionicons name="paper-plane" size={14} color="#fff" />
                <Text style={styles.sendForgeText}>Raporu Forge Ajanına Gönder</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scenarioRow: {
    flexDirection: 'row',
    gap: 8,
  },
  scenarioBadge: {
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  scenarioBadgeActive: {
    backgroundColor: '#a855f7',
    borderColor: '#a855f7',
  },
  scenarioText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarBox: {
    height: 330,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    marginBottom: 16,
    position: 'relative',
    backgroundColor: '#0f1115',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 17, 21, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  vizSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    gap: 10,
  },
  voiceBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 70,
  },
  voiceBar: {
    width: 6,
    borderRadius: 3,
  },
  vizStatus: {
    fontSize: 10,
    fontWeight: 'black',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  btnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  recordPanel: {
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  panelDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 16,
  },
  recordActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  micBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dictateStatusWrapper: {
    flex: 1,
    gap: 3,
  },
  dictateLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  dictateValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  sttLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  transcriptBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  transcriptText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  sendForgeBtn: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  sendForgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
