import React, { useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import Voice from '../services/Voice';

function MascotAvatar({ isThinking }) {
    const group = useRef();
    const mouth = useRef();
    const antenna = useRef();
    const eyeL = useRef();
    const eyeR = useRef();

    // Materials based on reference
    const materials = useMemo(() => ({
        white: new THREE.MeshStandardMaterial({
            color: '#ffffff', roughness: 0.1, metalness: 0.1
        }),
        blue: new THREE.MeshStandardMaterial({
            color: '#1a6bff', roughness: 0.3, metalness: 0.2
        }),
        glow: new THREE.MeshStandardMaterial({
            color: '#1a6bff', emissive: '#1a6bff', emissiveIntensity: 1, roughness: 0.1
        })
    }), []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const lvl = Voice.getLevel();

        if (group.current) {
            // Floating animation
            group.current.position.y = Math.sin(t * 1.5) * 0.1;

            // Thinking pulse
            if (isThinking) {
                const pulse = 1 + Math.sin(t * 5) * 0.05;
                group.current.scale.set(pulse, pulse, pulse);
            } else {
                group.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }

        // Lip Sync
        if (mouth.current) {
            const targetScaleY = 1 + lvl * 2;
            mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, targetScaleY, 0.2);
        }

        // Antenna Glow
        if (antenna.current) {
            antenna.current.material.emissiveIntensity = 0.5 + (lvl * 3) + Math.sin(t * 2) * 0.5;
        }

        // Blinking
        if (eyeL.current && eyeR.current) {
            const blink = Math.abs(Math.sin(t * 0.4)) < 0.05 ? 0.1 : 1;
            eyeL.current.scale.y = THREE.MathUtils.lerp(eyeL.current.scale.y, blink, 0.3);
            eyeR.current.scale.y = THREE.MathUtils.lerp(eyeR.current.scale.y, blink, 0.3);
        }
    });

    return (
        <group ref={group} scale={1.2}>
            {/* Head - Sphere */}
            <mesh material={materials.white} scale={[1, 0.9, 1]}>
                <sphereGeometry args={[1, 32, 32]} />
            </mesh>

            {/* Mouth - Torus (Smiling) */}
            <mesh ref={mouth} position={[0, -0.2, 0.9]} rotation={[-Math.PI / 12, 0, Math.PI]} material={materials.blue}>
                <torusGeometry args={[0.15, 0.04, 12, 24, Math.PI]} />
            </mesh>

            {/* Eyes - Capsules (Simulated with Cylinders/Spheres for compatibility) */}
            <mesh ref={eyeL} position={[-0.35, 0.1, 0.85]} material={materials.blue}>
                <sphereGeometry args={[0.1, 16, 16]} />
            </mesh>
            <mesh ref={eyeR} position={[0.35, 0.1, 0.85]} material={materials.blue}>
                <sphereGeometry args={[0.1, 16, 16]} />
            </mesh>

            {/* Antenna */}
            <mesh position={[0, 0.9, 0]} material={materials.white}>
                <cylinderGeometry args={[0.04, 0.04, 0.4, 8]} />
            </mesh>
            <mesh ref={antenna} position={[0, 1.1, 0]} material={materials.glow}>
                <sphereGeometry args={[0.12, 16, 16]} />
            </mesh>
        </group>
    );
}

export default function NoktaMascot({ isThinking }) {
    return (
        <View style={styles.container}>
            <Canvas camera={{ position: [0, 0.5, 4], fov: 40 }}>
                <ambientLight intensity={0.7} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -5]} color="#1a6bff" intensity={0.5} />
                <MascotAvatar isThinking={isThinking} />
                <ContactShadows position={[0, -1.2, 0]} opacity={0.3} scale={6} blur={2} />
            </Canvas>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 350,
        backgroundColor: 'transparent',
    }
});
