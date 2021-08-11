import { System } from "../ecs/index";
import { TransformC, Object3DC, NeuronMaterialC } from "../ecs/components";
import { applyQuery, Entity, World } from "../ecs/index";
import {
  SkinnedMesh,
  Mesh,
  UniformsUtils,
  MeshPhongMaterial,
} from "three";
import { getComponent } from "./core/utils";

interface NeuronMatSystem extends System {
  world: World | null;
  processEntity: (ent: Entity) => void;
  materials: THREE.Shader[];
  updateUniforms: (time: number, timeDelta: number) => void;
}

export const NeuronMatSystem: NeuronMatSystem = {
  type: "NeuronMatSystem",
  world: null,
  materials: [],
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
    };
    let materialOptions = {};

    const material = new MeshPhongMaterial(materialOptions);

    material.onBeforeCompile = (mshader) => {
      mshader.uniforms = UniformsUtils.merge([uniforms, mshader.uniforms]);
      mshader.vertexShader = require(`../shaders/${shader}Vert.glsl`);
      mshader.fragmentShader = require(`../shaders/${shader}Frag.glsl`);
      this.materials.push(mshader);
    };

    parent?.traverse((obj) => {
      if (obj.type === "Mesh") {
        const o = obj as Mesh;
        console.log(o)
        o.material = material;
      }
      if (obj.type === "SkinnedMesh") {
        const o = obj as SkinnedMesh;
        o.material = material;
        material.skinning = true;
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

  updateUniforms: function (time) {
    this.materials.forEach((mat) => {
      mat.uniforms["timeMSec"].value = time;
    });
  },

  tick: function (time, timeDelta) {
    this.updateUniforms(time, timeDelta);
  },
};
