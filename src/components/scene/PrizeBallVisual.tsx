import { useMemo } from 'react';

interface PrizeBallVisualProps {
    object: object;
    position: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    onClick?: () => void;
}

const PrizeBallVisual = ({
    object,
    position,
    rotation = [0, 0, 0],
    scale = 1,
    onClick,
}: PrizeBallVisualProps) => {
    const clonedObject = useMemo(() => {
        return (object as { clone: () => object }).clone();
    }, [object]);

    return (
        <group position={position} rotation={rotation} scale={scale} onClick={onClick}>
            <primitive object={clonedObject} />
        </group>
    );
};

export default PrizeBallVisual;
