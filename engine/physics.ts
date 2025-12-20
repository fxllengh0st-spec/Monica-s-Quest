
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

  for (const plat of platforms) {
    // Aumentar levemente a margem de colisão para evitar "tunnelling"
    const overlapX = Math.min(entity.pos.x + entity.size.x, plat.x + plat.w) - Math.max(entity.pos.x, plat.x);
    const overlapY = Math.min(entity.pos.y + entity.size.y, plat.y + plat.h) - Math.max(entity.pos.y, plat.y);

    if (overlapX > 0 && overlapY > 0) {
      if (overlapX < overlapY) {
        if (entity.pos.x + entity.size.x / 2 < plat.x + plat.w / 2) {
          entity.pos.x -= overlapX;
        } else {
          entity.pos.x += overlapX;
        }
        entity.vel.x = 0;
      } else {
        if (entity.pos.y + entity.size.y / 2 < plat.y + plat.h / 2) {
          // Top collision (landing)
          if (entity.vel.y >= 0) {
            entity.pos.y -= overlapY;
            entity.vel.y = 0;
            grounded = true;
          }
        } else {
          // Bottom collision (head hit)
          entity.pos.y += overlapY;
          entity.vel.y = 0;
        }
      }
    }
  }

  return grounded;
};
