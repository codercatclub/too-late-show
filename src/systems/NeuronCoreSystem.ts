import { System } from "../ecs/index";
import { TransformC, MovingC, Object3DC, NeuronCoreC } from "../ecs/components";
import { applyQuery } from "../ecs/index";
import { getComponent } from "./core/utils";
import { Mesh, MeshBasicMaterial, VideoTexture } from "three";

interface NeuronCoreSystem extends System {}

export const NeuronCoreSystem: NeuronCoreSystem = {
  type: "NeuronCoreSystem",
  queries: [TransformC, Object3DC, NeuronCoreC],
  entities: [],

  init: function (world) {
    this.entities = applyQuery(world.entities, this.queries);

    this.entities.forEach((ent, i) => {
      const { video: videoSrc } = getComponent(ent, NeuronCoreC);
      const { object3d } = getComponent(ent, Object3DC);

      var videoEl = document.createElement("video");

      videoEl.src = videoSrc;
      videoEl.muted = true;
      videoEl.autoplay = true;
      videoEl.loop = true;

      const mat = new MeshBasicMaterial();
      const texture = new VideoTexture( videoEl )

      mat.map = texture;

      object3d.traverse(obj => {
        if (obj.type === "Mesh") {
          const o = obj as Mesh;
          o.material = mat;
        }
      })
    });
  },

  tick: function (time) {},
};
