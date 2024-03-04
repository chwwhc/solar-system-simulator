import { EntityID, entityGetComponent, entityHasComponent } from './entity';
import { ComponentType, RenderComponent, TransformComponent, RotationComponent } from './component';
import { getViewMatrix, getProjectionMatrix, getCameraFront, getCameraUp, getCameraPosition } from './camera';
import { mat4, vec3, quat } from 'gl-matrix';
import { getMesh, getShader, modelMatName, viewMatName, projMatName, getTexture, textureName, getUniformLocation, ShaderID, sunColorName, sunPositionName } from './resourceManager';

// listener for input system
const currentKeys: Set<string> = new Set();
window.addEventListener('keydown', (event: KeyboardEvent) => {
    currentKeys.add(event.key);
});
window.addEventListener('keyup', (event: KeyboardEvent) => {
    currentKeys.delete(event.key);
});
const isKeyPressed = (key: string): boolean => {
    return currentKeys.has(key);
};

export interface System {
    update: (entites: EntityID[], deltaTime: number, gl?: WebGL2RenderingContext) => void
}

export const renderSystem: System = {
    update: (entities: EntityID[], deltaTime: number, gl: WebGL2RenderingContext) => {
        const posLayoutLoc: number = 0;
        const normalLayoutLoc: number = 1;
        const texCoordLayoutLoc: number = 2;

        const setupPositionBuffer = (vertices: Float32Array): void => {
            const positionBuffer: WebGLBuffer = gl.createBuffer();
            if (positionBuffer === null) {
                throw new Error('Unable to create position buffer');
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
            gl.vertexAttribPointer(posLayoutLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(posLayoutLoc);
        };
        const setupNormalBuffer = (normals: Float32Array): void => {
            const normalBuffer: WebGLBuffer = gl.createBuffer();
            if (normalBuffer === null) {
                throw new Error('Unable to create normal buffer');
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
            gl.vertexAttribPointer(normalLayoutLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLayoutLoc);
        };
        const setupTexCoordBuffer = (texCoords: Float32Array): void => {
            const texCoordBuffer: WebGLBuffer = gl.createBuffer();
            if (texCoordBuffer === null) {
                throw new Error('Unable to create texel buffer');
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
            gl.vertexAttribPointer(texCoordLayoutLoc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(texCoordLayoutLoc);
        };
        const setupIndexBuffer = (indices: Uint16Array): void => {
            const indexBuffer: WebGLBuffer = gl.createBuffer();
            if (indexBuffer === null) {
                throw new Error('Unable to create index buffer');
            }
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        };
        const generateVAO = (vertices: Float32Array, normals: Float32Array, texCoords: Float32Array, indices: Uint16Array): WebGLVertexArrayObject => {
            const vao: WebGLVertexArrayObject = gl.createVertexArray();
            if (vao === null) {
                throw new Error('Unable to create vertex array object');
            }
            gl.bindVertexArray(vao);
            setupPositionBuffer(vertices);
            setupNormalBuffer(normals);
            setupTexCoordBuffer(texCoords);
            setupIndexBuffer(indices);
            return vao;
        }

        const viewMat: mat4 = getViewMatrix();
        const projMat: mat4 = getProjectionMatrix();
        const sunColor: vec3 = new Float32Array([1.0, 1.0, 1.0]);
        const sunPosition: vec3 = new Float32Array([0.0, 0.0, 0.0]);

        entities.forEach((entity) => {
            if (entityHasComponent(entity, ComponentType.Render)) {
                const renderComponent: RenderComponent = entityGetComponent(entity, ComponentType.Render) as RenderComponent;

                const shaderID: ShaderID = renderComponent.shaderID;
                const shaderProgram = getShader(shaderID);
                gl.useProgram(shaderProgram);

                const mesh = getMesh(renderComponent.meshID);
                const { vertices, normals, texCoords, indices } = mesh;

                if (entityHasComponent(entity, ComponentType.Transform)) {
                    const transformComponent: TransformComponent = entityGetComponent(entity, ComponentType.Transform) as TransformComponent;

                    const modelMat: mat4 = mat4.create();
                    mat4.translate(modelMat, modelMat, transformComponent.position);
                    mat4.rotateX(modelMat, modelMat, transformComponent.rotation[0]);
                    mat4.rotateY(modelMat, modelMat, transformComponent.rotation[1]);
                    mat4.rotateZ(modelMat, modelMat, transformComponent.rotation[2]);
                    mat4.scale(modelMat, modelMat, transformComponent.scale);
                    gl.uniformMatrix4fv(getUniformLocation(shaderID, modelMatName), false, modelMat);
                } else {
                    gl.uniformMatrix4fv(getUniformLocation(shaderID, modelMatName), false, mat4.create());
                }

                gl.uniform3fv(getUniformLocation(shaderID, sunColorName), sunColor);
                gl.uniform3fv(getUniformLocation(shaderID, sunPositionName), sunPosition);

                gl.uniformMatrix4fv(getUniformLocation(shaderID, viewMatName), false, viewMat);
                gl.uniformMatrix4fv(getUniformLocation(shaderID, projMatName), false, projMat);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, getTexture(renderComponent.textureID));
                gl.uniform1i(getUniformLocation(shaderID, textureName), 0);

                if (renderComponent.vao === null) {
                    renderComponent.vao = generateVAO(vertices, normals, texCoords, indices);
                }

                gl.bindVertexArray(renderComponent.vao);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            }
        });
    }
};

export const inputSystem: System = {
    update: (entities: EntityID[], deltaTime: number, gl: WebGL2RenderingContext): void => {
        const cameraSpeed: number = 0.5 * deltaTime;
        const cameraRotationSpeed: number = 0.001 * deltaTime;
        const cameraPos: vec3 = getCameraPosition();
        const cameraFront: vec3 = getCameraFront();
        const cameraUp: vec3 = getCameraUp();

        vec3.normalize(cameraFront, cameraFront);
        vec3.normalize(cameraUp, cameraUp);

        const rotateVec3 = (vec: vec3, axis: vec3, angle: number): void => {
            const quaternion: quat = quat.create();
            quat.setAxisAngle(quaternion, axis, angle);
            const rotatedVec: vec3 = vec3.create();
            vec3.transformQuat(rotatedVec, vec, quaternion);
            vec3.copy(vec, rotatedVec);
        }

        // Movement (Zoom In/Out)
        if (isKeyPressed('w')) {
            vec3.scaleAndAdd(cameraPos, cameraPos, cameraFront, cameraSpeed); // Zoom in
        }
        if (isKeyPressed('s')) {
            vec3.scaleAndAdd(cameraPos, cameraPos, cameraFront, -cameraSpeed); // Zoom out
        }

        // Yaw (A/D)
        if (isKeyPressed('a')) {
            rotateVec3(cameraFront, cameraUp, cameraRotationSpeed); // Yaw left
        }
        if (isKeyPressed('d')) {
            rotateVec3(cameraFront, cameraUp, -cameraRotationSpeed); // Yaw right
        }

        // Pitch (Arrow Up/Down)
        if (isKeyPressed('ArrowUp')) {
            let right = vec3.create();
            vec3.cross(right, cameraFront, cameraUp);
            vec3.normalize(right, right);
            rotateVec3(cameraFront, right, cameraRotationSpeed); // Pitch up
            rotateVec3(cameraUp, right, cameraRotationSpeed);
        }
        if (isKeyPressed('ArrowDown')) {
            let right = vec3.create();
            vec3.cross(right, cameraFront, cameraUp);
            vec3.normalize(right, right);
            rotateVec3(cameraFront, right, -cameraRotationSpeed); // Pitch down
            rotateVec3(cameraUp, right, -cameraRotationSpeed);
        }

        // Roll (Arrow Left/Right)
        if (isKeyPressed('ArrowLeft')) {
            rotateVec3(cameraUp, cameraFront, cameraRotationSpeed); // Roll left
        }
        if (isKeyPressed('ArrowRight')) {
            rotateVec3(cameraUp, cameraFront, -cameraRotationSpeed); // Roll right
        }
    }
};

export const rotationSystem: System = {
    update: (entities: EntityID[], deltaTime: number): void => {
        entities.forEach(entity => {
            if (entityHasComponent(entity, ComponentType.Transform) && entityHasComponent(entity, ComponentType.Rotation)) {
                const transformComponent: TransformComponent = entityGetComponent(entity, ComponentType.Transform) as TransformComponent;
                const rotationComponent: RotationComponent = entityGetComponent(entity, ComponentType.Rotation) as RotationComponent;

                transformComponent.rotation[1] += rotationComponent.speed * deltaTime;

                transformComponent.rotation[1] %= 360;
            }
        });
    }
};