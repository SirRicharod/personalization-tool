// Component imports
import { createScene } from './components/scene.js';
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { loadModel } from './components/model.js';
import { updateModelTexture } from './components/textureProjector.js';
import { getPreset } from './presets/lightingPresetsLoader.js';
import { Color } from 'three';
// System imports
import { createRenderer } from './systems/Renderer.js';
import { Loop } from './systems/Loop.js';
import { Resizer } from './systems/Resizer.js';
import { createControls } from './systems/Controls.js';

let scene;
let camera;
let renderer;
let loop;
let controls;
let model;
let container;

class Model {
    constructor(containerElement) {
        container = containerElement;

        // 1. Initialize Core Components
        scene = createScene();
        camera = createCamera();
        renderer = createRenderer();

        // 2. Initialize Systems
        loop = new Loop(camera, scene, renderer);
        controls = createControls(camera, renderer.domElement);
        new Resizer(container, camera, renderer);

        // 3. Setup Scene Elements
        const { mainLight, fillLight, ambientLight } = createLights();
        this.mainLight = mainLight;
        this.fillLight = fillLight;
        this.ambientLight = ambientLight;
        scene.add(mainLight, fillLight, ambientLight);

        // 4. Link Systems
        loop.updatables.push(controls);

        container.appendChild(renderer.domElement);
    }

    async init(modelPath = '/models/tshirt.glb') {
        try {
            model = await loadModel(modelPath);
            scene.add(model);
        } catch (error) {
            console.error('Failed to initialize 3D Model:', error);
            // Optionally display a UI message here
        }
    }

    updateTexture(canvasElement, modelId = 'tshirt') {
        if (model) {
            updateModelTexture(model, canvasElement, modelId);
        }
    }

    async switchModel(modelPath, canvasElement, modelId) {
        if (model) {
            scene.remove(model);
            model = null;
        }
        try {
            model = await loadModel(modelPath);
            scene.add(model);

            // Re-project the decal
            if (canvasElement) {
                this.updateTexture(canvasElement, modelId);
            }
        } catch (error) {
            console.error('Failed to switch model:', error);
        }
    }

    start() {
        loop.start();
    }

    stop() {
        loop.stop();
    }

    changeModelColor(hexColor) {
        if (!model) return;
        model.traverse((child) => {
            if (child.isMesh && !child.userData.isProxy && child.material && child.material.color) {
                child.material.color.setHex(hexColor);
            }
        });
    }

    toggleAutoRotate(enabled) {
        controls.autoRotate = enabled;
    }

    setAutoRotateSpeed(speed) {
        controls.autoRotateSpeed = speed;
    }

    setLightingPreset(presetId) {
        const preset = getPreset(presetId);
        if (!preset) return;

        this.mainLight.intensity = preset.mainLight.intensity;
        this.mainLight.position.set(...preset.mainLight.position);
        if (preset.mainLight.color !== undefined) {
            this.mainLight.color.setHex(parseInt(preset.mainLight.color));
        } else {
            this.mainLight.color.setHex(0xffffff);
        }

        this.fillLight.intensity = preset.fillLight.intensity;
        this.fillLight.position.set(...preset.fillLight.position);
        if (preset.fillLight.color !== undefined) {
            this.fillLight.color.setHex(parseInt(preset.fillLight.color));
        } else {
            this.fillLight.color.setHex(0xffffff);
        }

        this.ambientLight.intensity = preset.ambientLight.intensity;
        if (preset.ambientLight.color !== undefined) {
            this.ambientLight.color.setHex(parseInt(preset.ambientLight.color));
        } else {
            this.ambientLight.color.setHex(0xffffff);
        }

        if (preset.backgroundColor) {
            scene.background = new Color(parseInt(preset.backgroundColor));
        } else {
            scene.background = null;
        }
    }

    exportScreenshot() {
        renderer.render(scene, camera);

        // Grab the image data
        const dataURL = renderer.domElement.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'my-3d-design.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    dispose() {
        loop.stop();
        renderer.dispose();
        // Clean up DOM element
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
    }
}

export { Model };