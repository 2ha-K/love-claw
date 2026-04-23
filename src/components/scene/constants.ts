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
export const MAX_ALIGNMENT_DISTANCE = 0.42;
export const GUARANTEE_READY_CHARGE = 9;
export const REVEAL_PULL_DURATION = 0.52;
export const REVEAL_FLASH_DURATION_MS = 560;
export const REWARD_DROP_ZONE = {
    minX: -0.9,
    maxX: -0.14,
    minY: -2,
    maxY: 1.52,
    minZ: 0.02,
    maxZ: 0.72,
};

export const REWARD_VARIANTS = [
    {
        colorKey: 'blue',
        label: 'Moonlit Promise',
        accent: '#8bc8ff',
        glow: 'rgba(89, 181, 255, 0.74)',
    },
    {
        colorKey: 'green',
        label: 'Garden Letter',
        accent: '#98e1bf',
        glow: 'rgba(108, 224, 172, 0.68)',
    },
    {
        colorKey: 'pink',
        label: 'Blush Secret',
        accent: '#ff9cc7',
        glow: 'rgba(255, 133, 194, 0.72)',
    },
    {
        colorKey: 'red',
        label: 'Velvet Heart',
        accent: '#ff9a97',
        glow: 'rgba(255, 111, 111, 0.7)',
    },
    {
        colorKey: 'yellow',
        label: 'Golden Memory',
        accent: '#ffe086',
        glow: 'rgba(255, 205, 97, 0.72)',
    },
] as const;

export const REWARD_TRAY_SLOTS = Array.from({ length: 24 }, (_, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2) % 2;
    const layer = Math.floor(index / 4);

    return [
        -0.38 + column * 0.18,
        1.72 + layer * 0.125,
        0.28 + row * 0.18,
    ] as [number, number, number];
});

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
