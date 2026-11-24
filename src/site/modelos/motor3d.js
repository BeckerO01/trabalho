// Motor 3D dos modelos premium (roda no navegador do visitante, com Three.js do jsDelivr).
// Objetos: haltere, sorriso (arcada que se monta), frasco de sérum, hambúrguer real (.glb escaneado),
// pizza, xícara, tigela e forma fluida. Câmera com entrada, aproximação na rolagem, "respiração" e zoom no toque.
// Sem crases nem ${ } aqui dentro: este texto vai embutido no HTML gerado.
export const MOTOR_3D = String.raw`
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
const cfg = JSON.parse(document.getElementById("cfg3d").textContent);
const cv = document.getElementById("o3d");
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: "high-performance" }); }
catch (e) { document.documentElement.classList.add("sem3d"); throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const cena = new THREE.Scene();
const pm = new THREE.PMREMGenerator(renderer);
cena.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
cam.position.set(0, 2.5, 15);
cena.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.9));
const sol = new THREE.DirectionalLight(0xffffff, 2.2); sol.position.set(3, 5, 4); cena.add(sol);
const borda = new THREE.PointLight(new THREE.Color(cfg.a1), 18, 12); borda.position.set(-3, 1.5, -2); cena.add(borda);
const C = (h) => new THREE.Color(h);
const std = (o) => new THREE.MeshStandardMaterial(o);
const fis = (o) => new THREE.MeshPhysicalMaterial(o);
const suave = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const volta = (x) => { x = Math.min(1, Math.max(0, x)); const k = 1.70158; return 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
const grupo = new THREE.Group(); cena.add(grupo);
let camadas = [];   // partes que se afastam com a rolagem (hambúrguer feito em código)
const anim = [];    // funções chamadas a cada quadro: (t, rol, dt)
const ctrl = { oscila: 0, giro: 1, toque: null }; // oscila: balança em vez de girar; toque: ação ao tocar no objeto

function haltere() {
  const g = new THREE.Group();
  const cromo = std({ color: 0xd9dde3, metalness: 1, roughness: 0.22 });
  const borracha = std({ color: 0x15161a, metalness: 0.1, roughness: 0.55 });
  const neon = std({ color: C(cfg.a1), emissive: C(cfg.a1), emissiveIntensity: 0.9, roughness: 0.3 });
  const barra = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.6, 32), cromo); g.add(barra);
  for (let i = -5; i <= 5; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 24), std({ color: 0xaab0b8, metalness: 1, roughness: 0.5 })); r.position.y = i * 0.07; g.add(r); }
  const anilhas = [];
  [-1, 1].forEach((lado) => {
    [[0.82, 0.2, 0.78], [0.7, 0.17, 1.0], [0.56, 0.15, 1.18]].forEach(([raio, esp, pos]) => {
      const a = new THREE.Group(); a.position.y = lado * pos; a.userData.y0 = lado * pos; g.add(a); anilhas.push(a);
      a.add(new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, esp, 64), borracha));
      const aro = new THREE.Mesh(new THREE.TorusGeometry(raio * 0.82, 0.018, 12, 80), neon); aro.rotation.x = Math.PI / 2; aro.position.y = lado * (esp / 2 + 0.002); a.add(aro);
      a.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, esp + 0.02, 32), cromo));
    });
    const trava = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 32), cromo); trava.position.y = lado * 0.6; g.add(trava);
  });
  // as anilhas chegam voando na entrada e se soltam um pouco ao tocar
  let solta = 0;
  ctrl.toque = () => { solta = 1; };
  anim.push((t, rol, dt) => {
    solta = Math.max(0, solta - dt * 0.9);
    anilhas.forEach((a, i) => { const ent = volta((t - 0.5 - (i % 3) * 0.12) / 0.9); const y0 = a.userData.y0; a.position.y = y0 + Math.sign(y0) * ((1 - ent) * 2.6 + Math.sin(solta * Math.PI) * 0.35 * (1 + (i % 3) * 0.4)); a.rotation.y = (1 - ent) * 4; });
  });
  g.rotation.z = Math.PI / 2; g.rotation.x = 0.35; g.scale.setScalar(1.05);
  return g;
}

// ---------- dentista: arcada que se monta dente por dente, gengiva e alinhador transparente ----------
function geoDente(tipo) {
  const geo = new THREE.SphereGeometry(1, 48, 48);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    if (tipo === "mol") {
      const ang = Math.atan2(v.z, v.x), alto = Math.max(0, (v.y - 0.25) / 0.75);
      v.y += alto * (0.2 * Math.pow(Math.abs(Math.cos(ang * 2)), 1.5) - 0.12);
      v.y -= alto * 0.22 * Math.exp(-(v.x * v.x + v.z * v.z) * 9);
      v.x *= 1.0; v.z *= 0.95; v.y *= 0.8;
    } else if (tipo === "pre") {
      const alto = Math.max(0, (v.y - 0.3) / 0.7);
      v.y -= alto * 0.18 * Math.exp(-v.z * v.z * 10);
      v.x *= 0.72; v.z *= 0.85; v.y *= 0.9;
    } else if (tipo === "can") {
      v.x *= 0.52; v.z *= 0.5; v.y *= 1.15;
      if (v.y > 0.2) { const k = Math.min(1, (v.y - 0.2) / 0.95); v.x *= 1 - 0.55 * k; v.z *= 1 - 0.35 * k; }
    } else {
      v.x *= 0.56; v.z *= 0.3; v.y *= 1.08;
      if (v.y > 0.55) v.y = 0.55 + (v.y - 0.55) * 0.35;
      v.z *= 1 - Math.max(0, v.y) * 0.35;
    }
    if (v.y < -0.1) { const k = Math.min(1, (-v.y - 0.1) * 1.2); v.x *= 1 - 0.2 * k; v.z *= 1 - 0.2 * k; }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}
function sorriso() {
  const g = new THREE.Group();
  const esmalte = fis({ color: 0xffffff, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.06, sheen: 0.4, sheenColor: C(cfg.a2 || "#e8f8ff") });
  const geos = { inc: geoDente("inc"), can: geoDente("can"), pre: geoDente("pre"), mol: geoDente("mol") };
  const ordem = [["inc", 0.42], ["inc", 0.38], ["can", 0.4], ["pre", 0.44], ["pre", 0.44], ["mol", 0.56], ["mol", 0.54]];
  const R = 1.55, pontoArco = (s) => { const a = s / R; return new THREE.Vector3(Math.sin(a) * R * 1.05, 0, Math.cos(a) * R * 0.95 - 0.6); };
  const dentes = [];
  [-1, 1].forEach((lado) => {
    let s = 0.03;
    ordem.forEach(([tipo, larg], i) => {
      const meio = s + larg / 2; s += larg + 0.035;
      const pos = pontoArco(lado * meio);
      const m = new THREE.Mesh(geos[tipo], esmalte);
      const esc = tipo === "mol" ? 0.27 : tipo === "pre" ? 0.23 : 0.24;
      m.scale.setScalar(esc);
      m.userData = { alvo: pos.clone().setY(0.1), rotAlvo: Math.atan2(pos.x, pos.z + 0.6), atraso: i * 0.08 + (lado > 0 ? 0.04 : 0), de: new THREE.Vector3().randomDirection().multiplyScalar(4 + Math.random() * 2), giro: (Math.random() - 0.5) * 8 };
      g.add(m); dentes.push(m);
    });
  });
  // gengiva em arco
  const pts = []; for (let k = -1; k <= 1.0001; k += 0.1) pts.push(pontoArco(k * 2.9).setY(-0.12));
  const curva = new THREE.CatmullRomCurve3(pts);
  const gengiva = new THREE.Mesh(new THREE.TubeGeometry(curva, 120, 0.2, 24, false), fis({ color: 0xf08a9a, transparent: true, roughness: 0.35, clearcoat: 0.8, sheen: 0.6, sheenColor: C("#ffd0d8") }));
  gengiva.scale.y = 0.9; g.add(gengiva);
  // alinhador transparente que desce sobre os dentes
  const pts2 = pts.map((p) => p.clone().setY(0.2));
  const alinhador = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 120, 0.26, 24, false), fis({ color: C(cfg.a2 || "#e8f8ff"), roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.3, depthWrite: false, envMapIntensity: 1.6 }));
  alinhador.scale.set(1.04, 1.25, 1.04); g.add(alinhador);
  // brilho em estrela que pisca nos dentes da frente
  const estrela = new THREE.Group();
  const raio = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  [0, Math.PI / 2].forEach((r) => { const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), raio); m.scale.set(0.06, 1, 0.06); m.rotation.z = r; estrela.add(m); });
  estrela.position.set(0.25, 0.5, 1.15); g.add(estrela);
  const pontos = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 80 }, () => new THREE.Vector3().randomDirection().multiplyScalar(1.9 + Math.random() * 1.1))), new THREE.PointsMaterial({ color: C(cfg.a1), size: 0.04, transparent: true, opacity: 0.8 }));
  g.add(pontos);
  let inicio = 0;
  ctrl.toque = (t) => { inicio = t - 0.2; dentes.forEach((d) => d.userData.de.randomDirection().multiplyScalar(4 + Math.random() * 2)); };
  ctrl.oscila = 0.65;
  anim.push((t, rol) => {
    const tt = t - inicio;
    dentes.forEach((d) => {
      const u = d.userData, k = volta((tt - 0.5 - u.atraso) / 0.85);
      d.position.lerpVectors(u.de, u.alvo, k);
      d.rotation.set((1 - k) * u.giro, u.rotAlvo + (1 - k) * u.giro, 0);
    });
    const monta = suave((tt - 1.6) / 0.8);
    gengiva.scale.x = gengiva.scale.z = 0.2 + monta * 0.8; gengiva.material.opacity = monta;
    // o alinhador paira em cima e encaixa conforme rola (ou sozinho, a cada ciclo)
    const ciclo = reduz ? 0 : suave(Math.sin(t * 0.55) * 1.4 - 0.2);
    const desce = Math.max(rol * 1.6, ciclo);
    alinhador.position.y = 0.9 * (1 - suave(desce)) + (1 - monta) * 3;
    alinhador.material.opacity = 0.3 * monta * (0.35 + 0.65 * suave(desce));
    const pisca = Math.max(0, Math.sin(t * 1.7)) ** 12;
    estrela.scale.setScalar(0.2 + pisca * 1.2); estrela.rotation.z = t * 0.8; raio.opacity = pisca * monta;
    pontos.rotation.y = -t * 0.06;
  });
  g.rotation.x = 0.42; g.position.y = 0.05; g.scale.setScalar(0.92);
  return g;
}

// ---------- clínica: frasco de sérum de vidro com conta-gotas que pinga ----------
function serum() {
  const g = new THREE.Group();
  const vidro = fis({ color: 0xffffff, roughness: 0.03, clearcoat: 1, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 2.2, side: THREE.DoubleSide });
  const V = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(V([[0, -1.3], [0.68, -1.3], [0.78, -1.24], [0.82, -1.1], [0.82, 0.3], [0.78, 0.5], [0.6, 0.68], [0.36, 0.78], [0.31, 0.9], [0.31, 1.02], [0.27, 1.02], [0.27, 0.9], [0.32, 0.78], [0.56, 0.66], [0.74, 0.48], [0.77, 0.3], [0.77, -1.1], [0.74, -1.2], [0, -1.2]]), 96), vidro));
  const liq = fis({ color: C(cfg.a1), roughness: 0.12, clearcoat: 1, transparent: true, opacity: 0.85, sheen: 0.6, sheenColor: C("#ffffff") });
  const liquido = new THREE.Mesh(new THREE.LatheGeometry(V([[0, -1.19], [0.72, -1.19], [0.755, -1.1], [0.755, 0], [0, 0]]), 64), liq);
  g.add(liquido);
  // bolhinhas subindo dentro do líquido
  const nB = 40, bol = new THREE.BufferGeometry().setFromPoints(Array.from({ length: nB }, () => new THREE.Vector3((Math.random() - 0.5) * 1.1, -1.15 + Math.random() * 1.1, (Math.random() - 0.5) * 1.1)));
  g.add(new THREE.Points(bol, new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false })));
  // tampa com conta-gotas
  const tampa = new THREE.Group(); g.add(tampa);
  const ouro = std({ color: 0xd8b27a, metalness: 1, roughness: 0.22 });
  const anel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.34, 64), ouro); anel.position.y = 1.12; tampa.add(anel);
  const borr = fis({ color: C(cfg.a1).lerp(C("#ffffff"), 0.15), roughness: 0.45, clearcoat: 0.4, sheen: 0.5, sheenColor: C("#ffffff"), emissive: C(cfg.a1), emissiveIntensity: 0.15 });
  const bulbo = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.42, 16, 40), borr); bulbo.position.y = 1.62; tampa.add(bulbo);
  const pipeta = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.04, 1.95, 24), fis({ color: 0xffffff, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.35, depthWrite: false })); pipeta.position.y = -0.02; tampa.add(pipeta);
  const ponta = new THREE.Vector3(0, -1.0, 0);
  // gotas e ondas no "chão"
  const gotaGeo = new THREE.SphereGeometry(0.075, 24, 16), gotas = [];
  for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(gotaGeo, liq); m.visible = false; g.add(m); gotas.push({ m, v: 0, viva: false }); }
  const ondaMat = new THREE.MeshBasicMaterial({ color: C(cfg.a1), transparent: true, opacity: 0, side: THREE.DoubleSide }), ondas = [];
  for (let i = 0; i < 4; i++) { const o = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 64), ondaMat.clone()); o.rotation.x = -Math.PI / 2; o.position.y = -1.32; o.visible = false; g.add(o); ondas.push({ o, t: 9 }); }
  // pérolas em órbita
  const perola = fis({ color: 0xffffff, roughness: 0.15, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.3, sheen: 1, sheenColor: C(cfg.a1) });
  const orbita = new THREE.Group(); g.add(orbita);
  for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07 + (i % 3) * 0.035, 24, 16), perola); const a = (i / 7) * Math.PI * 2; m.position.set(Math.cos(a) * 1.75, Math.sin(a * 2) * 0.5, Math.sin(a) * 1.75); orbita.add(m); }
  orbita.rotation.z = 0.35;
  let ultimaGota = 0, cicloIni = 1.2;
  ctrl.toque = (t) => { if ((t - cicloIni) % 7.5 > 6.4 || t - cicloIni < 0) cicloIni = t; };
  ctrl.oscila = 0.5;
  anim.push((t, rol, dt) => {
    // ciclo de 7,5s: sobe, vai para o lado, pinga, volta e fecha
    const f = reduz ? 0 : (((t - cicloIni) % 7.5) + 7.5) % 7.5;
    const sobe = suave(f / 1) - suave((f - 6.4) / 1);
    const lado = suave((f - 1) / 0.9) - suave((f - 5.4) / 0.9);
    tampa.position.set(lado * 1.55, sobe * 1.45 + lado * 0.15, 0);
    tampa.rotation.z = -lado * 0.12;
    if (f > 2.1 && f < 5.2 && t - ultimaGota > 0.55) {
      const gt = gotas.find((x) => !x.viva);
      if (gt) { ultimaGota = t; gt.viva = true; gt.v = 0; gt.m.visible = true; gt.m.position.copy(ponta).applyMatrix4(tampa.matrix); gt.m.scale.set(0.2, 0.2, 0.2); gt.cresce = 0; }
    }
    gotas.forEach((x) => {
      if (!x.viva) return;
      x.cresce = Math.min(1, x.cresce + dt * 4);
      if (x.cresce < 1) { x.m.scale.setScalar(0.2 + x.cresce * 0.8); return; }
      x.v += dt * 6; x.m.position.y -= x.v * dt; x.m.scale.set(0.85, 1.35, 0.85);
      if (x.m.position.y < -1.3) {
        x.viva = false; x.m.visible = false;
        const o = ondas.find((w) => w.t > 1) || ondas[0]; o.t = 0; o.o.visible = true; o.o.position.x = x.m.position.x; o.o.position.z = x.m.position.z;
      }
    });
    ondas.forEach((w) => { w.t += dt; const k = Math.min(1, w.t / 1); w.o.scale.setScalar(0.05 + k * 0.6); w.o.material.opacity = (1 - k) * 0.6; if (k >= 1) w.o.visible = false; });
    const p = bol.attributes.position;
    for (let i = 0; i < nB; i++) { let y = p.getY(i) + dt * (0.15 + (i % 5) * 0.05); if (y > -0.03) y = -1.15; p.setY(i, y); }
    p.needsUpdate = true;
    liquido.rotation.y = t * 0.2; liquido.position.y = Math.sin(t * 2.1) * 0.004;
    orbita.rotation.y = t * 0.35;
  });
  g.position.y = -0.35; g.scale.setScalar(0.8);
  return g;
}

function burger() {
  const g = new THREE.Group();
  const pao = std({ color: 0xd8892f, roughness: 0.55 });
  const camada = (mesh, y) => { mesh.position.y = y; mesh.userData.y0 = y; g.add(mesh); camadas.push(mesh); return mesh; };
  camada(new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 0.38, 64), pao), -0.95);
  const carne = new THREE.CylinderGeometry(1.24, 1.24, 0.32, 64, 4);
  const pc = carne.attributes.position; for (let i = 0; i < pc.count; i++) pc.setX(i, pc.getX(i) * (1 + (Math.random() - 0.5) * 0.04));
  carne.computeVertexNormals();
  camada(new THREE.Mesh(carne, std({ color: 0x4a2414, roughness: 0.95 })), -0.58);
  const queijo = camada(new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.07, 2.25), std({ color: 0xffb81c, roughness: 0.35 })), -0.38); queijo.rotation.y = Math.PI / 4;
  camada(new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.12, 48), std({ color: 0xd62d20, roughness: 0.4 })), -0.25);
  const alface = new THREE.CylinderGeometry(1.32, 1.32, 0.08, 96, 1);
  const pa = alface.attributes.position; for (let i = 0; i < pa.count; i++) { const a = Math.atan2(pa.getZ(i), pa.getX(i)); pa.setY(i, pa.getY(i) + Math.sin(a * 14) * 0.05); }
  alface.computeVertexNormals();
  camada(new THREE.Mesh(alface, std({ color: 0x5fae3b, roughness: 0.6 })), -0.12);
  const topo = new THREE.Mesh(new THREE.SphereGeometry(1.2, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2), pao); topo.scale.y = 0.72;
  const tampa = new THREE.Group(); tampa.add(topo);
  const ger = new THREE.CapsuleGeometry(0.025, 0.06, 4, 8), gm = std({ color: 0xfff4dc, roughness: 0.6 });
  for (let i = 0; i < 46; i++) { const th = Math.random() * Math.PI * 2, ph = Math.random() * 1.15; const s = new THREE.Mesh(ger, gm); s.position.set(Math.sin(ph) * Math.cos(th) * 1.2, Math.cos(ph) * 1.2 * 0.72, Math.sin(ph) * Math.sin(th) * 1.2); s.lookAt(0, -1, 0); s.rotateX(Math.PI / 2); s.rotateZ(Math.random() * 3); tampa.add(s); }
  camada(tampa, 0.02);
  g.rotation.x = 0.22; g.scale.setScalar(1.08);
  return g;
}

// hambúrguer de verdade (modelo escaneado em .glb): entra no lugar do feito em código quando carrega
function carregarGlb(url) {
  Promise.all([import("three/addons/loaders/GLTFLoader.js"), import("three/addons/libs/meshopt_decoder.module.js")]).then(([L, M]) => {
    const ld = new L.GLTFLoader(); ld.setMeshoptDecoder(M.MeshoptDecoder);
    ld.load(url, (gl) => {
      const m = gl.scene, caixa = new THREE.Box3().setFromObject(m), tam = caixa.getSize(new THREE.Vector3());
      m.position.sub(caixa.getCenter(new THREE.Vector3()));
      m.traverse((o) => { if (o.isMesh) { o.material.roughness = 0.62; o.material.metalness = 0; o.material.envMapIntensity = 0.7; } });
      const novo = new THREE.Group(); novo.add(m); novo.scale.setScalar(3.1 / Math.max(tam.x, tam.y, tam.z));
      novo.rotation.x = 0.18; trocar(novo);
    });
  }).catch(() => {});
}

function pizza() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.6, 0.16, 96), std({ color: 0xd9973f, roughness: 0.7 })));
  const borda = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.12, 24, 120), std({ color: 0xc98535, roughness: 0.75 })); borda.rotation.x = Math.PI / 2; borda.position.y = 0.06; g.add(borda);
  const molho = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.04, 96), std({ color: 0xb3261e, roughness: 0.5 })); molho.position.y = 0.09; g.add(molho);
  const queijo = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.36, 0.04, 96), std({ color: 0xf8d978, roughness: 0.35 })); queijo.position.y = 0.12; g.add(queijo);
  const pep = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32), pm2 = std({ color: 0xa3261b, roughness: 0.45 });
  [[0, 0], [0.75, 0.3], [-0.7, 0.45], [0.35, -0.8], [-0.45, -0.7], [0.95, -0.45], [-1.05, -0.1], [0.1, 0.95]].forEach(([x, z]) => { const m = new THREE.Mesh(pep, pm2); m.position.set(x, 0.16, z); g.add(m); });
  const folha = new THREE.SphereGeometry(0.13, 16, 8), fm = std({ color: 0x2f7d32, roughness: 0.5 });
  [[0.4, 0.5], [-0.3, 0.1], [0.6, -0.1], [-0.8, 0.7], [-0.1, -0.4]].forEach(([x, z]) => { const m = new THREE.Mesh(folha, fm); m.scale.set(1.4, 0.25, 0.7); m.position.set(x, 0.17, z); m.rotation.y = x * 3; g.add(m); });
  g.rotation.x = 0.62; g.scale.setScalar(1.05);
  return g;
}

function xicara() {
  const g = new THREE.Group();
  const loucaMat = fis({ color: 0xffffff, roughness: 0.18, clearcoat: 1 });
  const perfil = [[0, -0.9], [0.75, -0.9], [0.95, -0.6], [1.05, 0.2], [1.1, 0.75], [1.04, 0.78], [0.98, 0.2], [0.88, -0.55], [0.7, -0.8], [0, -0.8]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(perfil, 96), loucaMat));
  const cafe = new THREE.Mesh(new THREE.CircleGeometry(1.0, 64), std({ color: 0x3b1f12, roughness: 0.25 })); cafe.rotation.x = -Math.PI / 2; cafe.position.y = 0.55; g.add(cafe);
  const alca = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 24, 64, Math.PI * 1.25), loucaMat); alca.position.set(1.12, 0.05, 0); alca.rotation.z = -Math.PI * 0.62; g.add(alca);
  const pires = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.45, 0.1, 96), loucaMat); pires.position.y = -0.97; g.add(pires);
  const fum = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 90 }, () => new THREE.Vector3((Math.random() - 0.5) * 0.7, 0.6 + Math.random() * 1.6, (Math.random() - 0.5) * 0.7))), new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.35, depthWrite: false }));
  g.add(fum);
  anim.push((t) => { const p = fum.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + 0.006; if (y > 2.4) y = 0.6; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t + i) * 0.0015); } p.needsUpdate = true; });
  g.rotation.x = 0.28; g.scale.setScalar(0.95);
  return g;
}

function tigela() {
  const g = new THREE.Group();
  const perfil = [[0, -0.75], [0.6, -0.75], [1.2, -0.45], [1.55, 0.25], [1.6, 0.42], [1.52, 0.42], [1.47, 0.25], [1.12, -0.38], [0.55, -0.65], [0, -0.65]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(perfil, 96), fis({ color: C(cfg.a1), roughness: 0.25, clearcoat: 1 })));
  const comida = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 1.42, 0.08, 64), std({ color: 0xf4efe6, roughness: 0.8 })); comida.position.y = 0.2; g.add(comida);
  const cores = [0xff7a4d, 0x6cbf4a, 0xf2c14e, 0xe85d75];
  for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.22), std({ color: cores[i % 4], roughness: 0.5 })); const a = Math.random() * Math.PI * 2, r = Math.random() * 1.15; m.position.set(Math.cos(a) * r, 0.3, Math.sin(a) * r); m.rotation.set(Math.random(), Math.random(), Math.random()); g.add(m); }
  [0.12, -0.12].forEach((dz) => { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 3.4, 16), std({ color: 0x2b2118, roughness: 0.5 })); h.rotation.z = 1.15; h.position.set(0.3, 0.85, dz); g.add(h); });
  g.rotation.x = 0.5;
  return g;
}

function forma() {
  const g = new THREE.Group();
  const geo = new THREE.IcosahedronGeometry(1.25, 40), base = geo.attributes.position.array.slice();
  const m = fis({ color: C(cfg.a2 || "#ffffff"), roughness: 0.08, metalness: 0.15, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.4, sheen: 1, sheenColor: C(cfg.a1) });
  g.add(new THREE.Mesh(geo, m));
  anim.push((t) => {
    if (reduz) return;
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2]; const n = 1 + 0.09 * Math.sin(x * 2.2 + t * 1.1) * Math.cos(y * 2.4 + t * 0.9) + 0.05 * Math.sin(z * 3.1 + t * 1.6); p.setXYZ(i, x * n, y * n, z * n); }
    p.needsUpdate = true; geo.computeVertexNormals();
  });
  return g;
}

const fab = { haltere, sorriso, dente: sorriso, serum, forma, burger, pizza, xicara, tigela };
let atual = (fab[cfg.objeto] || forma)(); grupo.add(atual);
let entra = 0; // 0..1: objeto crescendo na troca
function trocar(novo) { camadas = []; grupo.remove(atual); atual = novo; grupo.add(novo); entra = 0; }
if (cfg.glb) carregarGlb(cfg.glb);

let zBase = 7.2;
function ajustar() {
  const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); cam.aspect = w / h;
  zBase = w / h < 0.9 ? 8.6 : 7.2; cam.updateProjectionMatrix();
}
new ResizeObserver(ajustar).observe(cv); ajustar();

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });
// tocar no objeto: a câmera dá um zoom rápido e o objeto reage
let zoom = 0, zoomAlvo = 0;
const relogio = new THREE.Clock();
const palco = cv.parentElement;
palco.style.cursor = "pointer";
palco.addEventListener("pointerdown", () => { zoomAlvo = 1; setTimeout(() => (zoomAlvo = 0), 650); if (ctrl.toque) ctrl.toque(relogio.getElapsedTime()); });
let visivel = true;
new IntersectionObserver((es) => { visivel = es[0].isIntersecting; }).observe(cv);
let giro = 0, antes = 0;
function quadro() {
  requestAnimationFrame(quadro);
  if (!visivel) return;
  const t = relogio.getElapsedTime(), dt = Math.min(0.05, t - antes); antes = t;
  const rol = Math.min(1, scrollY / innerHeight);
  mouse.sx += (mouse.x - mouse.sx) * 0.06; mouse.sy += (mouse.y - mouse.sy) * 0.06;
  zoom += (zoomAlvo - zoom) * 0.12;
  entra = Math.min(1, entra + dt * 1.4);
  atual.scale.setScalar(Math.max(0.001, volta(entra)) * (atual.userData.esc || (atual.userData.esc = atual.scale.x)));
  // câmera: chega de longe, aproxima ao rolar, "respira" (afasta e aproxima) e orbita um pouco
  const ei = reduz ? 1 : 1 - Math.pow(1 - Math.min(1, t / 2.6), 4);
  const respira = reduz ? 0 : Math.sin(t * 0.45) * 0.55;
  const z = (15 - (15 - zBase) * ei) * (1 - 0.38 * suave(rol * 1.3)) + respira - zoom * 1.8;
  const ang = (1 - ei) * 1.3 + mouse.sx * 0.35 + rol * 0.8 + (reduz ? 0 : Math.sin(t * 0.21) * 0.22);
  cam.position.set(Math.sin(ang) * z, 0.2 + (1 - ei) * 2.6 + rol * 1.1 - mouse.sy * 0.7, Math.cos(ang) * z);
  cam.lookAt(0, -rol * 0.35, 0);
  if (ctrl.oscila) grupo.rotation.y = Math.sin(t * 0.5) * ctrl.oscila + mouse.sx * 0.6;
  else { giro += reduz ? 0.0015 : 0.005 + rol * 0.02; grupo.rotation.y = giro + mouse.sx * 0.8; }
  grupo.rotation.x = mouse.sy * 0.3;
  grupo.position.y = Math.sin(t * 1.2) * (reduz ? 0 : 0.08) - rol * 0.4;
  camadas.forEach((c, i) => { c.position.y = c.userData.y0 * (1 + rol * 0.9) + (i - 2.5) * rol * 0.12; });
  anim.forEach((f) => f(t, rol, dt));
  renderer.render(cena, cam);
}
quadro();
document.documentElement.classList.add("com3d");
`;
