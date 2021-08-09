import { extend, World, newComponent } from "./ecs/index";
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
import { CCMaterialC } from "./ecs/components";
import { MaterialSystem } from "./systems/MaterialSystem";
import { HemisphereLightSystem } from "./systems/core/HemisphereLightSystem";
import { OrbitControlsSystem } from "./systems/core/OrbitControlsSystem";
import { CCMaterialSystem } from "./systems/CCMaterialSystem";
import { AudioSystem } from "./systems/core/AudioSystem";
import { StandardPrimitiveSystem } from "./systems/core/StandardPrimitiveSystem";
import { StatsSystem } from "./systems/core/StatsSystem";

(async () => {
  const assetManager = new AssetManager();

  assetManager
    .addAsset("assets/models/prop_net.glb", "prop_net")
    .addAsset("assets/textures/env.jpg", "env_tex"); // Environmental texture for PBR material.

  // Wait until all assets are loaded
  await assetManager.load();

  const world = new World(assetManager.loadedAssets);

  const camera = Camera(new Vector3(0, 2, 4));

  const neurons = Asset({
    src: "assets/models/prop_net.glb",
    scale: new Vector3(10, 10, 10),
  });

  const hLight = HemisphereLight({ intensity: 1 });

  const cube = StandardPrimitive({});

  world
    .addEntity(camera)
    .addEntity(neurons)
    .addEntity(hLight)
    .addEntity(cube);

  world
    .registerSystem(
      RenderSystem.configure({
        enableShadows: false,
        // fog: { enabled: true, color: new Color(0xc2d1d1), density: 0.02 },
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
    .registerSystem(CCMaterialSystem);

  world.init();

  console.log(world);
})();
