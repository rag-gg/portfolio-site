(() => {
  'use strict';
  const cursor = document.querySelector('.custom-cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let lenis;
  let cursorEnabled = false;
  const dialogOpeners = new Map();

  function resetCursor() {
    root.classList.remove('custom-cursor-active');
    cursor.style.opacity = '0';
  }

  document.querySelectorAll('[data-open]').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.open);
      if (!dialog) return;
      dialogOpeners.set(dialog, button);
      resetCursor();
      lenis?.stop();
      dialog.showModal();
      dialog.querySelector('.dialog-close').focus();
    });
  });
  document.querySelectorAll('.project-dialog').forEach(dialog => {
    dialog.setAttribute('data-lenis-prevent', '');
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => { lenis?.start(); dialogOpeners.get(dialog)?.focus(); });
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    const heroIntro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '.hero', start: 'top bottom', end: 'bottom top', toggleActions: 'play reverse play reverse', invalidateOnRefresh: true }
    });
    heroIntro.from('.name-line > span', { yPercent: 105, duration: 1, stagger: .13 }, .08)
      .from('.hero-enter', { y: 20, opacity: 0, duration: .8, stagger: .12 }, .3)
      .from('.floating-tech', { opacity: 0, scale: .8, duration: 1, stagger: .09 }, .35);

    // Reset outside either edge of the viewport, then replay on re-entry in either direction.
    gsap.utils.toArray('.reveal').forEach(element => {
      gsap.fromTo(element, { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: .65, ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 93%', end: 'bottom 7%', toggleActions: 'play reverse play reverse', invalidateOnRefresh: true }
      });
    });
    gsap.utils.toArray('.reveal-visual').forEach(element => {
      gsap.fromTo(element, { y: 45, opacity: 0, scale: .97 }, {
        y: 0, opacity: 1, scale: 1, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 94%', end: 'bottom 6%', toggleActions: 'play reverse play reverse', invalidateOnRefresh: true }
      });
    });
    gsap.fromTo('.hero-recognition', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .65, scrollTrigger: { trigger: '.hero-recognition', start: 'top 96%', end: 'bottom 4%', toggleActions: 'play reverse play reverse' } });

    gsap.utils.toArray('.floating-tech').forEach((element, index) => {
      gsap.to(element, { y: index % 2 ? -11 : 12, rotate: index % 2 ? -4 : 4, duration: 3.3 + index * .28, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });
    gsap.to('.tech-cloud', { y: 85, rotate: 5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 } });
    gsap.to('.hero-copy', { y: 35, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.utils.toArray('.mockup-parallax').forEach(element => {
      gsap.fromTo(element, { y: 22 }, { y: -22, ease: 'none', scrollTrigger: { trigger: element.closest('.project-visual'), start: 'top bottom', end: 'bottom top', scrub: 1.1 } });
    });
    gsap.to('.moving-line', { strokeDashoffset: -120, duration: 7, repeat: -1, ease: 'none' });
    gsap.utils.toArray('.automation-node').forEach((element, index) => {
      gsap.to(element, { y: index % 2 ? 8 : -9, duration: 3.4 + index * .4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    });

    if (window.Lenis && finePointer.matches) {
      lenis = new Lenis({ duration: .95, smoothWheel: true, syncTouch: false, anchors: { offset: -65 } });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = time => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = undefined; };
    }
  });

  media.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    cursorEnabled = true;
    let firstMove = true;
    const xTo = gsap.quickTo(cursor, 'x', { duration: .14, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: .14, ease: 'power3.out' });
    const onMove = event => {
      if (!cursorEnabled || event.pointerType !== 'mouse' || document.querySelector('dialog[open]')) { resetCursor(); return; }
      if (firstMove || !root.classList.contains('custom-cursor-active')) {
        gsap.set(cursor, { x: event.clientX - 7, y: event.clientY - 7 });
        firstMove = false;
      }
      xTo(event.clientX - 7); yTo(event.clientY - 7);
      cursor.style.opacity = '1';
      root.classList.add('custom-cursor-active');
    };
    const onOver = event => {
      const interactive = event.target.closest('a,button,.floating-tech');
      gsap.to(cursor, { scale: interactive ? 2 : 1, duration: .2, ease: 'power2.out' });
    };
    const onVisibility = () => { if (document.hidden) resetCursor(); };
    const onKeyboard = event => { if (event.key === 'Tab') resetCursor(); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerover', onOver);
    window.addEventListener('blur', resetCursor);
    document.documentElement.addEventListener('pointerleave', resetCursor);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('keydown', onKeyboard);
    const cleanups = [];
    document.querySelectorAll('.magnetic').forEach(button => {
      const move = event => {
        const rect = button.getBoundingClientRect();
        gsap.to(button, { x: (event.clientX - rect.left - rect.width / 2) * .08, y: (event.clientY - rect.top - rect.height / 2) * .1, duration: .35, ease: 'power2.out' });
      };
      const leave = () => gsap.to(button, { x: 0, y: 0, duration: .5, ease: 'power3.out' });
      button.addEventListener('pointermove', move); button.addEventListener('pointerleave', leave);
      cleanups.push(() => { button.removeEventListener('pointermove', move); button.removeEventListener('pointerleave', leave); });
    });
    const cloud = document.querySelector('.tech-cloud');
    const cloudInner = document.querySelector('.tech-cloud-inner');
    const tilt = event => {
      const rect = cloud.getBoundingClientRect();
      gsap.to(cloudInner, { rotateY: ((event.clientX - rect.left) / rect.width - .5) * 12, rotateX: -((event.clientY - rect.top) / rect.height - .5) * 10, duration: .65, ease: 'power2.out' });
    };
    const resetTilt = () => gsap.to(cloudInner, { rotateX: 0, rotateY: 0, duration: .8, ease: 'power2.out' });
    cloud.addEventListener('pointermove', tilt); cloud.addEventListener('pointerleave', resetTilt);
    return () => {
      cursorEnabled = false; resetCursor();
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerover', onOver); window.removeEventListener('blur', resetCursor);
      document.documentElement.removeEventListener('pointerleave', resetCursor); document.removeEventListener('visibilitychange', onVisibility); document.removeEventListener('keydown', onKeyboard);
      cloud.removeEventListener('pointermove', tilt); cloud.removeEventListener('pointerleave', resetTilt); cleanups.forEach(cleanup => cleanup());
    };
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();
