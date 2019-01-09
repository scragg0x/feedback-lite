/* globals document, html2canvas */
import defaultsDeep from 'lodash.defaultsdeep';

// import './feedback.scss';

const dom = {
  createNode(tag, attrs, html) {
    const node = document.createElement(tag);
    for (const key of Object.keys(attrs)) {
      node.setAttribute(key, attrs[key]);
    }
    node.innerHTML = html;
    return node;
  }
};

class Feedback {
  constructor(opts = {}) {
    this.opts = defaultsDeep(opts, {
      includeBrowserInfo: true,
      includeHtml: true,
      includeUrl: true,
      html2canvas: window.html2canvas,
      onSubmit: console.log,
    });

    this.body = document.body;
    this.refs = {};
    this.ssCanvas = null;

    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.painting = false;
  }

  setRefs() {
    this.refs.btn = document.getElementById('feedback-btn');
    this.refs.wrapper = document.getElementById('feedback-wrapper');
    this.refs.form = document.getElementById('feedback-form');
    this.refs.submitBtn = document.getElementById('feedback-submit-btn');
    this.refs.previewImg = document.getElementById('feedback-preview-img');
    this.refs.closeBtn = document.getElementById('feedback-close-btn');
    this.refs.note = document.getElementById('feedback-note');
    this.refs.canvas = document.getElementById('feedback-canvas');

    this.refs.canvas.height = window.innerHeight;
    this.refs.canvas.width = window.innerWidth;

    this.context = this.refs.canvas.getContext('2d');
  }

  submitData() {
    const data = {};
    data.note = this.refs.note.value;
    if (this.opts.includeBrowserInfo) {
      data.browser = {};
      ['appCodeName', 'appName', 'appVersion', 'cookieEnabled', 'onLine', 'platform', 'userAgent'].forEach((key) => {
        data.browser[key] = navigator[key];
      });
      data.browser.plugins = [];
      for (const key of Object.keys(navigator.plugins)) {
        const plugin = navigator.plugins[key];
        data.browser.plugins.push(plugin.name);
      }
    }

    if (this.opts.includeUrl) {
      data.url = document.URL;
    }

    if (this.opts.includeHtml) {
      data.html = document.querySelector('html').innerHTML;
    }

    if (this.ssCanvas) {
      data.img = this.ssCanvas.toDataURL();
    }

    this.opts.onSubmit(data);
    this.unmount();
  }

  addHandlers() {
    this.refs.submitBtn.addEventListener('click', () => {
      this.submitData();
    });
    this.refs.closeBtn.addEventListener('click', () => {
      this.unmount();
    });

    this.refs.canvas.addEventListener('mousedown', (e) => {
      this.painting = true;
      this.addClick(e.pageX, e.pageY);

      this.redraw();
    });

    this.refs.canvas.addEventListener('mousemove', (e) => {
      if (this.painting) {
        this.addClick(e.pageX, e.pageY, true);
        this.redraw();
      }
    });

    ['mouseup', 'mouseleave'].forEach((ev) => {
      this.refs.canvas.addEventListener(ev, () => {
        this.painting = false;
        this.screenshot();
      });
    });
  }

  redraw() {
    const { context, clickX, clickY, clickDrag } = this;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

    context.strokeStyle = "red";
    context.lineJoin = "round";
    context.lineWidth = 5;

    for(let i = 0; i < clickX.length; i++) {
      context.beginPath();
      if (clickDrag[i] && i){
        context.moveTo(clickX[i - 1], clickY[i - 1]);
      } else {
        context.moveTo(clickX[i] - 1, clickY[i]);
      }
      context.lineTo(clickX[i], clickY[i]);
      context.closePath();
      context.stroke();
    }
  }

  addClick(x, y, dragging) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
  }

  screenshot() {
    if (!this.opts.html2canvas) {
      return;
    }

    this.opts.html2canvas(this.body).then((canvas) => {
      this.refs.previewImg.setAttribute('src', canvas.toDataURL());
      this.ssCanvas = canvas;
    });
  }

  getButton() {
    return `
      <a data-html2canvas-ignore class="btn btn-default" id="feedback-btn">Feedback</a>
    `;
  }

  getForm() {
    return `
     <div id="feedback-form" data-html2canvas-ignore>
       <div class="panel panel-default">
        <div class="panel-heading">Submit Feedback
          <button id="feedback-close-btn" type="button" class="close" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="panel-body">
         <div class="thumnbnail"><img id="feedback-preview-img"></div>

         <form>
          <div class="form-group">
            <label for="feedback-note">Comment</label>
            <textarea id="feedback-note" class="form-control"></textarea>
          </div>

          <input id="feedback-submit-btn" type="button" class="btn btn-default" value="Submit" />
         </form>
        </div>
      </div>
     </div>
    `;
  }

  getWrapper() {
    return `<div>
      <canvas id="feedback-canvas"></canvas>
      ${this.getForm()}
    </div>`;
  }

  attach(el) {
    el.addEventListener('click', () => {
      this.mount();
    });
  }

  showButton() {
    this.body.appendChild(dom.createNode('div', { id: 'feedback-btn-wrapper' }, this.getButton()));
    this.attach(document.getElementById('feedback-btn'));
  }

  mount() {
    this.body.appendChild(dom.createNode('div', { id: 'feedback-wrapper' }, this.getWrapper()));
    this.setRefs();
    this.addHandlers();
    // Add small delay to allow UI to settle
    setTimeout(() => { this.screenshot(); }, 500);
  }

  unmount() {
    this.refs.wrapper.parentNode.removeChild(this.refs.wrapper);
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
  }
}

module.exports = Feedback;
