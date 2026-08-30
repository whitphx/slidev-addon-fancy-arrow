import type { LineRange } from "./parse-option";

/**
 * Shiki, which Slidev renders code blocks with, wraps every line of a code block
 * in a `<span class="line">`.
 */
export const CODE_LINE_SELECTOR = ".line";

/**
 * Picks the elements of the given lines out of a code block, in document order.
 *
 * Line numbers are 1-based and count the rendered lines, the same way Slidev's own
 * line-highlighting syntax does. Out-of-range lines are dropped rather than clamped,
 * so that a stale line number doesn't silently point at the wrong line.
 */
export function pickCodeLineElements(
  codeBlock: Element,
  lines: LineRange[],
): Element[] {
  const lineElements = Array.from(
    codeBlock.querySelectorAll(CODE_LINE_SELECTOR),
  );
  if (lineElements.length === 0) {
    console.warn(
      "No code lines found in the snap target. A line specifier such as {3} only works on a code block.",
    );
    return [];
  }

  const picked = new Set<Element>();
  for (const { start, end } of lines) {
    if (start > lineElements.length) {
      console.warn(
        `Line ${start} is out of range: the code block has ${lineElements.length} lines.`,
      );
      continue;
    }
    for (let line = start; line <= Math.min(end, lineElements.length); line++) {
      picked.add(lineElements[line - 1]);
    }
  }

  // Ranges may be given out of order, so sort back into document order.
  return lineElements.filter((element) => picked.has(element));
}
