import { System, World } from "../../ecs/index";
import {
  TransformC,
  Object3DC,
  GLTFModelC,
  ScrollAnimationC,
} from "../../ecs/components";
import { applyQuery } from "../../ecs/index";
import { getComponent } from "./utils";
import { AnimationMixer } from "three";
import { NeuronMatSystem } from "../NeuronMatSystem";
import { RenderSystem } from "./RenderSystem";

export interface ScrollAnimationSystem extends System {
  mixers: Map<string, AnimationMixer>;
  scrollTime: number;
  lastDelta: number;
  lastRealDelta: number;
  moving: boolean;
  world: World | null;
}

export const ScrollAnimationSystem: ScrollAnimationSystem = {
  type: "ScrollAnimationSystem",
  queries: [TransformC, Object3DC, ScrollAnimationC],
  mixers: new Map(),
  scrollTime: 0,
  lastDelta: 0,
  lastRealDelta: 0,
  moving: false,
  world: null,

  init: function (world) {
    this.world = world;

    this.entities = applyQuery(world.entities, this.queries);

    this.entities.forEach((ent) => {
      const { src } = getComponent(ent, GLTFModelC);
      const { object3d } = getComponent(ent, Object3DC);

      const animClips = world.assets.animations.get(src);
      const mixer = new AnimationMixer(object3d);

      this.mixers.set(src, mixer);

      const startTime = 0;
      this.scrollTime = startTime;

      animClips?.forEach((clip) => {
        mixer.clipAction(clip).play();
        mixer.update(startTime);
      });
    });

    let removedTutorial = false;
    //get current time by scroll amount
    document.addEventListener("wheel", (event) => {
      this.lastDelta = 0.5 * event.deltaY;

      if (!removedTutorial) {
        let tutorialEl = document.querySelector("cc-tutorial");
        tutorialEl?.remove();
        removedTutorial = true;
      }
    });
  },

  tick: function (_time, deltaTime) {
    //only hard set delta if autoscrolling in capture mode
    const renderSystem = this.world?.getSystem<RenderSystem>(RenderSystem.type);
    let updateAmt = deltaTime * this.lastDelta;
    if (renderSystem?.captureMode) {
      this.lastDelta = deltaTime;
      updateAmt = this.lastDelta;
    }
    const newScrollTime = this.scrollTime + updateAmt;
    const maxScroll = 35.04;

    if (newScrollTime > maxScroll) {
      updateAmt = Math.max(0, maxScroll - this.scrollTime);
    }

    if (Math.abs(updateAmt) > 0) {
      this.moving = true;
    } else {
      this.moving = false;
    }

    if (newScrollTime < 0.0) {
      updateAmt = -this.scrollTime;
    }
    this.lastRealDelta = updateAmt;
    this.scrollTime += updateAmt;
    this.mixers.forEach((m) => m.update(updateAmt));

    this.lastDelta = 0;
  },
};
