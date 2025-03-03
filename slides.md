---
mdc: true
---

# Fancy Arrow

## Slidev addon for drawing arrows with <span v-mark.orange="0" id="fancy-styles">fancy styles</span>,

<span forward:delay-500 id="rough-js">powered by [Rough.js](https://roughjs.com).</span>

<FancyArrow id1="rough-js" pos1="bottomright" id2="fancy-styles" pos2="bottom" color="orange" width="3" arc="-0.3" seed="1" roughness="2" />

---

# Positioning

<div grid="~ cols-3 gap-4" mt-6 h-100>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Absolute positioning

<FancyArrow
    x1="120"
    y1="200"
    x2="260"
    y2="300"
/>

<div grow-1><!-- Placeholder--></div>

```html
<FancyArrow
    x1="120"
    y1="200"
    x2="260"
    y2="300"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Snapped to elements

<code id="snapped-element1" absolute left-380px top-200px>#snapped-element1</code>
<code id="snapped-element2" absolute left-420px top-300px>#snapped-element2</code>
<FancyArrow
    id1="snapped-element1"
    id2="snapped-element2"
/>

<div grow-1><!-- Placeholder--></div>

```html
<code id="snapped-element1" absolute left-380px top-200px>#snapped-element1</code>
<code id="snapped-element2" absolute left-420px top-300px>#snapped-element2</code>
<FancyArrow
    id1="snapped-element1"
    id2="snapped-element2"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Mixed

<code id="snapped-element3" absolute left-680px top-200px>#snapped-element3</code>
<FancyArrow
    id1="snapped-element3"
    x2="800"
    y2="300"
/>

<div grow-1><!-- Placeholder--></div>

```html
<code id="snapped-element3" absolute left-680px top-200px>#snapped-element3</code>
<FancyArrow
    id1="snapped-element3"
    x2="800"
    y2="300"
/>
```

</div>

</div>

---

# Anchor point

<div absolute left="50%" top="50%" translate-x="-50%" translate-y="-50%" w-100 h-30 border="~ gray/50 rounded-lg" id="anchor-example">

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute left="50%" top="50%" translate-x="-50%" translate-y="-50%">center</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute left="0" top="0">
    topleft
</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute left="50%" top="0" translate-x="-50%">
    top
</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute right="0" top="0">
    topright
</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute left="0" top="50%" translate-y="-50%">
    left
</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute right="0" top="50%" translate-y="-50%">
    right
</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute left="0" bottom="0">
    bottomleft
</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute left="50%" bottom="0" translate-x="-50%">
    bottom
</code>

<code bg-gray:10 p-1 min-w-25 text-center rounded-md absolute right="0" bottom="0">
    bottomright
</code>

</div>

<FancyArrow x1="0" y1="0" id2="anchor-example" pos2="topleft" color="red" width="4" roughness="3" arc="-0.4" seed="1" />

Use `pos1` and `pos2` to specify the anchor point on the snapped elements.

```html
<FancyArrow x1="0" y1="0" id2="anchor-example" pos2="topleft" color="red" width="4" roughness="3" arc="-0.4" seed="1" />
```

---

# Appearance

<div grid="~ cols-3 gap-4" mt-6 h-80>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Color

<FancyArrow color="orange" x1="100" y1="200" x2="200" y2="300" />
<FancyArrow color="lime" x1="140" y1="200" x2="240" y2="300" />
<FancyArrow color="sky" x1="180" y1="200" x2="280" y2="300" />

<div grow-1><!-- Placeholder--></div>

```html
<FancyArrow color="orange" x1="100" y1="200" x2="200" y2="300" />
<FancyArrow color="lime" x1="140" y1="200" x2="240" y2="300" />
<FancyArrow color="sky" x1="180" y1="200" x2="280" y2="300" />
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Width

<FancyArrow width="2" x1="400" y1="200" x2="500" y2="300" />
<FancyArrow width="4" x1="440" y1="200" x2="540" y2="300" />
<FancyArrow width="6" x1="480" y1="200" x2="580" y2="300" />

<div grow-1><!-- Placeholder--></div>

```html
<FancyArrow width="2" x1="400" y1="200" x2="500" y2="300" />
<FancyArrow width="4" x1="440" y1="200" x2="540" y2="300" />
<FancyArrow width="6" x1="480" y1="200" x2="580" y2="300" />
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Arrow head

<FancyArrow two-way x1="700" y1="200" x2="800" y2="300" />
<FancyArrow arrowHeadType="polygon" x1="740" y1="200" x2="840" y2="300" />
<FancyArrow arrowHeadSize="60" x1="780" y1="200" x2="880" y2="300" />

<div grow-1><!-- Placeholder--></div>

```html
<FancyArrow two-way x1="700" y1="200" x2="800" y2="300" />
<FancyArrow arrowHeadType="polygon" x1="740" y1="200" x2="840" y2="300" />
<FancyArrow arrowHeadSize="60" x1="780" y1="200" x2="880" y2="300" />
```

</div>

</div>

---

# Arc

<code id="arc-start" absolute left-300px top-100px style="transform: translate(-50%, -50%);">#arc-start</code>
<code id="arc-end" absolute left-300px top-400px style="transform: translate(-50%, -50%);">#arc-end</code>

<FancyArrow arc="1.5" id1="arc-start" pos1="bottom" id2="arc-end" pos2="top" color="red" />
<FancyArrow arc="1.0" id1="arc-start" pos1="bottom" id2="arc-end" pos2="top" color="orange" />
<FancyArrow arc="0.5" id1="arc-start" pos1="bottom" id2="arc-end" pos2="top" color="yellow" />
<FancyArrow arc="0.0" id1="arc-start" pos1="bottom" id2="arc-end" pos2="top" color="green" />
<FancyArrow arc="-0.5" id1="arc-start" pos1="bottom" id2="arc-end" pos2="top" color="blue" />
<FancyArrow arc="-1.0" id1="arc-start" pos1="bottom" id2="arc-end" pos2="top" color="purple" />
<FancyArrow arc="-1.5" id1="arc-start" pos1="bottom" id2="arc-end" pos2="top" color="pink" />

<Arrow x1="50" y1="450" x2="550" y2="450" />

<code absolute left-0px top-460px>arc=</code>
<code absolute left-75px top-460px style="transform: translateX(-50%);">-1.5</code>
<code absolute left-150px top-460px style="transform: translateX(-50%);">-1.0</code>
<code absolute left-225px top-460px style="transform: translateX(-50%);">-0.5</code>
<code absolute left-300px top-460px style="transform: translateX(-50%);">0</code>
<code absolute left-375px top-460px style="transform: translateX(-50%);">0.5</code>
<code absolute left-450px top-460px style="transform: translateX(-50%);">1.0</code>
<code absolute left-525px top-460px style="transform: translateX(-50%);">1.5</code>

<div absolute right-0 top-30 w-100>

```html
<code id="arc-start" absolute left-300px top-400px style="transform: translate(-50%, -50%);">#arc-start</code>
<code id="arc-end" absolute left-300px top-100px style="transform: translate(-50%, -50%);">#arc-end</code>

<FancyArrow arc="1.5" id1="arc-start" id2="arc-end" color="red" />
<FancyArrow arc="1.0" id1="arc-start" id2="arc-end" color="orange" />
<FancyArrow arc="0.5" id1="arc-start" id2="arc-end" color="yellow" />
<FancyArrow arc="0.0" id1="arc-start" id2="arc-end" color="green" />
<FancyArrow arc="-0.5" id1="arc-start" id2="arc-end" color="blue" />
<FancyArrow arc="-1.0" id1="arc-start" id2="arc-end" color="purple" />
<FancyArrow arc="-1.5" id1="arc-start" id2="arc-end" color="pink" />
```

</div>

---

# Content on the arrow

<FancyArrow x1="100" y1="100" x2="200" y2="200" >
    Hello
</FancyArrow>

<FancyArrow x1="200" y1="100" x2="300" y2="200" arc="0.3">
    Ahoy
</FancyArrow>

<FancyArrow x1="300" y1="100" x2="400" y2="200" arc="0.3">
    <span text-4xl text-red v-mark.red="0">Hello</span>
</FancyArrow>

<FancyArrow x1="400" y1="100" x2="500" y2="200" arc="0.3">
    <span text-nowrap>Slidev logo</span>
    <img src="https://sli.dev/logo.svg" w-10 m-auto/>
</FancyArrow>

<div mt-40>

```html
<FancyArrow x1="100" y1="100" x2="200" y2="200" >
    Hello
</FancyArrow>

<FancyArrow x1="200" y1="100" x2="300" y2="200" arc="0.3">
    Ahoy
</FancyArrow>

<FancyArrow x1="300" y1="100" x2="400" y2="200" arc="0.3">
    <span text-4xl text-red v-mark.red="0">Hello</span>
</FancyArrow>

<FancyArrow x1="400" y1="100" x2="500" y2="200" arc="0.3">
    <span text-nowrap>Slidev logo</span>
    <img src="https://sli.dev/logo.svg" w-10 m-auto/>
</FancyArrow>
```

</div>

---

# Demo: Animated arrows

<img v-click="1" src="https://sli.dev/logo.svg" w-10 id="slidev-logo" absolute top-25 left-25 v-motion :initial="{x: -80, y: -80}" :enter="{x: 0, y: 0}" />
<img v-click="1" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/1280px_Markdown_with_White_Background.png/640px-1280px_Markdown_with_White_Background.png" w-15 id="markdown-mark" absolute top-30 right-30 v-motion :initial="{x: +80, y: -80}" :enter="{x: 0, y: 0}"/>
<img v-click="1" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/512px-Vue.js_Logo_2.svg.png" w-10 id="vue-mark" absolute bottom-20 right-100 v-motion :initial="{x: +30, y: +80}" :enter="{x: 0, y: 0}"/>

<FancyArrow v-click="1" id1="slidev-logo" pos1="bottom" id2="slidev-text" pos2="bottomleft" color="teal" width="4" roughness="3" arc="-0.3" seed="1" />
<FancyArrow v-click="1" id1="markdown-mark" pos1="bottom" id2="markdown-text" pos2="bottomright" color="gray" width="4" roughness="2" arc="0.3" seed="1" />
<FancyArrow v-click="1" id1="vue-mark" pos1="left" id2="vue-text" pos2="bottom" color="green" width="4" roughness="2" arc="0.3" seed="1" />

<div w="2/3" m-auto mt-40>
    <span id="slidev-text" v-mark.teal="1">Slidev</span> <sub top--1>(slide + dev, /slaɪdɪv/)</sub> is a web-based slides maker and presenter. It's designed for developers to focus on writing content in <span id="markdown-text" v-mark.gray="1">Markdown</span>. With the power of web technologies like <span id="vue-text" v-mark.green="1">Vue</span>, you are able to deliver pixel-perfect designs with interactive demos to your presentation.
</div>

---

### Snapped to animated elements

<div v-click p-8>
    <span id="foo">Foo</span>
</div>

<div :class="$clicks === 0 ? 'translate-y--16' : ''" p-8>
    <span id="bar">Bar</span>
</div>

<FancyArrow v-click="1" forward:delay-100 id1="foo" pos1="bottomright" id2="bar" pos2="topright" color="red" width="2" arc="0.3" seed="1" roughness="2" >Hey</FancyArrow>
<FancyArrow v-click="1" forward:delay-100 id2="foo" pos2="bottomleft" id1="bar" pos1="topleft" color="red" width="2" arc="0.3" seed="1" roughness="2" >
    <span text-red>Ahoy</span>
</FancyArrow>

<div v-click p-8 :class="$clicks === 0 ? 'translate-y--32' : $clicks === 1 ? 'translate-y--16' : ''">
    <span id="baz">Baz</span>
</div>

<FancyArrow v-click="2" forward:delay-100 id1="bar" pos1="bottomright" id2="baz" pos2="topright" color="green" width="2" arc="0.3" seed="1" roughness="2" >
    <span text-green v-mark.green="2">Hola!</span>
</FancyArrow>
---

# Demo

<div id="block1">Block 1</div>

<div v-click>
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    <br />
</div>

<div id="block2" :class="$clicks === 0 ? 'translate-y--32' : ''">Block 2</div>

<FancyArrow x1="10" y1="20" x2="100" y2="200" color="green" width="3"  />

<FancyArrow id1="block1" pos1="bottomleft" id2="block2" pos2="topleft" color="red" width="3" />

<FancyArrow id1="block1" pos1="bottom" id2="block2" pos2="top" color="red" width="3" twoWay />

<FancyArrow id1="block1" pos1="bottomright" id2="block2" pos2="topright" color="red" width="3" twoWay arc="0.5" arrowHeadType="polygon" arrowHeadSize="30" />

---

# Next page
