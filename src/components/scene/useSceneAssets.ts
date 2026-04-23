import { useGLTF } from '@react-three/drei';
import { MODEL_PATHS } from './constants';

export const useSceneAssets = () => {
    const floor = useGLTF(MODEL_PATHS.floor);
    const clawMachine = useGLTF(MODEL_PATHS.clawMachine);
    const clawRest = useGLTF(MODEL_PATHS.clawRest);
    const clawRest1 = useGLTF(MODEL_PATHS.clawRest1);
    const clawRest2 = useGLTF(MODEL_PATHS.clawRest2);
    const clawRest3 = useGLTF(MODEL_PATHS.clawRest3);
    const claw1 = useGLTF(MODEL_PATHS.claw1);
    const claw2 = useGLTF(MODEL_PATHS.claw2);
    const claw3 = useGLTF(MODEL_PATHS.claw3);
    const blueBall = useGLTF(MODEL_PATHS.blueBall);
    const greenBall = useGLTF(MODEL_PATHS.greenBall);
    const pinkBall = useGLTF(MODEL_PATHS.pinkBall);
    const redBall = useGLTF(MODEL_PATHS.redBall);
    const yellowBall = useGLTF(MODEL_PATHS.yellowBall);

    return {
        floor,
        clawMachine,
        clawRest,
        clawRest1,
        clawRest2,
        clawRest3,
        claw1,
        claw2,
        claw3,
        balls: [blueBall, greenBall, pinkBall, redBall, yellowBall],
    };
};

Object.values(MODEL_PATHS).forEach((path) => {
    useGLTF.preload(path);
});
