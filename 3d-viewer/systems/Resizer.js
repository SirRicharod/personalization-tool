class Resizer {
  constructor(container, camera, renderer) {
    let width = container.clientWidth;
    let height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

    window.addEventListener('resize', () => {
      width = container.clientWidth;
      height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    });
  }
}

export { Resizer };