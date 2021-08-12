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
} from "three";
import { getComponent } from "./core/utils";
import { RenderSystem } from "./core/RenderSystem";

interface ClusterData {
  corePos: Vector3;
  shader: Shader | null;
  playT: number;
}

interface NeuronMatSystem extends System {
  world: World | null;
  processEntity: (ent: Entity) => void;
  clusterData: ClusterData[];
  updateUniforms: (time: number, timeDelta: number) => void;
  lastCameraPosition: Vector3;
}

export const NeuronMatSystem: NeuronMatSystem = {
  type: "NeuronMatSystem",
  world: null,
  clusterData: [],
  lastCameraPosition: new Vector3(),
  queries: [TransformC, Object3DC, NeuronMaterialC],

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
    };
    let materialOptions = {};


    parent?.traverse((obj) => {

      if (obj.type === "Mesh") {
        const o = obj as Mesh;
        // if (!o.name.includes("core")) {

          let clusterData: ClusterData = {
            corePos: new Vector3(),
            shader: null,
            playT: -1,
          }

          if(o.parent)
          {
            clusterData.corePos = o.parent.position;
          }

          const material = new MeshPhongMaterial(materialOptions);

          material.onBeforeCompile = (mshader) => {
            mshader.uniforms = UniformsUtils.merge([uniforms, mshader.uniforms]);
            mshader.vertexShader = require(`../shaders/${shader}Vert.glsl`);
            mshader.fragmentShader = require(`../shaders/${shader}Frag.glsl`);
            clusterData.shader = mshader;
            this.clusterData.push(clusterData);
          };

          o.material = material;
        // }
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
      this.lastCameraPosition.copy(cameraPos);
    }
    this.clusterData.forEach((clusterData) => {
      if (clusterData.shader) {
        let distFromCam = cameraPos.distanceTo(clusterData.corePos);
        if (distFromCam < 10.0 && clusterData.playT < 0) {
          //turn on
          clusterData.playT = 0;
        }
        if (clusterData.playT >= 0) {
          clusterData.playT += timeDelta / 5;
        }
        //final clamp and turn off
        if (clusterData.playT >= 1) {
          clusterData.playT = -1;
        }

        //shader activation is first 0.1
        let playT = clusterData.playT > 0 ? Math.min(10.0 * clusterData.playT, 1) : 1;

        clusterData.shader.uniforms["playT"].value = playT;
        clusterData.shader.uniforms["timeMSec"].value = time;
        clusterData.shader.uniforms["cameraMove"].value = cameraMove;
      }
    });
  },

  tick: function (time, timeDelta) {
    this.updateUniforms(time, timeDelta);
  },
};
