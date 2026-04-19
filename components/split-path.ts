export function splitPathDefinition(d: string): string[] {
  const segments = d.split(/(?=M(?![a-z]))/);
  return segments.map((s) => s.trim()).filter((s) => s !== "");
}

export function splitPath(path: SVGPathElement): SVGPathElement[] {
  // Split <path d="M ... M ..." /> into <path d="M ..." /> elements.
  const d = path.getAttribute("d");
  if (!d) {
    return [];
  }
  return splitPathDefinition(d).map((segment) => {
    const cloned = path.cloneNode();
    if (!(cloned instanceof SVGPathElement)) {
      throw new Error("Expected cloneNode() to return an SVGPathElement");
    }
    cloned.setAttribute("d", segment);
    return cloned;
  });
}
