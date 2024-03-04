import { vec3 } from 'gl-matrix';
import { MeshID, TextureID, ShaderID } from './resourceManager';

export enum ComponentType {
    Render = 'Render',
    Transform = 'Transform',
    Light = 'Light',
    Rotation = 'Rotation',
};

export type RenderComponent = {
    type: ComponentType.Render,
    meshID: MeshID,
    textureID: TextureID,
    shaderID: ShaderID,
    vao: WebGLVertexArrayObject | null,
};

export type TransformComponent = {
    type: ComponentType.Transform,
    position: vec3,
    rotation: vec3,
    scale: vec3,
};

export type RotationComponent = {
    type: ComponentType.Rotation,
    axis: vec3,
    speed: number,
};

export type Component = RenderComponent | TransformComponent | RotationComponent;

export const createRenderComponent = (meshID: MeshID, textureID: TextureID, shaderID: ShaderID): RenderComponent => {
    return {
        type: ComponentType.Render,
        meshID,
        textureID,
        shaderID,
        vao: null,
    };
};

export const createTransformComponent = (position: vec3, rotation: vec3, scale: vec3): TransformComponent => {
    return {
        type: ComponentType.Transform,
        position,
        rotation,
        scale,
    };
};

export const createRotationComponent = (axis: vec3, speed: number): RotationComponent => {
    return {
        type: ComponentType.Rotation,
        axis,
        speed,
    };
};