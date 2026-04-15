/**
 * Manages responsive resizing of the 3D viewer canvas
 */
class Resizer {
  /**
   * Sets up resize observers and event listeners for the container
   */
  constructor(container, camera, renderer) {
    const setSize = () => {
      // Read actual footprint if visible, or fallback to the explicit inline styles we applied during preload
      const width = container.clientWidth || parseInt(container.style.width) || 500;
      const height = container.clientHeight || parseInt(container.style.height) || 500;

      if (!width || !height) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    // Initial size
    setSize();

    // Use ResizeObserver for accurate container resizing even when toggled via display: none/block
    const resizeObserver = new ResizeObserver(() => setSize());
    resizeObserver.observe(container);

    // Fallback for older browsers
    window.addEventListener('resize', setSize);
  }
}

export { Resizer };