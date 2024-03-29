import { Mesh } from "./mesh";

const meshCache: Mesh[] = [];
const textureCache: WebGLTexture[] = [];
const shaderCache: [WebGLProgram, { [key: string]: WebGLUniformLocation }][] = [];

export const modelMatName: string = 'uModelMat';
export const viewMatName: string = 'uViewMat';
export const projMatName: string = 'uProjMat';
export const textureName: string = 'uTexture';
export const sunColorName: string = 'uSunColor';
export const sunPositionName: string = 'uSunPosition';

export type ShaderID = number;
export type TextureID = number;
export type MeshID = number;

export const addMesh = (mesh: Mesh): MeshID => {
    meshCache.push(mesh);
    return meshCache.length - 1;
}

export const addTexture = async (gl: WebGL2RenderingContext, url: string, texParam: number = gl.CLAMP_TO_EDGE): Promise<TextureID> => {
    const IsPowerOf2 = (value: number): boolean => (value & (value - 1)) == 0;

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level: number = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        if (IsPowerOf2(image.width) && IsPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texParam);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texParam);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    textureCache.push(texture);
    return textureCache.length - 1;
}

export const addShader = async (gl: WebGL2RenderingContext, vertexShaderUrl: string, fragmentShaderUrl: string): Promise<ShaderID> => {
    const vertexShaderSource: string = await (await fetch(vertexShaderUrl)).text();
    const fragmentShaderSource: string = await (await fetch(fragmentShaderUrl)).text();
    if (vertexShaderSource === null || fragmentShaderSource === null) {
        throw new Error('Unable to fetch shader source');
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (vertexShader === null) {
        throw new Error('Unable to create vertex shader');
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader === null) {
        throw new Error('Unable to create fragment shader');
    }

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error('Vertex shader compilation failed: ' + gl.getShaderInfoLog(vertexShader));
    }

    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error('Fragment shader compilation failed: ' + gl.getShaderInfoLog(fragmentShader));
    }

    const shaderProgram = gl.createProgram();
    if (shaderProgram === null) {
        throw new Error('Unable to create shader program');
    }

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error('Shader program linking failed: ' + gl.getProgramInfoLog(shaderProgram));
    }

    // retrieve uniform locations
    const uniformCache: { [key: string]: WebGLUniformLocation } = {};
    uniformCache[modelMatName] = gl.getUniformLocation(shaderProgram, modelMatName);
    uniformCache[viewMatName] = gl.getUniformLocation(shaderProgram, viewMatName);
    uniformCache[projMatName] = gl.getUniformLocation(shaderProgram, projMatName);
    uniformCache[textureName] = gl.getUniformLocation(shaderProgram, textureName);
    uniformCache[sunColorName] = gl.getUniformLocation(shaderProgram, sunColorName);
    uniformCache[sunPositionName] = gl.getUniformLocation(shaderProgram, sunPositionName);

    shaderCache.push([shaderProgram, uniformCache]);
    return shaderCache.length - 1;
}

export const getMesh = (id: MeshID): Mesh => {
    const mesh = meshCache[id];
    if (mesh === undefined) {
        throw new Error(`Mesh with id ${id} not found`);
    }
    return mesh;
}

export const getTexture = (id: TextureID): WebGLTexture => {
    const texture = textureCache[id];
    if (texture === undefined) {
        throw new Error(`Texture with id ${id} not found`);
    }
    return texture;
}

export const getShader = (id: ShaderID): WebGLProgram => {
    const shader = shaderCache[id][0];
    if (shader === undefined) {
        throw new Error(`Shader with id ${id} not found`);
    }
    return shader;
};

export const getUniformLocation = (shaderID: ShaderID, name: string): WebGLUniformLocation => {
    const uniform = shaderCache[shaderID][1][name];
    if (uniform === undefined) {
        throw new Error(`Uniform ${name} not found in shader with id ${shaderID}`);
    }
    return uniform;
};