Feedback Lite
========

Small feedback library inspired by https://github.com/ivoviz/feedback

### Usage

```js
  var feedback = new Feedback({ serverUrl: 'http://localhost'});
  feedback.showButton();
  // or
  feedback.attach(document.getElementById('my-feedback-btn'));
```

Use `feedback.showButton` to render a button or attach to your own with `feedback.attach`.


### Options

`serverUrl` (required) Post data to this URL.


### Post Data

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
