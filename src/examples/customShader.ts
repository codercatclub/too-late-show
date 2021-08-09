import { World, newEntity, newComponent } from "../ecs/index";
import { TransformC, GeometryC, Object3DC, MaterialC } from "../ecs/components";
import { RenderSystem } from "../systems/core/RenderSystem";
import { StandardPrimitiveSystem } from "../systems/core/StandardPrimitiveSystem";
import { Object3DSystem } from "../systems/core/Object3DSystem";
import { MaterialSystem } from "../systems/MaterialSystem";
import { OrbitControlsSystem } from "../systems/core/OrbitControlsSystem";

/** Adds a cube. Nothing more to say :) */
export default async () => {
  const world = new World();

  // Make custom material component that use TestFrag and TestVert shaders.
  const MyMateriaC = newComponent(MaterialC, { shader: "Test"});

  const box = newEntity([TransformC, GeometryC, Object3DC, MyMateriaC]);

  world.addEntity(box);

  world
    .registerSystem(RenderSystem)
    .registerSystem(Object3DSystem)
    .registerSystem(StandardPrimitiveSystem)
    .registerSystem(OrbitControlsSystem)
    .registerSystem(MaterialSystem);

  return world;
};
