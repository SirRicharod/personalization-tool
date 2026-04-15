/**
 * Manages the animation loop and frame updates
 */
class Loop {
  /**
   * Initializes the loop with camera, scene, and renderer
   * @param {THREE.Camera} camera - The camera to render from
   * @param {THREE.Scene} scene - The scene to render
   * @param {THREE.WebGLRenderer} renderer - The renderer to use
   */
  constructor(camera, scene, renderer) {
    this.camera = camera;
    this.scene = scene;
    this.renderer = renderer;
    this.updatables = [];
  }

  /**
   * Starts the animation loop using requestAnimationFrame
   */
  start() {
    this.renderer.setAnimationLoop(() => {
      this.tick();
      this.renderer.render(this.scene, this.camera);
    });
  }

  /**
   * Stops the animation loop
   */
  stop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * Updates all registered updatable objects (called every frame)
   */
  tick() {
    for (const object of this.updatables) {
      object.update();
    }
  }
}

export { Loop };