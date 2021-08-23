import { extend, World, newComponent } from "./ecs/index";
import { RenderSystem } from "./systems/core/RenderSystem";
import { Object3DSystem } from "./systems/core/Object3DSystem";
import { AssetManager } from "./ecs/assetManager";
import { Asset, HemisphereLight, StandardPrimitive } from "./ecs/archetypes";
import { AssetSystem } from "./systems/core/AssetSystem";
import { PointLightSystem } from "./systems/core/PointLightSystem";
import { Vector3, Color } from "three";
import { CameraSystem } from "./systems/core/CameraSystem";
import { ScrollAnimationC, GLTFCameraC, NeuronCoreC, NeuronMaterialC, MuscleMaterialC, EnvSphereC, AnimationC } from "./ecs/components";
import { MaterialSystem } from "./systems/MaterialSystem";
import { HemisphereLightSystem } from "./systems/core/HemisphereLightSystem";
import { OrbitControlsSystem } from "./systems/core/OrbitControlsSystem";
import { CCMaterialSystem } from "./systems/CCMaterialSystem";
import { NeuronMatSystem } from "./systems/NeuronMatSystem";
import { MuscleMatSystem } from "./systems/MuscleMatSystem";
import { AudioSystem } from "./systems/core/AudioSystem";
import { StandardPrimitiveSystem } from "./systems/core/StandardPrimitiveSystem";
import { StatsSystem } from "./systems/core/StatsSystem";
import { NeuronCoreSystem } from "./systems/NeuronCoreSystem";
import { GLTFCameraSystem } from "./systems/core/GLTFCameraSystem";
import { AnimationSystem } from "./systems/core/AnimationSystem";
import { ScrollAnimationSystem } from "./systems/core/ScrollAnimationSystem";
import { EnvSphereSystem } from "./systems/EnvSphereSystem";

(async () => {
  const assetManager = new AssetManager();

  assetManager
    .addAsset("assets/models/clusters.glb", "clusters")
    .addAsset("assets/models/cameras.glb", "cameras")
    .addAsset("assets/models/muscles.glb", "muscles")
    .addAsset("assets/models/env_neurons.glb", "env_neurons")
    .addAsset("assets/models/env.glb", "env")
    .addAsset("assets/models/track.glb", "track")
    .addAsset("assets/textures/env.jpg", "env_tex"); // Environmental texture for PBR material.

  // Wait until all assets are loaded
  await assetManager.load();

  const world = new World(assetManager.loadedAssets);

  const cameras = extend(
    Asset({
      src: "assets/models/cameras.glb",
    }),
    [GLTFCameraC, newComponent(ScrollAnimationC)]
  );

  const track = extend(
    Asset({
      src: "assets/models/track.glb",
    }),
    [AnimationC]
  );

  const clusters = extend(
    Asset({
      src: "assets/models/clusters.glb",
    }),
    [newComponent(NeuronMaterialC), newComponent(MuscleMaterialC)]
  );

  const muscles = extend(
    Asset({
      src: "assets/models/muscles.glb",
    }),
    [newComponent(MuscleMaterialC)]
  );

  const env = extend(
    Asset({
      src: "assets/models/env.glb",
    }),
    [newComponent(EnvSphereC)]
  );

  const env_neurons = extend(
    Asset({
      src: "assets/models/env_neurons.glb",
    }),
    [newComponent(MuscleMaterialC)]
  );

  world
    .addEntity(cameras)
    .addEntity(clusters)
    .addEntity(muscles)
    .addEntity(env)
    .addEntity(track)
    // .addEntity(env_neurons)

  world
    .registerSystem(
      RenderSystem.configure({
        enableShadows: false,
        fog: { enabled: true, color: new Color("#000619"), density: 0.01 },
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
    .registerSystem(NeuronMatSystem)
    .registerSystem(MuscleMatSystem)
    .registerSystem(GLTFCameraSystem)
    .registerSystem(AnimationSystem)
    .registerSystem(ScrollAnimationSystem)
    .registerSystem(EnvSphereSystem)

  world.init();
})();
