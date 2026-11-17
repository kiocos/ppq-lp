(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 900px)');
  const landscape = matchMedia('(min-width: 520px) and (max-height: 500px)');

  function mount(root) {
    const steps = [...root.querySelectorAll('.story-step')];
    const visual = root.querySelector('.story-visual');
    let progress = 0, scheduled = false;

    const update = () => {
      scheduled = false;
      const remaining = innerHeight - 64 - visual.offsetHeight;
      const line = narrow.matches && !landscape.matches
        ? 64 + visual.offsetHeight + Math.max(80, remaining / 2)
        : 64 + (innerHeight - 64) / 2;
      const centers = steps.map((step) => {
        const rect = step.getBoundingClientRect();
        return rect.top + rect.height / 2;
      });
      progress = centers.length - 1;
      if (line <= centers[0]) progress = 0;
      else for (let i = 0; i < centers.length - 1; i++) {
        if (line <= centers[i + 1]) {
          progress = i + (line - centers[i]) / Math.max(1, centers[i + 1] - centers[i]);
          break;
        }
      }
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    };

    // Read native scroll position without moving the page or hiding any copy
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    new ResizeObserver(schedule).observe(root);
    update();
    return { get progress() { return motion.matches ? Math.round(progress) : progress; } };
  }

  window.PPQStory = { mount };
})();
