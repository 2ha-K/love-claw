import { useProgress } from '@react-three/drei';
import { Box, Button, Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import ButtonsControl from '../components/ButtonsControl';
import GameStatusHud from '../components/GameStatusHud';
import JoystickControl from '../components/JoystickControl';
import ProgressBar from '../components/ProgressBar';
import RewardLetterCard from '../components/RewardLetterCard';
import Scene from '../components/Scene';
import { GUARANTEE_READY_CHARGE, REVEAL_FLASH_DURATION_MS } from '../components/scene/constants';
import { CapturedReward, RevealingReward, SceneHandle } from '../types/game';

const Game = () => {
    const { active, progress } = useProgress();
    const [isLoading, setIsLoading] = useState(true);
    const [rewardQueue, setRewardQueue] = useState<CapturedReward[]>([]);
    const [revealingReward, setRevealingReward] = useState<RevealingReward | null>(null);
    const [revealStage, setRevealStage] = useState<'ball' | 'flash' | 'card' | null>(null);
    const [pityCharge, setPityCharge] = useState(0);

    const ref = useRef<SceneHandle | null>(null);
    const isPityReady = pityCharge === GUARANTEE_READY_CHARGE;
    const pityProgress = isPityReady ? 10 : pityCharge;
    const isRevealActive = Boolean(revealingReward);

    const handleRewardCollected = useCallback((reward: CapturedReward) => {
        setRewardQueue((previous) => [...previous, reward]);
    }, []);

    const handlePick = useCallback(() => {
        const guaranteed = isPityReady;
        const didStartPick = ref.current?.onPick({ guaranteed }) ?? false;

        if (!didStartPick) {
            return;
        }

        setPityCharge((previous) => (guaranteed ? 0 : Math.min(previous + 1, GUARANTEE_READY_CHARGE)));
    }, [isPityReady]);

    const handleOpen = useCallback(() => {
        if (!rewardQueue.length || isRevealActive) {
            return;
        }

        const nextReward = [...rewardQueue]
            .map((reward) => ({
                reward,
                position: ref.current?.getRewardBallPosition(reward.ballIndex),
            }))
            .filter((item): item is { reward: CapturedReward; position: [number, number, number] } => Boolean(item.position))
            .sort((left, right) => {
                if (left.position[1] !== right.position[1]) {
                    return left.position[1] - right.position[1];
                }

                if (left.position[0] !== right.position[0]) {
                    return left.position[0] - right.position[0];
                }

                return left.position[2] - right.position[2];
            })[0];

        if (!nextReward) {
            return;
        }

        const consumedReward = ref.current?.consumeReward(nextReward.reward.ballIndex);

        if (!consumedReward) {
            return;
        }

        setRewardQueue((previous) => previous.filter((reward) => reward.ballIndex !== nextReward.reward.ballIndex));
        setRevealingReward(consumedReward);
        setRevealStage('ball');
    }, [isRevealActive, rewardQueue]);

    const handleRevealBallClick = useCallback(() => {
        if (revealStage !== 'ball') {
            return;
        }

        setRevealStage('flash');
    }, [revealStage]);

    const handleRevealCard = useCallback(() => {
        setRevealStage('card');
    }, []);

    const handleCloseReveal = useCallback(() => {
        setRevealStage(null);
        setRevealingReward(null);
    }, []);

    useEffect(() => {
        if (active || progress < 100) {
            setIsLoading(true);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setIsLoading(false);
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [active, progress]);

    useEffect(() => {
        if (revealStage !== 'flash') {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            handleRevealCard();
        }, REVEAL_FLASH_DURATION_MS);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [handleRevealCard, revealStage]);

    return (
        <Box position='relative' w='100vw' h='100svh' overflow='hidden' overscrollBehavior='none'>
            <GameStatusHud pityProgress={pityProgress} isPityReady={isPityReady} />
            <Modal isOpen={isLoading} onClose={() => { }}>
                <ModalOverlay bg='linear-gradient(135deg, #6f00ff, #00ffcc)' />
                <ModalContent my={0} py='120px' h='full' display='flex' justifyContent='end' alignItems='center' bg='none' shadow='none'>
                    <ProgressBar progress={Math.round(progress)} />
                </ModalContent>
            </Modal>
            {!isRevealActive && (
                <>
                    <JoystickControl onJoystick={(x, z) => ref.current?.onJoystick(x, z)} />
                    <ButtonsControl
                        onOpen={handleOpen}
                        onPick={handlePick}
                        isOpenDisabled={isRevealActive}
                        isPickDisabled={isRevealActive}
                        isPityReady={isPityReady}
                    />
                </>
            )}
            {revealStage === 'card' && revealingReward && (
                <RewardLetterCard reward={revealingReward} />
            )}
            {revealStage === 'card' && (
                <Button
                    position='absolute'
                    zIndex={18}
                    left='50%'
                    bottom={{ base: 'calc(env(safe-area-inset-bottom, 0px) + 22px)', lg: '76px' }}
                    transform='translateX(-50%)'
                    onClick={handleCloseReveal}
                    rounded='full'
                    px={7}
                    h='48px'
                    bg='rgba(18, 14, 28, 0.82)'
                    color='rgba(255, 242, 235, 0.92)'
                    border='1px solid rgba(255,255,255,0.14)'
                    _hover={{ bg: 'rgba(10, 8, 18, 0.92)' }}
                >
                    Keep The Card
                </Button>
            )}
            <Canvas
                shadows='soft'
                dpr={[1, 1.5]}
                style={{
                    width: '100%',
                    height: '100%',
                    touchAction: 'none',
                }}
            >
                <Suspense fallback={null}>
                    <Scene
                        ref={ref}
                        onRewardCollected={handleRewardCollected}
                        revealingReward={revealingReward}
                        revealStage={revealStage}
                        controlsEnabled={!isRevealActive}
                        onRevealBallClick={handleRevealBallClick}
                    />
                </Suspense>
            </Canvas>
        </Box>
    );
};

export default Game;
