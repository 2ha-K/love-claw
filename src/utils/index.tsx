type VectorTuple = [number, number, number];

export const angleToRadian = (a: number) => {
    return Math.PI * a / 180;
}

export const clonePosition = (p: any): VectorTuple => [p.x, p.y, p.z];
export const cloneRotation = (r: any): VectorTuple => [r.x, r.y, r.z];
export const cloneScale = (s: any): VectorTuple => [s.x, s.y, s.z];

export const getPosition = (p1: VectorTuple, p2: VectorTuple, a: number) => {
    return {
        x: p1[0] + (p2[0] - p1[0]) * a,
        y: p1[1] + (p2[1] - p1[1]) * a,
        z: p1[2] + (p2[2] - p1[2]) * a,
    }
}

export const getRotation = (r1: VectorTuple, r2: VectorTuple, a: number) => {
    return {
        x: r1[0] + (r2[0] - r1[0]) * a,
        y: r1[1] + (r2[1] - r1[1]) * a,
        z: r1[2] + (r2[2] - r1[2]) * a,
    }
}

export const getScale = (s1: VectorTuple, s2: VectorTuple, a: number) => {
    return {
        x: s1[0] + (s2[0] - s1[0]) * a,
        y: s1[1] + (s2[1] - s1[1]) * a,
        z: s1[2] + (s2[2] - s1[2]) * a,
    }
}
