import { BallCollider, RigidBody } from '@react-three/rapier';
import { forwardRef, ForwardRefRenderFunction, useEffect, useMemo, useState } from 'react';
import { BALL_COLLIDER_RADIUS } from './scene/constants';

interface Props {
    obj: any;
    position?: [number, number, number];
    isActive?: boolean;
}

const Ball: ForwardRefRenderFunction<any, Props> = ({ obj, position, isActive = true }, ref) => {
    const clonedObj = useMemo(() => obj.clone(), [obj]);
    const [showObj, setShowObj] = useState(false);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => setShowObj(true), 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    if (!isActive) {
        return null;
    }

    return (
        <RigidBody ref={ref} position={position}>
            <BallCollider args={[BALL_COLLIDER_RADIUS]} />
            {showObj && (
                <primitive object={clonedObj} />
            )}
        </RigidBody>
    )
}

export default forwardRef(Ball);
