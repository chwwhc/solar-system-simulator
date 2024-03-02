import { Mesh } from "./mesh";

const meshCache: Mesh[] = [];
const textureCache: WebGLTexture[] = [];
const shaderCache: WebGLProgram[] = [];

export const modelMatName: string = 'uModelMat';
export const viewMatName: string = 'uViewMat';
export const projMatName: string = 'uProjMat';
export const textureName: string = 'uTexture';

export type ShaderID = number;
export type TextureID = number;
export type MeshID = number;

export const addMesh = (mesh: Mesh): MeshID => {
    meshCache.push(mesh);
    return meshCache.length - 1;
}

export const addTexture = async (gl: WebGL2RenderingContext, url: string): Promise<TextureID> => {
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
    const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        if (IsPowerOf2(image.width) && IsPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    textureCache.push(texture);
    return textureCache.length - 1;
}

export const addShader = (gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string): ShaderID => {
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

    shaderCache.push(shaderProgram);
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
    const shader = shaderCache[id];
    if (shader === undefined) {
        throw new Error(`Shader with id ${id} not found`);
    }
    return shader;
}