export function getClosestEdgePoint(
  rect: { x: number; y: number; width: number; height: number },
  anotherPoint: { x: number; y: number },
): { x: number; y: number } {
  const c1x = rect.x + rect.width / 2;
  const c1y = rect.y + rect.height / 2;
  if (rect.width === 0) {
    return {
      x: c1x,
      y: Math.max(rect.y, Math.min(rect.y + rect.height, anotherPoint.y)),
    };
  } else if (rect.height === 0) {
    return {
      x: Math.max(rect.x, Math.min(rect.x + rect.width, anotherPoint.x)),
      y: c1y,
    };
  }

  const dx = anotherPoint.x - c1x;
  const dy = anotherPoint.y - c1y;
  if (dx === 0 && dy === 0) {
    return { x: c1x, y: c1y };
  }

  if (Math.abs(dx / dy) > rect.width / rect.height) {
    const x = dx > 0 ? rect.x + rect.width : rect.x;
    // Relationship between the ratios of side lengths of similar figures in geometry.
    // y - c1y : dy = x - c1x : dx
    const y = c1y + ((x - c1x) * dy) / dx;
    return { x, y };
  } else {
    const y = dy > 0 ? rect.y + rect.height : rect.y;
    // Relationship between the ratios of side lengths of similar figures in geometry.
    // x - c1x : dx = y - c1y : dy
    const x = c1x + ((y - c1y) * dx) / dy;
    return { x, y };
  }
}
