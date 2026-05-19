import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Voice from './Voice';

export default function NoktaAvatar() {
  const group    = useRef();
  const mouth    = useRef();
  const antenna  = useRef();
  const eyeL     = useRef();
  const eyeR     = useRef();

  const [reaction, setReaction] = useState('idle'); // 'idle', 'sleep', 'tickle', 'angry', 'love'
  const tickleTime = useRef(0);
  const angryTime = useRef(0);
  const loveTime = useRef(0);
  const idleTimer = useRef(0);
  
  // Interaction tracking
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const petDistance = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });

  // Sleep logic: sleep after 10 seconds of no audio
  useEffect(() => {
    const checkIdle = setInterval(() => {
      if (Voice.isPlaying || Voice.getLevel() > 0.05 || reaction === 'tickle') {
        idleTimer.current = 0;
        if (reaction === 'sleep') setReaction('idle');
      } else {
        idleTimer.current += 1;
        if (idleTimer.current > 10 && reaction === 'idle') {
          setReaction('sleep');
        }
      }
    }, 1000);
    return () => clearInterval(checkIdle);
  }, [reaction]);

  useFrame(({ clock, mouse, viewport }) => {
    const t = clock.getElapsedTime();

    // Tickle & Angry shake logic
    let shakeX = 0, shakeY = 0;
    if (reaction === 'tickle') {
      tickleTime.current -= 0.03;
      shakeX = Math.sin(t * 50) * 0.06 * tickleTime.current;
      shakeY = Math.cos(t * 45) * 0.06 * tickleTime.current;
      if (tickleTime.current <= 0) {
        setReaction('idle');
        idleTimer.current = 0;
      }
    } else if (reaction === 'angry') {
      angryTime.current -= 0.01; // slower decay for 5 seconds (500 frames approx)
      shakeX = Math.sin(t * 70) * 0.03; // constant rapid vibration
      shakeY = Math.cos(t * 60) * 0.03;
      if (angryTime.current <= 0) {
        setReaction('idle');
        idleTimer.current = 0;
      }
    } else if (reaction === 'love') {
      loveTime.current -= 0.01;
      shakeY = Math.sin(t * 3) * 0.04; // slow, happy float
      if (loveTime.current <= 0) {
        setReaction('idle');
        idleTimer.current = 0;
      }
    }

    // Head movement & Floating
    if (group.current) {
      const floatY = reaction === 'sleep' ? -0.15 : Math.sin(t * 1.8) * 0.06;
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, floatY + shakeY, 0.1);
      group.current.position.x = shakeX;

      // When sleeping or loving, look differently. Otherwise follow mouse.
      const tx = (reaction === 'sleep' || reaction === 'love') ? 0 : (mouse.x * viewport.width)  / 12;
      const ty = reaction === 'sleep' ? -0.25 : (reaction === 'love' ? 0.15 : (mouse.y * viewport.height) / 12);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, tx,  0.04);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -ty, 0.04);
      
      // Happy tilt
      const tz = reaction === 'love' ? Math.PI / 16 * Math.sin(t * 2) : 0;
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, tz, 0.05);
    }

    // Lip sync & Smile
    if (mouth.current) {
      if (reaction === 'sleep') {
        mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 0.2, 0.2);
      } else if (reaction === 'love') {
        mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 1.2, 0.2);
      } else {
        const lvl = Voice.getLevel();
        mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 1 + lvl * 1.8, 0.25);
      }
    }

    // Antenna glow
    if (antenna.current) {
      const lvl = Voice.getLevel();
      let target = 0.8 + Math.sin(t * 3) * 0.4; // idle
      if (reaction === 'sleep') target = 0.1;
      else if (Voice.isPlaying) target = 1.5 + lvl * 4;
      
      antenna.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        antenna.current.material.emissiveIntensity, target, 0.12
      );
    }

    // Blinking / Sleep / Angry / Love eyes
    if (eyeL.current && eyeR.current) {
      let blink = 1;
      if (reaction === 'sleep' || reaction === 'love') blink = 0.08; // Eyes closed
      else if (reaction === 'tickle') blink = 0.2; // Eyes squinted
      else if (reaction === 'angry') blink = 0.6; // Angry eyes
      else blink = Math.abs(Math.sin(t * 0.5)) < 0.04 ? 0.1 : 1; // Normal blink

      eyeL.current.scale.y = THREE.MathUtils.lerp(eyeL.current.scale.y, blink, 0.3);
      eyeR.current.scale.y = THREE.MathUtils.lerp(eyeR.current.scale.y, blink, 0.3);

      // Angry brows (rotate eyes inwards)
      const eyeRot = reaction === 'angry' ? 0.3 : 0;
      eyeL.current.rotation.z = THREE.MathUtils.lerp(eyeL.current.rotation.z, -eyeRot, 0.3);
      eyeR.current.rotation.z = THREE.MathUtils.lerp(eyeR.current.rotation.z, eyeRot, 0.3);
    }
  });

  const onPointerMove = (e) => {
    if (reaction === 'love' || reaction === 'angry') return;
    
    const dx = e.point.x - lastPos.current.x;
    const dy = e.point.y - lastPos.current.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    // Ignore huge jumps from initial entry
    if (dist < 1) {
      petDistance.current += dist;
    }
    lastPos.current = { x: e.point.x, y: e.point.y };

    if (petDistance.current > 3.0) {
      setReaction('love');
      loveTime.current = 4.0;
      petDistance.current = 0;
      idleTimer.current = 0;
    }
  };

  const onPointerDown = (e) => {
    e.stopPropagation();
    
    clickCount.current += 1;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 1000);

    if (clickCount.current >= 3) {
      setReaction('angry');
      angryTime.current = 1.0; // scales to ~5 seconds of decay
      clickCount.current = 0;
    } else if (reaction !== 'angry') {
      setReaction('tickle');
      tickleTime.current = 1.0;
    }
    idleTimer.current = 0;
  };

  const white = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.08, metalness: 0.05,
    clearcoat: 1, clearcoatRoughness: 0.08,
  });
  const blue = new THREE.MeshStandardMaterial({
    color: '#1a6bff', roughness: 0.4, metalness: 0.2,
  });
  const glow = new THREE.MeshStandardMaterial({
    color: '#1a6bff', emissive: '#1a6bff', emissiveIntensity: 1, roughness: 0.1,
  });

  return (
    <group ref={group} scale={0.75} onPointerDown={onPointerDown} onPointerMove={onPointerMove} cursor="pointer">
      {reaction === 'sleep' && (
        <Html position={[0.6, 1.2, 0]} center>
          <div style={{ color: '#1a6bff', fontSize: 24, fontWeight: 'bold', fontFamily: 'sans-serif', letterSpacing: 2, animation: 'pulse 2s infinite' }}>Zzz</div>
        </Html>
      )}

      {reaction === 'angry' && (
        <Html position={[0.6, 1.2, 0]} center>
          <div style={{ fontSize: 32, animation: 'pulse 0.5s infinite alternate' }}>💢</div>
        </Html>
      )}

      {reaction === 'love' && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', fontSize: 24, animation: 'floatHeart1 2s infinite' }}>❤️</div>
            <div style={{ position: 'absolute', fontSize: 20, animation: 'floatHeart2 2.5s infinite 0.5s' }}>💕</div>
          </div>
        </Html>
      )}

      {/* ── Head (Sphere) ── */}
      <mesh scale={[1, 0.88, 0.92]} material={white}>
        <sphereGeometry args={[1, 64, 64]} />
      </mesh>

      {/* ── Cute Animal Ears (Cones) ── */}
      <group position={[-0.45, 0.75, 0]} rotation={[0, 0, Math.PI / 6]}>
        <mesh material={white}>
          <coneGeometry args={[0.3, 0.6, 32]} />
        </mesh>
        <mesh position={[0, 0.05, 0.15]} material={new THREE.MeshStandardMaterial({color: '#ffb6c1', roughness: 0.8})}>
          <coneGeometry args={[0.2, 0.45, 32]} />
        </mesh>
      </group>

      <group position={[0.45, 0.75, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <mesh material={white}>
          <coneGeometry args={[0.3, 0.6, 32]} />
        </mesh>
        <mesh position={[0, 0.05, 0.15]} material={new THREE.MeshStandardMaterial({color: '#ffb6c1', roughness: 0.8})}>
          <coneGeometry args={[0.2, 0.45, 32]} />
        </mesh>
      </group>

      {/* ── Eyes ── */}
      <mesh ref={eyeL} position={[-0.34, 0.12, 0.87]} material={blue}>
        <capsuleGeometry args={[0.09, 0.14, 16, 16]} />
      </mesh>
      <mesh ref={eyeR} position={[0.34, 0.12, 0.87]} material={blue}>
        <capsuleGeometry args={[0.09, 0.14, 16, 16]} />
      </mesh>

      {/* ── Cute Animal Nose ── */}
      <mesh position={[0, -0.05, 0.95]} material={new THREE.MeshStandardMaterial({color: '#ffb6c1', roughness: 0.5})}>
        <sphereGeometry args={[0.08, 32, 32]} />
      </mesh>

      {/* ── Mouth (Smile/Frown) ── */}
      <mesh ref={mouth} position={[0, -0.17, 0.91]} rotation={[reaction === 'angry' ? Math.PI / 12 : -Math.PI / 12, 0, reaction === 'angry' ? 0 : Math.PI]} material={
        new THREE.MeshStandardMaterial({ color: reaction === 'angry' ? '#dc2626' : '#1a6bff', roughness: 0.7 })
      }>
        <torusGeometry args={[0.12, 0.03, 16, 32, Math.PI]} />
      </mesh>
    </group>
  );
}
