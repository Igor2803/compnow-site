(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Ano no rodapé
  $("#year").textContent = new Date().getFullYear();

  // Header: fundo ao rolar + botão voltar ao topo
  const nav = $("#nav");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    toTop.classList.toggle("show", y > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0 }));

  // Menu mobile
  const toggle = $("#toggle");
  const menu = $("#menu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
    document.body.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // Link ativo conforme a seção visível
  const links = $$(".nav__links a[href^='#']:not(.btn)");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((l) => { const s = $(l.getAttribute("href")); if (s) spy.observe(s); });

  // Contadores
  const countUp = (el) => {
    const end = +el.dataset.count;
    if (reduced) { el.textContent = end; return; }
    const dur = 1600;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.max(0, Math.min((t - t0) / dur, 1));
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Reveal ao rolar (com atraso escalonado entre irmãos)
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("is-visible");
      $$("[data-count]", el).forEach(countUp);
      revealIO.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  $$(".reveal").forEach((el) => {
    const sibs = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 6) * 0.08}s`);
    revealIO.observe(el);
  });

  // Linha do tempo "Como funciona": acende os passos conforme a rolagem
  const steps = $("#steps");
  const stepItems = $$(".step", steps);
  const updateSteps = () => {
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / r.height));
    steps.style.setProperty("--p", `${p * 100}%`);
    stepItems.forEach((s, i) => s.classList.toggle("is-on", p >= i / stepItems.length + 0.02));
  };
  window.addEventListener("scroll", updateSteps, { passive: true });
  window.addEventListener("resize", updateSteps);
  updateSteps();

  // Efeito de digitação no título
  const typed = $(".typed");
  if (typed && !reduced) {
    const words = typed.dataset.words.split(",");
    let w = 0, c = words[0].length, deleting = true;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, c);
      if (deleting) {
        c--;
        if (c < 0) { deleting = false; w = (w + 1) % words.length; c = 0; }
        setTimeout(tick, 55);
      } else {
        c++;
        if (c > words[w].length) { deleting = true; c = words[w].length; setTimeout(tick, 2200); return; }
        setTimeout(tick, 95);
      }
    };
    setTimeout(tick, 2600);
  }

  // Tilt 3D na imagem do hero (apenas mouse)
  const tilt = $("[data-tilt]");
  if (tilt && !reduced && matchMedia("(hover: hover)").matches) {
    tilt.addEventListener("mousemove", (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    tilt.addEventListener("mouseleave", () => (tilt.style.transform = ""));
  }
})();
