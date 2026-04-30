import { Box } from "@chakra-ui/react";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { DownIcon, LeftIcon, RightIcon, UpIcon } from "./icons";

const getTouchPoint = (event: any) => event.touches?.[0] ?? event.changedTouches?.[0] ?? event;

const JoystickControl: FC<{
    onJoystick: (x: number, z: number) => void;
}> = ({ onJoystick }) => {
    const ref = useRef<any>();
    const [isDragging, setIsDragging] = useState(false);
    const [joystickPos, setJoystickPos] = useState({ x: 0, z: 0 });

    const updateJoystickPos = useCallback((clientX: number, clientY: number) => {
        const rect = ref.current.getBoundingClientRect();
        const relativeX = clientX - rect.left;
        const relativeY = clientY - rect.top;

        let x = relativeX - rect.width / 2;
        let z = relativeY - rect.height / 2;
        const limit = rect.width * 0.31;

        const d = Math.hypot(x, z);
        if (d > limit) {
            x *= limit / d;
            z *= limit / d;
        }

        setJoystickPos({ x, z });
        onJoystick(x / limit, z / limit);
    }, [onJoystick]);

    const handleStart = (e: any) => {
        if (e.cancelable) {
            e.preventDefault();
        }

        setIsDragging(true);
        const point = getTouchPoint(e);
        updateJoystickPos(point.clientX, point.clientY);
    };

    const handleMove = useCallback((e: any) => {
        if (isDragging) {
            if (e.cancelable) {
                e.preventDefault();
            }

            const point = getTouchPoint(e);
            updateJoystickPos(point.clientX, point.clientY);
        }
    }, [isDragging, updateJoystickPos]);

    const handleEnd = useCallback(() => {
        setIsDragging(false);
        setJoystickPos({ x: 0, z: 0 });
        onJoystick(0, 0);
    }, [onJoystick]);

    useEffect(() => {
        window.addEventListener("mouseup", handleEnd);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("touchend", handleEnd);
        window.addEventListener("touchmove", handleMove, { passive: false });

        return () => {
            window.removeEventListener("mouseup", handleEnd);
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("touchend", handleEnd);
            window.removeEventListener("touchmove", handleMove);
        };
    }, [handleMove, handleEnd]);

    return (
        <Box
            ref={ref}
            position='absolute'
            zIndex={10}
            left={{ base: '12px', sm: '16px', lg: '64px' }}
            bottom={{ base: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', lg: '64px' }}
            w={{ base: '128px', sm: '136px', md: '148px', lg: '160px' }}
            h={{ base: '128px', sm: '136px', md: '148px', lg: '160px' }}
            bg='rgba(7, 10, 18, 0.38)'
            border='1px solid rgba(255,255,255,0.16)'
            boxShadow='0 18px 42px rgba(5, 7, 16, 0.32), inset 0 0 18px rgba(255,255,255,0.08)'
            backdropFilter='blur(12px)'
            rounded='full'
            cursor='pointer'
            userSelect='none'
            sx={{
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
        >
            <Box
                position='absolute'
                left={{ base: 'calc(50% - 24px)', md: 'calc(50% - 28px)', lg: 'calc(50% - 30px)' }}
                top={{ base: 'calc(50% - 24px)', md: 'calc(50% - 28px)', lg: 'calc(50% - 30px)' }}
                w={{ base: '48px', md: '56px', lg: '60px' }}
                h={{ base: '48px', md: '56px', lg: '60px' }}
                bg='rgba(255, 255, 255, 0.92)'
                p={1}
                rounded='full'
                boxShadow='0 10px 24px rgba(0,0,0,0.22)'
                style={{ transform: `translate(${joystickPos?.x}px, ${joystickPos?.z}px)` }}
            >
                <Box w='full' h='full' bg='white' border='1px solid rgba(0,0,0,0.18)' rounded='full' />
            </Box>
            <LeftIcon position='absolute' left={{ base: 1.5, md: 2 }} top='calc(50% - 6px)' />
            <RightIcon position='absolute' right={{ base: 1.5, md: 2 }} top='calc(50% - 6px)' />
            <UpIcon position='absolute' top={{ base: 1.5, md: 2 }} left='calc(50% - 6px)' />
            <DownIcon position='absolute' bottom={{ base: 1.5, md: 2 }} left='calc(50% - 6px)' />
        </Box>
    );
};

export default JoystickControl;
