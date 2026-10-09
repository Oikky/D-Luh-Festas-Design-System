/* Bolo 3D da cena "Bolo do tamanho da festa" (Three.js, js/vendor).
   Carregado sob demanda pelo cenas.js quando a seção chega perto; se o WebGL falhar,
   o círculo em SVG continua no lugar. Só desenha enquanto a cena está na tela. */
import * as THREE from "./vendor/three.module.min.js";

export function criarBolo3D(caixa) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = "cena-bolo__3d";
  caixa.appendChild(renderer.domElement);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 3.1, 5.2);
  camera.lookAt(0, 0.15, 0);

  cena.add(new THREE.HemisphereLight(0xfff6f1, 0xc9a094, 1.6));
  const sol = new THREE.DirectionalLight(0xffe9dc, 2.2);
  sol.position.set(2.5, 4, 3);
  cena.add(sol);

  /* Bolo, prato e sombra crescem juntos. */
  const bolo = new THREE.Group();
  cena.add(bolo);

  /* Prato branco e uma sombra macia pintada em canvas (mais leve que sombra de verdade). */
  const prato = new THREE.Mesh(
    new THREE.CylinderGeometry(1.32, 1.24, 0.06, 96),
    new THREE.MeshStandardMaterial({ color: 0xfffaf7, emissive: 0xfff3ee, emissiveIntensity: 0.35, roughness: 0.35 })
  );
  prato.position.y = -0.03;
  bolo.add(prato);

  const tela = document.createElement("canvas");
  tela.width = tela.height = 128;
  const g = tela.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 10, 64, 64, 64);
  grad.addColorStop(0, "rgba(120,60,45,0.28)");
  grad.addColorStop(1, "rgba(120,60,45,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.2),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(tela), transparent: true, depthWrite: false, toneMapped: false })
  );
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = -0.06;
  bolo.add(sombra);

  /* O bolo: lateral de chantilly, topo com a foto do próprio bolo, bolinhas de confeito nas bordas. */
  const ALTURA = 0.62;
  const chantilly = new THREE.MeshStandardMaterial({ color: 0xf6ddd3, roughness: 0.8 });
  const topo = new THREE.MeshStandardMaterial({ color: 0xf6ddd3, roughness: 0.7 });
  const corpo = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, ALTURA, 96), [chantilly, topo, chantilly]);
  corpo.position.y = ALTURA / 2;
  bolo.add(corpo);

  const bolinha = new THREE.SphereGeometry(0.075, 16, 12);
  const confeito = new THREE.MeshStandardMaterial({ color: 0xfdf3f0, roughness: 0.55 });
  const N = 40;
  const bordas = new THREE.InstancedMesh(bolinha, confeito, N * 2);
  const m = new THREE.Matrix4();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    m.makeTranslation(Math.cos(a) * 0.97, ALTURA + 0.01, Math.sin(a) * 0.97);
    bordas.setMatrixAt(i, m);
    m.makeTranslation(Math.cos(a) * 1.0, 0.06, Math.sin(a) * 1.0);
    bordas.setMatrixAt(N + i, m);
  }
  bolo.add(bordas);

  /* Tamanho e foto: o cenas.js chama definir() a cada aro. */
  const carregador = new THREE.TextureLoader();
  carregador.setCrossOrigin("anonymous");
  const texturas = new Map();
  let fotoAtual = "";
  function trocarFoto(url) {
    if (!url || url === fotoAtual) return;
    fotoAtual = url;
    const aplicar = tex => {
      if (fotoAtual !== url) return;
      topo.map = tex;
      topo.color.set(0xffffff);
      topo.needsUpdate = true;
    };
    if (texturas.has(url)) return aplicar(texturas.get(url));
    carregador.load(url, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      texturas.set(url, tex);
      aplicar(tex);
    });
  }

  const estado = { escala: 0.6, giroExtra: 0 };
  bolo.scale.setScalar(estado.escala);

  function definir(proporcao, imagem) {
    const alvo = 0.5 + 0.5 * proporcao;
    const gsap = window.gsap;
    if (gsap) gsap.to(estado, { escala: alvo, giroExtra: estado.giroExtra + 0.9, duration: 0.7, ease: "power3.out", overwrite: true });
    else estado.escala = alvo;
    trocarFoto(imagem);
  }

  /* Ajusta o tamanho do canvas à caixa. */
  function medir() {
    const w = caixa.clientWidth, h = caixa.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(medir).observe(caixa);
  medir();

  /* Laço de desenho só com a cena visível. */
  let visivel = false, ultimo = 0, giro = 0, rodando = false;
  function quadro(t) {
    if (!visivel || document.hidden) { rodando = false; return; }
    const dt = ultimo ? Math.min(0.05, (t - ultimo) / 1000) : 0;
    ultimo = t;
    giro += dt * 0.35;
    bolo.rotation.y = giro + estado.giroExtra;
    bolo.scale.setScalar(estado.escala);
    renderer.render(cena, camera);
    requestAnimationFrame(quadro);
  }
  function ligar() {
    if (rodando || !visivel || document.hidden) return;
    rodando = true; ultimo = 0;
    requestAnimationFrame(quadro);
  }
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; ligar(); }).observe(caixa);
  document.addEventListener("visibilitychange", ligar);

  return { definir };
}
