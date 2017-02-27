# multiflip v5.1.2

> Animation of dom, flipping its sections for showing and hiding the whole

***Note:*** This library depends on jQuery class-component and es6-promise.

# Usage

Load jquery, class-component and multiflip, then put dom with the class name `multiflip`.

```js
<script src="path/to/jquery.js"></script>
<script src="path/to/class-component.js"></script>
<script src="path/to/multiflip.js"></script>

<div class="multiflip" m="8" n="4" unit-dur="400" bgcolor="#115588">
  <div class="content">Example</div>
</div>

<style>
.multiflip { width: 400px; height: 200px; }
</style>
```

The meaning of attrs:
- attr {number} m The horizontal partition number
- attr {number} n The vertical partition number
- attr {number} unit-dur The duration showing and hiding the unit chip. default 400
- attr {number} content-show-dur The duration of showing and hiding the content. default 400
- attr {string} bgcolor The background color

### [demo](http://kt3k.github.io/multiflip/test.html) (chrome)

# Install

Via npm:

    npm install multiflip

# License

MIT
