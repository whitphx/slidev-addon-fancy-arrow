---
mdc: true
---

# Slidev Fancy Arrow

<h2>
Slidev addon for drawing arrows with<br>
<span v-mark.orange="1" data-id="fancy-styles">fancy styles</span> and <span v-mark.green="1" data-id="intuitive-positioning">intuitive positioning</span>.
</h2>

<div mt-20>

<span data-id="rough-js">Powered by [Rough.js](https://roughjs.com).</span>

</div>

<FancyArrow from="[data-id=rough-js]@top" to="[data-id=fancy-styles]@bottom" color="orange" width="3" arc="-0.3" seed="1" roughness="2" animated animationDuration="500" animationDelay="0" />

<div absolute left-80 top-90>
<p>
    <code data-id="snap-sample">Snapped to an element</code>
</p>

<p>
    <code data-id="abspos-sample">or an absolute position</code>
</p>
</div>

<FancyArrow from="[data-id=intuitive-positioning]@bottom" to="[data-id=snap-sample]@top" color="green" width="3" arc="-0.3" seed="1" roughness="2" animated animationDuration="500" animationDelay="500" />

<FancyArrow from="[data-id=abspos-sample]@topright" to="(800,500)" color="blue" width="3" arc="0.3" seed="1" roughness="2" animated animationDuration="500" animationDelay="1000" />

<div absolute w="1px" h="100%" left="800px" top="0" bg="gray" opacity="0.5" translate-x="-50%"></div>
<div absolute h="1px" w="100%" left="0" top="500px" bg="gray" opacity="0.5" translate-y="-50%"></div>

<div absolute right-10 top="50%" translate-y="-50%" text-6xl data-id="github">

[<octicon-mark-github-24 />](https://github.com/whitphx/slidev-addon-fancy-arrow)

</div>

<FancyArrow from="[data-id=check-out]@bottomright" to="[data-id=github]@topleft" color="gray" arc="0.2" width="3" seed="1" roughness="2" >
<span text-nowrap v-mark.gray="1">
the demo and docs!
</span>
</FancyArrow>

<div data-id="check-out" absolute right-50 top-20 text-2xl>

[Check out](https://whitphx.github.io/slidev-addon-fancy-arrow/)

</div>


---

# Positioning

<div grid="~ cols-3 gap-4" mt-6 h-85>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Absolute positioning

<FancyArrow
    x1="120"
    y1="200"
    x2="260"
    y2="280"
/>

<div grow-1><!-- Placeholder--></div>

```html
<FancyArrow
    x1="120"
    y1="200"
    x2="260"
    y2="280"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Snapped to elements

<code data-id="anchor1" absolute left-380px top-180px>data-id=anchor1</code>
<code data-id="anchor2" absolute left-420px top-260px>data-id=anchor2</code>
<FancyArrow
    q1="[data-id=anchor1]"
    q2="[data-id=anchor2]"
/>

<div grow-1><!-- Placeholder--></div>

```html
<code data-id="anchor1" absolute left-380px top-180px>data-id=anchor1</code>
<code data-id="anchor2" absolute left-420px top-260px>data-id=anchor2</code>
<FancyArrow
    q1="[data-id=anchor1]"
    q2="[data-id=anchor2]"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Mixed

<code data-id="anchor3" absolute left-680px top-180px>data-id=anchor3</code>
<FancyArrow
    q1="[data-id=anchor3]"
    x2="800"
    y2="280"
/>

<div grow-1><!-- Placeholder--></div>

```html
<code data-id="anchor3" absolute left-680px top-180px>data-id=anchor3</code>
<FancyArrow
    q1="[data-id=anchor3]"
    x2="800"
    y2="280"
/>
```

</div>

</div>

<div m-2 text-sm>

You can pass any valid CSS selector to `q1` and `q2` to specify the elements to snap to. `FancyArrow` will snap to the first element that matches the selector in the same page.
Using ID is not recommended because each component is rendered twice in the presenter mode and IDs will not be unique in such a case.
</div>

---

# Anchor point

<div absolute left="50%" top-45 translate-x="-50%" w-100 h-30 border="~ gray/50 rounded-lg" overflow-hidden data-id="anchor-example">

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

<FancyArrow
    x1="0" y1="0"
    q2="[data-id=anchor-example]"
    pos2="left"
    color="red" arc="-0.4"
/>

<FancyArrow
    x1="0" y1="0"
    q2="[data-id=anchor-example]"
    pos2="center"
    color="red" arc="-0.4"
/>

<FancyArrow
    x1="0" y1="0"
    q2="[data-id=anchor-example]"
    pos2="bottomright"
    color="red" arc="-0.4"
/>

<div mx-8>

Use `pos1` and `pos2` to specify the anchor point on the snapped elements.

</div>

<div mx-auto mt-60 grid="~ cols-3 gap-4">

```html {4}
<FancyArrow
    x1="0" y1="0"
    q2="[data-id=anchor-example]"
    pos2="left"
    color="red" arc="-0.4"
/>
```

```html {4}
<FancyArrow
    x1="0" y1="0"
    q2="[data-id=anchor-example]"
    pos2="center"
    color="red" arc="-0.4"
/>
```

```html {4}
<FancyArrow
    x1="0" y1="0"
    q2="[data-id=anchor-example]"
    pos2="bottomright"
    color="red" arc="-0.4"
/>
```

</div>

---

# `from` and `to` shorthand

<div grid="~ cols-3 gap-4" mt-6 h-85>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Absolute positioning

<FancyArrow
    from="(120, 200)"
    to="(260, 280)"
/>

<div grow-1><!-- Placeholder--></div>

```html
<FancyArrow
    from="(120, 200)"
    to="(260, 280)"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Snapped to elements

<code data-id="anchor1" absolute left-380px top-180px>data-id=anchor1</code>
<code data-id="anchor2" absolute left-420px top-260px>data-id=anchor2</code>
<FancyArrow
    from="[data-id=anchor1]"
    to="[data-id=anchor2]"
/>

<div grow-1><!-- Placeholder--></div>

```html
<code data-id="anchor1" absolute left-380px top-180px>data-id=anchor1</code>
<code data-id="anchor2" absolute left-420px top-260px>data-id=anchor2</code>
<FancyArrow
    from="[data-id=anchor1]"
    to="[data-id=anchor2]"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### With snapped points

<code data-id="anchor3" absolute left-680px top-180px>data-id=anchor3</code>
<code data-id="anchor4" absolute left-680px top-260px>data-id=anchor4</code>
<FancyArrow
    from="[data-id=anchor3]@bottom"
    to="[data-id=anchor4]@top"
/>

<div grow-1><!-- Placeholder--></div>

```html
<code data-id="anchor3" absolute left-680px top-180px>data-id=anchor3</code>
<code data-id="anchor4" absolute left-680px top-260px>data-id=anchor4</code>
<FancyArrow
    from="[data-id=anchor3]@bottom"
    to="[data-id=anchor4]@top"
/>
```

</div>

</div>

---

# Auto-snap

<div>
If no snap target or absolute position is specified, the arrow will automatically snap to the next or previous element in the slide.
</div>

<div p-8 flex justify-center>Prev</div>

<FancyArrow />

<div p-8 flex justify-center>Next</div>

```html
<div p-8 flex justify-center>Prev</div>

<FancyArrow />

<div p-8 flex justify-center>Next</div>
```

---

# Appearance

<div grid="~ cols-3 gap-4" mt-6 h-100>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Color

<FancyArrow x1="100" y1="180" x2="200" y2="280"
    color="orange"
/>
<FancyArrow x1="140" y1="180" x2="240" y2="280"
    color="lime"
/>
<FancyArrow x1="180" y1="180" x2="280" y2="280"
    color="cyan"
/>

<div grow-1><!-- Placeholder--></div>

```html {2,5,8}
<FancyArrow x1="100" y1="180" x2="200" y2="280"
    color="orange"
/>
<FancyArrow x1="140" y1="180" x2="240" y2="280"
    color="lime"
/>
<FancyArrow x1="180" y1="180" x2="280" y2="280"
    color="cyan"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Width

<FancyArrow  x1="400" y1="180" x2="500" y2="280"
    width="2"
/>
<FancyArrow x1="440" y1="180" x2="540" y2="280"
    width="4"
/>
<FancyArrow x1="480" y1="180" x2="580" y2="280"
    width="6"
/>

<div grow-1><!-- Placeholder--></div>

```html {2,5,8}
<FancyArrow x1="400" y1="180" x2="500" y2="280"
    width="2"
/>
<FancyArrow x1="440" y1="180" x2="540" y2="280"
    width="4"
/>
<FancyArrow x1="480" y1="180" x2="580" y2="280"
    width="6"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Arrow head

<FancyArrow x1="700" y1="180" x2="800" y2="280"
    two-way
/>
<FancyArrow x1="740" y1="180" x2="840" y2="280"
    head-type="polygon"
/>
<FancyArrow x1="780" y1="180" x2="880" y2="280"
    head-size="60"
/>

<div grow-1><!-- Placeholder--></div>

```html {2,5,8}
<FancyArrow x1="700" y1="180" x2="800" y2="280"
    two-way
/>
<FancyArrow x1="740" y1="180" x2="840" y2="280"
    head-type="polygon"
/>
<FancyArrow x1="780" y1="180" x2="880" y2="280"
    head-size="60"
/>
```

</div>

</div>

---

# Rough.js options

<div grid="~ cols-3 gap-4" mt-6 h-100>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Roughness

<FancyArrow x1="100" y1="180" x2="200" y2="280"
    roughness="0"
/>
<FancyArrow x1="150" y1="180" x2="250" y2="280"
    roughness="2"
/>
<FancyArrow x1="200" y1="180" x2="300" y2="280"
    roughness="4"
/>

<div grow-1><!-- Placeholder--></div>

```html {2,5,8}
<FancyArrow x1="100" y1="180" x2="200" y2="280"
    roughness="0"
/>
<FancyArrow x1="150" y1="180" x2="250" y2="280"
    roughness="2"
/>
<FancyArrow x1="200" y1="180" x2="300" y2="280"
    roughness="4"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Bowing

<FancyArrow x1="400" y1="180" x2="500" y2="280" roughness="2"
    bowing="0"
/>
<FancyArrow x1="440" y1="180" x2="540" y2="280" roughness="2"
    bowing="0.5"
/>
<FancyArrow x1="480" y1="180" x2="580" y2="280" roughness="2"
    bowing="1"
/>

<div grow-1><!-- Placeholder--></div>

```html {2,5,8}
<FancyArrow x1="400" y1="180" x2="500" y2="280" roughness="2"
    bowing="0"
/>
<FancyArrow x1="440" y1="180" x2="540" y2="280" roughness="2"
    bowing="0.5"
/>
<FancyArrow x1="480" y1="180" x2="580" y2="280" roughness="2"
    bowing="1"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Seed

<FancyArrow x1="700" y1="180" x2="800" y2="280" roughness="3"
    seed="2"
/>
<FancyArrow x1="740" y1="180" x2="840" y2="280" roughness="3"
    seed="3"
/>
<FancyArrow x1="780" y1="180" x2="880" y2="280" roughness="3"
    seed="4"
/>

<div grow-1><!-- Placeholder--></div>

```html {2,5,8}

<FancyArrow x1="700" y1="180" x2="800" y2="280" roughness="3"
    seed="2"
/>
<FancyArrow x1="740" y1="180" x2="840" y2="280" roughness="3"
    seed="3"
/>
<FancyArrow x1="780" y1="180" x2="880" y2="280" roughness="3"
    seed="4"
/>
```

</div>

</div>

---

# Arc

<code data-id="arc-start" absolute left-300px top-100px style="transform: translate(-50%, -50%);">\[data-id=arc-start\]</code>
<code data-id="arc-end" absolute left-300px top-400px style="transform: translate(-50%, -50%);">\[data-id=arc-end\]</code>

<FancyArrow arc="1.5" q1="[data-id=arc-start]" pos1="bottom" q2="[data-id=arc-end]" pos2="top" color="red" />
<FancyArrow arc="1.0" q1="[data-id=arc-start]" pos1="bottom" q2="[data-id=arc-end]" pos2="top" color="orange" />
<FancyArrow arc="0.5" q1="[data-id=arc-start]" pos1="bottom" q2="[data-id=arc-end]" pos2="top" color="yellow" />
<FancyArrow arc="0.0" q1="[data-id=arc-start]" pos1="bottom" q2="[data-id=arc-end]" pos2="top" color="green" />
<FancyArrow arc="-0.5" q1="[data-id=arc-start]" pos1="bottom" q2="[data-id=arc-end]" pos2="top" color="blue" />
<FancyArrow arc="-1.0" q1="[data-id=arc-start]" pos1="bottom" q2="[data-id=arc-end]" pos2="top" color="purple" />
<FancyArrow arc="-1.5" q1="[data-id=arc-start]" pos1="bottom" q2="[data-id=arc-end]" pos2="top" color="pink" />

<Arrow x1="50" y1="450" x2="550" y2="450" />

<code absolute left-0px top-460px>arc=</code>
<code absolute left-105px top-460px style="transform: translateX(-50%);">-1.5</code>
<code absolute left-170px top-460px style="transform: translateX(-50%);">-1.0</code>
<code absolute left-235px top-460px style="transform: translateX(-50%);">-0.5</code>
<code absolute left-300px top-460px style="transform: translateX(-50%);">0</code>
<code absolute left-365px top-460px style="transform: translateX(-50%);">0.5</code>
<code absolute left-430px top-460px style="transform: translateX(-50%);">1.0</code>
<code absolute left-495px top-460px style="transform: translateX(-50%);">1.5</code>

<div absolute right-0 top-30 w-100>

```html
<code data-id="arc-start" absolute left-300px top-400px style="transform: translate(-50%, -50%);">#arc-start</code>
<code data-id="arc-end" absolute left-300px top-100px style="transform: translate(-50%, -50%);">#arc-end</code>

<FancyArrow arc="1.5" q1="[data-id=arc-start]" q2="[data-id=arc-end]" color="red" />
<FancyArrow arc="1.0" q1="[data-id=arc-start]" q2="[data-id=arc-end]" color="orange" />
<FancyArrow arc="0.5" q1="[data-id=arc-start]" q2="[data-id=arc-end]" color="yellow" />
<FancyArrow arc="0.0" q1="[data-id=arc-start]" q2="[data-id=arc-end]" color="green" />
<FancyArrow arc="-0.5" q1="[data-id=arc-start]" q2="[data-id=arc-end]" color="blue" />
<FancyArrow arc="-1.0" q1="[data-id=arc-start]" q2="[data-id=arc-end]" color="purple" />
<FancyArrow arc="-1.5" q1="[data-id=arc-start]" q2="[data-id=arc-end]" color="pink" />
```

</div>

---

# Animation

<div grid="~ cols-3 gap-4" mt-6 h-85>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Animated

<FancyArrow
    animated
    x1="120" y1="200" x2="260" y2="280"
/>

<div grow-1><!-- Placeholder--></div>

```html {2}
<FancyArrow
    animated
    x1="120" y1="200" x2="260" y2="280"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Custom duration

<FancyArrow
    animationDuration="3000"
    x1="420" y1="200" x2="560" y2="280"
/>

<div grow-1><!-- Placeholder--></div>

```html {2}
<FancyArrow
    animationDuration="3000"
    x1="420" y1="200" x2="560" y2="280"
/>
```

</div>

<div bg-gray:10 p-4 border="~ gray/50 rounded-lg" flex="~ col">

### Custom delay

<FancyArrow
    animationDelay="1000"
    x1="720" y1="200" x2="860" y2="280"
/>

<div grow-1><!-- Placeholder--></div>

```html {2}
<FancyArrow
    animationDelay="1000"
    x1="720" y1="200" x2="860" y2="280"
/>
```

</div>

</div>

---

# Specify the snapping point by position values

<div h-40>
    <img
        src="https://images.unsplash.com/photo-1513407030348-c983a97b98d8?q=80&w=1920&auto=format&fit=crop"
        data-id="snapped-image"
        m-auto
        max-h="100%"
    />
</div>

<span data-id="label-tower" text-6xl absolute left-40 top-30>🗼</span>

<FancyArrow
    to="[data-id=snapped-image]@(20%,50%)"
    from="[data-id=label-tower]"
    arc="0.3"
    color="red"
/>

<span data-id="label-house" text-6xl absolute right-40 top-30>🏘️</span>

<FancyArrow
    to="[data-id=snapped-image]@(100,120)"
    from="[data-id=label-house]"
    arc="-0.3"
    color="purple"
/>

```html {2,8}
<FancyArrow
    to="[data-id=snapped-image]@(20%,50%)"
    from="[data-id=label-tower]"
    arc="0.3"
    color="red"
/>
<FancyArrow
    to="[data-id=snapped-image]@(100,120)"
    from="[data-id=label-house]"
    arc="-0.3"
    color="purple"
/>
```

---

# Contents on the arrow

<FancyArrow x1="100" y1="100" x2="200" y2="200" >
    Hello
</FancyArrow>

<FancyArrow x1="200" y1="100" x2="300" y2="200" arc="0.3">
    Ahoy
</FancyArrow>

<FancyArrow x1="300" y1="100" x2="400" y2="200" arc="0.3">
    <span text-4xl text-red v-mark.red="1">Hello</span>
</FancyArrow>

<FancyArrow x1="400" y1="100" x2="500" y2="200" arc="0.3">
    <span text-nowrap>Slidev logo</span>
    <img src="https://sli.dev/logo.svg" w-10 m-auto/>
</FancyArrow>

<FancyArrow x1="500" y1="100" x2="600" y2="200" animated>
    Animated
</FancyArrow>

<FancyArrow x1="600" y1="100" x2="700" y2="200" animated v-click>
    Animated with v-click
</FancyArrow>

<div mt-40 h-70>

```html {*}{maxHeight: '100%'}
<FancyArrow x1="100" y1="100" x2="200" y2="200" >
    Hello
</FancyArrow>

<FancyArrow x1="200" y1="100" x2="300" y2="200" arc="0.3">
    Ahoy
</FancyArrow>

<FancyArrow x1="300" y1="100" x2="400" y2="200" arc="0.3">
    <span text-4xl text-red v-mark.red="1">Hello</span>
</FancyArrow>

<FancyArrow x1="400" y1="100" x2="500" y2="200" arc="0.3">
    <span text-nowrap>Slidev logo</span>
    <img src="https://sli.dev/logo.svg" w-10 m-auto/>
</FancyArrow>

<FancyArrow x1="500" y1="100" x2="600" y2="200" animated>
    Animated
</FancyArrow>

<FancyArrow x1="600" y1="100" x2="700" y2="200" animated v-click>
    Animated with v-click
</FancyArrow>
```

</div>

---

# Demo: animated arrows

<img v-click="1" src="https://sli.dev/logo.svg" w-20 data-id="slidev-logo" absolute top-25 left-20 v-motion :initial="{x: -80, y: -80}" :enter="{x: 0, y: 0}" />
<img v-click="1" src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/1280px_Markdown_with_White_Background.png/640px-1280px_Markdown_with_White_Background.png" w-30 data-id="markdown-mark" absolute top-30 right-25 v-motion :initial="{x: +80, y: -80}" :enter="{x: 0, y: 0}"/>
<img v-click="1" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/512px-Vue.js_Logo_2.svg.png" w-20 data-id="vue-mark" absolute bottom-10 right-120 v-motion :initial="{x: +30, y: +80}" :enter="{x: 0, y: 0}"/>

<FancyArrow v-click="1" q1="[data-id=slidev-logo]" pos1="bottom" q2="[data-id=slidev-text]" pos2="bottomleft" color="cyan" width="4" roughness="3" arc="-0.3" seed="1" animated />
<FancyArrow v-click="1" q1="[data-id=markdown-mark]" pos1="bottom" q2="[data-id=markdown-text]" pos2="bottomright" color="gray" width="4" roughness="2" arc="0.3" seed="1" animated />
<FancyArrow v-click="1" q1="[data-id=vue-mark]" pos1="top" q2="[data-id=vue-text]" pos2="bottom" color="teal" width="4" roughness="2" arc="0.3" seed="1" animated />

<div w="2/3" m-auto mt-40>
    <span data-id="slidev-text" v-mark.cyan="1">Slidev</span> <sub top--1>(slide + dev, /slaɪdɪv/)</sub> is a web-based slides maker and presenter. It's designed for developers to focus on writing content in <span data-id="markdown-text" v-mark.gray="1">Markdown</span>. With the power of web technologies like <span data-id="vue-text" v-mark.teal="1">Vue</span>, you are able to deliver pixel-perfect designs with interactive demos to your presentation.
</div>

---

# Demo: arrows snapped to animated elements

<div v-click p-8>
    <span data-id="foo">Foo</span>
</div>

<div :class="$clicks === 0 ? 'translate-y--16' : ''" p-8>
    <span data-id="bar">Bar</span>
</div>

<FancyArrow v-click="1" forward:delay-100 q1="[data-id=foo]" pos1="bottomright" q2="[data-id=bar]" pos2="topright" color="red" width="2" arc="0.3" seed="1" roughness="2" >Hey</FancyArrow>
<FancyArrow v-click="1" forward:delay-100 q2="[data-id=foo]" pos2="bottomleft" q1="[data-id=bar]" pos1="topleft" color="red" width="2" arc="0.3" seed="1" roughness="2" >
    <span text-red>Ahoy</span>
</FancyArrow>

<div v-click p-8 :class="$clicks === 0 ? 'translate-y--32' : $clicks === 1 ? 'translate-y--16' : ''">
    <span data-id="baz">Baz</span>
</div>

<FancyArrow v-click="2" forward:delay-100 q1="[data-id=bar]" pos1="bottomright" q2="[data-id=baz]" pos2="topright" color="green" width="2" arc="0.3" seed="1" roughness="2" >
    <span text-green v-mark.green="2">Hola!</span>
</FancyArrow>

---
clicks: 4
---

# Demo: dynamic positions

<div absolute left="50%" top="50%" translate-x="-50%" translate-y="-50%" data-id="center-anchor"></div>
<div absolute right-10 top="50%" translate-x="-50%" translate-y="-50%" data-id="right-anchor">Anchor</div>

<FancyArrow q1="[data-id=center-anchor]" :x2="$clicks % 2 === 0 ? 100 : 900" :y2="$clicks / 2 < 1 ? 100 : 500" :q2="$clicks > 3 ? '[data-id=right-anchor]' : undefined" />
