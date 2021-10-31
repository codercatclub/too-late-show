import { System } from "../ecs/index";
import { TransformC, Object3DC, EnvSphereC } from "../ecs/components";
import { applyQuery, World } from "../ecs/index";
import { getComponent } from "./core/utils";
import {
  Color,
  Mesh,
  MeshPhysicalMaterial,
  Shader,
  UniformsUtils,
} from "three";
import { RenderSystem } from "./core/RenderSystem";

interface EnvSphereSystem extends System {
  world: World | null;
  shaders: Shader[];
}

export const EnvSphereSystem: EnvSphereSystem = {
  type: "EnvSphereSystem",
  world: null,
  queries: [TransformC, Object3DC, EnvSphereC],
  entities: [],
  shaders: [],

  init: function (world) {
    this.entities = applyQuery(world.entities, this.queries);
    this.world = world;
    this.entities.forEach((ent) => {
      const { object3d } = getComponent(ent, Object3DC);

      const uniforms = {
        timeMSec: {
          value: 0,
        },
        env_c1: {
          value: new Color(0xC30909),
        },
        env_c2: {
          value: new Color(0x00091a),
        },
        exposureAmt: { type: "f", value: 1 },
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
    const renderSystem = this.world?.getSystem<typeof RenderSystem>(
      RenderSystem.type
    );
    this.shaders.forEach((shader) => {
      shader.uniforms.timeMSec.value = time;
      shader.uniforms.exposureAmt.value = renderSystem?.exposureAmt;
    });
  },
};
