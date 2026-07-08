"use client";

import { useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ascesaCss } from "./ascesaStyles";
import { ascesaHtml } from "./ascesaMarkup";

/**
 * Landing "L'ascesa" portata in React.
 *
 * CSS e markup sono verbatim dalla sorgente originale (landing/sanup-ascesa.html),
 * resi via <style>/<div> e quindi rimossi automaticamente allo smontaggio: non
 * contaminano le altre pagine dell'app. La scena Three.js gira in un useEffect
 * con cleanup completo (AbortController per i listener, RAF cancellati, renderer
 * disposto) per essere sicura anche col doppio invoke di React Strict Mode.
 */
export default function AscesaLanding() {
  useEffect(() => {
    const root = document.getElementById("ascesa");
    if (!root) return;

    const ac = new AbortController();
    const signal = ac.signal;
    const opts: AddEventListenerOptions = { signal };
    const passive: AddEventListenerOptions = { passive: true, signal };

    let disposed = false;
    let rafAnim = 0,
      rafCur = 0,
      rafPre = 0;
    const observers: IntersectionObserver[] = [];

    // Failsafe: se Three.js va in errore prima di raggiungere la logica del
    // preloader, lo nascondiamo comunque dopo 5 secondi.
    const preloaderSafe = setTimeout(() => {
      const el = document.getElementById("preloader");
      if (el && el.style.display !== "none") {
        el.style.transition = "opacity 0.6s";
        el.style.opacity = "0";
        setTimeout(() => { el.style.display = "none"; }, 650);
      }
    }, 5000);
    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const smoothScroll = !isCoarse && !reduceMotion;

    /* ============ SETUP ============ */
    const canvas = document.getElementById("scene") as HTMLCanvasElement;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setClearColor(0x050b14, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.setSize(window.innerWidth, window.innerHeight);
    } catch {
      canvas.style.display = "none";
    }
    canvas.style.opacity = "0";

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050b14, 0.0015);
    const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 2500);

    function glowTexture() {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.55)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }
    const tex = glowTexture();

    /* ============ ELICA ============ */
    const HELIX_H = 540,
      HELIX_R = 42,
      TURNS = 7,
      Y0 = -HELIX_H / 2;
    const helixGroup = new THREE.Group();
    scene.add(helixGroup);

    const cCyan = new THREE.Color(0x16c7c3);
    const cBlue = new THREE.Color(0x1276e3);
    const cLight = new THREE.Color(0x7fd4f0);
    const cWhite = new THREE.Color(0xcff6f4);

    type IntroItem = { geo: THREE.BufferGeometry; startPos: Float32Array; finalPos: Float32Array };
    const introData: IntroItem[] = [];

    function buildStrand(phase: number, colA: THREE.Color, colB: THREE.Color) {
      const N = 900;
      const finalPos = new Float32Array(N * 3);
      const startPos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const tmp = new THREE.Color();
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const a = t * Math.PI * 2 * TURNS + phase;
        finalPos[i * 3] = Math.cos(a) * HELIX_R + (Math.random() - 0.5) * 3.4;
        finalPos[i * 3 + 1] = Y0 + t * HELIX_H + (Math.random() - 0.5) * 2.2;
        finalPos[i * 3 + 2] = Math.sin(a) * HELIX_R + (Math.random() - 0.5) * 3.4;
        const sr = Math.random() * 14,
          sa = Math.random() * Math.PI * 2;
        startPos[i * 3] = Math.cos(sa) * sr;
        startPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        startPos[i * 3 + 2] = Math.sin(sa) * sr;
        tmp.copy(colA).lerp(colB, t * 0.85 + Math.random() * 0.15);
        const b = 0.65 + Math.random() * 0.45;
        col[i * 3] = tmp.r * b;
        col[i * 3 + 1] = tmp.g * b;
        col[i * 3 + 2] = tmp.b * b;
      }
      const currPos = new Float32Array(startPos);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(currPos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        size: 3.1,
        map: tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        sizeAttenuation: true,
      });
      introData.push({ geo, startPos, finalPos });
      return new THREE.Points(geo, mat);
    }
    helixGroup.add(buildStrand(0, cCyan, cLight));
    helixGroup.add(buildStrand(Math.PI, cBlue, cCyan));

    /* pioli */
    {
      const RUNGS = 58,
        PER = 15,
        N = RUNGS * PER;
      const pos = new Float32Array(N * 3),
        col = new Float32Array(N * 3);
      const tmp = new THREE.Color();
      let k = 0;
      for (let r = 0; r < RUNGS; r++) {
        const t = (r + 0.5) / RUNGS,
          a = t * Math.PI * 2 * TURNS;
        const ax = Math.cos(a) * HELIX_R,
          az = Math.sin(a) * HELIX_R,
          y = Y0 + t * HELIX_H;
        for (let j = 0; j < PER; j++) {
          const u = j / (PER - 1);
          pos[k * 3] = ax * (1 - 2 * u) + (Math.random() - 0.5) * 1.6;
          pos[k * 3 + 1] = y + (Math.random() - 0.5) * 1.6;
          pos[k * 3 + 2] = az * (1 - 2 * u) + (Math.random() - 0.5) * 1.6;
          tmp.copy(cBlue).lerp(cWhite, Math.abs(0.5 - u) * 0.9);
          const b = 0.5 + Math.random() * 0.35;
          col[k * 3] = tmp.r * b;
          col[k * 3 + 1] = tmp.g * b;
          col[k * 3 + 2] = tmp.b * b;
          k++;
        }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      helixGroup.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            size: 2.5,
            map: tex,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            sizeAttenuation: true,
          })
        )
      );
    }

    /* fari luminosi */
    let beaconMat: THREE.PointsMaterial;
    {
      const COUNT = 14;
      const pos = new Float32Array(COUNT * 3),
        col = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const t = (i + 0.5) / COUNT;
        const a = t * Math.PI * 2 * TURNS + (i % 2 ? Math.PI : 0);
        pos[i * 3] = Math.cos(a) * HELIX_R;
        pos[i * 3 + 1] = Y0 + t * HELIX_H;
        pos[i * 3 + 2] = Math.sin(a) * HELIX_R;
        col[i * 3] = cWhite.r;
        col[i * 3 + 1] = cWhite.g;
        col[i * 3 + 2] = cWhite.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      beaconMat = new THREE.PointsMaterial({
        size: 9,
        map: tex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        sizeAttenuation: true,
      });
      helixGroup.add(new THREE.Points(geo, beaconMat));
    }

    /* faro apicale */
    const apex = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: tex,
        color: 0xaff6f0,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    apex.position.set(0, HELIX_H / 2 + 26, 0);
    apex.scale.set(60, 60, 1);
    helixGroup.add(apex);

    /* polvere cosmica */
    {
      const N = 1100;
      const finalPos = new Float32Array(N * 3);
      const startPos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const tmp = new THREE.Color();
      for (let i = 0; i < N; i++) {
        const r = 130 + Math.random() * 560,
          a = Math.random() * Math.PI * 2;
        finalPos[i * 3] = Math.cos(a) * r;
        finalPos[i * 3 + 1] = -470 + Math.random() * 1000;
        finalPos[i * 3 + 2] = Math.sin(a) * r;
        const sr = 20 + Math.random() * 30,
          sa = Math.random() * Math.PI * 2;
        startPos[i * 3] = Math.cos(sa) * sr;
        startPos[i * 3 + 1] = (Math.random() - 0.5) * 30;
        startPos[i * 3 + 2] = Math.sin(sa) * sr;
        tmp.copy(Math.random() > 0.6 ? cCyan : cLight);
        const b = 0.14 + Math.random() * 0.3;
        col[i * 3] = tmp.r * b;
        col[i * 3 + 1] = tmp.g * b;
        col[i * 3 + 2] = tmp.b * b;
      }
      const currPos = new Float32Array(startPos);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(currPos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      scene.add(
        new THREE.Points(
          geo,
          new THREE.PointsMaterial({
            size: 2.1,
            map: tex,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true,
            sizeAttenuation: true,
          })
        )
      );
      introData.push({ geo, startPos, finalPos });
    }

    /* ============ BLOOM ============ */
    if (renderer) {
      try {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloom = new UnrealBloomPass(
          new THREE.Vector2(innerWidth, innerHeight),
          0.72,
          0.6,
          0.2
        );
        composer.addPass(bloom);
        composer.setSize(innerWidth, innerHeight);
        composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      } catch {
        composer = null;
      }
    }

    /* ============ CAMERA ============ */
    const KF = [
      { p: new THREE.Vector3(0, -150, 400), l: new THREE.Vector3(0, -20, 0) },
      { p: new THREE.Vector3(175, -115, 165), l: new THREE.Vector3(0, -55, 0) },
      { p: new THREE.Vector3(46, 45, 34), l: new THREE.Vector3(0, 140, 0) },
      { p: new THREE.Vector3(-38, 190, 70), l: new THREE.Vector3(0, 210, 0) },
      { p: new THREE.Vector3(120, 250, 250), l: new THREE.Vector3(0, 235, 0) },
      { p: new THREE.Vector3(0, 335, 150), l: new THREE.Vector3(0, 255, 0) },
    ];
    const curPos = KF[0].p.clone();
    const curLook = KF[0].l.clone();
    const tgtPos = new THREE.Vector3();
    const tgtLook = new THREE.Vector3();

    const SECTION_BG = [
      new THREE.Color(0x050b14),
      new THREE.Color(0x050d1f),
      new THREE.Color(0x100806),
      new THREE.Color(0x051310),
      new THREE.Color(0x070919),
      new THREE.Color(0x060a14),
    ];
    const curBg = new THREE.Color(0x050b14);

    /* ============ SEZIONI, PANNELLI, DOTS ============ */
    const weakPanel = document.getElementById("weakPanel")!;
    const examPanel = document.getElementById("examPanel")!;
    const sectionEls = [...root.querySelectorAll(".content .section")] as HTMLElement[];
    const sectionRatios = new Array(sectionEls.length).fill(0);
    let activeSection = 0;

    let targetY = window.scrollY;
    let lastSetY = window.scrollY;

    const dotLabels = ["Intro", "Struttura", "Errori", "Progresso", "L'app", "La cima"];
    const dotsNav = document.getElementById("dots")!;
    dotsNav.innerHTML = "";
    const dotEls = sectionEls.map((sec, i) => {
      const b = document.createElement("button");
      b.className = "dot";
      b.type = "button";
      b.setAttribute("aria-label", dotLabels[i] || "Sezione " + i);
      b.innerHTML =
        '<span class="d-label">' + (dotLabels[i] || "0" + i) + '</span><span class="d-mark"></span>';
      b.addEventListener(
        "click",
        () => {
          const y = Math.max(0, Math.min(sec.offsetTop, document.body.scrollHeight - innerHeight));
          if (smoothScroll) targetY = y;
          else sec.scrollIntoView({ behavior: "smooth" });
        },
        opts
      );
      dotsNav.appendChild(b);
      return b;
    });

    const sectionIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = sectionEls.indexOf(e.target as HTMLElement);
          if (i >= 0) sectionRatios[i] = e.isIntersecting ? e.intersectionRatio : 0;
          if (e.target.id === "showcase" || e.target.id === "subjects") {
            e.target.classList.toggle("visible", e.intersectionRatio > 0.25);
          }
        }
        let best = -1,
          active = 0;
        sectionRatios.forEach((r, i) => {
          if (r > best) {
            best = r;
            active = i;
          }
        });
        activeSection = active;
        examPanel.classList.toggle("visible", active === 1 || active === 2);
        weakPanel.classList.toggle("visible", active === 3);
        dotEls.forEach((d, i) => d.classList.toggle("active", i === active));
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sectionEls.forEach((s) => sectionIO.observe(s));
    observers.push(sectionIO);

    let scrollProg = 0;
    const progressEl = document.getElementById("progress")!;
    const altitudeEl = document.getElementById("altitude")!;
    const scrollInd = document.getElementById("scrollInd")!;

    function onScroll() {
      const docH = document.body.scrollHeight - innerHeight;
      scrollProg = docH > 0 ? Math.min(1, Math.max(0, scrollY / docH)) : 0;
      progressEl.style.width = scrollProg * 100 + "%";
      altitudeEl.textContent = "ASCESA · " + Math.round(scrollProg * 100) + "%";
      scrollInd.classList.toggle("hidden", scrollProg > 0.04);
      if (smoothScroll && Math.abs(scrollY - lastSetY) > 2) targetY = scrollY;
    }
    addEventListener("scroll", onScroll, passive);
    onScroll();

    if (smoothScroll) {
      addEventListener(
        "wheel",
        (e) => {
          if (e.ctrlKey) return;
          e.preventDefault();
          targetY = Math.max(0, Math.min(targetY + e.deltaY, document.body.scrollHeight - innerHeight));
        },
        { passive: false, signal }
      );
    }

    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    function cameraTargets(prog: number) {
      const segs = KF.length - 1;
      const x = Math.min(segs - 1e-6, prog * segs);
      const i = Math.floor(x),
        t = ease(x - i);
      tgtPos.lerpVectors(KF[i].p, KF[i + 1].p, t);
      tgtLook.lerpVectors(KF[i].l, KF[i + 1].l, t);
    }

    let mx = 0,
      my = 0,
      smx = 0,
      smy = 0;
    addEventListener(
      "mousemove",
      (e) => {
        mx = (e.clientX / innerWidth - 0.5) * 2;
        my = (e.clientY / innerHeight - 0.5) * 2;
      },
      passive
    );

    /* ============ CURSORE ============ */
    const cursorEl = document.getElementById("cursor")!;
    if (!isCoarse) {
      document.body.classList.add("custom-cursor");
      let cx = innerWidth / 2,
        cy = innerHeight / 2,
        ctx = cx,
        cty = cy;
      addEventListener(
        "mousemove",
        (e) => {
          ctx = e.clientX;
          cty = e.clientY;
        },
        passive
      );
      const curLoop = () => {
        if (disposed) return;
        cx += (ctx - cx) * 0.2;
        cy += (cty - cy) * 0.2;
        cursorEl.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%)";
        rafCur = requestAnimationFrame(curLoop);
      };
      curLoop();
      root.querySelectorAll("a, .btn, .sub-card, .phone, .dot, .nav-cta").forEach((el) => {
        el.addEventListener("mouseenter", () => cursorEl.classList.add("hover"), opts);
        el.addEventListener("mouseleave", () => cursorEl.classList.remove("hover"), opts);
      });
    }

    /* ============ PRELOADER ============ */
    const preloader = document.getElementById("preloader")!;
    const preBar = document.getElementById("preBar")!;
    const preLabel = document.getElementById("preLabel")!;
    let preProg = 0,
      pageLoaded = document.readyState === "complete",
      introGo = false,
      introStartT: number | null = null;
    addEventListener("load", () => (pageLoaded = true), opts);
    function dismissPreloader() {
      preloader.classList.add("gone");
      introGo = true;
      dotsNav.classList.add("ready");
      setTimeout(() => {
        preloader.style.display = "none";
      }, 900);
    }
    const tickPre = () => {
      if (disposed) return;
      const target = pageLoaded ? 100 : Math.min(88, preProg + 0.7);
      preProg += (target - preProg) * 0.09;
      preBar.style.width = preProg.toFixed(1) + "%";
      if (pageLoaded && preProg > 99) {
        preBar.style.width = "100%";
        preLabel.textContent = "Pronti";
        dismissPreloader();
        return;
      }
      rafPre = requestAnimationFrame(tickPre);
    };
    tickPre();

    /* ============ ANIMAZIONE TESTI ============ */
    function splitWords(el: Element) {
      let idx = 0;
      function process(node: Node, grad: boolean): DocumentFragment {
        const frag = document.createDocumentFragment();
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === 3) {
            (child.textContent || "").split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) {
                frag.appendChild(document.createTextNode(" "));
                return;
              }
              const w = document.createElement("span");
              w.className = "w";
              const wi = document.createElement("span");
              wi.className = "wi" + (grad ? " grad" : "");
              wi.textContent = part;
              wi.style.transitionDelay = idx * 0.05 + "s";
              idx++;
              w.appendChild(wi);
              frag.appendChild(w);
            });
          } else if ((child as HTMLElement).tagName === "BR") {
            frag.appendChild(document.createElement("br"));
          } else {
            const c = child as HTMLElement;
            frag.appendChild(process(c, !!(c.classList && c.classList.contains("grad"))));
          }
        });
        return frag;
      }
      const out = process(el, false);
      el.innerHTML = "";
      el.appendChild(out);
    }
    root.querySelectorAll(".block h1, .block h2").forEach(splitWords);

    const blockIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("visible", e.isIntersecting);
      },
      { threshold: 0.35 }
    );
    root.querySelectorAll(".block").forEach((b) => blockIO.observe(b));
    observers.push(blockIO);

    /* ============ LOOP ============ */
    const clock = new THREE.Clock();

    function animate() {
      if (disposed || !renderer) return;
      const t = clock.getElapsedTime();

      if (smoothScroll) {
        const cur = window.scrollY;
        if (Math.abs(targetY - cur) > 0.4) {
          const next = cur + (targetY - cur) * 0.12;
          window.scrollTo(0, next);
          lastSetY = window.scrollY;
        }
      }

      if (introGo && introStartT === null) introStartT = t;
      const introRaw = introStartT === null ? 0 : Math.min(1, (t - introStartT) / 2.8);
      const introEased = 1 - Math.pow(1 - introRaw, 4);
      canvas.style.opacity = (introStartT === null ? 0 : Math.min(1, introRaw * 1.6)).toString();

      if (introRaw < 1) {
        for (const d of introData) {
          const pos = d.geo.attributes.position.array as Float32Array;
          for (let i = 0; i < pos.length; i++) {
            pos[i] = d.startPos[i] + (d.finalPos[i] - d.startPos[i]) * introEased;
          }
          d.geo.attributes.position.needsUpdate = true;
        }
      }

      if (introRaw < 1) {
        const cx2 = introEased * KF[0].p.x;
        const cy2 = 10 + introEased * (KF[0].p.y - 10);
        const cz2 = 200 + introEased * (KF[0].p.z - 200);
        camera.position.set(cx2, cy2, cz2);
        camera.lookAt(KF[0].l.x * introEased, KF[0].l.y * introEased, KF[0].l.z * introEased);
      } else {
        cameraTargets(scrollProg);
        curPos.lerp(tgtPos, 0.055);
        curLook.lerp(tgtLook, 0.055);
        smx += (mx - smx) * 0.04;
        smy += (my - smy) * 0.04;
        const px = reduceMotion ? 0 : smx * 16;
        const py = reduceMotion ? 0 : -smy * 9;
        camera.position.set(curPos.x + px, curPos.y + py, curPos.z);
        camera.lookAt(curLook);
      }

      helixGroup.rotation.y =
        (reduceMotion ? 0 : t * 0.055) + (introRaw >= 1 ? scrollProg * 1.35 : 0);

      if (introRaw >= 1 && activeSection === 2 && !reduceMotion) {
        const st = t * 2.8;
        for (const d of introData) {
          const pos = d.geo.attributes.position.array as Float32Array;
          for (let i = 0; i < pos.length / 3; i++) {
            const s = Math.sin(st + i * 0.19) * 5.5;
            pos[i * 3] = d.finalPos[i * 3] + s * Math.cos(i * 2.1);
            pos[i * 3 + 1] = d.finalPos[i * 3 + 1] + s * Math.sin(i * 1.6) * 0.3;
            pos[i * 3 + 2] = d.finalPos[i * 3 + 2] + s * Math.sin(i * 2.1);
          }
          d.geo.attributes.position.needsUpdate = true;
        }
      } else if (introRaw >= 1) {
        for (const d of introData) {
          const pos = d.geo.attributes.position.array as Float32Array;
          let dirty = false;
          for (let i = 0; i < pos.length; i++) {
            const delta = d.finalPos[i] - pos[i];
            if (Math.abs(delta) > 0.02) {
              pos[i] += delta * 0.08;
              dirty = true;
            }
          }
          if (dirty) d.geo.attributes.position.needsUpdate = true;
        }
      }

      const tgtBg = SECTION_BG[Math.min(activeSection, SECTION_BG.length - 1)];
      curBg.lerp(tgtBg, 0.03);
      renderer.setClearColor(curBg, 1);
      scene.fog!.color.copy(curBg);

      beaconMat.size = 8 + Math.sin(t * 2.1) * 2.4;
      const ap = 1 + (reduceMotion ? 0 : Math.sin(t * 1.7) * 0.16);
      apex.scale.set(60 * ap, 60 * ap, 1);
      apex.material.opacity = 0.75 + Math.sin(t * 1.7) * 0.2;

      if (composer) composer.render();
      else renderer.render(scene, camera);
      rafAnim = requestAnimationFrame(animate);
    }
    if (renderer) animate();

    addEventListener(
      "resize",
      () => {
        if (!renderer) return;
        camera.aspect = innerWidth / innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(innerWidth, innerHeight);
        if (composer) composer.setSize(innerWidth, innerHeight);
      },
      opts
    );

    return () => {
      disposed = true;
      clearTimeout(preloaderSafe);
      ac.abort();
      cancelAnimationFrame(rafAnim);
      cancelAnimationFrame(rafCur);
      cancelAnimationFrame(rafPre);
      observers.forEach((o) => o.disconnect());
      document.body.classList.remove("custom-cursor");
      try {
        (composer as unknown as { dispose?: () => void } | null)?.dispose?.();
      } catch {
        /* noop */
      }
      try {
        renderer?.dispose();
      } catch {
        /* noop */
      }
    };
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: ascesaCss }} />
      <div id="ascesa" dangerouslySetInnerHTML={{ __html: ascesaHtml }} />
    </>
  );
}
