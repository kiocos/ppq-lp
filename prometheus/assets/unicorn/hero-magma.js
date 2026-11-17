(() => {
  const element = document.getElementById('hero-magma');
  const button = document.getElementById('hero-art-toggle');
  if (!element || !button || !window.UnicornStudio) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let scene;
  let stopped = reduced.matches;
  let disposed = false;

  function update() {
    button.setAttribute('aria-pressed', String(stopped));
    button.setAttribute('aria-label', stopped ? 'Play background animation' : 'Pause background animation');
    if (!scene) return;
    scene.setVariables({
      Motion: !stopped,
      'Mouse influence': stopped || coarse.matches ? 0 : 0.75
    });
    scene.paused = stopped;
  }

  function preferenceChanged() {
    stopped = reduced.matches;
    update();
  }

  button.addEventListener('click', () => {
    stopped = !stopped;
    update();
  });
  reduced.addEventListener('change', preferenceChanged);
  coarse.addEventListener('change', update);

  function destroy() {
    disposed = true;
    reduced.removeEventListener('change', preferenceChanged);
    coarse.removeEventListener('change', update);
    scene?.destroy();
  }

  addEventListener('pagehide', event => {
    if (!event.persisted) destroy();
  });

  window.UnicornStudio.addScene({
    element,
    projectId: 'iN8ERNBuIx6r8XNnuMEl',
    fps: 30,
    dpi: 1,
    scale: 0.75,
    lazyLoad: false,
    production: false,
    initialVariables: {
      Motion: !stopped,
      'Mouse influence': stopped || coarse.matches ? 0 : 0.75,
      'Flow speed': 0.31
    },
    interactivity: { mouse: { disableMobile: true } }
  }).then(result => {
    if (disposed) {
      result.destroy();
      return;
    }
    scene = result;
    element.classList.add('is-ready');
    element.dataset.sceneStatus = 'ready';
    button.hidden = false;
    update();
  }).catch(error => {
    element.dataset.sceneStatus = 'fallback';
    console.warn('Hero animation unavailable; showing the static artwork', error);
  });
})();
