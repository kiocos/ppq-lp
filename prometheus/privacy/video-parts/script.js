  // privacy film player: the silent teaser loops in place; play swaps in the film (16:9, or 4:5 on phones)
  // When the film ends, the teaser comes back with "Watch again"; sound will be added to the film file later
  (() => {
    const vp = document.getElementById('vp');
    if (!vp) return;
    const teaser = vp.querySelector('.vp-teaser'), film = vp.querySelector('.vp-film'), play = vp.querySelector('.vp-play'), label = play.querySelector('b');
    const phone = matchMedia('(max-width: 700px)'), reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const src = (name) => `../assets/motion/${name}${phone.matches ? '-tall' : ''}.mp4`;
    const setTeaser = () => {
      teaser.poster = `../assets/motion/enclave-teaser${phone.matches ? '-tall' : ''}-poster.jpg`;
      if (reduce.matches) { teaser.removeAttribute('autoplay'); teaser.pause(); }
      teaser.src = src('enclave-teaser');
      if (!reduce.matches) teaser.play().catch(() => {});
    };
    // the loop only runs while it is on screen
    new IntersectionObserver(([e]) => { if (vp.dataset.state !== 'teaser' || reduce.matches) return; e.isIntersecting ? teaser.play().catch(() => {}) : teaser.pause(); }, { threshold: 0.2 }).observe(vp);
    play.addEventListener('click', () => {
      if (!film.src || film.dataset.cut !== String(phone.matches)) { film.src = src('enclave-film'); film.dataset.cut = String(phone.matches); }
      vp.dataset.state = 'film'; teaser.pause();
      film.currentTime = 0; film.play().catch(() => {}); film.focus({ preventScroll: true });
    });
    film.addEventListener('ended', () => { vp.dataset.state = 'teaser'; label.textContent = 'Watch again'; if (!reduce.matches) teaser.play().catch(() => {}); play.focus({ preventScroll: true }); });
    phone.addEventListener('change', () => { if (vp.dataset.state === 'teaser') setTeaser(); });
    setTeaser();
  })();
