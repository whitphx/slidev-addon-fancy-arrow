export function splitPathDefinition(d: string): string[] {
  const segments = d.split(/(?:^M| M)(?=[-\d])/);
  return segments
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map((s) => "M" + s);
}

export function splitPath(path: SVGPathElement): SVGPathElement[] {
  // Split <path d="M ... M ..." /> into <path d="M ..." /> elements.
  const d = path.getAttribute("d");
  if (!d) {
    return [];
  }
  return splitPathDefinition(d).map((segment) => {
    const newPath = path.cloneNode() as SVGPathElement;
    newPath.setAttribute("d", segment);
    return newPath;
  });
}
