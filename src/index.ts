import { extend, World, newComponent, newEntity } from "./ecs/index";
import { RenderSystem } from "./systems/core/RenderSystem";
import { Object3DSystem } from "./systems/core/Object3DSystem";
import { AssetManager } from "./ecs/assetManager";
import {
  Asset,
  Camera,
  HemisphereLight,
  StandardPrimitive,
} from "./ecs/archetypes";
import { AssetSystem } from "./systems/core/AssetSystem";
import { PointLightSystem } from "./systems/core/PointLightSystem";
import { Vector3, Color } from "three";
import { CameraSystem } from "./systems/core/CameraSystem";
import {
  AnimationC,
  CCMaterialC,
  GLTFCameraC,
  NeuronCoreC,
} from "./ecs/components";
import { MaterialSystem } from "./systems/MaterialSystem";
import { HemisphereLightSystem } from "./systems/core/HemisphereLightSystem";
import { OrbitControlsSystem } from "./systems/core/OrbitControlsSystem";
import { CCMaterialSystem } from "./systems/CCMaterialSystem";
import { AudioSystem } from "./systems/core/AudioSystem";
import { StandardPrimitiveSystem } from "./systems/core/StandardPrimitiveSystem";
import { StatsSystem } from "./systems/core/StatsSystem";
import { NeuronCoreSystem } from "./systems/NeuronCoreSystem";
import { GLTFCameraSystem } from "./systems/core/GLTFCameraSystem";
import { AnimationSystem } from "./systems/core/AnimationSystem";

interface Neuron {
  src: string;
  video: string;
}

const Neuron = ({ src, video }: Neuron) => [
  extend(
    Asset({
      src,
      part: "/Scene/Core",
      scale: new Vector3(10, 10, 10),
    }),
    [newComponent(NeuronCoreC, { video })]
  ),
  Asset({
    src,
    part: "/Scene/Branches",
    scale: new Vector3(10, 10, 10),
  }),
];

(async () => {
  const assetManager = new AssetManager();

  assetManager
    .addAsset("assets/models/prop_net.glb", "prop_net")
    .addAsset("assets/models/neuron.glb", "neuron")
    .addAsset("assets/models/neuron2.glb", "neuron")
    .addAsset("assets/models/clusters.glb", "clusters")
    .addAsset("assets/models/cameras.glb", "cameras")
    .addAsset("assets/textures/env.jpg", "env_tex"); // Environmental texture for PBR material.

  // Wait until all assets are loaded
  await assetManager.load();

  const world = new World(assetManager.loadedAssets);

  const cameras = extend(
    Asset({
      src: "assets/models/cameras.glb",
    }),
    [GLTFCameraC, newComponent(AnimationC, { clipName: "CameraAction.001" })]
  );

  const clusters = Asset({
    src: "assets/models/clusters.glb",
    debug: true,
  });

  const hLight = HemisphereLight({ intensity: 1 });

  const cube = StandardPrimitive({});

  world
    .addEntity(cameras)
    .addEntity(clusters)
    // .addEntity(neurons)
    // .addEntity(neuron2)
    .addEntity(hLight)
    .addEntity(cube);
  // .addEntities(neuron);

  world
    .registerSystem(
      RenderSystem.configure({
        enableShadows: false,
        fog: { enabled: true, color: new Color(0xc2d1d1), density: 0.02 },
      })
    )
    .registerSystem(Object3DSystem)
    .registerSystem(AssetSystem)
    .registerSystem(CameraSystem)
    .registerSystem(StandardPrimitiveSystem)
    .registerSystem(AudioSystem)
    .registerSystem(OrbitControlsSystem)
    .registerSystem(StatsSystem)
    .registerSystem(HemisphereLightSystem)
    .registerSystem(PointLightSystem)
    .registerSystem(MaterialSystem)
    .registerSystem(CCMaterialSystem)
    .registerSystem(NeuronCoreSystem)
    .registerSystem(GLTFCameraSystem)
    .registerSystem(AnimationSystem);

  world.init();
})();
