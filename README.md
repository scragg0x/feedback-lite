Feedback Lite
=============

Small feedback library inspired by https://github.com/ivoviz/feedback
Gets screenshot, url, browser info, html, and comments from user.

Filesize minified/compressed: < 6KB

### Usage

```js
  var feedback = new Feedback({ onSubmit: function(data) {
    // do something
    console.log(data);
  } });
  feedback.showButton();
  // or
  feedback.attach(document.getElementById('my-feedback-btn'));
```

Use `feedback.showButton` to render a button or attach to your own with `feedback.attach`.

### Options

`onSubmit` <Function> Callback that receives feedback data object
`html2canvas` <Object> Pass html2canvas object. Default: `window.html2canvas`
`includeBrowserInfo`: <Bool> Default: true
`includeUrl`: <Bool> Default: true
`includeHtml`: <Bool> Default: true

### Returned Data

```
{
  browser <Object>
  html: <String>
  img: <String>
  url: <String>
}
```

### Development

```
npm install
// run weback dev server
npm start
// build dist
npm run build
```

### License

MIT
