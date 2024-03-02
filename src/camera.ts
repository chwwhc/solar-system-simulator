
import { mat4, vec3 } from 'gl-matrix';

const cameraState = {
    position: vec3.fromValues(0, 0, 12),
    front: vec3.fromValues(0, 0, -1),
    up: vec3.fromValues(0, 1, 0),
    fov: Math.PI / 3,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 100,
};

export const updateCameraPosition = (x: number, y: number, z: number): void => {
    cameraState.position = vec3.fromValues(x, y, z);
};

export const updateCameraFront = (x: number, y: number, z: number): void => {
    cameraState.front = vec3.fromValues(x, y, z);
};

export const updateCameraUp = (x: number, y: number, z: number): void => {
    cameraState.up = vec3.fromValues(x, y, z);
};

export const updateCameraFOV = (fov: number): void => {
    cameraState.fov = fov;
};

export const updateCameraAspect = (aspect: number): void => {
    cameraState.aspect = aspect;
};

export const updateCameraNear = (near: number): void => {
    cameraState.near = near;
};

export const updateCameraFar = (far: number): void => {
    cameraState.far = far;
};

export const getViewMatrix = (): mat4 => {
    const posPlusFront = vec3.create();
    vec3.add(posPlusFront, cameraState.position, cameraState.front);
    const viewMat = mat4.create();
    mat4.lookAt(viewMat, cameraState.position, posPlusFront, cameraState.up);
    return viewMat;
};

export const getProjectionMatrix = (): mat4 => {
    const projectionMatrix: mat4 = mat4.create();
    mat4.perspective(projectionMatrix, cameraState.fov, cameraState.aspect, cameraState.near, cameraState.far);
    return projectionMatrix;
};