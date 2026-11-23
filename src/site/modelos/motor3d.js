// Motor 3D dos modelos premium (roda no navegador do visitante, com Three.js do jsDelivr).
// Objetos montados em código (sem arquivos de modelo): haltere, dente, hambúrguer, pizza, xícara, tigela e forma fluida.
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
cam.position.set(0, 0.2, 7.2);
cena.add(new THREE.HemisphereLight(0xffffff, 0x222222, 0.9));
const sol = new THREE.DirectionalLight(0xffffff, 2.2); sol.position.set(3, 5, 4); cena.add(sol);
const borda = new THREE.PointLight(new THREE.Color(cfg.a1), 18, 12); borda.position.set(-3, 1.5, -2); cena.add(borda);
const C = (h) => new THREE.Color(h);
const std = (o) => new THREE.MeshStandardMaterial(o);
const fis = (o) => new THREE.MeshPhysicalMaterial(o);
const grupo = new THREE.Group(); cena.add(grupo);
const camadas = []; // partes que se afastam com a rolagem (hambúrguer)
const extras = [];  // partes animadas (fumaça, brilhos, anéis)

function haltere() {
  const g = new THREE.Group();
  const cromo = std({ color: 0xd9dde3, metalness: 1, roughness: 0.22 });
  const borracha = std({ color: 0x15161a, metalness: 0.1, roughness: 0.55 });
  const neon = std({ color: C(cfg.a1), emissive: C(cfg.a1), emissiveIntensity: 0.9, roughness: 0.3 });
  const barra = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.6, 32), cromo); g.add(barra);
  for (let i = -5; i <= 5; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 24), std({ color: 0xaab0b8, metalness: 1, roughness: 0.5 })); r.position.y = i * 0.07; g.add(r); }
  [-1, 1].forEach((lado) => {
    [[0.82, 0.2, 0.78], [0.7, 0.17, 1.0], [0.56, 0.15, 1.18]].forEach(([raio, esp, pos]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(raio, raio, esp, 64), borracha); p.position.y = lado * pos; g.add(p);
      const aro = new THREE.Mesh(new THREE.TorusGeometry(raio * 0.82, 0.018, 12, 80), neon); aro.rotation.x = Math.PI / 2; aro.position.y = lado * (pos + esp / 2 + 0.002); g.add(aro);
      const cubo = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, esp + 0.02, 32), cromo); cubo.position.y = lado * pos; g.add(cubo);
    });
    const trava = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 32), cromo); trava.position.y = lado * 0.6; g.add(trava);
  });
  g.rotation.z = Math.PI / 2; g.rotation.x = 0.35; g.scale.setScalar(1.05);
  return g;
}

function dente() {
  const g = new THREE.Group();
  const geo = new THREE.SphereGeometry(1, 96, 96);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const ang = Math.atan2(v.z, v.x), alto = Math.max(0, (v.y - 0.25) / 0.75);
    v.y += alto * (0.2 * Math.pow(Math.abs(Math.cos(ang * 2)), 1.5) - 0.12);   // quatro cúspides
    v.y -= alto * 0.22 * Math.exp(-(v.x * v.x + v.z * v.z) * 9);               // sulco no centro
    v.x *= 1.12; v.z *= 0.95; v.y *= 0.78;
    if (v.y < -0.15) { const k = Math.min(1, (-v.y - 0.15) * 1.4); v.x *= 1 - 0.18 * k; v.z *= 1 - 0.18 * k; } // colo do dente
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const esmalte = fis({ color: 0xffffff, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, sheen: 0.5, sheenColor: C(cfg.a2 || "#dff3ff") });
  const coroa = new THREE.Mesh(geo, esmalte); g.add(coroa);
  const perfilRaiz = [[0, -1.25], [0.1, -1.2], [0.2, -1.0], [0.3, -0.6], [0.38, -0.2], [0.42, 0.15], [0, 0.15]].map(([x, y]) => new THREE.Vector2(x, y));
  [-1, 1].forEach((l) => {
    const raiz = new THREE.Mesh(new THREE.LatheGeometry(perfilRaiz, 48), esmalte);
    raiz.rotation.z = l * 0.14; raiz.position.set(l * 0.36, -0.62, 0); raiz.scale.set(1, 1, 0.85); g.add(raiz);
  });
  const anel = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.012, 12, 160), std({ color: C(cfg.a1), emissive: C(cfg.a1), emissiveIntensity: 0.7 }));
  anel.rotation.x = 1.25; g.add(anel); extras.push({ m: anel, gira: 0.004 });
  const brilho = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 70 }, () => new THREE.Vector3().randomDirection().multiplyScalar(1.6 + Math.random() * 0.9))), new THREE.PointsMaterial({ color: C(cfg.a1), size: 0.045, transparent: true, opacity: 0.85 }));
  g.add(brilho); extras.push({ m: brilho, gira: -0.002 });
  g.position.y = 0.3; g.scale.setScalar(0.95);
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
  g.add(fum); extras.push({ m: fum, fumaca: true });
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

let blobGeo, blobBase;
function forma() {
  const g = new THREE.Group();
  blobGeo = new THREE.IcosahedronGeometry(1.25, 40);
  blobBase = blobGeo.attributes.position.array.slice();
  const m = fis({ color: C(cfg.a2 || "#ffffff"), roughness: 0.08, metalness: 0.15, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.4, sheen: 1, sheenColor: C(cfg.a1) });
  g.add(new THREE.Mesh(blobGeo, m));
  [[1.9, 1.2], [2.25, -0.8]].forEach(([r, inc], i) => { const a = new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 12, 180), std({ color: C(cfg.a1), emissive: C(cfg.a1), emissiveIntensity: 0.6 })); a.rotation.x = inc; g.add(a); extras.push({ m: a, gira: i ? -0.003 : 0.004 }); });
  return g;
}

const fab = { haltere, dente, burger, pizza, xicara, tigela, forma };
grupo.add((fab[cfg.objeto] || forma)());

function ajustar() {
  const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); cam.aspect = w / h;
  cam.position.z = w / h < 0.9 ? 8.6 : 7.2; cam.updateProjectionMatrix();
}
new ResizeObserver(ajustar).observe(cv); ajustar();

const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
addEventListener("pointermove", (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; }, { passive: true });
let visivel = true;
new IntersectionObserver((es) => { visivel = es[0].isIntersecting; }).observe(cv);
const relogio = new THREE.Clock();
let giro = 0;
function quadro() {
  requestAnimationFrame(quadro);
  if (!visivel) return;
  const t = relogio.getElapsedTime();
  const rol = Math.min(1, scrollY / innerHeight);
  mouse.sx += (mouse.x - mouse.sx) * 0.06; mouse.sy += (mouse.y - mouse.sy) * 0.06;
  giro += reduz ? 0.0015 : 0.005 + rol * 0.02;
  grupo.rotation.y = giro + mouse.sx * 0.8;
  grupo.rotation.x = mouse.sy * 0.4;
  grupo.position.y = Math.sin(t * 1.2) * (reduz ? 0 : 0.08) - rol * 0.4;
  camadas.forEach((c, i) => { c.position.y = c.userData.y0 * (1 + rol * 0.9) + (i - 2.5) * rol * 0.12; });
  extras.forEach((x) => {
    if (x.gira) x.m.rotation.z += x.gira;
    if (x.fumaca) { const p = x.m.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + 0.006; if (y > 2.4) y = 0.6; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(t + i) * 0.0015); } p.needsUpdate = true; }
  });
  if (blobGeo && !reduz) {
    const p = blobGeo.attributes.position, b = blobBase;
    for (let i = 0; i < p.count; i++) {
      const x = b[i * 3], y = b[i * 3 + 1], z = b[i * 3 + 2];
      const n = 1 + 0.09 * Math.sin(x * 2.2 + t * 1.1) * Math.cos(y * 2.4 + t * 0.9) + 0.05 * Math.sin(z * 3.1 + t * 1.6);
      p.setXYZ(i, x * n, y * n, z * n);
    }
    p.needsUpdate = true; blobGeo.computeVertexNormals();
  }
  renderer.render(cena, cam);
}
quadro();
document.documentElement.classList.add("com3d");
`;
