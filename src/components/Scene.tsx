import { Environment, OrbitControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { forwardRef, ForwardRefRenderFunction, useImperativeHandle } from 'react';
import Ball from './Ball';
import { ENVIRONMENT_MAP_URL, PRIZE_POSITIONS } from './scene/constants';
import RewardReveal3D from './scene/RewardReveal3D';
import { useClawMachineController } from './scene/useClawMachineController';
import { useSceneAssets } from './scene/useSceneAssets';
import { CapturedReward, RevealingReward, SceneHandle } from '../types/game';

const Scene: ForwardRefRenderFunction<
    SceneHandle,
    {
        onRewardCollected?: (reward: CapturedReward) => void;
        revealingReward: RevealingReward | null;
        revealStage: 'ball' | 'flash' | 'card' | null;
        controlsEnabled: boolean;
        onRevealBallClick: () => void;
    }
> = ({ onRewardCollected, revealingReward, revealStage, controlsEnabled, onRevealBallClick }, ref) => {
    const { floor, clawMachine, clawRest, clawRest1, clawRest2, clawRest3, claw1, claw2, claw3, balls, ballScenesByColor } = useSceneAssets();
    const {
        clawRestRef,
        clawRest1Ref,
        clawRest2Ref,
        clawRest3Ref,
        claw1Ref,
        claw2Ref,
        claw3Ref,
        ballRefs,
        activeBalls,
        onJoystick,
        onPick,
        getRewardBallPosition,
        consumeReward,
        orbitControlsProps,
    } = useClawMachineController(onRewardCollected);

    useImperativeHandle(ref, () => ({ onPick, onJoystick, getRewardBallPosition, consumeReward }));

    return (
        <>
            <Environment files={ENVIRONMENT_MAP_URL} />
            <ambientLight intensity={2} />
            <pointLight position={[-2, 5, 8]} intensity={50} castShadow />
            <primitive object={floor.scene} receiveShadow position={[0, -0.25, 0]} />
            <group ref={clawRestRef}>
                <group position={[0, 3.28, 0]}>
                    <primitive object={clawRest.scene} />
                    <group ref={clawRest1Ref} >
                        <primitive object={clawRest1.scene} />
                        <primitive ref={clawRest2Ref} object={clawRest2.scene} position={[0, 0.36, 0]} />
                        <group ref={clawRest3Ref}>
                            <primitive object={clawRest3.scene} />
                            <group rotation={[0, -2.0944, 0]}>
                                <primitive ref={claw1Ref} object={claw3.scene} position={[0, 0, 0.113]} />
                            </group>
                            <group>
                                <primitive ref={claw2Ref} object={claw1.scene} position={[0, 0, 0.113]} />
                            </group>
                            <group rotation={[0, 2.0944, 0]}>
                                <primitive ref={claw3Ref} object={claw2.scene} position={[0, 0, 0.113]} />
                            </group>
                        </group>
                    </group>
                </group>
            </group>
            <Physics>
                {PRIZE_POSITIONS.map((position, index) => (
                    <Ball
                        key={index}
                        ref={ballRefs.current[index]}
                        obj={balls[index % balls.length].scene}
                        position={position}
                        isActive={activeBalls[index]}
                    />
                ))}
                <RigidBody ccd type="fixed" colliders="trimesh">
                    <primitive object={clawMachine.scene} castShadow />
                </RigidBody>
            </Physics >
            <RewardReveal3D
                reward={revealingReward}
                stage={revealStage}
                ballScenesByColor={ballScenesByColor}
                onBallClick={onRevealBallClick}
            />
            <OrbitControls {...orbitControlsProps} enabled={controlsEnabled} />
        </>
    )
}

export default forwardRef(Scene);
