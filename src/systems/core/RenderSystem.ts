import * as THREE from "three";
import { Color, PerspectiveCamera } from "three";
import { System } from "../../ecs/index";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// @ts-expect-error
import {BloomPass}  from '../../shaders/BloomPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader";

interface RenderSystemConfig {
  enableShadows: boolean;
  bloom: { enabled: boolean; intensity: number};
  fog: { enabled: boolean; color: Color; density: number };
}

export interface RenderSystem extends System, RenderSystemConfig {
  camera: THREE.PerspectiveCamera | null;
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  clock: THREE.Clock | null;
  systems: System[];
  animation(time: number): void;
  onFrameStart(time: number, delta: number): void;
  onFrameEnd(time: number, delta: number): void;
  tick(time: number, delta: number): void;
  onWindowResize(): void;
  configure(props: Partial<RenderSystemConfig>): RenderSystem;
  setCamera(cam: PerspectiveCamera): void;
  composer: EffectComposer | null;
}

export const RenderSystem: RenderSystem = {
  type: "RenderSystem",
  camera: null,
  scene: null,
  renderer: null,
  systems: [],
  clock: null,
  queries: [],
  enableShadows: false,
  bloom: { enabled: false, intensity: 2},
  composer: null,
  fog: { enabled: false, color: new Color(1, 1, 1), density: 0.1 },

  configure: function ({ enableShadows, bloom, fog }) {
    if (enableShadows) this.enableShadows = enableShadows;
    if (bloom) this.bloom = bloom;
    if (fog) this.fog = fog;

    return this;
  },

  setCamera: function (cam) {
    // TODO (Kirill): Overriding render system default camera is not idel.
    // perhaps render system should search for existing camera...
    this.camera = cam;
  },

  init: function (world) {
    this.animation = this.animation.bind(this);
    this.clock = new THREE.Clock();

    this.systems = world.systems.filter((s) => s.type !== "RenderSystem");

    this.scene = world.scene;

    if (this.fog.enabled && this.scene) {
      this.scene.fog = new THREE.FogExp2(
        this.fog.color.getHex(),
        this.fog.density
      );
    }

    // TODO
    // Set default camera.
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      1000
    );

    this.camera.position.set(0, 0, 1);

    this.renderer = new THREE.WebGLRenderer({ antialias: !this.bloom.enabled });

    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setAnimationLoop(this.animation);

    this.renderer.domElement.id = "world";
    this.renderer.autoClear = !this.bloom.enabled;

    if (this.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    document.body.appendChild(this.renderer.domElement);

    // TODO (Kirill): Remove resize event listener on world.destroy
    window.addEventListener("resize", this.onWindowResize.bind(this), false);
  },

  animation: function () {
    if (!this.clock || !this.scene || !this.camera || !this.renderer) return;

    //set post processing after everything has been loaded
    if (this.bloom.enabled && this.composer == null) {
      this.composer = new EffectComposer(this.renderer);
      var bloomPass = new BloomPass( this.bloom.intensity, 25, 5);
      const renderScene = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderScene);
      this.composer.addPass(bloomPass);
      var effectCopy = new ShaderPass(CopyShader);
      this.composer.addPass(effectCopy);
      effectCopy.renderToScreen = true;
    }

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.elapsedTime;

    this.onFrameStart(elapsedTime, delta);

    this.tick(elapsedTime, delta);

    if (this.bloom.enabled) {
      this.composer?.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.onFrameEnd(elapsedTime, delta);
  },

  onWindowResize: function () {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  },

  onFrameStart: function (time, delta) {
    this.systems.forEach((s) =>
      s.onFrameStart ? s.onFrameStart(time, delta) : null
    );
  },

  onFrameEnd: function (time, delta) {
    this.systems.forEach((s) =>
      s.onFrameEnd ? s.onFrameEnd(time, delta) : null
    );
  },

  tick: function (time, delta) {
    this.systems.forEach((s) => (s.tick ? s.tick(time, delta) : null));
  },
};