import { describe, it, expect } from "vitest";
import { getClosestEdgePoint } from "./closest-edge-point";

describe("getClosestEdgePoint", () => {
  describe("rect has surface", () => {
    const rect = { x: 100, y: 100, width: 100, height: 100 };
    describe("when the point is outside the rectangle", () => {
      [
        {
          point: { x: 0, y: 0 },
          expected: { x: 100, y: 100 },
        },
        {
          point: { x: 150, y: 0 },
          expected: { x: 150, y: 100 },
        },
        {
          point: { x: 300, y: 0 },
          expected: { x: 200, y: 100 },
        },
        {
          point: { x: 300, y: 150 },
          expected: { x: 200, y: 150 },
        },
        {
          point: { x: 300, y: 300 },
          expected: { x: 200, y: 200 },
        },
        {
          point: { x: 150, y: 300 },
          expected: { x: 150, y: 200 },
        },
        {
          point: { x: 0, y: 300 },
          expected: { x: 100, y: 200 },
        },
        {
          point: { x: 0, y: 150 },
          expected: { x: 100, y: 150 },
        },
      ].forEach(({ point, expected }) => {
        it(`should return the point on the rectangle edge closest to the given point (${JSON.stringify(rect)}, ${JSON.stringify(point)})`, () => {
          expect(getClosestEdgePoint(rect, point)).toEqual(expected);
        });
      });
    });

    describe("when the point is on the rectangle edge", () => {
      [
        {
          point: { x: 100, y: 100 },
          expected: { x: 100, y: 100 },
        },
        {
          point: { x: 150, y: 100 },
          expected: { x: 150, y: 100 },
        },
        {
          point: { x: 200, y: 100 },
          expected: { x: 200, y: 100 },
        },
        {
          point: { x: 200, y: 150 },
          expected: { x: 200, y: 150 },
        },
        {
          point: { x: 200, y: 200 },
          expected: { x: 200, y: 200 },
        },
        {
          point: { x: 150, y: 200 },
          expected: { x: 150, y: 200 },
        },
        {
          point: { x: 100, y: 200 },
          expected: { x: 100, y: 200 },
        },
        {
          point: { x: 100, y: 150 },
          expected: { x: 100, y: 150 },
        },
      ].forEach(({ point, expected }) => {
        it(`should return the point on the rectangle edge closest to the given point (${JSON.stringify(rect)}, ${JSON.stringify(point)})`, () => {
          expect(getClosestEdgePoint(rect, point)).toEqual(expected);
        });
      });
    });

    describe("when the point is inside the rectangle", () => {
      [
        {
          point: { x: 125, y: 125 },
          expected: { x: 100, y: 100 },
        },
        {
          point: { x: 150, y: 125 },
          expected: { x: 150, y: 100 },
        },
        {
          point: { x: 175, y: 125 },
          expected: { x: 200, y: 100 },
        },
        {
          point: { x: 175, y: 150 },
          expected: { x: 200, y: 150 },
        },
        {
          point: { x: 175, y: 175 },
          expected: { x: 200, y: 200 },
        },
        {
          point: { x: 150, y: 175 },
          expected: { x: 150, y: 200 },
        },
        {
          point: { x: 125, y: 175 },
          expected: { x: 100, y: 200 },
        },
        {
          point: { x: 125, y: 150 },
          expected: { x: 100, y: 150 },
        },
      ].forEach(({ point, expected }) => {
        it(`should return the point on the rectangle edge closest to the given point (${JSON.stringify(rect)}, ${JSON.stringify(point)})`, () => {
          expect(getClosestEdgePoint(rect, point)).toEqual(expected);
        });
      });
    });
  });

  describe("when rect's width is zero", () => {
    const rect = { x: 100, y: 100, width: 0, height: 100 };
    [
      {
        point: { x: 0, y: 0 },
        expected: { x: 100, y: 100 },
      },
      {
        point: { x: 100, y: 0 },
        expected: { x: 100, y: 100 },
      },
      {
        point: { x: 200, y: 0 },
        expected: { x: 100, y: 100 },
      },
      {
        point: { x: 200, y: 150 },
        expected: { x: 100, y: 150 },
      },
      {
        point: { x: 200, y: 300 },
        expected: { x: 100, y: 200 },
      },
      {
        point: { x: 100, y: 300 },
        expected: { x: 100, y: 200 },
      },
      {
        point: { x: 0, y: 300 },
        expected: { x: 100, y: 200 },
      },
      {
        point: { x: 0, y: 150 },
        expected: { x: 100, y: 150 },
      },
    ].forEach(({ point, expected }) => {
      it(`should return the point on the rectangle edge closest to the given point (${JSON.stringify(rect)}, ${JSON.stringify(point)})`, () => {
        expect(getClosestEdgePoint(rect, point)).toEqual(expected);
      });
    });
  });

  describe("when rect's height is zero", () => {
    const rect = { x: 100, y: 100, width: 100, height: 0 };
    [
      {
        point: { x: 0, y: 0 },
        expected: { x: 100, y: 100 },
      },
      {
        point: { x: 150, y: 0 },
        expected: { x: 150, y: 100 },
      },
      {
        point: { x: 300, y: 0 },
        expected: { x: 200, y: 100 },
      },
      {
        point: { x: 300, y: 100 },
        expected: { x: 200, y: 100 },
      },
      {
        point: { x: 300, y: 200 },
        expected: { x: 200, y: 100 },
      },
      {
        point: { x: 150, y: 200 },
        expected: { x: 150, y: 100 },
      },
      {
        point: { x: 0, y: 200 },
        expected: { x: 100, y: 100 },
      },
      {
        point: { x: 0, y: 100 },
        expected: { x: 100, y: 100 },
      },
    ].forEach(({ point, expected }) => {
      it(`should return the point on the rectangle edge closest to the given point (${JSON.stringify(rect)}, ${JSON.stringify(point)})`, () => {
        expect(getClosestEdgePoint(rect, point)).toEqual(expected);
      });
    });
  });
});
