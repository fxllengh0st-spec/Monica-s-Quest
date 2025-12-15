
import { Entity, Platform, Vector2D } from '../types';

export const checkAABB = (a: { pos: Vector2D; size: Vector2D }, b: { pos: Vector2D; size: Vector2D }) => {
  return (
    a.pos.x < b.pos.x + b.size.x &&
    a.pos.x + a.size.x > b.pos.x &&
    a.pos.y < b.pos.y + b.size.y &&
    a.pos.y + a.size.y > b.pos.y
  );
};

export const resolveCollisions = (entity: Entity, platforms: Platform[]) => {
  let grounded = false;

  // X axis movement is already applied or about to be
  // We check for collisions to stop the entity from moving through walls
  
  // Y axis collision
  for (const plat of platforms) {
    if (
      entity.pos.x < plat.x + plat.w &&
      entity.pos.x + entity.size.x > plat.x &&
      entity.pos.y + entity.size.y > plat.y &&
      entity.pos.y < plat.y + plat.h
    ) {
      // Collision detected
      if (entity.vel.y > 0) {
        // Falling down
        entity.pos.y = plat.y - entity.size.y;
        entity.vel.y = 0;
        grounded = true;
      } else if (entity.vel.y < 0) {
        // Jumping up
        entity.pos.y = plat.y + plat.h;
        entity.vel.y = 0;
      }
    }
  }

  return grounded;
};
