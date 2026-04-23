import { useFrame } from '@react-three/fiber';
import { createRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vector3 } from 'three';
import {
    angleToRadian,
    clonePosition,
    cloneRotation,
    cloneScale,
    getPosition,
    getRotation,
    getScale,
} from '../../utils';
import {
    BALL_COUNT,
    CARRIED_BALL_Y_OFFSET,
    CLAMPED_CLAW_X,
    CLAMPED_CLAW_Z,
    JOYSTICK_MOVEMENT_SPEED,
    MAX_ALIGNMENT_DISTANCE,
    PICK_DELAY_MS,
    PICK_TARGET_Y,
    REWARD_DROP_ZONE,
    REWARD_VARIANTS,
} from './constants';
import { CapturedReward, RevealingReward } from '../../types/game';

interface AnimationState {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}

interface AnimationStep {
    ref: React.MutableRefObject<any>;
    name: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    start: number;
    duration: number;
    cb?: () => void;
}

interface AnimationQueueItem {
    animationSet: AnimationStep[];
    startTime: number;
    isPlaying: boolean;
}

interface UseClawMachineControllerResult {
    clawRestRef: React.MutableRefObject<any>;
    clawRest1Ref: React.MutableRefObject<any>;
    clawRest2Ref: React.MutableRefObject<any>;
    clawRest3Ref: React.MutableRefObject<any>;
    claw1Ref: React.MutableRefObject<any>;
    claw2Ref: React.MutableRefObject<any>;
    claw3Ref: React.MutableRefObject<any>;
    ballRefs: React.MutableRefObject<React.RefObject<any>[]>;
    activeBalls: boolean[];
    onJoystick: (x: number, z: number) => void;
    onPick: (options?: { guaranteed?: boolean }) => boolean;
    getRewardBallPosition: (ballIndex: number) => [number, number, number] | null;
    consumeReward: (ballIndex: number) => RevealingReward | null;
    orbitControlsProps: {
        minAzimuthAngle: number;
        maxAzimuthAngle: number;
        minPolarAngle: number;
        maxPolarAngle: number;
        minDistance: number;
        maxDistance: number;
        target: [number, number, number];
        enablePan: boolean;
    };
}

const getCatchChance = (distance: number) => {
    if (distance <= 0.16) {
        return 0.92;
    }

    if (distance <= 0.25) {
        return 0.76;
    }

    if (distance <= 0.33) {
        return 0.56;
    }

    return 0.34;
};

export const useClawMachineController = (
    onRewardCollected?: (reward: CapturedReward) => void,
): UseClawMachineControllerResult => {
    const clawRestRef = useRef<any>();
    const clawRest1Ref = useRef<any>();
    const clawRest2Ref = useRef<any>();
    const clawRest3Ref = useRef<any>();
    const claw1Ref = useRef<any>();
    const claw2Ref = useRef<any>();
    const claw3Ref = useRef<any>();
    const ballRefs = useRef(Array.from({ length: BALL_COUNT }, () => createRef<any>()));
    const joystickRef = useRef({ x: 0, z: 0 });
    const animationQueueRef = useRef<AnimationQueueItem[]>([]);
    const selectedIndexRef = useRef<number | null>(null);
    const animationStateMapRef = useRef<Record<string, AnimationState>>({});
    const currentPickGuaranteeRef = useRef(false);
    const pendingRewardRef = useRef<CapturedReward | null>(null);
    const fallingRewardsRef = useRef<Map<number, CapturedReward>>(new Map());
    const storedRewardsRef = useRef<Map<number, CapturedReward>>(new Map());
    const onRewardCollectedRef = useRef(onRewardCollected);
    const rewardSequenceRef = useRef(0);
    const activeBallsRef = useRef<boolean[]>(Array.from({ length: BALL_COUNT }, () => true));
    const [isPicking, setIsPicking] = useState(false);
    const [activeBalls, setActiveBalls] = useState<boolean[]>(() => Array.from({ length: BALL_COUNT }, () => true));

    useEffect(() => {
        activeBallsRef.current = activeBalls;
    }, [activeBalls]);

    useEffect(() => {
        onRewardCollectedRef.current = onRewardCollected;
    }, [onRewardCollected]);

    const onJoystick = useCallback((x: number, z: number) => {
        joystickRef.current.x = x;
        joystickRef.current.z = z;
    }, []);

    const catchBall = useCallback(() => {
        const x1 = clawRest1Ref.current.position.x;
        const z1 = clawRestRef.current.position.z;

        const distances = ballRefs.current
            .map((ballRef, index) => {
                if (!activeBallsRef.current[index] || fallingRewardsRef.current.has(index) || storedRewardsRef.current.has(index)) {
                    return null;
                }

                const translation = ballRef.current?.translation();

                if (!translation) {
                    return null;
                }

                return {
                    distance: Math.sqrt(
                        (translation.x - x1) * (translation.x - x1) +
                        (translation.y - PICK_TARGET_Y) * (translation.y - PICK_TARGET_Y) +
                        (translation.z - z1) * (translation.z - z1),
                    ),
                    index,
                };
            })
            .filter(Boolean)
            .sort((left, right) => left!.distance - right!.distance);

        const nearestBall = distances[0];

        if (!nearestBall || nearestBall.distance > MAX_ALIGNMENT_DISTANCE) {
            return;
        }

        const variant = REWARD_VARIANTS[nearestBall.index % REWARD_VARIANTS.length];
        const caught = currentPickGuaranteeRef.current || Math.random() < getCatchChance(nearestBall.distance);

        if (!caught) {
            pendingRewardRef.current = null;
            selectedIndexRef.current = null;
            return;
        }

        selectedIndexRef.current = nearestBall.index;
        rewardSequenceRef.current += 1;
        pendingRewardRef.current = {
            id: `reward-${rewardSequenceRef.current}-${nearestBall.index}`,
            ballIndex: nearestBall.index,
            sequence: rewardSequenceRef.current,
            colorKey: variant.colorKey,
            label: variant.label,
            accent: variant.accent,
            glow: variant.glow,
        };
        ballRefs.current[selectedIndexRef.current].current?.setGravityScale(0);
    }, []);

    const releaseBall = useCallback(() => {
        if (selectedIndexRef.current == null) {
            return;
        }

        const selectedIndex = selectedIndexRef.current;
        const reward = pendingRewardRef.current;

        if (reward) {
            const selectedBall = ballRefs.current[selectedIndex].current;
            selectedBall?.setLinvel({ x: 0, y: 0, z: 0 });
            selectedBall?.setGravityScale(1);
            fallingRewardsRef.current.set(selectedIndex, reward);
        } else {
            ballRefs.current[selectedIndex].current?.setGravityScale(1);
        }

        selectedIndexRef.current = null;
        pendingRewardRef.current = null;
    }, []);

    const spreadClawAnimation = useMemo<AnimationStep[]>(() => {
        return [
            { ref: claw1Ref, name: 'claw1', rotation: [0, 0, 0], start: 0, duration: 0.3 },
            { ref: claw2Ref, name: 'claw2', rotation: [0, 0, 0], start: 0, duration: 0.3 },
            {
                ref: claw3Ref,
                name: 'claw3',
                rotation: [0, 0, 0],
                start: 0,
                duration: 0.3,
                cb: () => setIsPicking(false),
            },
        ];
    }, []);

    const releaseAnimationSet = useMemo<AnimationStep[]>(() => {
        return [
            { ref: clawRest1Ref, name: 'clawRest1', position: [-0.75, 0, 0], start: 0, duration: 1.5 },
            { ref: clawRestRef, name: 'clawRest', position: [0, 0, 0.5], start: 0, duration: 1.5 },
            { ref: claw1Ref, name: 'claw1', rotation: [0, 0, 0], start: 1.7, duration: 0.3 },
            { ref: claw2Ref, name: 'claw2', rotation: [0, 0, 0], start: 1.7, duration: 0.3 },
            { ref: claw3Ref, name: 'claw3', rotation: [0, 0, 0], start: 1.7, duration: 0.3, cb: releaseBall },
            { ref: clawRest1Ref, name: 'clawRest1', position: [0, 0, 0], start: 2.2, duration: 1.5 },
            {
                ref: clawRestRef,
                name: 'clawRest',
                position: [0, 0, 0],
                start: 2.2,
                duration: 1.5,
                cb: () => setIsPicking(false),
            },
        ];
    }, [releaseBall]);

    const playNextAnimation = useCallback(() => {
        window.setTimeout(() => {
            if (selectedIndexRef.current != null) {
                ballRefs.current[selectedIndexRef.current].current?.setLinvel({ x: 0, y: 0, z: 0 });
                animationQueueRef.current.push({ animationSet: releaseAnimationSet, startTime: 0, isPlaying: false });
                return;
            }

            animationQueueRef.current.push({ animationSet: spreadClawAnimation, startTime: 0, isPlaying: false });
        }, PICK_DELAY_MS);
    }, [releaseAnimationSet, spreadClawAnimation]);

    const catchAnimationSet = useMemo<AnimationStep[]>(() => {
        return [
            { ref: clawRest2Ref, name: 'clawRest2', scale: [1, 8, 1], start: 0, duration: 1.5 },
            { ref: clawRest3Ref, name: 'clawRest3', position: [0, -1.2, 0], start: 0, duration: 1.5, cb: catchBall },
            { ref: claw1Ref, name: 'claw1', rotation: [0.35, 0, 0], start: 1.7, duration: 0.3 },
            { ref: claw2Ref, name: 'claw2', rotation: [0.35, 0, 0], start: 1.7, duration: 0.3 },
            { ref: claw3Ref, name: 'claw3', rotation: [0.35, 0, 0], start: 1.7, duration: 0.3 },
            { ref: clawRest2Ref, name: 'clawRest2', scale: [1, 1, 1], start: 2.2, duration: 1.5 },
            {
                ref: clawRest3Ref,
                name: 'clawRest3',
                position: [0, 0, 0],
                start: 2.2,
                duration: 1.5,
                cb: playNextAnimation,
            },
        ];
    }, [catchBall, playNextAnimation]);

    const onPick = useCallback((options?: { guaranteed?: boolean }) => {
        if (isPicking || !activeBallsRef.current.some(Boolean)) {
            return false;
        }

        currentPickGuaranteeRef.current = Boolean(options?.guaranteed);
        setIsPicking(true);
        animationQueueRef.current.push({ animationSet: catchAnimationSet, startTime: 0, isPlaying: false });
        return true;
    }, [catchAnimationSet, isPicking]);

    useFrame(({ clock }) => {
        if (clawRestRef.current && clawRest1Ref.current) {
            const nextZ = Math.max(
                CLAMPED_CLAW_Z.min,
                Math.min(CLAMPED_CLAW_Z.max, clawRestRef.current.position.z + joystickRef.current.z * JOYSTICK_MOVEMENT_SPEED),
            );
            const nextX = Math.max(
                CLAMPED_CLAW_X.min,
                Math.min(CLAMPED_CLAW_X.max, clawRest1Ref.current.position.x + joystickRef.current.x * JOYSTICK_MOVEMENT_SPEED),
            );

            clawRestRef.current.position.z = nextZ;
            clawRest1Ref.current.position.x = nextX;
        }

        if (selectedIndexRef.current != null) {
            const ball = ballRefs.current[selectedIndexRef.current].current;

            ball?.setTranslation(
                new Vector3(
                    clawRest1Ref.current.position.x,
                    clawRest3Ref.current.position.y + CARRIED_BALL_Y_OFFSET,
                    clawRestRef.current.position.z,
                ),
            );
        }

        fallingRewardsRef.current.forEach((reward, index) => {
            const translation = ballRefs.current[index].current?.translation();

            if (!translation) {
                return;
            }

            const hasReachedDropZone =
                translation.x >= REWARD_DROP_ZONE.minX &&
                translation.x <= REWARD_DROP_ZONE.maxX &&
                translation.y >= REWARD_DROP_ZONE.minY &&
                translation.y <= REWARD_DROP_ZONE.maxY &&
                translation.z >= REWARD_DROP_ZONE.minZ &&
                translation.z <= REWARD_DROP_ZONE.maxZ;

            if (!hasReachedDropZone) {
                return;
            }

            ballRefs.current[index].current?.setLinvel({ x: 0, y: 0, z: 0 });
            storedRewardsRef.current.set(index, reward);
            onRewardCollectedRef.current?.(reward);
            fallingRewardsRef.current.delete(index);
        });

        animationQueueRef.current = animationQueueRef.current
            .filter((item) => item.animationSet.length > 0)
            .map((item) => {
                const startTime = item.isPlaying ? item.startTime : clock.elapsedTime;
                const elapsedTime = clock.elapsedTime - startTime;

                const animationSet = item.animationSet
                    .filter((animation) => {
                        const valid = elapsedTime < animation.start + animation.duration;

                        if (!valid) {
                            animation.cb?.();
                            delete animationStateMapRef.current[animation.name];
                        }

                        return valid;
                    })
                    .map((animation) => {
                        if (elapsedTime <= animation.start) {
                            return animation;
                        }

                        const object = animation.ref.current;

                        if (!object) {
                            return animation;
                        }

                        let state = animationStateMapRef.current[animation.name];

                        if (!state) {
                            state = {
                                position: clonePosition(object.position),
                                rotation: cloneRotation(object.rotation),
                                scale: cloneScale(object.scale),
                            };

                            animationStateMapRef.current[animation.name] = state;
                        }

                        const progress = (elapsedTime - animation.start) / animation.duration;

                        if (animation.position) {
                            const { x, y, z } = getPosition(state.position, animation.position, progress);
                            object.position.set(x, y, z);
                        }

                        if (animation.rotation) {
                            const { x, y, z } = getRotation(state.rotation, animation.rotation, progress);
                            object.rotation.set(x, y, z);
                        }

                        if (animation.scale) {
                            const { x, y, z } = getScale(state.scale, animation.scale, progress);
                            object.scale.set(x, y, z);
                        }

                        return animation;
                    });

                return { ...item, animationSet, startTime, isPlaying: true };
            });
    });

    const getRewardBallPosition = useCallback((ballIndex: number) => {
        const translation = ballRefs.current[ballIndex]?.current?.translation();

        if (!translation) {
            return null;
        }

        return [translation.x, translation.y, translation.z] as [number, number, number];
    }, []);

    const consumeReward = useCallback((ballIndex: number) => {
        const reward = storedRewardsRef.current.get(ballIndex);
        const translation = ballRefs.current[ballIndex]?.current?.translation();

        if (!reward || !translation) {
            return null;
        }

        storedRewardsRef.current.delete(ballIndex);
        setActiveBalls((previous) => previous.map((isActive, index) => (
            index === ballIndex ? false : isActive
        )));

        return {
            ...reward,
            startPosition: [translation.x, translation.y, translation.z] as [number, number, number],
        };
    }, []);

    return {
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
        orbitControlsProps: {
            minAzimuthAngle: angleToRadian(-10),
            maxAzimuthAngle: angleToRadian(10),
            minPolarAngle: angleToRadian(65),
            maxPolarAngle: angleToRadian(85),
            minDistance: 2.5,
            maxDistance: 5.5,
            target: [0.0, 2.4, 0.0],
            enablePan: false,
        },
    };
};
