import { Float, PresentationControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group, MathUtils, Mesh, Quaternion, Vector3 } from 'three';
import { RevealingReward, RewardColorKey } from '../../types/game';
import { REVEAL_PULL_DURATION } from './constants';
import PrizeBallVisual from './PrizeBallVisual';

interface RewardReveal3DProps {
    reward: RevealingReward | null;
    stage: 'ball' | 'flash' | 'card' | null;
    ballScenesByColor: Record<RewardColorKey, object>;
    onBallClick: () => void;
}

const cameraForward = new Vector3();
const cameraUp = new Vector3();
const cameraRight = new Vector3();
const targetPosition = new Vector3();
const startPosition = new Vector3();
const targetQuaternion = new Quaternion();

const RewardReveal3D = ({
    reward,
    stage,
    ballScenesByColor,
    onBallClick,
}: RewardReveal3DProps) => {
    const { camera } = useThree();
    const revealBallRef = useRef<Group>(null);
    const flashRef = useRef<Group>(null);
    const cardAnchorRef = useRef<Group>(null);
    const cardMeshRef = useRef<Mesh>(null);
    const pullProgressRef = useRef(0);

    useEffect(() => {
        pullProgressRef.current = 0;
    }, [reward?.id, stage]);

    const floatingCardAccent = useMemo(() => {
        return reward?.accent ?? '#f6d2b4';
    }, [reward?.accent]);

    useFrame((_, delta) => {
        if (!reward || !stage) {
            return;
        }

        camera.getWorldDirection(cameraForward);
        cameraUp.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
        cameraRight.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();

        targetPosition
            .copy(camera.position)
            .add(cameraForward.clone().multiplyScalar(1.45))
            .add(cameraUp.clone().multiplyScalar(-0.08));

        targetQuaternion.copy(camera.quaternion);

        if (stage === 'ball' && revealBallRef.current) {
            pullProgressRef.current = Math.min(pullProgressRef.current + delta / REVEAL_PULL_DURATION, 1);
            const eased = 1 - (1 - pullProgressRef.current) ** 3;

            startPosition.fromArray(reward.startPosition);
            revealBallRef.current.position.copy(startPosition.lerp(targetPosition, eased));
            revealBallRef.current.scale.setScalar(MathUtils.lerp(1, 1.7, eased));
            revealBallRef.current.quaternion.slerp(targetQuaternion, delta * 6);
            revealBallRef.current.rotateY(delta * 1.2);
        }

        if (stage === 'flash' && flashRef.current) {
            flashRef.current.position.copy(targetPosition);
            flashRef.current.quaternion.copy(targetQuaternion);
            const pulse = 1 + Math.sin(performance.now() * 0.02) * 0.08;
            flashRef.current.scale.setScalar(pulse);
        }

        if (stage === 'card' && cardAnchorRef.current) {
            cardAnchorRef.current.position
                .copy(camera.position)
                .add(cameraForward.clone().multiplyScalar(1.62))
                .add(cameraUp.clone().multiplyScalar(-0.02))
                .add(cameraRight.clone().multiplyScalar(0.02));
            cardAnchorRef.current.quaternion.copy(targetQuaternion);

            if (cardMeshRef.current) {
                cardMeshRef.current.rotation.y = MathUtils.lerp(cardMeshRef.current.rotation.y, 0.12, delta * 2.2);
                cardMeshRef.current.rotation.x = MathUtils.lerp(cardMeshRef.current.rotation.x, -0.06, delta * 2.2);
            }
        }
    });

    if (!reward || !stage) {
        return null;
    }

    return (
        <>
            {stage === 'ball' && (
                <group ref={revealBallRef} onClick={onBallClick}>
                    <pointLight intensity={18} color={reward.accent} distance={5} />
                    <PrizeBallVisual object={ballScenesByColor[reward.colorKey]} position={[0, 0, 0]} scale={1} />
                    <mesh>
                        <sphereGeometry args={[0.28, 32, 32]} />
                        <meshBasicMaterial color={reward.accent} transparent opacity={0.14} />
                    </mesh>
                </group>
            )}

            {stage === 'flash' && (
                <group ref={flashRef}>
                    <pointLight intensity={44} color={reward.accent} distance={8} />
                    <mesh>
                        <sphereGeometry args={[0.44, 32, 32]} />
                        <meshBasicMaterial color='white' transparent opacity={0.9} />
                    </mesh>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.45, 0.92, 48]} />
                        <meshBasicMaterial color={reward.accent} transparent opacity={0.45} side={2} />
                    </mesh>
                    <mesh rotation={[0, Math.PI / 2, 0]}>
                        <ringGeometry args={[0.45, 0.92, 48]} />
                        <meshBasicMaterial color='white' transparent opacity={0.35} side={2} />
                    </mesh>
                </group>
            )}

            {stage === 'card' && (
                <group ref={cardAnchorRef}>
                    <Float speed={1.5} rotationIntensity={0.12} floatIntensity={0.2}>
                        <PresentationControls
                            global={false}
                            polar={[-0.35, 0.35]}
                            azimuth={[-0.9, 0.9]}
                            config={{ mass: 1.8, tension: 210 }}
                            snap={false}
                        >
                            <group>
                                <pointLight intensity={12} color={reward.accent} distance={4.5} />
                                <mesh ref={cardMeshRef} castShadow receiveShadow>
                                    <planeGeometry args={[1.08, 1.52, 1, 1]} />
                                    <meshPhysicalMaterial
                                        color='#fff6ef'
                                        emissive={floatingCardAccent}
                                        emissiveIntensity={0.18}
                                        roughness={0.18}
                                        metalness={0.02}
                                        transmission={0.04}
                                        clearcoat={1}
                                        clearcoatRoughness={0.18}
                                    />
                                </mesh>
                                <mesh position={[0, 0, 0.01]}>
                                    <planeGeometry args={[0.9, 1.34, 1, 1]} />
                                    <meshBasicMaterial color='white' transparent opacity={0.18} />
                                </mesh>
                                <mesh position={[0, -0.58, 0.014]}>
                                    <planeGeometry args={[0.74, 0.16, 1, 1]} />
                                    <meshBasicMaterial color={reward.accent} transparent opacity={0.16} />
                                </mesh>
                            </group>
                        </PresentationControls>
                    </Float>
                </group>
            )}
        </>
    );
};

export default RewardReveal3D;
