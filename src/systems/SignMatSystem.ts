import { System } from "../ecs/index";
import { TransformC, Object3DC, SignMaterialC } from "../ecs/components";
import { applyQuery, Entity, World } from "../ecs/index";
import {
  Mesh,
  UniformsUtils,
  Color,
  MeshLambertMaterial,
  Vector3,
  Shader
} from "three";
import { getComponent } from "./core/utils";
import { NeuronMatSystem } from "./NeuronMatSystem";

interface SignMatSystem extends System {
  world: World | null;
  processEntity: (ent: Entity) => void;
  updateUniforms: (time: number, timeDelta: number) => void;
  materials: Shader[],
  signPos: Vector3;
  turningOn: boolean;
}

export const SignMatSystem: SignMatSystem = {
  type: "SignMatSystem",
  world: null,
  materials: [],
  signPos: new Vector3(),
  turningOn: false,
  queries: [TransformC, Object3DC, SignMaterialC],

  init: function (world) {
    this.world = world;
    this.entities = applyQuery(world.entities, this.queries);
    this.entities.forEach(this.processEntity.bind(this));
  },

  processEntity: function (ent) {
    if (!this.world) return;
    const { object3d: parent } = getComponent(ent, Object3DC);
    const { color } = getComponent(ent, SignMaterialC);
    const uniforms = {
      timeMSec: { type: "f", value: 0 },
      turnOnT: { type: "f", value: 0 },
      fresnelScale: { type: "f", value: 1 },
      fresnelColor: { type: "color", value: color },
    };

    parent?.traverse((obj) => {
      if (obj.type === "Mesh") {
        const o = obj as Mesh;
        let materialOptions = {
        };
        const material = new MeshLambertMaterial(materialOptions);
        material.onBeforeCompile = (mshader) => {
          mshader.uniforms = UniformsUtils.merge([uniforms, mshader.uniforms]);
          mshader.vertexShader = require(`../shaders/SignVert.glsl`);
          mshader.fragmentShader = require(`../shaders/SignFrag.glsl`);
          this.materials.push(mshader);
        };
        o.material = material;
        this.signPos = o.position;
      }
    });
  },

  onEntityAdd: function (ent) {
    const entities = applyQuery([ent], this.queries);
    entities.forEach(this.processEntity.bind(this));
  },

  updateUniforms: function (time, timeDelta) {
    const neuronMatSystem = this.world?.getSystem<typeof NeuronMatSystem>(NeuronMatSystem.type);
    if(!neuronMatSystem) return;
    let distFromSign = neuronMatSystem.spark.position.distanceTo(this.signPos);
    console.log(distFromSign)
    this.turningOn = (distFromSign < 12.5);
    this.materials.forEach(shader => {
      let dir = this.turningOn ? 1 : -1;
      let nextVal = shader.uniforms["turnOnT"].value + 4.0 * dir * timeDelta;
      shader.uniforms["turnOnT"].value = Math.min(Math.max(nextVal, 0),1)
    })

  },

  tick: function (time, timeDelta) {
    this.updateUniforms(time, timeDelta);
  },
};
