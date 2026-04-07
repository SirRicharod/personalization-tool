class Resizer {
  constructor(container, camera, renderer) {
    const setSize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) return;

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