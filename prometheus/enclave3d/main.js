// PayPerQ privacy section: three independent 3D models stacked top to bottom (your laptop, PayPerQ's server with the
// AWS Nitro Enclave behind smoked glass, the AI provider's racks). The camera descends as you scroll and each model
// appears when its turn comes. Everything is a function of the story position p (0 = title … 4 = verified), so it
// plays forwards and backwards with the scroll. Built with three.js; bundled by build.mjs into ../assets/enclave3d.js.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

const clamp = (x) => Math.max(0, Math.min(1, x));
const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const mix = (a, b, u) => a + (b - a) * u;

const PLAIN = 'Summarize these board notes into five decisions.';
const CIPHER = 'oJN0HMhgTqS4I1MvqAxwE/qLxaNbtOv1eQFURxw7Unut8u7096yYNWJgKK2PXxq0X';
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// world layout: one column, top to bottom
const Y_LAPTOP = 0, Y_SERVER = -7.4, Y_RACKS = -14.8;

function webglOK() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch { return false; }
}

// ---------- materials ----------
function makeMaterials() {
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x313237, metalness: 0.9, roughness: 0.3, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 1.25 });
  const graphiteDark = new THREE.MeshPhysicalMaterial({ color: 0x17181b, metalness: 0.8, roughness: 0.45 });
  const alu = new THREE.MeshPhysicalMaterial({ color: 0x8e9197, metalness: 1, roughness: 0.3, clearcoat: 0.2 });
  const steel = new THREE.MeshPhysicalMaterial({ color: 0x55585e, metalness: 1, roughness: 0.28 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0b0c0f, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.52, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.2, depthWrite: false });
  const black = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.5, metalness: 0.2 });
  const pad = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0.2, roughness: 0.85, envMapIntensity: 0.12 });
  return { graphite, graphiteDark, alu, steel, glass, black, pad };
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, canvas: c, g };
}

// a floating platform under each model: glossy black disc with a faint light rim
function platform(M, r) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 96), M.pad); disc.position.y = -0.04; g.add(disc);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.32, 0.32, 0.36) }));
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.001; g.add(rim);
  return { group: g, rim };
}

// ---------- the laptop ----------
function makeLaptop(M) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(3.2, 0.13, 2.2, 4, 0.05), M.alu); base.position.y = 0.065; g.add(base);
  const keys = canvasTexture(512, 192, (c, w, h) => {
    c.fillStyle = '#16171a'; c.fillRect(0, 0, w, h);
    const cols = 14, rows = 5, kw = w / cols, kh = h / rows;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { c.fillStyle = '#26272b'; c.fillRect(k * kw + 3, r * kh + 3, kw - 6, kh - 6); }
  });
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(2.75, 1.0), new THREE.MeshStandardMaterial({ map: keys.tex, roughness: 0.7, metalness: 0.1 }));
  kb.rotation.x = -Math.PI / 2; kb.position.set(0, 0.132, -0.38); g.add(kb);
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), new THREE.MeshStandardMaterial({ color: 0x6f7278, metalness: 0.9, roughness: 0.38 }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.132, 0.6); g.add(pad);
  // lid on a hinge at the back edge
  const hinge = new THREE.Group(); hinge.position.set(0, 0.13, -1.08); g.add(hinge);
  const lid = new THREE.Mesh(new RoundedBoxGeometry(3.2, 2.1, 0.07, 4, 0.03), M.alu); lid.position.set(0, 1.05, -0.035); hinge.add(lid);
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(3.04, 1.96), M.black); bezel.position.set(0, 1.05, 0.002); hinge.add(bezel);
  // the screen shows your message being typed
  const screen = canvasTexture(1024, 620, () => {});
  const scrMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: screen.tex, emissiveIntensity: 0, roughness: 0.25, metalness: 0 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.86, 1.76), scrMat); scr.position.set(0, 1.05, 0.004); hinge.add(scr);
  let lastScreen = '';
  const drawScreen = (typed, caret) => {
    const key = typed + (caret ? '|' : ''); if (key === lastScreen) return; lastScreen = key;
    const c = screen.g, w = 1024, h = 620;
    c.fillStyle = '#0e0e10'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#18181b'; c.fillRect(0, 0, w, 54);
    c.fillStyle = '#bf3c1b'; c.beginPath(); c.arc(40, 27, 9, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#2a2a2e'; for (let i = 0; i < 3; i++) { c.fillRect(70 + i * 90, 20, 70, 14); }
    // earlier messages, as quiet bars
    c.fillStyle = '#1d1d21'; c.fillRect(70, 110, 520, 64); c.fillRect(70, 190, 380, 64);
    // the composer with your message
    c.fillStyle = '#1b1b1f'; c.strokeStyle = '#3a3a40'; c.lineWidth = 2;
    const bx = 60, by = 410, bw = w - 120, bh = 150; c.beginPath(); c.roundRect(bx, by, bw, bh, 18); c.fill(); c.stroke();
    c.fillStyle = '#f2f1ee'; c.font = '500 38px Geist, system-ui, sans-serif'; c.textBaseline = 'top';
    const words = typed.split(' '); let line = '', y = by + 30; const lines = [];
    for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (c.measureText(tst).width > bw - 70) { lines.push(line); line = wd; } else line = tst; }
    lines.push(line); lines.slice(0, 2).forEach((l, i) => c.fillText(l, bx + 34, y + i * 50));
    if (caret) { const last = lines[Math.min(1, lines.length - 1)] || ''; const cx = bx + 34 + c.measureText(last).width + 4; c.fillStyle = '#e97d49'; c.fillRect(cx, y + Math.min(1, lines.length - 1) * 50 + 2, 3, 40); }
    c.fillStyle = '#bf3c1b'; c.beginPath(); c.roundRect(bx + bw - 76, by + bh - 66, 52, 46, 10); c.fill();
    screen.tex.needsUpdate = true;
  };
  drawScreen('', false);
  return { group: g, hinge, scrMat, drawScreen, screenAnchor: new THREE.Vector3(1.43, 1.9, -1.0) };
}

// ---------- PayPerQ's server, with the enclave inside ----------
function makeServer(M) {
  const g = new THREE.Group();
  const W = 2.7, H = 3.3, D = 2.5, t = 0.13;
  const shell = [
    [t, H, D, -W / 2 + t / 2, H / 2, 0], [t, H, D, W / 2 - t / 2, H / 2, 0],
    [W, t, D, 0, H - t / 2, 0], [W, t, D, 0, t / 2, 0], [W, H, t, 0, H / 2, -D / 2 + t / 2],
  ];
  for (const [w, h, d, x, y, z] of shell) { const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.045), M.graphite); m.position.set(x, y, z); g.add(m); }
  // feet
  for (const sx of [-1, 1]) { const f = new THREE.Mesh(new RoundedBoxGeometry(W - 0.5, 0.12, 0.25, 2, 0.03), M.graphiteDark); f.position.set(0, -0.04, sx * (D / 2 - 0.35)); g.add(f); }
  // interior back plate
  const back = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * t, H - 2 * t), new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.8 }));
  back.position.set(0, H / 2, -D / 2 + t + 0.01); g.add(back);
  // the enclave module: a steel frame, a frosted core, brackets to the walls, four bolts
  const mod = new THREE.Group(); mod.position.set(0, H / 2 + 0.05, 0.05); g.add(mod);
  const fw = 1.3, fh = 1.65, fd = 0.55, ft = 0.12;
  for (const [w, h, x, y] of [[fw, ft, 0, fh / 2 - ft / 2], [fw, ft, 0, -fh / 2 + ft / 2], [ft, fh, -fw / 2 + ft / 2, 0], [ft, fh, fw / 2 - ft / 2, 0]]) {
    const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, fd, 2, 0.03), M.steel); b.position.set(x, y, 0); mod.add(b);
  }
  const modBack = new THREE.Mesh(new THREE.BoxGeometry(fw - 0.02, fh - 0.02, 0.04), M.graphiteDark); modBack.position.z = -fd / 2 + 0.03; mod.add(modBack);
  const frost = canvasTexture(256, 320, (c, w, h) => {
    const gr = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h * 0.62);
    gr.addColorStop(0, '#ffd0a8'); gr.addColorStop(0.35, '#ff8a48'); gr.addColorStop(0.75, '#d9501f'); gr.addColorStop(1, '#7a2208');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    for (let n = 0; n < 2600; n++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; c.fillRect(Math.random() * w, Math.random() * h, 1, 1); }
  });
  const coreMat = new THREE.MeshStandardMaterial({ color: 0x120400, emissive: 0xffffff, emissiveMap: frost.tex, emissiveIntensity: 0.9, roughness: 0.7, metalness: 0 });
  const core = new THREE.Mesh(new THREE.BoxGeometry(fw - 2 * ft, fh - 2 * ft, fd - 0.06), coreMat); mod.add(core);
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 16), M.steel); bolt.rotation.x = Math.PI / 2; bolt.position.set(sx * (fw / 2 - 0.06), sy * (fh / 2 - 0.06), fd / 2 + 0.01); mod.add(bolt);
  }
  for (const sx of [-1, 1]) for (const yy of [0.45, -0.45]) {
    const br = new THREE.Mesh(new THREE.BoxGeometry((W - 2 * t - fw) / 2, 0.08, 0.16), M.steel); br.position.set(sx * (fw / 2 + (W - 2 * t - fw) / 4), yy, -0.1); mod.add(br);
  }
  const coreLight = new THREE.PointLight(0xff6a2a, 2, 4, 2); coreLight.position.set(0, 0, 0.6); mod.add(coreLight);
  // smoked glass front with a bezel and corner screws
  const glass = new THREE.Mesh(new THREE.BoxGeometry(W - 0.06, H - 0.06, 0.03), M.glass); glass.position.set(0, H / 2, D / 2 - 0.03); glass.renderOrder = 2; g.add(glass);
  for (const [w, h, x, y] of [[W, 0.06, 0, H - 0.03], [W, 0.06, 0, 0.03], [0.06, H, -W / 2 + 0.03, H / 2], [0.06, H, W / 2 - 0.03, H / 2]]) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), M.steel); b.position.set(x, y, D / 2 - 0.02); g.add(b);
  }
  for (const sx of [-1, 1]) for (const sy of [0, 1]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), M.steel); s.rotation.x = Math.PI / 2; s.position.set(sx * (W / 2 - 0.16), sy ? H - 0.16 : 0.16, D / 2 + 0.005); g.add(s);
  }
  // attestation scan: a sheet of green light passing through the server
  const scanMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.35, 1.7, 0.85), transparent: true, opacity: 0, depthWrite: false });
  const scan = new THREE.Mesh(new THREE.BoxGeometry(W + 0.14, 0.02, D + 0.14), scanMat); g.add(scan);
  return { group: g, coreMat, coreLight, scan, scanMat, H, D, coreLocal: new THREE.Vector3(0, H / 2 + 0.05, 0.4), topLocal: new THREE.Vector3(0.7, H, -0.6), bottomLocal: new THREE.Vector3(0, 0, -0.3) };
}

// ---------- the AI provider's racks ----------
function makeRacks(M) {
  const g = new THREE.Group();
  const vent = canvasTexture(128, 512, (c, w, h) => {
    c.fillStyle = '#141518'; c.fillRect(0, 0, w, h);
    for (let y = 10; y < h - 10; y += 14) { c.fillStyle = '#060607'; c.fillRect(10, y, w - 20, 7); c.fillStyle = '#24262a'; c.fillRect(10, y + 7, w - 20, 1); }
  });
  const ventMat = new THREE.MeshStandardMaterial({ map: vent.tex, metalness: 0.7, roughness: 0.5 });
  const leds = [];
  for (let i = 0; i < 4; i++) {
    const x = (i - 1.5) * 1.06;
    const body = new THREE.Mesh(new RoundedBoxGeometry(0.96, 3.7, 2.4, 3, 0.05), M.graphite); body.position.set(x, 1.85, 0); g.add(body);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.76, 3.25), ventMat); face.position.set(x, 1.8, 1.201); g.add(face);
    const ledMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.2, 0.22) });
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.035, 0.02), ledMat); led.position.set(x, 3.52, 1.21); g.add(led); leds.push(ledMat);
  }
  return { group: g, leds, topLocal: new THREE.Vector3(0, 3.7, -0.4) };
}

// ---------- the fibre and the light that travels on it ----------
function makeFiber(points) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.3);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uDraw: { value: 0 }, uPacket: { value: -1 }, uPacketAmt: { value: 0 }, uGreen: { value: -1 }, uGreenAmt: { value: 0 }, uHideA: { value: 2 }, uHideB: { value: 2 } },
    vertexShader: 'varying float vU; void main(){ vU = uv.x; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying float vU; uniform float uDraw, uPacket, uPacketAmt, uGreen, uGreenAmt, uHideA, uHideB;
      void main(){
        if (vU > uDraw || (vU > uHideA && vU < uHideB)) discard;
        vec3 c = vec3(0.13, 0.13, 0.15);
        float d = vU - uPacket;
        c += vec3(1.0, 0.9, 0.78) * uPacketAmt * (exp(-pow(d / 0.010, 2.0)) * 5.0 + (d < 0.0 ? exp(d / 0.05) * 0.9 : 0.0));
        float gd = vU - uGreen;
        c += vec3(0.35, 1.0, 0.6) * uGreenAmt * (exp(-pow(gd / 0.012, 2.0)) * 5.0 + (gd > 0.0 ? exp(-gd / 0.06) * 0.8 : 0.0));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 600, 0.03, 8, false), mat);
  // arc-length parameter of any point on the route
  const N = 1200, pts = Array.from({ length: N + 1 }, (_, i) => curve.getPointAt(i / N));
  const uOf = (v) => { let best = 0, bd = Infinity; pts.forEach((p, i) => { const d = p.distanceToSquared(v); if (d < bd) { bd = d; best = i; } }); return best / N; };
  return { curve, tube, mat, uOf };
}

export function mount(story, options = {}) {
  const host = story.querySelector('.en-3d');
  if (!host) return;
  const steps = [...story.querySelectorAll('.en-step')];
  const msg = host.querySelector('.en-msg'), k = host.querySelector('.en-k'), t = host.querySelector('.en-t');
  const verify = host.querySelector('.en-verify'), names = [...host.querySelectorAll('.en-name')];
  const mq = matchMedia('(max-width: 900px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!webglOK()) { host.classList.add('no-3d'); return; }

  const canvas = host.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(options.chapters ? 1.5 : 2, devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c0b0a);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-6, 10, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xc8d4ff, 0.9); rim.position.set(8, 4, -8); scene.add(rim);
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 300);

  const M = makeMaterials();
  const laptop = makeLaptop(M), server = makeServer(M), racks = makeRacks(M);
  const pads = [platform(M, 2.5), platform(M, 2.7), platform(M, 3.0)];
  const holders = [laptop.group, server.group, racks.group].map((obj, i) => { const h = new THREE.Group(); h.add(pads[i].group); h.add(obj); scene.add(h); return h; });
  holders[0].position.y = Y_LAPTOP; holders[1].position.y = Y_SERVER; holders[2].position.y = Y_RACKS;
  holders[0].rotation.y = -0.12; holders[2].rotation.y = 0.1;

  // the route: out of the back of the laptop, down into the server's roof, through the enclave, out of the floor, down to the racks
  scene.updateMatrixWorld(true);
  const W = (holder, v) => holder.localToWorld(v.clone());
  const pServerTop = W(holders[1], server.topLocal), pCore = W(holders[1], server.coreLocal), pServerBottom = W(holders[1], server.bottomLocal), pRacksTop = W(holders[2], racks.topLocal);
  const route = [
    W(holders[0], new THREE.Vector3(1.1, 0.25, -1.15)), W(holders[0], new THREE.Vector3(1.4, -0.4, -1.4)), new THREE.Vector3(pServerTop.x + 0.4, pServerTop.y + 2.6, pServerTop.z - 0.4),
    new THREE.Vector3(pServerTop.x, pServerTop.y + 0.6, pServerTop.z), pServerTop, new THREE.Vector3(pServerTop.x - 0.3, pCore.y + 0.5, pServerTop.z + 0.4), pCore,
    new THREE.Vector3(pCore.x, pCore.y - 0.9, pCore.z - 0.5), pServerBottom, new THREE.Vector3(pServerBottom.x, pServerBottom.y - 0.8, pServerBottom.z),
    new THREE.Vector3(pRacksTop.x, pRacksTop.y + 1.8, pRacksTop.z), pRacksTop,
  ];
  const fiber = makeFiber(route); scene.add(fiber.tube);
  const U = { start: 0, serverTop: fiber.uOf(pServerTop), core: fiber.uOf(pCore), serverBottom: fiber.uOf(pServerBottom), racks: 1 };
  fiber.mat.uniforms.uHideA.value = U.serverTop + 0.004; fiber.mat.uniforms.uHideB.value = U.serverBottom - 0.004;
  const packet = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.7, 2.3) }));
  const packetLight = new THREE.PointLight(0xffe2c4, 0, 2.6, 1.8); packet.add(packetLight); scene.add(packet);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.6, 0.5, 0.88); composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // camera framing per held step: [target x, y, z, distance]; the view comes from the front right, a little above
  const dir = new THREE.Vector3(5.6, 3.6, 8.6).normalize();
  const frames = () => options.chapters
    ? [[0, Y_LAPTOP + 1.0, 0, 14], [0, Y_SERVER + 1.6, 0, 16], [0, Y_SERVER + 1.7, 0.6, 12], [0, Y_RACKS + 1.8, 0, 17], [0, Y_LAPTOP + 1.0, 0, 16]]
    : mq.matches
    ? [[0, Y_LAPTOP + 1.0, 0, 14], [0, Y_SERVER + 1.6, 0, 15], [0, Y_SERVER + 1.7, 0.6, 9.5], [0, Y_RACKS + 1.8, 0, 16], [0, (Y_LAPTOP + Y_RACKS) / 2 + 1.6, 0, 54]]
    : [[0, Y_LAPTOP + 1.0, 0, 11.5], [0, Y_SERVER + 1.6, 0, 12.5], [0, Y_SERVER + 1.7, 0.6, 7.6], [0, Y_RACKS + 1.8, 0, 13], [0, (Y_LAPTOP + Y_RACKS) / 2 + 1.3, 0, 47]];
  let F = frames();

  let width = 1, height = 1;
  const resize = () => {
    const r = (options.chapters ? canvas : host).getBoundingClientRect(); width = Math.max(1, r.width); height = Math.max(1, r.height);
    renderer.setSize(width, height, false); composer.setSize(width, height); bloom.resolution.set(width, height);
    camera.aspect = width / height; camera.updateProjectionMatrix(); F = frames(); dirty = true;
  };
  new ResizeObserver(resize).observe(host);

  const proj = new THREE.Vector3();
  const toScreen = (v) => { proj.copy(v).project(camera); return [(proj.x + 1) / 2 * width, (1 - proj.y) / 2 * height, proj.z < 1]; };
  const setVar = (n, v) => host.style.setProperty(n, +v.toFixed(4));

  let lastText = '';
  const writeText = (typed, r) => {
    const key2 = typed.toFixed(3) + '|' + r.toFixed(3); if (key2 === lastText) return; lastText = key2;
    t.classList.toggle('c', r > 0.5);
    if (typed < 1) { t.textContent = PLAIN.slice(0, Math.round(PLAIN.length * typed)); return; }
    const nc = Math.round(CIPHER.length * r), np = Math.round(PLAIN.length * r);
    const band = r > 0 && r < 1 ? Array.from({ length: 3 }, () => GLYPHS[(Math.random() * 64) | 0]).join('') : '';
    t.textContent = CIPHER.slice(0, nc) + band + PLAIN.slice(Math.min(PLAIN.length, np + band.length));
  };

  const camTarget = new THREE.Vector3(), orbit = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  let clock = 0;
  const draw = (p) => {
    const i = Math.min(3, Math.floor(p)), f = p - i, E = ss(0.06, 0.94, f), A = F[i], B = F[i + 1];
    camTarget.set(mix(A[0], B[0], E), mix(A[1], B[1], E), mix(A[2], B[2], E));
    const dist = mix(A[3], B[3], E);
    const az = mix(-0.16, 0.14, clamp(p / 4)) + 0.05 * Math.sin(p * 1.4);
    orbit.copy(dir).applyAxisAngle(UP, az);
    camera.position.copy(camTarget).addScaledVector(orbit, dist); camera.lookAt(camTarget);

    // models appear one by one, rising into place
    const appear = [1, ss(0.32, 0.8, p), ss(2.18, 2.65, p)];
    holders.forEach((h, n) => {
      const a = appear[n]; h.visible = a > 0.001;
      h.position.y = [Y_LAPTOP, Y_SERVER, Y_RACKS][n] - (1 - a) * 1.6;
      const s = 0.9 + 0.1 * a; h.scale.setScalar(s);
      pads[n].rim.material.color.setScalar(0.32 * a + 0.02);
    });
    // the laptop opens and wakes up; the message is typed on its screen
    const deviceProgress = options.chapters ? Math.max(.42, p) : p;
    const lid = ss(0.02, 0.26, deviceProgress); laptop.hinge.rotation.x = mix(Math.PI / 2 - 0.02, -0.28, lid);
    laptop.scrMat.emissiveIntensity = 0.95 * ss(0.12, 0.3, deviceProgress);
    const typed = ss(0.16, 0.42, deviceProgress);
    laptop.drawScreen(PLAIN.slice(0, Math.round(PLAIN.length * typed)), typed > 0 && typed < 1 ? (clock % 1 < 0.6) : typed >= 1 && p < 0.5);

    // the fibre draws itself ahead of the message, and the light travels on it
    const draw1 = ss(0.4, 0.85, p) * U.serverTop, draw2 = ss(1.05, 1.5, p) * (U.serverBottom - U.serverTop), draw3 = ss(2.1, 2.6, p) * (1 - U.serverBottom);
    fiber.mat.uniforms.uDraw.value = draw1 + draw2 + draw3 + 0.0001;
    let u = 0, amt = 0;
    if (p < 1) { u = ss(0.48, 0.95, p) * U.serverTop; amt = ss(0.46, 0.52, p); }
    else if (p < 2) { u = mix(U.serverTop, U.core, ss(1.2, 1.7, p)); amt = 1; }
    else if (p < 3) { u = mix(U.core, 1, ss(2.18, 2.78, p)); amt = 1; }
    else { u = 1; amt = 1 - ss(3.05, 3.25, p); }
    fiber.mat.uniforms.uPacket.value = u; fiber.mat.uniforms.uPacketAmt.value = amt;
    packet.position.copy(fiber.curve.getPointAt(Math.min(1, Math.max(0, u)))); packet.visible = amt > 0.01; packet.scale.setScalar(0.4 + 0.6 * amt);
    packetLight.intensity = 1.4 * amt;

    // the enclave lights up while it holds the message; at rest it breathes
    const lit = ss(1.45, 1.85, p) * (1 - ss(2.15, 2.45, p));
    const green = p > 3 ? ss(3.32, 3.8, p) : 0, greenAmt = Math.sin(Math.PI * green) * (green > 0 && green < 1 ? 1 : 0);
    const scanU = ss(3.12, 3.5, p), scanAmt = Math.sin(Math.PI * scanU) * (scanU > 0 && scanU < 1 ? 1 : 0);
    const breathe = 0.12 * Math.sin(clock * 1.7);
    server.coreMat.emissiveIntensity = 0.85 + breathe + 1.1 * lit + 0.5 * scanAmt;
    server.coreLight.intensity = 1.5 + 3.5 * lit + 2 * scanAmt;
    server.scan.position.y = mix(server.H + 0.05, 0.02, scanU); server.scanMat.opacity = 0.9 * scanAmt;
    // the racks wake up when the request arrives
    const on = ss(2.7, 2.85, p) * (p < 3.3 ? 1 : 1);
    racks.leds.forEach((m, n) => m.color.setRGB(0.2 + 2.6 * on * (0.85 + 0.15 * Math.sin(clock * 3 + n)), 0.2 + 2.7 * on, 0.22 + 2.9 * on));
    // attestation travels back up to your browser
    fiber.mat.uniforms.uGreen.value = mix(U.core, 0, green); fiber.mat.uniforms.uGreenAmt.value = greenAmt;

    // HTML layer: the message card follows the light; the verified card appears by the laptop
    const mo = (options.chapters ? 1 : ss(0.14, 0.24, p)) * (1 - ss(3.05, 3.3, p));
    let r = 0, label = 'You', fs = 0, fi = 0, cardLit = 0;
    if (p < 1) { r = ss(0.5, 0.8, p); label = p < 0.56 ? 'You' : 'What reaches PayPerQ'; fs = ss(0.86, 0.97, p); }
    else if (p < 2) { r = 1 - ss(1.45, 1.8, p); label = p < 1.5 ? 'What reaches PayPerQ' : 'Inside the AWS Nitro Enclave'; fs = 1 - ss(1.0, 1.2, p); cardLit = ss(1.45, 1.85, p); }
    else if (p < 3) { r = 0; label = p < 2.3 ? 'Inside the AWS Nitro Enclave' : 'What the AI provider gets'; cardLit = 1 - ss(2.15, 2.45, p); fi = ss(2.78, 2.95, p); }
    else { r = 0; label = 'What the AI provider gets'; fi = 1; }
    if (options.chapters && p < 1) { r = 1; label = p < .6 ? 'Encrypted on your device' : 'What reaches PayPerQ'; }
    if (k.textContent !== label) k.textContent = label;
    writeText(typed, r);
    setVar('--mo', mo); setVar('--lit', cardLit); setVar('--fs', fs); setVar('--fi', fi);
    const vo = ss(3.62, 3.82, p); setVar('--vo', vo); setVar('--ck', 1 - ss(3.7, 3.95, p));

    camera.updateMatrixWorld();
    if (!mq.matches && !options.chapters) {
      // before it leaves, the card sits by the laptop's screen; then it rides next to the light
      const anchor = p < 0.5 ? W(holders[0], laptop.screenAnchor) : packet.position;
      const [x, y0] = toScreen(anchor), mh = msg.offsetHeight || 100;
      const y = Math.max(mh / 2 + 8, Math.min(height - mh / 2 - 8, y0));   // keep the card inside the frame
      const right = x < width - 300;
      msg.style.left = `${right ? x + 22 : x - 22}px`; msg.style.top = `${y}px`; msg.style.transform = right ? 'translate(0, -50%)' : 'translate(-100%, -50%)';
      const [vx, vy] = toScreen(W(holders[0], new THREE.Vector3(1.8, 1.0, -0.6)));
      verify.style.left = `${vx + 18}px`; verify.style.top = `${vy}px`; verify.style.transform = `translate(0, calc(-50% + ${(1 - vo) * 10}px))`;
    }
    // names under each model, while it's the one in focus, and in the final overview
    const nameAmt = [1 - ss(0.4, 0.7, p), ss(0.75, 0.95, p) * (1 - ss(1.1, 1.3, p)), ss(2.7, 2.9, p) * (1 - ss(3.1, 3.3, p))].map((a, n) => Math.max(a, ss(3.65, 3.9, p) * appear[n]));
    names.forEach((el, n) => {
      const [x, y] = toScreen(holders[n].localToWorld(new THREE.Vector3(0, -0.15, 2.9)));
      el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.opacity = nameAmt[n].toFixed(3);
    });
    if (!options.chapters) steps.forEach((el, n) => { const d = Math.abs(p - n); el.style.opacity = (0.24 + 0.76 * clamp(1 - d * 1.6)).toFixed(3); el.classList.toggle('on', d < 0.5); });
    composer.render();
  };

  // story position from scroll: p = n when step n's centre sits on the reading line (mid-screen; lower on phones)
  const target = () => {
    if (options.getProgress) return Math.max(0, Math.min(4, options.getProgress()));
    const line = innerHeight * (mq.matches ? 0.72 : 0.5);
    const c = steps.map((el) => { const b = el.getBoundingClientRect(); return b.top + b.height / 2; });
    if (line <= c[0]) return 0;
    for (let n = 0; n < c.length - 1; n++) if (line <= c[n + 1]) return n + (line - c[n]) / (c[n + 1] - c[n]);
    return c.length - 1;
  };
  let shown = target(), dirty = true, visible = false, last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; clock += dt;
    if (visible) {
      const goal = target();
      shown = options.chapters ? goal : reduce ? Math.round(goal) : shown + (goal - shown) * Math.min(1, dt * 9);
      draw(shown); dirty = false;
    }
    requestAnimationFrame(loop);
  };
  new IntersectionObserver((es) => es.forEach((e) => { visible = e.isIntersecting; }), { rootMargin: '200px 0px' }).observe(host);
  mq.addEventListener('change', () => { F = frames(); });
  resize();
  host.classList.add('is-3d');
  draw(shown);
  requestAnimationFrame(loop);
  // test hook: render a given story position synchronously (used by the review scripts)
  window.__enclave3d = { draw: (p) => { shown = p; draw(p); }, get progress() { return shown; }, U };
}
