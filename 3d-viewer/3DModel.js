// Component imports
import { createScene } from './components/scene.js';
import { createCamera } from './components/camera.js';
import { createLights } from './components/lights.js';
import { loadModel } from './components/model.js';

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

    start() {
        loop.start();
    }

    stop() {
        loop.stop();
    }

    changeModelColor(hexColor) {
        if (!model) return;
        model.traverse((child) => {
            if (child.isMesh) {
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