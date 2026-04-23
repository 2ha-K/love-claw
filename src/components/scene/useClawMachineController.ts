import { useFrame } from '@react-three/fiber';
import { createRef, useCallback, useMemo, useRef, useState } from 'react';
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
    PICK_DELAY_MS,
    PICK_TARGET_Y,
} from './constants';

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
    onJoystick: (x: number, z: number) => void;
    onPick: () => void;
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

export const useClawMachineController = (): UseClawMachineControllerResult => {
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
    const [isPicking, setIsPicking] = useState(false);

    const onJoystick = useCallback((x: number, z: number) => {
        joystickRef.current.x = x;
        joystickRef.current.z = z;
    }, []);

    const catchBall = useCallback(() => {
        const x1 = clawRest1Ref.current.position.x;
        const z1 = clawRestRef.current.position.z;

        const distances = ballRefs.current
            .map((ballRef, index) => {
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

        if (!distances.length) {
            return;
        }

        selectedIndexRef.current = distances[0]!.index;
        ballRefs.current[selectedIndexRef.current].current?.setGravityScale(0);
    }, []);

    const releaseBall = useCallback(() => {
        if (selectedIndexRef.current == null) {
            return;
        }

        ballRefs.current[selectedIndexRef.current].current?.setGravityScale(1);
        selectedIndexRef.current = null;
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

    const onPick = useCallback(() => {
        if (isPicking) {
            return;
        }

        setIsPicking(true);
        animationQueueRef.current.push({ animationSet: catchAnimationSet, startTime: 0, isPlaying: false });
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

    return {
        clawRestRef,
        clawRest1Ref,
        clawRest2Ref,
        clawRest3Ref,
        claw1Ref,
        claw2Ref,
        claw3Ref,
        ballRefs,
        onJoystick,
        onPick,
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
