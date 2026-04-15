import * as THREE from 'three';
import { getModelConfig } from '../presets/configLoader.js';

let projectorCamera = null;
let customMaterial = null;
let decalProxies = [];

/**
 * Initializes the custom shader material for texture projection (one-time setup)
 */
// Initialize the shader overrides exactly once per model load to prevent memory leaks
function initProjector() {
    if (customMaterial) return;

    projectorCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);

    customMaterial = new THREE.ShaderMaterial({
        uniforms: {
            decalTex: { value: null },
            projMatrix: { value: new THREE.Matrix4() },
            projDirection: { value: new THREE.Vector3(0, 0, -1) },
        },
        vertexShader: `
            varying vec4 vWorldPos;
            varying vec3 vWorldNormal;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPos = worldPosition;
                vWorldNormal = normalize(mat3(modelMatrix) * normal);
                gl_Position = projectionMatrix * viewMatrix * worldPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D decalTex;
            uniform mat4 projMatrix;
            uniform vec3 projDirection;

            varying vec4 vWorldPos;
            varying vec3 vWorldNormal;

            void main() {
                vec4 pPos = projMatrix * vWorldPos;
                vec3 projCoord = pPos.xyz / pPos.w;

                // Slice perfectly to the projection camera bounds
                if (projCoord.x < -1.0 || projCoord.x > 1.0 ||
                    projCoord.y < -1.0 || projCoord.y > 1.0 ||
                    projCoord.z < -1.0 || projCoord.z > 1.0) {
                    discard;
                }

                // Strict backface culling to stop bleeding onto the back of the shirt
                float facingRatio = dot(vWorldNormal, -projDirection);
                if (facingRatio < 0.1) {
                    discard;
                }

                vec2 decalUv = projCoord.xy * 0.5 + 0.5;
                vec4 dcl = texture2D(decalTex, decalUv);

                // Discard transparent bounds of the PNG so we only see the logo
                if (dcl.a < 0.05) {
                    discard;
                }

                gl_FragColor = dcl;
            }
        `,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4
    });
}

export function updateModelTexture(model, canvasElement, modelId = 'tshirt') {
    if (!model || !canvasElement) return;

    const config = getModelConfig(modelId);
    if (!config) return;

    // Build the global material if it doesn't exist yet
    initProjector();

    // Clone proxies onto THIS specific model if we haven't already!
    if (!model.userData.hasProxies) {
        model.traverse((child) => {
            if (child.isMesh && !child.userData.isProxy) {
                const proxy = child.clone();
                proxy.userData.isProxy = true;
                proxy.material = customMaterial;
                proxy.renderOrder = 100;
                child.parent.add(proxy);
            }
        });
        model.userData.hasProxies = true;
    }

    // Prevent memory leaks by disposing of the old texture before creating the new one
    if (customMaterial.uniforms.decalTex.value) {
        customMaterial.uniforms.decalTex.value.dispose();
    }

    // We can accept an Image object or a Canvas object here
    const texture = new THREE.Texture(canvasElement);
    texture.needsUpdate = true; // Essential when passing an HTML Image to raw THREE.Texture
    texture.flipY = true;       // Enforce WebGL origin alignment
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;

    customMaterial.uniforms.decalTex.value = texture;

    // Grab model bounds
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Lock Aspect Ratio so rectangular canvases don't warp
    const aspect = canvasElement.width / canvasElement.height;
    
    // Scale camera footprint to match your config
    const targetWidth = (size.x * 0.8) / (config.projection.scale || 1.0);
    const targetHeight = targetWidth / aspect;

    projectorCamera.left = -targetWidth / 2;
    projectorCamera.right = targetWidth / 2;
    projectorCamera.top = targetHeight / 2;
    projectorCamera.bottom = -targetHeight / 2;
    // Camera is placed 0.5 units away from the front bounding box.
    const distanceToFront = 0.5;
    const anchorZ = center.z + (size.z / 2) + distanceToFront;

    // Fix the camera's depth of field so it mathematically stops exactly halfway through the torso.
    // In our previous version it was getting clipped before it ever reached the shirt!
    projectorCamera.far = distanceToFront + (size.z / 2);
    projectorCamera.updateProjectionMatrix();

    // Map offset variables from JSON config
    const anchorX = center.x + (config.projection.offset.x || 0);
    const anchorY = center.y + (size.y * 0.15) + (config.projection.offset.y || 0);

    projectorCamera.position.set(anchorX, anchorY, anchorZ);
    projectorCamera.lookAt(anchorX, anchorY, center.z);
    projectorCamera.updateMatrixWorld();

    // Feed math back into the Shader
    const projMatrix = new THREE.Matrix4();
    projMatrix.multiplyMatrices(
        projectorCamera.projectionMatrix,
        projectorCamera.matrixWorldInverse
    );

    customMaterial.uniforms.projMatrix.value.copy(projMatrix);

    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(projectorCamera.quaternion).normalize();
    customMaterial.uniforms.projDirection.value.copy(dir);
}
