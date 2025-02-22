---
mdc: true
---

# Fancy Arrow

## Slidev addon for drawing arrows with <span v-mark.orange="0" id="fancy-styles">fancy styles</span>,

<span forward:delay-500 id="rough-js">powered by [Rough.js](https://roughjs.com).</span>

<FancyArrow id1="rough-js" pos1="bottomright" id2="fancy-styles" pos2="bottom" color="orange" width="3" arc="-0.3" seed="1" roughness="2" />

---

## Demo

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

<FancyArrow v-click="1" forward:delay-100 id1="foo" pos1="bottomleft" id2="bar" pos2="topleft" color="red" width="2" arc="-0.3" seed="1" roughness="2" >Hey</FancyArrow>
<FancyArrow v-click="1" forward:delay-100 id2="foo" pos2="bottomright" id1="bar" pos1="topright" color="red" width="2" arc="-0.3" seed="1" roughness="2" >
    <span text-red>Ahoy</span>
</FancyArrow>

<div v-click p-8 :class="$clicks === 0 ? 'translate-y--32' : $clicks === 1 ? 'translate-y--16' : ''">
    <span id="baz">Baz</span>
</div>

<FancyArrow v-click="2" forward:delay-100 id1="bar" pos1="bottomleft" id2="baz" pos2="topleft" color="green" width="2" arc="0.3" seed="1" roughness="2" >
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
