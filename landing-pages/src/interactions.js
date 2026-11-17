(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const root = document.querySelector('.review-root')
  const metadata = document.querySelector('#variant-data')
  const variants = metadata ? JSON.parse(metadata.textContent) : []
  const motionControllers = []
  let motionPaused = false
  let motionFrame = 0
  let lastMotionTime = 0

  function fitDesktop() {
    if (!root) return
    const panel = root.querySelector('[data-page]:not([hidden])')
    const page = panel?.querySelector('.lp')
    if (!page) return
    if (root.classList.contains('desktop-preview')) {
      const scale = Math.min(1, root.querySelector('.page-viewport').clientWidth / 1280)
      root.style.setProperty('--preview-scale', String(scale))
      panel.style.height = Math.ceil(page.offsetHeight * scale) + 'px'
    } else {
      panel.style.height = ''
    }
  }

  function chooseVariant(id, persist = true) {
    const variant = variants.find(item => item.id === id)
    if (!variant) return
    document.querySelectorAll('[data-page]').forEach(panel => {
      panel.hidden = panel.dataset.page !== id
    })
    document.querySelectorAll('[data-choose]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.choose === id))
    })
    document.querySelector('#variant-select').value = id
    document.querySelector('#variant-note').textContent = variant.note
    document.querySelector('#variant-inspiration').textContent = variant.inspiration
    const standaloneLink = document.querySelector('#standalone-link')
    if (standaloneLink) standaloneLink.href = `${variant.id}-${variant.slug}.html`
    fitDesktop()
    refreshMotion()
    enterHero(document.querySelector(`[data-page="${id}"] .lp`))
    if (persist) {
      try { history.replaceState(null, '', `#layout-${id}`) } catch {}
    }
  }

  function chooseTab(button) {
    const frame = button.closest('.media-frame')
    frame.querySelectorAll('[data-demo]').forEach(tab => {
      const selected = tab === button
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
    })
    frame.querySelectorAll('[data-panel]').forEach(panel => {
      panel.hidden = panel.dataset.panel !== button.dataset.demo
    })
  }

  function setModel(picker, name) {
    const label = picker.querySelector('.selected-model')
    if (label.textContent !== name) label.textContent = name
    picker.querySelectorAll('[data-model]').forEach(button => {
      const selected = button.dataset.model === name
      if (button.getAttribute('aria-pressed') !== String(selected)) button.setAttribute('aria-pressed', String(selected))
      const state = selected ? 'Selected' : 'Select'
      if (button.querySelector('span').textContent !== state) button.querySelector('span').textContent = state
    })
  }

  function fitMenu(picker) {
    const frame = picker.closest('.media-frame')
    if (!frame || !picker.open) return
    const bounds = frame.getBoundingClientRect()
    if (!bounds.width) return
    const scale = bounds.width / frame.offsetWidth
    const left = (picker.getBoundingClientRect().left - bounds.left) / scale
    const width = Math.min(224, frame.offsetWidth - 32)
    const menu = picker.querySelector('.model-menu')
    menu.style.width = width + 'px'
    menu.style.left = Math.max(16 - left, Math.min(0, frame.offsetWidth - 16 - left - width)) + 'px'
  }

  const clamp = value => Math.max(0, Math.min(1, value))
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t) }

  class ProductMotion {
    constructor(element) {
      this.element = element
      this.visible = false
      this.seen = false
      this.wantPlay = !reducedMotion.matches
      this.elapsed = 0
      this.lastScene = -1
      this.optionPoint = null
      const scenes = [...element.querySelectorAll('[data-demo-scene]')]
      this.steps = scenes.length > 1
        ? scenes.map(scene => ({ scene, start: scene.dataset.demoScene === 'api' ? 'Claude' : 'GPT', target: scene.dataset.demoScene === 'api' ? 'GPT' : 'Claude' }))
        : [{ scene: scenes[0], start: 'Claude', target: 'GPT' }, { scene: scenes[0], start: 'GPT', target: scenes[0].dataset.demoScene === 'api' ? 'Claude' : 'Open-weight model' }]
      this.duration = this.steps.length * 8000
      this.controls = element.querySelector('.motion-controls')
      this.toggle = this.controls.querySelector('[data-motion-toggle]')
      this.slider = this.controls.querySelector('.motion-seek')
      this.status = this.controls.querySelector('.motion-status')
      this.slider.max = String(this.duration)
      this.render()
      this.updateControls()
    }

    get canRun() {
      return this.wantPlay && this.visible && !motionPaused && !reducedMotion.matches && !document.hidden && !this.element.closest('[hidden]')
    }

    updateControls() {
      this.toggle.disabled = motionPaused && !reducedMotion.matches
      this.toggle.textContent = reducedMotion.matches ? 'Next step' : motionPaused ? 'Motion paused' : this.wantPlay ? 'Pause demo' : 'Play demo'
      this.element.classList.toggle('demo-paused', !this.canRun)
      this.element.dataset.motionState = reducedMotion.matches ? 'reduced' : this.canRun ? 'playing' : this.wantPlay && !motionPaused ? 'waiting' : 'paused'
    }

    pause() {
      this.wantPlay = false
      this.updateControls()
      refreshMotion()
    }

    playOrStep() {
      if (reducedMotion.matches) {
        const positions = this.steps.flatMap((_, index) => [1400, 3400, 6000].map(time => index * 8000 + time))
        this.seek(positions.find(time => time > this.elapsed + 50) ?? 0)
        return
      }
      this.wantPlay = !this.wantPlay
      this.updateControls()
      refreshMotion()
    }

    seek(time) {
      this.wantPlay = false
      this.elapsed = Math.max(0, Math.min(this.duration - 1, time))
      this.render()
      this.updateControls()
      refreshMotion()
    }

    replay() {
      this.elapsed = 0
      this.lastScene = -1
      this.wantPlay = !reducedMotion.matches && !motionPaused
      this.render()
      this.updateControls()
      refreshMotion()
    }

    render() {
      const index = Math.floor(this.elapsed / 8000)
      const phase = this.elapsed % 8000
      const step = this.steps[index]
      const scene = step.scene
      const picker = scene.querySelector('.model-picker')
      const frame = scene.closest('.media-frame')
      const kind = scene.dataset.demoScene
      if (this.lastScene !== index) {
        this.element.querySelectorAll('.model-picker').forEach(item => { item.open = false })
        this.element.querySelectorAll('.motion-hover').forEach(item => item.classList.remove('motion-hover'))
        this.element.querySelectorAll('.is-typing').forEach(item => item.classList.remove('is-typing'))
        this.element.querySelectorAll('.motion-cursor').forEach(item => { item.style.opacity = '0' })
        const tab = this.element.querySelector(`[data-demo="${kind}"]`)
        if (tab) chooseTab(tab)
        this.optionPoint = null
        this.lastScene = index
      }
      const opened = phase >= 1100 && phase < 3200
      if (picker.open !== opened) picker.open = opened
      if (opened) fitMenu(picker)
      setModel(picker, phase >= 3200 ? step.target : step.start)
      const option = [...picker.querySelectorAll('[data-model]')].find(button => button.dataset.model === step.target)
      picker.querySelectorAll('[data-model]').forEach(button => button.classList.toggle('motion-hover', button === option && phase >= 2200 && phase < 3200))
      const draft = scene.querySelector('.demo-draft')
      const prompt = kind === 'api' ? 'Explain this codebase.' : 'Help me plan this project.'
      const count = phase < 4200 ? 0 : reducedMotion.matches ? prompt.length : Math.floor(clamp((phase - 4200) / 1400) * prompt.length)
      const text = count ? prompt.slice(0, count) : draft.dataset.idle
      if (draft.textContent !== text) draft.textContent = text
      draft.classList.toggle('has-draft', count > 0)
      draft.classList.toggle('is-typing', phase >= 4200 && phase < 5600 && !reducedMotion.matches)
      const label = kind === 'api' ? 'OpenCode' : 'Chat'
      const status = phase < 1100 ? `${label} · Open model picker` : phase < 3200 ? `${label} · Choose ${step.target}` : phase < 4200 ? `${step.target} selected` : phase < 5600 ? `${label} · Draft a request` : 'Preview only · no request sent'
      if (this.status.textContent !== status) this.status.textContent = status
      this.slider.value = String(Math.round(this.elapsed))
      if (this.slider.getAttribute('aria-valuetext') !== status) this.slider.setAttribute('aria-valuetext', status)
      this.element.dataset.motionScene = kind
      this.element.dataset.motionPhase = String(Math.round(phase))
      this.drawCursor(frame, picker, option, draft, phase, opened)
    }

    drawCursor(frame, picker, option, draft, phase, opened) {
      const cursor = frame.querySelector('.motion-cursor')
      if (reducedMotion.matches || phase >= 4600) {
        cursor.style.opacity = '0'
        return
      }
      const bounds = frame.getBoundingClientRect()
      if (!bounds.width) return
      const scale = bounds.width / frame.offsetWidth
      const point = target => {
        const rect = target.getBoundingClientRect()
        return { x: Math.max(12, Math.min(frame.offsetWidth - 24, (rect.left - bounds.left + Math.min(rect.width * .6, 64 * scale)) / scale)), y: (rect.top - bounds.top + rect.height * .55) / scale }
      }
      const summary = point(picker.querySelector('summary'))
      if (opened) this.optionPoint = point(option)
      const choice = this.optionPoint || { x: summary.x, y: summary.y - 86 }
      const input = point(draft)
      const mix = (a, b, t) => ({ x: a.x + (b.x - a.x) * ease(t), y: a.y + (b.y - a.y) * ease(t) })
      let position = summary
      if (phase < 1100) position = mix({ x: Math.min(summary.x + 64, frame.offsetWidth - 24), y: summary.y - 32 }, summary, phase / 1100)
      else if (phase >= 1800 && phase < 2600) position = mix(summary, choice, (phase - 1800) / 800)
      else if (phase >= 2600 && phase < 3200) position = choice
      else if (phase >= 3200) position = mix(choice, input, (phase - 3200) / 800)
      cursor.style.transform = `translate(${position.x}px, ${position.y}px)`
      cursor.style.opacity = String(phase < 300 ? phase / 300 : phase > 4200 ? 1 - (phase - 4200) / 400 : 1)
      const clickStart = phase >= 3000 ? 3000 : 1000
      const click = (phase - clickStart) / 400
      cursor.style.setProperty('--click-scale', String(click >= 0 && click <= 1 ? .5 + click * 1.5 : 0))
      cursor.style.setProperty('--click-opacity', String(click >= 0 && click <= 1 ? 1 - click : 0))
    }
  }

  function controllerFor(target) {
    const owner = target.closest('[data-motion-demo]')
    return motionControllers.find(controller => controller.element === owner)
  }

  function motionTick(time) {
    motionFrame = 0
    const delta = lastMotionTime ? Math.min(100, time - lastMotionTime) : 0
    lastMotionTime = time
    motionControllers.forEach(controller => {
      if (!controller.canRun) return
      controller.elapsed = (controller.elapsed + delta) % controller.duration
      controller.render()
    })
    if (motionControllers.some(controller => controller.canRun)) motionFrame = requestAnimationFrame(motionTick)
    else lastMotionTime = 0
  }

  function refreshMotion() {
    motionControllers.forEach(controller => controller.updateControls())
    if (motionControllers.some(controller => controller.canRun)) {
      if (!motionFrame) motionFrame = requestAnimationFrame(motionTick)
    } else {
      cancelAnimationFrame(motionFrame)
      motionFrame = 0
      lastMotionTime = 0
    }
  }

  function enterHero(page) {
    const stage = page?.querySelector('.hero-stage')
    if (!stage || reducedMotion.matches || motionPaused || !stage.animate) return
    stage.getAnimations().forEach(animation => animation.cancel())
    stage.animate([{ opacity: .15, transform: 'translateY(36px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 880, easing: 'cubic-bezier(.16,1,.3,1)' })
  }

  document.addEventListener('click', event => {
    const motionToggle = event.target.closest('[data-motion-toggle]')
    if (motionToggle) controllerFor(motionToggle)?.playOrStep()
    const motionReplay = event.target.closest('[data-motion-replay]')
    if (motionReplay) controllerFor(motionReplay)?.replay()
    const globalToggle = event.target.closest('.global-motion-toggle')
    if (globalToggle) {
      motionPaused = !motionPaused
      globalToggle.setAttribute('aria-pressed', String(motionPaused))
      globalToggle.textContent = motionPaused ? 'Retomar animações' : 'Pausar animações'
      document.querySelectorAll('.lp').forEach(page => {
        page.classList.toggle('motion-paused', motionPaused)
        if (motionPaused) page.getAnimations({ subtree: true }).forEach(animation => {
          if (animation.effect?.getTiming().iterations !== Infinity) animation.finish()
        })
      })
      refreshMotion()
    }
    const variantButton = event.target.closest('[data-choose]')
    if (variantButton) chooseVariant(variantButton.dataset.choose)
    const viewportButton = event.target.closest('[data-width]')
    if (viewportButton && root) {
      root.classList.toggle('mobile-preview', viewportButton.dataset.width === 'mobile')
      root.classList.toggle('desktop-preview', viewportButton.dataset.width === 'desktop')
      document.querySelectorAll('[data-width]').forEach(button => button.setAttribute('aria-pressed', String(button === viewportButton)))
      fitDesktop()
    }
    const tab = event.target.closest('[data-demo]')
    if (tab) chooseTab(tab)
    const model = event.target.closest('[data-model]')
    if (model) {
      const picker = model.closest('.model-picker')
      setModel(picker, model.dataset.model)
      picker.open = false
      picker.querySelector('summary').focus({ preventScroll: true })
    }
    if (!event.target.closest('.model-picker,.motion-controls,.global-motion-toggle')) document.querySelectorAll('.model-picker[open]').forEach(picker => { picker.open = false })
    const anchor = event.target.closest('a[href^="#"]')
    if (anchor) {
      const target = document.getElementById(anchor.getAttribute('href').slice(1))
      if (target) {
        event.preventDefault()
        target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' })
        target.setAttribute('tabindex', '-1')
        target.focus({ preventScroll: true })
      }
    }
  })

  document.addEventListener('input', event => {
    if (event.target.matches('.motion-seek')) controllerFor(event.target)?.seek(Number(event.target.value))
  })
  document.addEventListener('toggle', event => {
    if (event.target.matches('.model-picker')) fitMenu(event.target)
  }, true)
  const pauseForInteraction = event => {
    if (event.target.closest('.media-frame') && event.target.closest('button, summary, [role="tabpanel"]')) controllerFor(event.target)?.pause()
  }
  document.addEventListener('pointerdown', pauseForInteraction)
  document.addEventListener('focusin', pauseForInteraction)
  document.addEventListener('visibilitychange', refreshMotion)
  window.addEventListener('pagehide', () => { cancelAnimationFrame(motionFrame); motionFrame = 0; lastMotionTime = 0 })
  window.addEventListener('pageshow', refreshMotion)

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const picker = event.target.closest('.model-picker[open]')
      if (picker) {
        picker.open = false
        picker.querySelector('summary').focus()
      }
    }
    const tab = event.target.closest('[role="tab"]')
    if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')]
      const index = tabs.indexOf(tab)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length
      chooseTab(tabs[next])
      tabs[next].focus()
    }
  })

  document.querySelector('#variant-select')?.addEventListener('change', event => chooseVariant(event.target.value))
  document.querySelector('#notes-toggle')?.addEventListener('change', event => root.classList.toggle('show-notes', event.target.checked))
  document.querySelectorAll('[data-motion-demo]').forEach(element => {
    if (!element.querySelector('[data-demo-scene]')) {
      element.querySelector('.motion-controls')?.remove()
      element.removeAttribute('data-motion-demo')
      return
    }
    motionControllers.push(new ProductMotion(element))
  })
  reducedMotion.addEventListener('change', () => {
    motionControllers.forEach(controller => {
      controller.wantPlay = false
      controller.render()
    })
    refreshMotion()
  })
  document.fonts.ready.then(() => enterHero(document.querySelector('[data-page]:not([hidden]) .lp') || document.querySelector('.lp')))
  if (root) {
    const id = location.hash.match(/^#layout-(\d{2})$/)?.[1]
    if (id) chooseVariant(id, false)
    fitDesktop()
    document.fonts.ready.then(fitDesktop)
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(fitDesktop)
      resizeObserver.observe(root.querySelector('.page-viewport'))
      root.querySelectorAll('.lp').forEach(page => resizeObserver.observe(page))
    }
  }

  if ('IntersectionObserver' in window) {
    const productObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const controller = motionControllers.find(item => item.element === entry.target)
        if (!controller) return
        controller.visible = entry.isIntersecting && entry.intersectionRatio >= .12
        if (controller.visible && !controller.seen) {
          controller.seen = true
          const frame = entry.target.querySelector('.media-frame')
          if (entry.target.dataset.motionDemo !== 'hero' && !reducedMotion.matches && !motionPaused && frame.animate) {
            frame.animate([{ opacity: .2, transform: 'translateY(32px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' })
          }
        }
      })
      refreshMotion()
    }, { threshold: [0, .12] })
    motionControllers.forEach(controller => productObserver.observe(controller.element))
    const chapterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const navigation = entry.target.closest('.lp').querySelector('.chapter-nav')
        navigation?.querySelectorAll('a').forEach(anchor => {
          if (anchor.hash === '#' + entry.target.id) anchor.setAttribute('aria-current', 'location')
          else anchor.removeAttribute('aria-current')
        })
      })
    }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 })
    document.querySelectorAll('.variant-chapters .section').forEach(section => chapterObserver.observe(section))
  } else {
    motionControllers.forEach(controller => { controller.visible = true })
    refreshMotion()
  }
})()
