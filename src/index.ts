import { updateCameraAspect } from './camera';
import { MeshID, ShaderID, TextureID, addMesh, addShader, addTexture } from './resourceManager';
import { createSphere } from './mesh';
import { EntityID, createEntity, entityGetComponent } from './entity';
import { ComponentType, TransformComponent, createRenderComponent, createTransformComponent } from './component';
import { renderSystem } from './systems';

const canvasID: string = 'webglCanvas';
const canvas: HTMLCanvasElement | null = document.getElementById(canvasID) as HTMLCanvasElement;
const gl: WebGL2RenderingContext | null = canvas.getContext('webgl2');

if (canvas === null) {
    alert('Unable to find canvas element with ID: ' + canvasID);
}
if (gl === null) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
}

window.addEventListener('resize', () => {
    if (canvas !== null) {

        canvas.width = canvas.clientWidth * window.devicePixelRatio;
        canvas.height = canvas.clientHeight * window.devicePixelRatio;

        gl.viewport(0, 0, canvas.width, canvas.height);

        updateCameraAspect(canvas.width / canvas.height);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const updateFPS = (time: number): [number, number] => {
        const currTime: number = performance.now();
        const delta: number = currTime - time;
        const fpsValue: number = Math.floor(1000 / delta);
        const fps: HTMLElement | null = document.getElementById('fps');
        if (fps !== null) {
            fps.textContent = `FPS: ${fpsValue}`;
        }

        return [currTime, delta];
    }

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    // setup entities
    const entities: EntityID[] = [];

    // compile shaders
    const planetVertexShaderSource: string = await (await fetch('assets/shaders/planetShader.vert')).text();
    const planetFragmentShaderSource: string = await (await fetch('assets/shaders/planetShader.frag')).text();

    if (planetVertexShaderSource === null || planetFragmentShaderSource === null) {
        throw new Error('Unable to fetch shader source');
    }
    const planetShaderID: ShaderID = addShader(gl, planetVertexShaderSource, planetFragmentShaderSource);

    // load textures
    const earthTextureUrl: string = 'assets/textures/earth.jpg';
    const earthTextureID: TextureID = await addTexture(gl, earthTextureUrl);

    // load and setup sphere
    const sphereMeshID: MeshID = addMesh(createSphere(5, 20, 20));
    const sphereEntity: EntityID = createEntity([createRenderComponent(sphereMeshID, earthTextureID, planetShaderID), createTransformComponent({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 })]);
    entities.push(sphereEntity);

    // setup systems
    const systems = [renderSystem];

    let lastTime = performance.now();
    function render(time: number) {
        time *= 0.001; // Convert time to seconds
        const updateFPSResult: [number, number] = updateFPS(lastTime);
        lastTime = updateFPSResult[0];
        const deltaTime: number = updateFPSResult[1];

        const rotationSpeed = 0.5; 
        const rotationAngle = time * rotationSpeed;

        (entityGetComponent(sphereEntity, ComponentType.Transform) as TransformComponent).rotation = { x: 0, y: rotationAngle, z: 0 };

        gl.clearColor(0.0, 0.0, 0.0, 1.0); 
        gl.clearDepth(1.0); 
        gl.enable(gl.DEPTH_TEST); 
        gl.depthFunc(gl.LEQUAL); 
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        systems.forEach((system) => {
            system.update(entities, deltaTime, gl);
        });

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
});