import { Canvas, useFrame } from '@react-three/fiber/native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
} from 'three';

export type MascotVisualState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'waiting'
  | 'error';

type MascotReaction = 'idle' | 'sleep' | 'tickle' | 'angry' | 'love';

type NoktaAvatar3DProps = {
  state: MascotVisualState;
};

type AvatarModelProps = {
  reaction: MascotReaction;
  state: MascotVisualState;
};

export function NoktaAvatar3D({ state }: NoktaAvatar3DProps) {
  const [reaction, setReaction] = useState<MascotReaction>('idle');
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (state !== 'idle' && reaction === 'sleep') {
      setReaction('idle');
    }
  }, [reaction, state]);

  useEffect(() => {
    if (reaction === 'idle' && state === 'idle') {
      const sleepTimer = setTimeout(() => setReaction('sleep'), 12000);
      return () => clearTimeout(sleepTimer);
    }

    if (reaction === 'tickle') {
      const timer = setTimeout(() => setReaction('idle'), 900);
      return () => clearTimeout(timer);
    }

    if (reaction === 'angry') {
      const timer = setTimeout(() => setReaction('idle'), 2200);
      return () => clearTimeout(timer);
    }

    if (reaction === 'love') {
      const timer = setTimeout(() => setReaction('idle'), 2600);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [reaction, state]);

  const interact = () => {
    clickCount.current += 1;

    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }

    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 900);

    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setReaction('angry');
      return;
    }

    if (reaction !== 'angry') {
      setReaction('tickle');
    }
  };

  const badge = getBadge(reaction, state);

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, -0.18, 5.5], fov: 40 }}
        style={styles.canvas}
      >
        <color args={['#eef2ff']} attach="background" />
        <ambientLight intensity={0.8} />
        <directionalLight intensity={1.35} position={[8, 10, 5]} />
        <pointLight color="#88aaff" intensity={0.65} position={[-4, 4, 4]} />
        <AvatarModel reaction={reaction} state={state} />
      </Canvas>

      {badge ? (
        <View style={styles.badge}>
          <Text style={[styles.badgeText, badge.kind === 'error' ? styles.errorBadgeText : null]}>
            {badge.label}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityLabel="Nokta Maskot"
        accessibilityRole="button"
        onLongPress={() => setReaction('love')}
        onPress={interact}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

function AvatarModel({ reaction, state }: AvatarModelProps) {
  const group = useRef<Group>(null);
  const mouth = useRef<Mesh>(null);
  const antenna =
    useRef<Mesh<SphereGeometry, MeshStandardMaterial>>(null);
  const eyeL = useRef<Mesh>(null);
  const eyeR = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const visual = reaction !== 'idle' ? reaction : state;
    const active =
      state === 'listening' || state === 'thinking' || state === 'speaking';
    const waiting = state === 'waiting';
    const angry = visual === 'angry' || state === 'error';
    const sleeping = visual === 'sleep';
    const loving = visual === 'love';
    const tickle = visual === 'tickle';

    if (group.current) {
      const shakePower = tickle ? 0.055 : angry ? 0.035 : 0;
      const shakeX = shakePower ? Math.sin(t * (angry ? 70 : 50)) * shakePower : 0;
      const shakeY = shakePower ? Math.cos(t * (angry ? 60 : 45)) * shakePower : 0;
      const floatY = sleeping
        ? -0.14
        : loving
          ? Math.sin(t * 3) * 0.05
          : Math.sin(t * 1.8) * 0.06;
      const lookX = sleeping ? -0.08 : Math.sin(t * 0.45) * 0.18;
      const lookY = sleeping ? -0.2 : Math.cos(t * 0.5) * 0.08;
      const tilt = loving ? Math.sin(t * 2.2) * 0.2 : waiting ? Math.sin(t) * 0.05 : 0;

      group.current.position.x = lerp(
        group.current.position.x,
        shakeX,
        0.12,
      );
      group.current.position.y = lerp(
        group.current.position.y,
        floatY + shakeY,
        0.12,
      );
      group.current.rotation.x = lerp(
        group.current.rotation.x,
        -lookY,
        0.05,
      );
      group.current.rotation.y = lerp(
        group.current.rotation.y,
        lookX,
        0.05,
      );
      group.current.rotation.z = lerp(
        group.current.rotation.z,
        tilt,
        0.05,
      );
    }

    if (mouth.current) {
      const speakingScale = 1 + Math.abs(Math.sin(t * 9)) * 1.15;
      const thinkingScale = 0.85 + Math.abs(Math.sin(t * 4)) * 0.45;
      const targetScale = sleeping
        ? 0.2
        : loving
          ? 1.25
          : active
            ? speakingScale
            : waiting
              ? thinkingScale
              : 1;
      mouth.current.scale.y = lerp(
        mouth.current.scale.y,
        targetScale,
        0.25,
      );
    }

    if (antenna.current) {
      const target = sleeping
        ? 0.12
        : active
          ? 1.7 + Math.abs(Math.sin(t * 8)) * 2.2
          : waiting
            ? 1.4 + Math.abs(Math.sin(t * 3)) * 1.3
            : 0.85 + Math.sin(t * 3) * 0.35;
      antenna.current.material.emissiveIntensity = lerp(
        antenna.current.material.emissiveIntensity,
        target,
        0.13,
      );
    }

    if (eyeL.current && eyeR.current) {
      const blink = sleeping || loving
        ? 0.08
        : tickle
          ? 0.2
          : angry
            ? 0.55
            : Math.abs(Math.sin(t * 0.5)) < 0.04
              ? 0.12
              : 1;
      const eyeRot = angry ? 0.32 : 0;

      eyeL.current.scale.y = lerp(eyeL.current.scale.y, blink, 0.3);
      eyeR.current.scale.y = lerp(eyeR.current.scale.y, blink, 0.3);
      eyeL.current.rotation.z = lerp(
        eyeL.current.rotation.z,
        -eyeRot,
        0.25,
      );
      eyeR.current.rotation.z = lerp(
        eyeR.current.rotation.z,
        eyeRot,
        0.25,
      );
    }
  });

  const accentColor = reaction === 'angry' || state === 'error' ? '#dc2626' : '#1a6bff';
  const mouthRotation = reaction === 'angry' || state === 'error'
    ? [Math.PI / 12, 0, 0] as [number, number, number]
    : [-Math.PI / 12, 0, Math.PI] as [number, number, number];

  return (
    <group ref={group} scale={0.8}>
      <mesh scale={[1, 0.88, 0.92]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.05}
          roughness={0.08}
        />
      </mesh>

      <mesh position={[0.52, -0.72, 0]} rotation={[0, 0, Math.PI / 3.8]}>
        <coneGeometry args={[0.28, 0.58, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.05}
          roughness={0.08}
        />
      </mesh>

      <mesh position={[-0.08, 0.92, 0]} rotation={[0, 0, Math.PI / 9]}>
        <cylinderGeometry args={[0.038, 0.048, 0.48, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.05}
          roughness={0.08}
        />
      </mesh>

      <mesh ref={antenna} position={[-0.28, 1.13, 0]}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1}
          roughness={0.1}
        />
      </mesh>

      <mesh ref={eyeL} position={[-0.34, 0.12, 0.87]}>
        <capsuleGeometry args={[0.09, 0.14, 16, 16]} />
        <meshStandardMaterial color={accentColor} metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh ref={eyeR} position={[0.34, 0.12, 0.87]}>
        <capsuleGeometry args={[0.09, 0.14, 16, 16]} />
        <meshStandardMaterial color={accentColor} metalness={0.2} roughness={0.4} />
      </mesh>

      <mesh ref={mouth} position={[0, -0.17, 0.91]} rotation={mouthRotation}>
        <torusGeometry args={[0.16, 0.04, 16, 32, Math.PI]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} />
      </mesh>

      <group position={[0.68, 0.48, 0.62]} rotation={[0, 0, -Math.PI / 6]}>
        {[
          { height: 0.07, position: [-0.14, -0.14, 0] },
          { height: 0.13, position: [0, 0, 0] },
          { height: 0.19, position: [0.14, 0.14, 0] },
        ].map((bar, index) => (
          <mesh
            key={index}
            position={bar.position as [number, number, number]}
          >
            <capsuleGeometry args={[0.022, bar.height, 8, 8]} />
            <meshStandardMaterial color={accentColor} metalness={0.2} roughness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function lerp(current: number, target: number, alpha: number) {
  return current + (target - current) * alpha;
}

function getBadge(
  reaction: MascotReaction,
  state: MascotVisualState,
): { kind: 'default' | 'error'; label: string } | null {
  if (state === 'error') {
    return { kind: 'error', label: '!' };
  }

  if (reaction === 'sleep') {
    return { kind: 'default', label: 'Zzz' };
  }

  if (reaction === 'love') {
    return { kind: 'default', label: '<3' };
  }

  if (reaction === 'angry') {
    return { kind: 'error', label: '!' };
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  badge: {
    position: 'absolute',
    right: '24%',
    top: '18%',
    minWidth: 48,
    minHeight: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  badgeText: {
    color: '#1a6bff',
    fontSize: 18,
    fontWeight: '900',
  },
  errorBadgeText: {
    color: '#dc2626',
  },
});
