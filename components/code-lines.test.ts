// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { pickCodeLineElements } from "./code-lines";

function codeBlock(lineCount: number): Element {
  const pre = document.createElement("pre");
  pre.className = "slidev-code";
  const code = document.createElement("code");
  for (let i = 1; i <= lineCount; i++) {
    const line = document.createElement("span");
    line.className = "line";
    line.textContent = `line ${i}`;
    code.appendChild(line);
    code.appendChild(document.createTextNode("\n"));
  }
  pre.appendChild(code);
  return pre;
}

function texts(elements: Element[]): (string | null)[] {
  return elements.map((element) => element.textContent);
}

describe("pickCodeLineElements", () => {
  it("picks a single line, counting from 1", () => {
    expect(
      texts(pickCodeLineElements(codeBlock(5), [{ start: 3, end: 3 }])),
    ).toEqual(["line 3"]);
  });

  it("picks every line of a range", () => {
    expect(
      texts(pickCodeLineElements(codeBlock(5), [{ start: 2, end: 4 }])),
    ).toEqual(["line 2", "line 3", "line 4"]);
  });

  it("returns the lines of several ranges in document order, without duplicates", () => {
    expect(
      texts(
        pickCodeLineElements(codeBlock(5), [
          { start: 4, end: 5 },
          { start: 1, end: 1 },
          { start: 4, end: 4 },
        ]),
      ),
    ).toEqual(["line 1", "line 4", "line 5"]);
  });

  it("drops lines beyond the end of the code block", () => {
    expect(
      texts(pickCodeLineElements(codeBlock(3), [{ start: 2, end: 9 }])),
    ).toEqual(["line 2", "line 3"]);
    expect(pickCodeLineElements(codeBlock(3), [{ start: 9, end: 9 }])).toEqual(
      [],
    );
  });

  it("returns nothing when the target holds no code lines", () => {
    expect(
      pickCodeLineElements(document.createElement("div"), [
        { start: 1, end: 1 },
      ]),
    ).toEqual([]);
  });
});
