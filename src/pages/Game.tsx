import { useProgress } from '@react-three/drei';
import { Box, Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import ButtonsControl from '../components/ButtonsControl';
import JoystickControl from '../components/JoystickControl';
import ProgressBar from '../components/ProgressBar';
import Scene from '../components/Scene';

const Game = () => {
    const { active, progress } = useProgress();
    const [isLoading, setIsLoading] = useState(true);

    const ref = useRef<any>();

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

    return (
        <Box position='relative' w='100vw' h='100vh'>
            <Modal isOpen={isLoading} onClose={() => { }}>
                <ModalOverlay bg='linear-gradient(135deg, #6f00ff, #00ffcc)' />
                <ModalContent my={0} py='120px' h='full' display='flex' justifyContent='end' alignItems='center' bg='none' shadow='none'>
                    <ProgressBar progress={Math.round(progress)} />
                </ModalContent>
            </Modal>
            <JoystickControl onJoystick={(x, z) => ref.current?.onJoystick(x, z)} />
            <ButtonsControl onStart={() => { }} onPick={() => ref.current?.onPick()} />
            <Canvas shadows='soft'>
                <Suspense fallback={null}>
                    <Scene ref={ref} />
                </Suspense>
            </Canvas>
        </Box>
    );
};

export default Game;
