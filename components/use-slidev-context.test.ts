// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp, type App, type ComputedRef } from "vue";
import { createMemoryHistory, createRouter, type Router } from "vue-router";
import { useIsPrintMode } from "./use-slidev-context";

vi.mock("@slidev/client/context.ts", () => ({
  useSlideContext: () => ({ $nav: { value: { currentSlideNo: 1 } } }),
}));

describe("useIsPrintMode with fixed navigation lacking isPrintMode", () => {
  let app: App;
  let router: Router;
  let isPrintMode: ComputedRef<boolean>;

  async function navigate(url: string, route = url) {
    window.history.replaceState({}, "", url);
    await router.push(route);
  }

  beforeEach(async () => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/:no", name: "play", component: {} },
        { path: "/print", name: "print", component: {} },
        { path: "/export/:no?", name: "export", component: {} },
      ],
    });
    await navigate("/1");
    app = createApp({
      setup() {
        isPrintMode = useIsPrintMode();
        return () => null;
      },
    });
    app.use(router);
    app.mount(document.createElement("div"));
  });

  afterEach(() => {
    app.unmount();
    window.history.replaceState({}, "", "/");
  });

  it("returns false on a normal slide", () => {
    expect(isPrintMode.value).toBe(false);
  });

  it.each([
    "/print?print",
    "/print?print=clicks",
    "/1?print=false",
    "/export",
    "/export/1",
  ])("detects print mode at %s and clears it on return", async (url) => {
    expect(isPrintMode.value).toBe(false);
    await navigate(url);
    expect(isPrintMode.value).toBe(true);
    await navigate("/1");
    expect(isPrintMode.value).toBe(false);
  });

  it("uses the document query in hash-router mode, as Slidev does", async () => {
    await navigate("/?print#/1", "/1");
    expect(isPrintMode.value).toBe(true);
    await navigate("/#/1?print", "/1?print");
    expect(isPrintMode.value).toBe(false);
  });
});

describe("useIsPrintMode without a Vue Router injection", () => {
  let app: App | undefined;
  let isPrintMode: ComputedRef<boolean>;

  afterEach(() => {
    app?.unmount();
    app = undefined;
    window.history.replaceState({}, "", "/");
  });

  function mountWithoutRouter() {
    app = createApp({
      setup() {
        // No app.use(router): useRoute() returns undefined, which previously
        // threw on route.query and blanked the whole Slidev slide.
        isPrintMode = useIsPrintMode();
        return () => null;
      },
    });
    app.mount(document.createElement("div"));
  }

  it("does not throw when useRoute() is undefined", () => {
    window.history.replaceState({}, "", "/1");
    expect(() => mountWithoutRouter()).not.toThrow();
    expect(isPrintMode.value).toBe(false);
  });

  it("falls back to location.search when useRoute() is undefined", () => {
    window.history.replaceState({}, "", "/1?print");
    mountWithoutRouter();
    expect(isPrintMode.value).toBe(true);
  });
});
