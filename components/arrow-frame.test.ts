import { describe, it, expect } from "vitest";
import {
  measureArrowFrame,
  screenToSvgPoint,
  screenToSvgSize,
  slideToSvgPoint,
  type Rect,
} from "./arrow-frame";

const SLIDE_SIZE = { width: 980, height: 552 };

/** The slide as it is displayed, and the SVG of an arrow placed directly on it. */
function slideRect(scale: number, left = 0, top = 0): Rect {
  return {
    left,
    top,
    width: SLIDE_SIZE.width * scale,
    height: SLIDE_SIZE.height * scale,
  };
}
function svgRect(scale: number, left = 0, top = 0): Rect {
  return { left, top, width: scale, height: scale };
}

describe("measureArrowFrame", () => {
  it("takes the scale from the size of the 1px SVG", () => {
    const frame = measureArrowFrame(
      svgRect(0.5),
      slideRect(0.5),
      SLIDE_SIZE,
      1,
    );
    expect(frame.scale).toEqual({ x: 0.5, y: 0.5 });
  });

  it("falls back to the given scale when the SVG has no size to measure", () => {
    const frame = measureArrowFrame(
      { left: 0, top: 0, width: 0, height: 0 },
      undefined,
      SLIDE_SIZE,
      0.5,
    );
    expect(frame.scale).toEqual({ x: 0.5, y: 0.5 });
  });

  it("maps slide coordinates one to one when the arrow sits at the slide's origin", () => {
    const frame = measureArrowFrame(
      svgRect(0.5),
      slideRect(0.5),
      SLIDE_SIZE,
      0.5,
    );
    expect(frame.slideOrigin).toEqual({ x: 0, y: 0 });
    expect(frame.slideUnit).toEqual({ x: 1, y: 1 });
    expect(slideToSvgPoint(frame, { x: 100, y: 200 })).toEqual({
      x: 100,
      y: 200,
    });
  });

  it("keeps slide coordinates on the slide when a positioned ancestor moved the SVG", () => {
    // The SVG is anchored to an ancestor 60px right and 40px down from the slide's
    // top-left corner, on a slide displayed at half its authored size.
    const frame = measureArrowFrame(
      svgRect(0.5, 30, 20),
      slideRect(0.5),
      SLIDE_SIZE,
      0.5,
    );
    expect(frame.slideOrigin).toEqual({ x: -60, y: -40 });
    expect(frame.slideUnit).toEqual({ x: 1, y: 1 });
    expect(slideToSvgPoint(frame, { x: 100, y: 200 })).toEqual({
      x: 40,
      y: 160,
    });
  });

  it("keeps slide coordinates on the slide when an ancestor scales the SVG", () => {
    // The arrow is inside something displayed at twice the scale of the slide itself,
    // so one slide unit is half an SVG user unit.
    const frame = measureArrowFrame(
      svgRect(1),
      slideRect(0.5),
      SLIDE_SIZE,
      0.5,
    );
    expect(frame.slideUnit).toEqual({ x: 0.5, y: 0.5 });
    expect(slideToSvgPoint(frame, { x: 100, y: 200 })).toEqual({
      x: 50,
      y: 100,
    });
  });

  it("leaves coordinates as they are when there is no slide to anchor to", () => {
    const frame = measureArrowFrame(
      svgRect(1, 30, 20),
      undefined,
      SLIDE_SIZE,
      1,
    );
    expect(frame.slideOrigin).toEqual({ x: 0, y: 0 });
    expect(frame.slideUnit).toEqual({ x: 1, y: 1 });
    expect(slideToSvgPoint(frame, { x: 100, y: 200 })).toEqual({
      x: 100,
      y: 200,
    });
  });

  it("ignores a slide that isn't being rendered", () => {
    const frame = measureArrowFrame(
      svgRect(1),
      { left: 0, top: 0, width: 0, height: 0 },
      SLIDE_SIZE,
      1,
    );
    expect(frame.slideUnit).toEqual({ x: 1, y: 1 });
  });
});

describe("screenToSvgPoint", () => {
  it("measures from the SVG's own origin", () => {
    const frame = measureArrowFrame(
      svgRect(0.5, 30, 20),
      slideRect(0.5),
      SLIDE_SIZE,
      0.5,
    );
    expect(screenToSvgPoint(frame, { x: 130, y: 70 })).toEqual({
      x: 200,
      y: 100,
    });
    expect(screenToSvgSize(frame, { x: 50, y: 25 })).toEqual({
      x: 100,
      y: 50,
    });
  });

  it("puts a snapped point on the same screen pixel whatever moved the SVG", () => {
    const target = { x: 130, y: 70 };
    const toScreen = (svg: Rect) => {
      const frame = measureArrowFrame(svg, slideRect(0.5), SLIDE_SIZE, 0.5);
      const point = screenToSvgPoint(frame, target);
      return {
        x: svg.left + point.x * frame.scale.x,
        y: svg.top + point.y * frame.scale.y,
      };
    };
    expect(toScreen(svgRect(0.5))).toEqual(target);
    expect(toScreen(svgRect(0.5, 30, 20))).toEqual(target);
  });
});
