# patapata v1.1.0

> Animation of dom, flipping its sections for showing and hiding the whole

***Note:*** This library depends on jQuery and es6-promise.

# Usage

```js
<script src="jquery.min.js"></script>
<script src="patapata.js"></script>
<script>
$(function () {
    $('.main').patapata(8, 4, {unitDur: 500}).show().then(function (pp) {
        pp.$dom.click(function () {
            pp.hide();
        });
    });
});
</script>
```

### [demo](http://kt3k.github.io/info-pane/test.html) (chrome)

### [API doc](http://kt3k.github.io/info-pane/doc/v1.1.0/)
