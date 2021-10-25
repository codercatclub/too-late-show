import { System } from "../ecs/index";
import { TransformC, Object3DC, EnvSphereC } from "../ecs/components";
import { applyQuery } from "../ecs/index";
import { getComponent } from "./core/utils";
import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  Shader,
  UniformsUtils,
} from "three";

interface EnvSphereSystem extends System {
  shaders: Shader[];
}

export const EnvSphereSystem: EnvSphereSystem = {
  type: "EnvSphereSystem",
  queries: [TransformC, Object3DC, EnvSphereC],
  entities: [],
  shaders: [],

  init: function (world) {
    this.entities = applyQuery(world.entities, this.queries);

    this.entities.forEach((ent) => {
      const { object3d } = getComponent(ent, Object3DC);

      const uniforms = {
        time: {
          value: 0,
        },
        env_c1: {
          value: new Color(0xC30909),
        },
        env_c2: {
          value: new Color(0x000000),
        },
      };

      object3d.traverse((obj) => {
        if (obj.type === "Mesh") {
          const mesh = obj as Mesh;

          (mesh.material as MeshPhysicalMaterial).onBeforeCompile = (
            shader
          ) => {
            shader.uniforms = UniformsUtils.merge([uniforms, shader.uniforms]);
            shader.vertexShader = require("../shaders/EnvVert.glsl");
            shader.fragmentShader = require("../shaders/EnvFrag.glsl");
            this.shaders.push(shader);
          };

          // const mat = (mesh.material as MeshPhysicalMaterial).clone();

          // mat.emissive = new Color(0xFF00FF);
          // mat.emissiveIntensity = 1.0;

          // mesh.material = mat;
        }
      });
    });
  },

  tick: function (time) {
    this.shaders.forEach((shader) => {
      shader.uniforms.time.value = time;
    });
  },
};
