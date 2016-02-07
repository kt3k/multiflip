# multiflip v2.0.0

> Animation of dom, flipping its sections for showing and hiding the whole

***Note:*** This library depends on jQuery class-component and es6-promise.

# Usage

```js
<script src="jquery.min.js"></script>
<script src="multiflip.js"></script>
<script>
$(function () {
    $('.main').multiflip(8, 4, {unitDur: 500}).show().then(function (pp) {
        pp.$dom.click(function () {
            pp.hide();
        });
    });
});
</script>
```

### [demo](http://kt3k.github.io/multiflip/test.html) (chrome)

### [API doc](http://kt3k.github.io/multiflip/doc/v1.1.0/)
