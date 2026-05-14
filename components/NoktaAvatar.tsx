import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MascotState } from '../types';

interface NoktaAvatarProps {
    state: MascotState;
    vocalLevel?: number;
}

export default function NoktaAvatar({ state, vocalLevel = 0 }: NoktaAvatarProps) {
    const group = useRef<THREE.Group>(null);
    const mouth = useRef<THREE.Mesh>(null);
    const antenna = useRef<THREE.Mesh>(null);
    const eyeL = useRef<THREE.Mesh>(null);
    const eyeR = useRef<THREE.Mesh>(null);

    // States: 'idle', 'sleep', 'talking', 'love', 'angry'
    const idleTimer = useRef(0);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        // Shake & Float Logic
        let shakeX = 0, shakeY = 0;
        if (state === 'angry') {
            shakeX = Math.sin(t * 70) * 0.03;
            shakeY = Math.cos(t * 60) * 0.03;
        } else if (state === 'love') {
            shakeY = Math.sin(t * 3) * 0.04;
        }

        // Head movement & Floating
        if (group.current) {
            const floatY = state === 'sleep' ? -0.15 : Math.sin(t * 1.8) * 0.06;
            group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, floatY + shakeY, 0.1);
            group.current.position.x = shakeX;

            // Rotation
            const tx = state === 'sleep' || state === 'love' ? 0 : 0; // Simplified for mobile
            const ty = state === 'sleep' ? -0.25 : (state === 'love' ? 0.15 : 0);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, tx, 0.04);
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -ty, 0.04);

            const tz = state === 'love' ? Math.PI / 16 * Math.sin(t * 2) : 0;
            group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, tz, 0.05);
        }

        // Lip sync & Smile
        if (mouth.current) {
            if (state === 'sleep') {
                mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 0.2, 0.2);
            } else if (state === 'love') {
                mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 1.2, 0.2);
            } else if (state === 'talking') {
                mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 1 + vocalLevel * 2.5, 0.25);
            } else {
                mouth.current.scale.y = THREE.MathUtils.lerp(mouth.current.scale.y, 1, 0.2);
            }
        }

        // Antenna glow
        if (antenna.current) {
            let target = 0.8 + Math.sin(t * 3) * 0.4;
            if (state === 'sleep') target = 0.1;
            else if (state === 'talking') target = 1.5 + vocalLevel * 4;

            const mat = antenna.current.material as THREE.MeshStandardMaterial;
            if (mat.emissiveIntensity !== undefined) {
                mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, target, 0.12);
            }
        }

        // Eyes
        if (eyeL.current && eyeR.current) {
            let blink = 1;
            if (state === 'sleep' || state === 'love') blink = 0.08;
            else if (state === 'angry') blink = 0.6;
            else blink = Math.abs(Math.sin(t * 0.5)) < 0.04 ? 0.1 : 1;

            eyeL.current.scale.y = THREE.MathUtils.lerp(eyeL.current.scale.y, blink, 0.3);
            eyeR.current.scale.y = THREE.MathUtils.lerp(eyeR.current.scale.y, blink, 0.3);

            const eyeRot = state === 'angry' ? 0.3 : 0;
            eyeL.current.rotation.z = THREE.MathUtils.lerp(eyeL.current.rotation.z, -eyeRot, 0.3);
            eyeR.current.rotation.z = THREE.MathUtils.lerp(eyeR.current.rotation.z, eyeRot, 0.3);
        }
    });

    const white = new THREE.MeshStandardMaterial({
        color: '#ffffff', roughness: 0.1, metalness: 0.05,
    });
    const blue = new THREE.MeshStandardMaterial({
        color: '#1a6bff', roughness: 0.4, metalness: 0.2,
    });
    const glow = new THREE.MeshStandardMaterial({
        color: '#1a6bff', emissive: '#1a6bff', emissiveIntensity: 1, roughness: 0.1,
    });

    return (
        <group ref={group} scale={0.8}>
            {/* Head */}
            <mesh scale={[1, 0.88, 0.92]} material={white}>
                <sphereGeometry args={[1, 32, 32]} />
            </mesh>

            {/* Speech bubble tail */}
            <mesh position={[0.52, -0.72, 0]} rotation={[0, 0, Math.PI / 3.8]} material={white}>
                <coneGeometry args={[0.28, 0.58, 16]} />
            </mesh>

            {/* Antenna */}
            <mesh position={[-0.08, 0.92, 0]} rotation={[0, 0, Math.PI / 9]} material={white}>
                <cylinderGeometry args={[0.038, 0.048, 0.48, 16]} />
            </mesh>
            <mesh ref={antenna} position={[-0.28, 1.13, 0]} material={glow}>
                <sphereGeometry args={[0.14, 16, 16]} />
            </mesh>

            {/* Eyes */}
            <mesh ref={eyeL} position={[-0.34, 0.12, 0.87]} material={blue}>
                <capsuleGeometry args={[0.09, 0.14, 8, 8]} />
            </mesh>
            <mesh ref={eyeR} position={[0.34, 0.12, 0.87]} material={blue}>
                <capsuleGeometry args={[0.09, 0.14, 8, 8]} />
            </mesh>

            {/* Mouth */}
            <mesh
                ref={mouth}
                position={[0, -0.17, 0.91]}
                rotation={[state === 'angry' ? Math.PI / 12 : -Math.PI / 12, 0, state === 'angry' ? 0 : Math.PI]}
                material={new THREE.MeshStandardMaterial({ color: state === 'angry' ? '#dc2626' : '#1a6bff', roughness: 0.7 })}
            >
                <torusGeometry args={[0.16, 0.04, 8, 16, Math.PI]} />
            </mesh>

            {/* Signal Bars */}
            <group position={[0.68, 0.48, 0.62]} rotation={[0, 0, -Math.PI / 6]}>
                {[
                    { pos: [-0.14, -0.14, 0], h: 0.07 },
                    { pos: [0, 0, 0], h: 0.13 },
                    { pos: [0.14, 0.14, 0], h: 0.19 },
                ].map(({ pos, h }, i) => (
                    <mesh
                        key={i}
                        position={pos as any}
                        material={state === 'angry' ? new THREE.MeshStandardMaterial({ color: '#dc2626' }) : blue}
                    >
                        <capsuleGeometry args={[0.022, h, 8, 8]} />
                    </mesh>
                ))}
            </group>
        </group>
    );
}
