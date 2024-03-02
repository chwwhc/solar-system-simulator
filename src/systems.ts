import { EntityID, entityGetComponent, entityHasComponent } from './entity';
import { ComponentType, RenderComponent, TransformComponent } from './component';
import { getViewMatrix, getProjectionMatrix } from './camera';
import { mat4, vec3 } from 'gl-matrix';
import { getMesh, getShader, modelMatName, viewMatName, projMatName, getTexture, textureName } from './resourceManager';

export interface System {
    update: (entites: EntityID[], deltaTime: number, gl?: WebGL2RenderingContext) => void;
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

        entities.forEach((entity) => {
            if (entityHasComponent(entity, ComponentType.Render)) {
                const renderComponent: RenderComponent = entityGetComponent(entity, ComponentType.Render) as RenderComponent;

                const shaderProgram = getShader(renderComponent.shaderID);
                gl.useProgram(shaderProgram);

                const mesh = getMesh(renderComponent.meshID);
                const { vertices, normals, texCoords, indices } = mesh;

                if (entityHasComponent(entity, ComponentType.Transform)) {
                    const transformComponent: TransformComponent = entityGetComponent(entity, ComponentType.Transform) as TransformComponent;

                    const modelMat: mat4 = mat4.create();
                    mat4.translate(modelMat, modelMat, vec3.fromValues(transformComponent.position.x, transformComponent.position.y, transformComponent.position.z));
                    mat4.rotateX(modelMat, modelMat, transformComponent.rotation.x);
                    mat4.rotateY(modelMat, modelMat, transformComponent.rotation.y);
                    mat4.rotateZ(modelMat, modelMat, transformComponent.rotation.z);
                    mat4.scale(modelMat, modelMat, vec3.fromValues(transformComponent.scale.x, transformComponent.scale.y, transformComponent.scale.z));
                    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, modelMatName), false, modelMat);
                } else {
                    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, modelMatName), false, mat4.create());
                }

                gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, viewMatName), false, viewMat);
                gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, projMatName), false, projMat);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, getTexture(renderComponent.textureID));
                gl.uniform1i(gl.getUniformLocation(shaderProgram, textureName), 0);

                const vao: WebGLVertexArrayObject = generateVAO(vertices, normals, texCoords, indices);
                gl.bindVertexArray(vao);
                gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
            }
        });
    }
};