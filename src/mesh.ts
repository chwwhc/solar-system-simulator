export type Mesh = {
    vertices: Float32Array,
    indices: Uint16Array,
    normals: Float32Array,
    texCoords?: Float32Array,
    colors?: Float32Array,
}

export const createSphere = (radius: number, latSegments: number, lonSegments: number): Mesh => {
    const vertices: number[] = [];
    const normals: number[] = [];
    const texCoords: number[] = [];
    const indices: number[] = [];

    for (let lat = 0; lat <= latSegments; lat++) {
        const theta = lat * Math.PI / latSegments;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= lonSegments; lon++) {
            const phi = lon * 2 * Math.PI / lonSegments;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            const u = lon / lonSegments;
            const v = lat / latSegments;

            normals.push(x, y, z);
            texCoords.push(u, v);
            vertices.push(radius * x, radius * y, radius * z);
        }
    }

    for (let lat = 0; lat < latSegments; lat++) {
        for (let lon = 0; lon < lonSegments; lon++) {
            const first = (lat * (lonSegments + 1)) + lon;
            const second = first + lonSegments + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        texCoords: new Float32Array(texCoords),
        indices: new Uint16Array(indices),
    };
};