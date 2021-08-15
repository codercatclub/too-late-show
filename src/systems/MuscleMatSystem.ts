import { System } from "../ecs/index";
import { TransformC, Object3DC, MuscleMaterialC } from "../ecs/components";
import { applyQuery, Entity, World } from "../ecs/index";
import {
  Mesh,
  UniformsUtils,
  Vector3,
  Shader,
  Color,
  MeshPhysicalMaterial
} from "three";
import { getComponent } from "./core/utils";
import { RenderSystem } from "./core/RenderSystem";

interface ClusterData {
  corePos: Vector3;
  shader: Shader | null;
}

interface MuscleMatSystem extends System {
  world: World | null;
  processEntity: (ent: Entity) => void;
  clusterData: ClusterData[];
  updateUniforms: (time: number, timeDelta: number) => void;
  lastCameraPosition: Vector3;
  lerpCameraMove: number;
}

const colorList = [
  new Color("#ff2009"),
]

export const MuscleMatSystem: MuscleMatSystem = {
  type: "MuscleMatSystem",
  world: null,
  clusterData: [],
  lastCameraPosition: new Vector3(),
  lerpCameraMove: 0,
  queries: [TransformC, Object3DC, MuscleMaterialC],

  init: function (world) {
    this.world = world;
    this.entities = applyQuery(world.entities, this.queries);
    this.entities.forEach(this.processEntity.bind(this));
  },

  processEntity: function (ent) {
    if (!this.world) return;
    const { shader } = getComponent(ent, MuscleMaterialC);
    const { object3d: parent } = getComponent(ent, Object3DC);

    const uniforms = {
      timeMSec: { type: "f", value: 0 },
      cameraMove: { type: "f", value: 0 },
      fresnelColor: { type: "color", value: new Color("#56ff00") },
    };

    let materialOptions = {
    };


    parent?.traverse((obj) => {

      if (obj.type === "Mesh") {
        const o = obj as Mesh;
        console.log(o)
        let clusterData: ClusterData = {
          corePos: new Vector3(),
          shader: null,
        }

        if (o.parent) {
          clusterData.corePos = o.parent.position;
        }

        const material = new MeshPhysicalMaterial(materialOptions);

        material.onBeforeCompile = (mshader) => {
          mshader.uniforms = UniformsUtils.merge([uniforms, mshader.uniforms]);
          mshader.vertexShader = require(`../shaders/${shader}Vert.glsl`);
          mshader.fragmentShader = require(`../shaders/${shader}Frag.glsl`);
          let i = parseInt(o.name[o.name.length - 1]) % colorList.length;
          if (!i) {
            i = 0;
          }
          mshader.uniforms.fresnelColor.value = colorList[i];
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
      this.lerpCameraMove = 0.7 * this.lerpCameraMove + 0.3 * cameraMove;
      if(this.lerpCameraMove < 0.005) {
        this.lerpCameraMove = 0;
      }
      this.lastCameraPosition.copy(cameraPos);
    }
    this.clusterData.forEach((clusterData) => {
      if (clusterData.shader) {
        clusterData.shader.uniforms["timeMSec"].value = time;
        clusterData.shader.uniforms["cameraMove"].value = this.lerpCameraMove;
      }
    });
  },

  tick: function (time, timeDelta) {
    this.updateUniforms(time, timeDelta);
  },
};
