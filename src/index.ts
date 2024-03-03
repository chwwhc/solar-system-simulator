import { updateCameraAspect, getCameraFront, getCameraPosition, getCameraUp } from './camera';
import { MeshID, ShaderID, TextureID, addMesh, addShader, addTexture } from './resourceManager';
import { createRing, createSphere } from './mesh';
import { EntityID, createEntity } from './entity';
import { createRenderComponent, createRotationComponent, createTransformComponent } from './component';
import { inputSystem, renderSystem, rotationSystem } from './systems';
import { Planet, Ring, planetRadius, planetRotationSpeed, planetTextureUrl, planetTranslation, ringRadius, ringRotationSpeed, ringTextureUrl, ringTranslation } from './planetConstants';
import { vec3 } from 'gl-matrix';

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
    const updateDisplayInfo = (time: number): [number, number] => {
        // update fps
        const currTime: number = performance.now();
        const delta: number = currTime - time;
        const fpsValue: number = Math.floor(1000 / delta);
        const fps: HTMLElement | null = document.getElementById('fps');
        if (fps !== null) {
            fps.textContent = `FPS: ${fpsValue}`;
        }

        // update camera info
        const cameraPos = getCameraPosition();
        const cameraFront = getCameraFront();
        const cameraUp = getCameraUp();

        document.getElementById('cameraPosition').innerText = `Camera Position Vector: ${cameraPos[0].toFixed(2)}, ${cameraPos[1].toFixed(2)}, ${cameraPos[2].toFixed(2)}`;
        document.getElementById('cameraFront').innerText = `Camera Front Vector: ${cameraFront[0].toFixed(2)}, ${cameraFront[1].toFixed(2)}, ${cameraFront[2].toFixed(2)}`;
        document.getElementById('cameraUp').innerText = `Camera Up Vector: ${cameraUp[0].toFixed(2)}, ${cameraUp[1].toFixed(2)}, ${cameraUp[2].toFixed(2)}`;

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
    const ringVertexShaderSource: string = await (await fetch('assets/shaders/ringShader.vert')).text();
    const ringFragmentShaderSource: string = await (await fetch('assets/shaders/ringShader.frag')).text();
    if (ringVertexShaderSource === null || ringFragmentShaderSource === null) {
        throw new Error('Unable to fetch shader source');
    }
    const ringShaderID: ShaderID = addShader(gl, ringVertexShaderSource, ringFragmentShaderSource);


    Object.keys(Planet).forEach(async (key) => {
        const planet: Planet = key as Planet;

        // load textures
        const textureID: TextureID = await addTexture(gl, planetTextureUrl.get(planet) as string);
        // construct planet mesh
        const planetMeshID: MeshID = addMesh(createSphere(planetRadius.get(planet)));
        // create planet entity
        const planetEntity: EntityID = createEntity([
            createRenderComponent(planetMeshID, textureID, planetShaderID),
            createTransformComponent(planetTranslation.get(planet), vec3.create(), vec3.fromValues(1, 1, 1)),
            createRotationComponent(vec3.fromValues(0, 1, 0), planetRotationSpeed.get(planet))
        ]);
        entities.push(planetEntity);
    });

    Object.keys(Ring).forEach(async (key) => {
        const ring: Ring = key as Ring;

        // load textures
        const textureID: TextureID = await addTexture(gl, ringTextureUrl.get(ring) as string);
        // construct planet mesh
        const ringMeshID: MeshID = addMesh(createRing(ringRadius.get(ring)[0], ringRadius.get(ring)[1]));
        // create planet entity
        const ringEntity: EntityID = createEntity([
            createRenderComponent(ringMeshID, textureID, ringShaderID),
            createTransformComponent(ringTranslation.get(ring), vec3.create(), vec3.fromValues(1, 1, 1)),
            createRotationComponent(vec3.fromValues(0, 1, 0), ringRotationSpeed.get(ring))
        ]);
        entities.push(ringEntity);
    });

    // setup systems
    const systems = [inputSystem, rotationSystem, renderSystem];

    let lastTime = performance.now();
    function render(time: number) {
        time *= 0.001; // Convert time to seconds
        const updateFPSResult: [number, number] = updateDisplayInfo(lastTime);
        lastTime = updateFPSResult[0];
        const deltaTime: number = updateFPSResult[1];

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