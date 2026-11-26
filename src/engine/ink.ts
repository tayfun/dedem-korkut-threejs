import * as THREE from 'three';

/**
 * Minyatür görünümü: sahne önce renkli, sonra "normal + derinlik" olarak çizilir;
 * son geçişte kenarlara mürekkep çizgisi, üstüne kâğıt dokusu ve kenar kararması eklenir.
 */

/** Bu katmandaki nesnelere mürekkep çizgisi çekilmez (alev, ışık, yıldız, ot). */
export const FX_LAYER = 1;

export function noInk<T extends THREE.Object3D>(obj: T): T {
  obj.traverse((o) => o.layers.set(FX_LAYER));
  return obj;
}

const normalMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: /* glsl */ `
    #include <common>
    varying vec3 vN;
    varying float vZ;
    void main() {
      #include <beginnormal_vertex>
      #include <defaultnormal_vertex>
      #include <begin_vertex>
      #include <project_vertex>
      vN = normalize(transformedNormal);
      vZ = -mvPosition.z;
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vN;
    varying float vZ;
    void main() {
      vec3 n = normalize(vN);
      if (!gl_FrontFacing) n = -n;
      gl_FragColor = vec4(n * 0.5 + 0.5, vZ);
    }`,
});

const finalMaterial = new THREE.ShaderMaterial({
  depthTest: false,
  depthWrite: false,
  uniforms: {
    tColor: { value: null },
    tNormal: { value: null },
    texel: { value: new THREE.Vector2() },
    dpr: { value: 1 },
    ink: { value: 0.8 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tColor;
    uniform sampler2D tNormal;
    uniform vec2 texel;
    uniform float dpr;
    uniform float ink;
    varying vec2 vUv;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
    }

    void main() {
      vec4 c = texture2D(tColor, vUv);
      vec4 n0 = texture2D(tNormal, vUv);
      vec4 nl = texture2D(tNormal, vUv - vec2(texel.x, 0.0));
      vec4 nr = texture2D(tNormal, vUv + vec2(texel.x, 0.0));
      vec4 nu = texture2D(tNormal, vUv + vec2(0.0, texel.y));
      vec4 nd = texture2D(tNormal, vUv - vec2(0.0, texel.y));

      // Derinlik kenarı: 1/z düzlemlerde ekran uzayında doğrusaldır; ikinci türevi yalnızca kenarda büyür.
      float q0 = 1.0 / n0.a;
      float lap = abs(1.0 / nl.a + 1.0 / nr.a - 2.0 * q0) + abs(1.0 / nu.a + 1.0 / nd.a - 2.0 * q0);
      float depthEdge = smoothstep(0.012, 0.035, lap / q0);

      // Keskin kıvrımlar: komşu normaller arasındaki açı.
      vec3 a = n0.rgb * 2.0 - 1.0;
      float bend = 1.0 - min(min(dot(a, nl.rgb * 2.0 - 1.0), dot(a, nr.rgb * 2.0 - 1.0)), min(dot(a, nu.rgb * 2.0 - 1.0), dot(a, nd.rgb * 2.0 - 1.0)));
      float creaseEdge = smoothstep(0.35, 0.7, bend) * 0.7;

      float line = max(depthEdge, creaseEdge) * ink;
      line *= 1.0 - smoothstep(90.0, 320.0, n0.a) * 0.75; // uzakta çizgiler incelir
      vec3 col = mix(c.rgb, c.rgb * vec3(0.10, 0.06, 0.04), line);

      gl_FragColor = vec4(col, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>

      // Renk: hafif doygunluk ve sıcaklık.
      vec3 g = gl_FragColor.rgb;
      float luma = dot(g, vec3(0.299, 0.587, 0.114));
      g = mix(vec3(luma), g, 1.12);
      g *= vec3(1.03, 1.0, 0.94);

      // Kâğıt dokusu: ince gren ve iri lekeler.
      vec2 px = gl_FragCoord.xy / dpr;
      float grain = hash(floor(px * 1.3)) * 0.5 + vnoise(px * 0.35) * 0.5;
      float blot = vnoise(px * 0.012) * 0.6 + vnoise(px * 0.05) * 0.4;
      g *= 0.90 + 0.07 * grain + 0.06 * blot;

      // Kenar kararması.
      vec2 v = (vUv - 0.5) * vec2(1.0, 0.9);
      g *= 1.0 - 0.42 * smoothstep(0.38, 0.85, length(v));

      gl_FragColor = vec4(g, 1.0);
    }`,
});

export class InkPipeline {
  private color = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  private normal = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  private quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finalMaterial);
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private bg = new THREE.Color();

  constructor(private renderer: THREE.WebGLRenderer) {
    this.quad.frustumCulled = false;
  }

  setSize(w: number, h: number, dpr: number): void {
    const pw = Math.max(1, Math.floor(w * dpr));
    const ph = Math.max(1, Math.floor(h * dpr));
    this.color.setSize(pw, ph);
    this.normal.setSize(pw, ph);
    // Çizgi kalınlığı ekran yoğunluğundan bağımsız, yaklaşık 1,3 CSS pikseli.
    const lw = Math.max(1, dpr * 0.65);
    finalMaterial.uniforms.texel.value.set(lw / pw, lw / ph);
    finalMaterial.uniforms.dpr.value = dpr;
  }

  render(scene: THREE.Scene, camera: THREE.PerspectiveCamera): void {
    const r = this.renderer;

    camera.layers.enableAll();
    r.shadowMap.autoUpdate = true;
    r.setRenderTarget(this.color);
    r.render(scene, camera);

    // Normal + derinlik geçişi: efekt katmanı gizlenir, gölgeler yeniden hesaplanmaz.
    camera.layers.set(0);
    r.shadowMap.autoUpdate = false;
    scene.overrideMaterial = normalMaterial;
    r.getClearColor(this.bg);
    const alpha = r.getClearAlpha();
    r.setClearColor(new THREE.Color(0.5, 0.5, 1), 2000);
    r.setRenderTarget(this.normal);
    r.render(scene, camera);
    r.setClearColor(this.bg, alpha);
    scene.overrideMaterial = null;
    camera.layers.enableAll();

    finalMaterial.uniforms.tColor.value = this.color.texture;
    finalMaterial.uniforms.tNormal.value = this.normal.texture;
    r.setRenderTarget(null);
    r.render(this.quad, this.quadCam);
  }
}
