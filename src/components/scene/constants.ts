export const ENVIRONMENT_MAP_URL =
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr';

export const CLAMPED_CLAW_Z = {
    min: -0.75,
    max: 0.45,
};

export const CLAMPED_CLAW_X = {
    min: -0.82,
    max: 0.8,
};

export const JOYSTICK_MOVEMENT_SPEED = 0.0001;
export const BALL_COUNT = 54;
export const BALL_COLLIDER_RADIUS = 0.155;
export const PICK_TARGET_Y = 2;
export const CARRIED_BALL_Y_OFFSET = 3.05;
export const PICK_DELAY_MS = 200;

export const MODEL_PATHS = {
    floor: '/floor.glb',
    clawMachine: '/clawMachine.glb',
    clawRest: '/clawRest.glb',
    clawRest1: '/clawRest1.glb',
    clawRest2: '/clawRest2.glb',
    clawRest3: '/clawRest3.glb',
    claw1: '/claw1.glb',
    claw2: '/claw2.glb',
    claw3: '/claw3.glb',
    blueBall: '/ball-blue.glb',
    greenBall: '/ball-green.glb',
    pinkBall: '/ball-pink.glb',
    redBall: '/ball-red.glb',
    yellowBall: '/ball-yellow.glb',
} as const;

export const PRIZE_POSITIONS = Array.from({ length: BALL_COUNT }, (_, index) => {
    const x = 0.25 + Math.floor((index % 9) / 3) * 0.3;
    const y = 2 + Math.floor(index / 9) * 0.3;
    const z = -0.5 + (index % 3) * 0.3;

    return [x, y, z] as [number, number, number];
});
