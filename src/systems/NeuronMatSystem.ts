import { System } from "../ecs/index";
import { TransformC, Object3DC, NeuronMaterialC } from "../ecs/components";
import { applyQuery, Entity, World } from "../ecs/index";
import {
  SkinnedMesh,
  Mesh,
  UniformsUtils,
  MeshPhongMaterial,
  Vector3,
  Shader,
  Camera,
  PerspectiveCamera,
  Color,
  VideoTexture,
  SpriteMaterial
} from "three";
import { getComponent } from "./core/utils";
import { RenderSystem } from "./core/RenderSystem";

interface ClusterData {
  corePos: Vector3;
  shader: Shader | null;
  playT: number;
  videoEl: HTMLVideoElement | null;
}

interface NeuronMatSystem extends System {
  world: World | null;
  processEntity: (ent: Entity) => void;
  clusterData: ClusterData[];
  updateUniforms: (time: number, timeDelta: number) => void;
  lastCameraPosition: Vector3;
  lerpCameraMove: number,
}

const colorList = [
  new Color("#ff2009"),
  new Color("#56ff00"),
  new Color("#ff0b5d")
]

export const NeuronMatSystem: NeuronMatSystem = {
  type: "NeuronMatSystem",
  world: null,
  clusterData: [],
  lastCameraPosition: new Vector3(),
  queries: [TransformC, Object3DC, NeuronMaterialC],
  lerpCameraMove: 0,

  init: function (world) {
    this.world = world;
    this.entities = applyQuery(world.entities, this.queries);
    this.entities.forEach(this.processEntity.bind(this));
  },

  processEntity: function (ent) {
    if (!this.world) return;
    const { shader } = getComponent(ent, NeuronMaterialC);
    const { object3d: parent } = getComponent(ent, Object3DC);

    const uniforms = {
      timeMSec: { type: "f", value: 0 },
      playT: { type: "f", value: 0 },
      cameraMove: { type: "f", value: 0 },
      fresnelColor: { type: "color", value: new Color("#56ff00") },
    };
    let materialOptions = {
      transparent: true
    };


    parent?.traverse((obj) => {

      if (obj.type === "Mesh") {
        const o = obj as Mesh;


          let clusterData: ClusterData = {
            corePos: new Vector3(),
            shader: null,
            playT: -1,
            videoEl: null,
          }

          if(o.parent)
          {
            clusterData.corePos = o.parent.position;
          }

          const material = new MeshPhongMaterial(materialOptions);
          if (o.name.includes("core")) {
            var videoEl = document.createElement("video");
            // videoEl.src = o.userData.videoSrc;
            videoEl.src = "assets/videos/jasmin.mp4";
            //videoEl.loop = true;
    
            const texture = new VideoTexture(videoEl);
            material.map = texture;
            clusterData.videoEl = videoEl;
          }
          material.onBeforeCompile = (mshader) => {
            mshader.uniforms = UniformsUtils.merge([uniforms, mshader.uniforms]);
            mshader.vertexShader = require(`../shaders/${shader}Vert.glsl`);
            mshader.fragmentShader = require(`../shaders/${shader}Frag.glsl`);
            let i = parseInt(o.name[o.name.length - 1]) % colorList.length;
            if(!i) {
              i = 0;
            }
            mshader.uniforms.fresnelColor.value = colorList[i];
            clusterData.shader = mshader;
            this.clusterData.push(clusterData);
          };

          o.material = material;
      }
    });

    //onkeypress, fade in
    window.addEventListener("keydown", (event) => {
      if (event.key == "p") {
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
    if(cam) {
      cameraPos = cam.position;
      cameraMove = cameraPos.distanceTo(this.lastCameraPosition);
      //cameraMove = cameraMove < 1.0 ? 0.0 : cameraMove;
      this.lerpCameraMove = 0.3 * this.lerpCameraMove + 0.7 * cameraMove;
      if(this.lerpCameraMove < 0.005) {
        this.lerpCameraMove = 0;
      }
      this.lastCameraPosition.copy(cameraPos);
    }
    this.clusterData.forEach((clusterData) => {
      if (clusterData.shader) {
        let distFromCam = cameraPos.distanceTo(clusterData.corePos);
        if (distFromCam < 10.0 && clusterData.playT < 0) {
          //turn on
          clusterData.playT = 0;
          if(clusterData.videoEl) {
            clusterData.videoEl.pause();
            clusterData.videoEl.currentTime = 0;
            clusterData.videoEl.play();
          }
        }
        if (clusterData.playT >= 0) {
          clusterData.playT += timeDelta / 5;
        }
        //final clamp and turn off
        if (clusterData.playT >= 1) {
          clusterData.playT = -1;
        }

        //shader activation is first 0.1
        let playT = clusterData.playT > 0 ? Math.min(1.0 * clusterData.playT, 1) : 1;

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
