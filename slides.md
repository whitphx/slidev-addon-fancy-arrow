---
mdc: true
---

# Fancy Arrow

## Slidev addon for drawing arrows with <span v-mark.red id="fancy-styles">fancy styles</span>,

<span v-click id="rough-js">powered by [Rough.js](https://roughjs.com).</span>

<FancyArrow v-after id1="rough-js" pos1="bottomright" id2="fancy-styles" pos2="bottomleft" color="red" width="2" arc="-0.3" seed="1" roughness="2" />

---

## Slidev

<img src="https://sli.dev/logo.svg" class="w-10" id="slidev-logo" absolute top-20 left-20 />
<div bg-white fit-content absolute top-20 right-20>
    <img src="https://raw.githubusercontent.com/dcurtis/markdown-mark/refs/heads/master/svg/markdown-mark.svg" class="w-10" id="markdown-mark" />
</div>

<FancyArrow id1="slidev-logo" pos1="bottom" id2="slidev-text" pos2="bottom" color="teal" width="2" arc="-0.3" seed="1" roughness="2" />
<FancyArrow id1="markdown-mark" pos1="bottomright" id2="markdown-text" pos2="bottomleft" color="gray" width="2" arc="-0.3" seed="1" roughness="2" />

<div w="2/3" m-auto mt-32>
    <span id="slidev-text" v-mark.teal="0">Slidev</span> (slide + dev, /slaɪdɪv/) is a web-based slides maker and presenter. It's designed for developers to focus on writing content in <span id="markdown-text" v-mark.gray="0">Markdown</span>. With the power of web technologies like Vue, you are able to deliver pixel-perfect designs with interactive demos to your presentation.
</div>


---

### Snapped to animated elements

<div v-click p-8>
    <span id="foo">Foo</span>
</div>

<div :class="$clicks === 0 ? 'translate-y--16' : ''" p-8>
    <span id="bar">Bar</span>
</div>

<FancyArrow v-click="1" forward:delay-1000 id1="foo" pos1="bottomleft" id2="bar" pos2="topleft" color="red" width="2" arc="-0.3" seed="1" roughness="2" />

<div v-click p-8 :class="$clicks === 0 ? 'translate-y--32' : $clicks === 1 ? 'translate-y--16' : ''">
    <span id="baz">Baz</span>
</div>

<FancyArrow v-click="2" forward:delay-1000 id1="bar" pos1="bottomleft" id2="baz" pos2="topleft" color="green" width="2" arc="-0.3" seed="1" roughness="2" />
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
