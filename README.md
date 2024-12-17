# Feedback Lite

Small feedback library inspired by https://github.com/ivoviz/feedback
Gets screenshot, url, browser info, html, and comments from user.

Filesize minified/compressed: ~6KB (html2canvas not included)

![screenshot](https://cloud.githubusercontent.com/assets/222611/21775345/511dcf0c-d65b-11e6-81c5-7de6d7abf1bc.png)

### Usage

```html
<script
  src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
  integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA=="
  crossorigin="anonymous"
  referrerpolicy="no-referrer"
></script>
<script>
  var feedback = new Feedback({
    onSubmit: function (data) {
      // do something
      console.log(data);
    },
  });
  feedback.showButton();
  // or
  // feedback.attach(document.getElementById('my-feedback-btn'));
</script>
```

Use `feedback.showButton` to render a button or attach to your own with `feedback.attach`.

### Options

- `onSubmit` <Function> Callback that receives feedback data object
- `html2canvas` <Object> Pass html2canvas object. Default: `window.html2canvas`
- `includeBrowserInfo`: <Bool> Default: true
- `includeUrl`: <Bool> Default: true
- `includeHtml`: <Bool> Default: true

### Returned Data

```typescript
interface FeedbackData {
  browser: Record<string, any>;
  html: string;
  img: string;
  url: string;
  note: string;
}
```

### Test / Demo

```
pnpm install
pnpm build
npm i -g http-server
http-server .
```

### License

MIT
