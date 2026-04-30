export type RewardColorKey = 'blue' | 'green' | 'pink' | 'red' | 'yellow';

export interface CapturedReward {
    id: string;
    ballIndex: number;
    sequence: number;
    colorKey: RewardColorKey;
    label: string;
    message: string;
    accent: string;
    glow: string;
}

export interface RevealingReward extends CapturedReward {
    startPosition: [number, number, number];
}

export interface SceneHandle {
    onPick: (options?: { guaranteed?: boolean }) => boolean;
    onJoystick: (x: number, z: number) => void;
    getRewardBallPosition: (ballIndex: number) => [number, number, number] | null;
    consumeReward: (ballIndex: number) => RevealingReward | null;
}
