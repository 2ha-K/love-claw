import { BallCollider, RigidBody } from '@react-three/rapier';
import { forwardRef, ForwardRefRenderFunction, useEffect, useMemo, useState } from 'react';
import { BALL_COLLIDER_RADIUS } from './scene/constants';

interface Props {
    obj: any;
    position?: any;
}

const Ball: ForwardRefRenderFunction<any, Props> = ({ obj, position }, ref) => {
    const clonedObj = useMemo(() => obj.clone(), [obj]);
    const [showObj, setShowObj] = useState(false);

    useEffect(() => {
        setTimeout(() => setShowObj(true), 250);
    }, []);

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
