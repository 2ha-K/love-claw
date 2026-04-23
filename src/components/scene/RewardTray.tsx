import { CapturedReward, RewardColorKey } from '../../types/game';
import { REWARD_TRAY_SLOTS } from './constants';
import PrizeBallVisual from './PrizeBallVisual';

interface RewardTrayProps {
    rewards: CapturedReward[];
    ballScenesByColor: Record<RewardColorKey, object>;
}

const RewardTray = ({ rewards, ballScenesByColor }: RewardTrayProps) => {
    return (
        <>
            {rewards.slice(0, REWARD_TRAY_SLOTS.length).map((reward, index) => (
                <PrizeBallVisual
                    key={reward.id}
                    object={ballScenesByColor[reward.colorKey]}
                    position={REWARD_TRAY_SLOTS[index]}
                    rotation={[0, (index % 2) * 0.38, 0]}
                    scale={1}
                />
            ))}
        </>
    );
};

export default RewardTray;
