export function splitPathDefinition(d: string): string[] {
  const segments = d.split(/(?:^M| M)(?=[0-9])/);
  return segments
    .map((s) => s.trim())
    .filter((s) => s !== "")
    .map((s) => "M" + s);
}

function setAttributeIfNotNull(
  element: SVGElement,
  name: string,
  value: string | null,
) {
  if (value !== null) {
    element.setAttribute(name, value);
  }
}

export function splitPath(path: SVGPathElement): SVGPathElement[] {
  // Split <path d="M ... M ..." /> into <path d="M ..." /> elements.
  const d = path.getAttribute("d");
  if (!d) {
    return [];
  }
  return splitPathDefinition(d).map((segment) => {
    const newPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    newPath.setAttribute("d", segment);
    setAttributeIfNotNull(newPath, "stroke", path.getAttribute("stroke"));
    setAttributeIfNotNull(
      newPath,
      "stroke-width",
      path.getAttribute("stroke-width"),
    );
    setAttributeIfNotNull(newPath, "fill", path.getAttribute("fill"));
    setAttributeIfNotNull(newPath, "fill-rule", path.getAttribute("fill-rule"));
    return newPath;
  });
}
