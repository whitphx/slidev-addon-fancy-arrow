export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const NUMBER_PATTERN = /-?\d*\.?\d+(?:[eE][-+]?\d+)?/g;

/**
 * Bounding box of the control points of the given path definitions.
 *
 * Rough.js emits only `M`, `L`, and `C` commands with absolute coordinate pairs
 * (https://github.com/rough-stuff/rough/blob/v4.6.6/src/generator.ts#L227-L241),
 * and a bezier curve never leaves the convex hull of its control points, so the
 * box is guaranteed to contain the rendered path.
 */
export function getPathControlPointBounds(
  pathDefinitions: string[],
): Bounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const d of pathDefinitions) {
    const numbers = d.match(NUMBER_PATTERN);
    if (numbers == null) {
      continue;
    }
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      const x = Number(numbers[i]);
      const y = Number(numbers[i + 1]);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX > maxX) {
    return null;
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
