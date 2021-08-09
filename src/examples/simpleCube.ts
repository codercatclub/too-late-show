import { World, newEntity } from "../ecs/index";
import { TransformC, GeometryC, Object3DC } from "../ecs/components";
import { RenderSystem } from "../systems/core/RenderSystem";
import { StandardPrimitiveSystem } from "../systems/core/StandardPrimitiveSystem";
import { Object3DSystem } from "../systems/core/Object3DSystem";
import { PointLightSystem } from "../systems/core/PointLightSystem";

/** Adds a cube. Nothing more to say :) */
export default async () => {
  const world = new World();

  const box = newEntity([TransformC, GeometryC, Object3DC]);
  
  world.addEntity(box);
  
  world
    .registerSystem(RenderSystem) // Render system should be always first
    .registerSystem(Object3DSystem)
    .registerSystem(StandardPrimitiveSystem)
    .registerSystem(PointLightSystem);
  
  return world;
};
