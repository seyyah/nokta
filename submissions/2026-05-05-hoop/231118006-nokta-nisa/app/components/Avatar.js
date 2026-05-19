import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';

export default function Avatar({ isTalking, audioLevel }) {
  const headRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const [mood, setMood] = useState('NORMAL'); 
  const [jump, setJump] = useState(0);
  const jumpRef = useRef(0);

  const handleTouch = () => {
    setMood('HAPPY');
    setJump(1);
    setTimeout(() => {
      setMood('NORMAL');
      setJump(0);
    }, 2000);
  };

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    jumpRef.current = THREE.MathUtils.lerp(jumpRef.current, jump ? Math.sin(time * 10) * 0.2 : 0, 0.1);

    if (headRef.current) {
      headRef.current.position.y = (Math.sin(time * 1.5) * 0.05) + jumpRef.current;
      headRef.current.rotation.z = Math.sin(time) * 0.03;
      if (mood === 'HAPPY') headRef.current.rotation.y = Math.sin(time * 12) * 0.1;
    }

    const eyeScale = isTalking ? 1 + audioLevel * 0.5 : 1;
    if (eyeLeftRef.current && eyeRightRef.current) {
      if (mood === 'HAPPY') {
        eyeLeftRef.current.scale.set(1.5, 0.3, 1);
        eyeRightRef.current.scale.set(1.5, 0.3, 1);
      } else {
        const blink = Math.sin(time * 0.5) > 0.98 ? 0.1 : eyeScale;
        eyeLeftRef.current.scale.set(1, blink, 1);
        eyeRightRef.current.scale.set(1, blink, 1);
      }
    }
  });

  return (
    <group position={[0, -0.5, 0]} onPointerDown={handleTouch}>
      <ambientLight intensity={1.5} />
      <pointLight position={[5, 5, 5]} intensity={2} />
      
      <group ref={headRef}>
        {/* Main Head */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>

        {/* Visor */}
        <mesh position={[0, 0, 0.5]}>
           <sphereGeometry args={[0.92, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
           <meshStandardMaterial color="#111" />
        </mesh>

        {/* Eyes */}
        <group position={[0, 0, 0.95]}>
          <mesh ref={eyeLeftRef} position={[-0.35, 0, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
          <mesh ref={eyeRightRef} position={[0.35, 0, 0]}>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
        </group>
      </group>

      {/* Body */}
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
    </group>
  );
}

