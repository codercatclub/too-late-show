import { System } from "../ecs/index";
import { TransformC, Object3DC, NeuronCoreC } from "../ecs/components";
import { applyQuery } from "../ecs/index";
import { getComponent } from "./core/utils";
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  VideoTexture,
} from "three";

interface NeuronCoreSystem extends System {}

export const NeuronCoreSystem: NeuronCoreSystem = {
  type: "NeuronCoreSystem",
  queries: [TransformC, Object3DC, NeuronCoreC],
  entities: [],

  init: function (world) {
    this.entities = applyQuery(world.entities, this.queries);

    this.entities.forEach((ent, i) => {
      const { object3d } = getComponent(ent, Object3DC);

      const cores: Object3D[] = [];

      object3d.traverse((obj) => {
        if (obj.name.startsWith("core")) {
          cores.push(obj);
        }
      });

      cores.forEach((core) => {
        var videoEl = document.createElement("video");

        videoEl.src = core.userData.videoSrc;
        // videoEl.muted = true;
        // videoEl.autoplay = true;
        videoEl.loop = true;

        const texture = new VideoTexture(videoEl);

        window.addEventListener("keypress", (e) => {
          if (e.code === "KeyP") {
            videoEl.play();
          }
        });

        texture.flipY = false;

        core.traverse((obj) => {
          if (obj.type === "Mesh") {
            const o = obj as Mesh;
            const mat = (o.material as MeshPhysicalMaterial).clone();
            
            mat.roughness = 0.3;
            mat.metalness = 1;
            mat.reflectivity = 1;
            mat.emissiveMap = texture;

            o.material = mat;
          }
        });
      });
    });
  },

  tick: function (time) {},
};
