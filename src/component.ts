import { MeshID, TextureID, ShaderID } from "./resourceManager";

export enum ComponentType {
    Render = 'Render',
    Transform = 'Transform',
    Light = 'Light',
}

export type RenderComponent = {
    type: ComponentType.Render,
    meshID: MeshID,
    textureID: TextureID,
    shaderID: ShaderID,
}

export type TransformComponent = {
    type: ComponentType.Transform,
    position: { x: number, y: number, z: number },
    rotation: { x: number, y: number, z: number },
    scale: { x: number, y: number, z: number },
}

export type LightComponent = {
    type: ComponentType.Light,
    color: { r: number, g: number, b: number },
    intensity: number,
}

export type Component = RenderComponent | TransformComponent | LightComponent;

export const createRenderComponent = (meshID: MeshID, textureID: TextureID, shaderID: ShaderID): RenderComponent => {
    return {
        type: ComponentType.Render,
        meshID,
        textureID,
        shaderID,
    };
};

export const createTransformComponent = (position: { x: number, y: number, z: number }, rotation: { x: number, y: number, z: number }, scale: { x: number, y: number, z: number }): TransformComponent => {
    return {
        type: ComponentType.Transform,
        position,
        rotation,
        scale,
    };
};

export const createLightComponent = (color: { r: number, g: number, b: number }, intensity: number): LightComponent => {
    return {
        type: ComponentType.Light,
        color,
        intensity,
    };
};