import { System } from "../ecs/index";
import { TransformC, Object3DC, NeuronMaterialC } from "../ecs/components";
import { applyQuery, Entity, World } from "../ecs/index";
import {
  Mesh,
  UniformsUtils,
  MeshPhongMaterial,
  Vector3,
  Shader,
  Color,
  VideoTexture,
  Object3D,
} from "three";
import { getComponent } from "./core/utils";
import { RenderSystem } from "./core/RenderSystem";

interface ClusterData {
  corePos: Vector3;
  shader: Shader | null;
  playT: number;
  videoEl: HTMLVideoElement | null;
  index: number;
  allowedToPlay: boolean;
}

interface NeuronMatSystem extends System {
  world: World | null;
  processEntity: (ent: Entity) => void;
  clusterData: ClusterData[];
  updateUniforms: (time: number, timeDelta: number) => void;
  lastCameraPosition: Vector3;
  lerpCameraMove: number;
  isPlayingVideo: boolean;
  spark: Object3D;
}

const colorList = [
  new Color("#590100"),
  new Color("#8f0200"),
  new Color("#121214"),
];

let clipDurations: number[] = [];

export const NeuronMatSystem: NeuronMatSystem = {
  type: "NeuronMatSystem",
  world: null,
  clusterData: [],
  lastCameraPosition: new Vector3(),
  queries: [TransformC, Object3DC, NeuronMaterialC],
  lerpCameraMove: 0,
  isPlayingVideo: false,
  spark: new Object3D(),

  init: function (world) {
    this.world = world;
    this.entities = applyQuery(world.entities, this.queries);
    this.entities.forEach(this.processEntity.bind(this));
  },

  processEntity: function (ent) {
    if (!this.world) return;
    const { shader, color } = getComponent(ent, NeuronMaterialC);
    const { object3d: parent } = getComponent(ent, Object3DC);

    const uniforms = {
      timeMSec: { type: "f", value: 0 },
      playT: { type: "f", value: 0 },
      cameraMove: { type: "f", value: 0 },
      fresnelColor: { type: "color", value: new Color("#56ff00") },
    };
    let materialOptions = {
      transparent: true,
    };

    parent?.traverse((obj) => {
      if (obj.name == "Spark") {
        this.spark = obj;
      }
      if (obj.type === "Mesh") {
        const o = obj as Mesh;

        let clusterData: ClusterData = {
          corePos: new Vector3(),
          shader: null,
          playT: -1,
          videoEl: null,
          index: 0,
          allowedToPlay: true,
        };

        if (o.parent) {
          clusterData.corePos = o.parent.position;
        }

        const material = new MeshPhongMaterial(materialOptions);

        let i = parseInt(o.name[o.name.length - 1]);

        if (!i) {
          i = 0;
        }

        clusterData.index = i;

        if (o.name.includes("main_core")) {
          const videoEl = document.createElement("video");

          videoEl.src = `assets/videos/${o.userData.videoSrc}`;

          videoEl.muted = true;
          videoEl.autoplay = true;
          videoEl.loop = true;

          const texture = new VideoTexture(videoEl);

          texture.flipY = false;

          material.map = texture;

          clusterData.videoEl = videoEl;
        }

        material.onBeforeCompile = (mshader) => {
          mshader.uniforms = UniformsUtils.merge([uniforms, mshader.uniforms]);
          mshader.vertexShader = require(`../shaders/${shader}Vert.glsl`);
          mshader.fragmentShader = require(`../shaders/${shader}Frag.glsl`);
          let colorIdx = clusterData.index % colorList.length;
          mshader.uniforms.fresnelColor.value = color
            ? color
            : colorList[colorIdx];
          clusterData.shader = mshader;
          this.clusterData.push(clusterData);
        };

        o.material = material;
      }
    });
  },

  onEntityAdd: function (ent) {
    const entities = applyQuery([ent], this.queries);
    entities.forEach(this.processEntity.bind(this));
  },

  updateUniforms: function (time, timeDelta) {
    let cameraPos = new Vector3();
    const renderSystem = this.world?.getSystem<RenderSystem>(RenderSystem.type);
    let cam = renderSystem?.camera?.parent;
    let cameraMove = 0;
    if (cam) {
      cameraPos = cam.position;
      cameraMove = cameraPos.distanceTo(this.lastCameraPosition);
      cameraMove = cameraMove < 3.0 ? 0.0 : 0.5 * cameraMove;
      this.lerpCameraMove = 0.7 * this.lerpCameraMove + 0.3 * cameraMove;
      if (this.lerpCameraMove < 0.005) {
        this.lerpCameraMove = 0;
      }
      this.lastCameraPosition.copy(cameraPos);
    }
    this.isPlayingVideo = false;
    this.clusterData.forEach((clusterData) => {
      if (clusterData.shader) {
        if (clusterData.videoEl) {
          clipDurations[clusterData.index] = clusterData.videoEl.duration;
        }

        let distFromCam = this.spark.position.distanceTo(clusterData.corePos);
        
        if (!clusterData.allowedToPlay && distFromCam > 1) {
          clusterData.allowedToPlay = true;
        }

        if (
          distFromCam < 0.5 &&
          clusterData.playT < 0 &&
          clusterData.allowedToPlay
        ) {
          // turn on
          clusterData.playT = 0;
          if (clusterData.videoEl) {
            clusterData.videoEl.pause();
            clusterData.videoEl.currentTime = 0;
            clusterData.videoEl.play();
            this.isPlayingVideo = true;
          }

          const event = new CustomEvent("play-activation-sound");
          window.dispatchEvent(event);
        }

        if (clusterData.playT >= 0) {
          clusterData.playT += timeDelta;
          this.isPlayingVideo = true;
        }

        const playTMax = clipDurations[clusterData.index]
          ? clipDurations[clusterData.index] - 1
          : 5;
  
        // final clamp and turn off
        if (clusterData.playT >= playTMax) {
          clusterData.playT = -1;
          clusterData.allowedToPlay = false;
        }

        // shader activation is first 0.1
        const playT =
          clusterData.playT > 0 ? Math.min(0.2 * clusterData.playT, 1) : 1;

        clusterData.shader.uniforms["playT"].value = playT;
        clusterData.shader.uniforms["timeMSec"].value = time;
        clusterData.shader.uniforms["cameraMove"].value = this.lerpCameraMove;
      }
    });
  },

  tick: function (time, timeDelta) {
    this.updateUniforms(time, timeDelta);
  },
};
