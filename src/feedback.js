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
    this.canvas = null;
  }

  setRefs() {
    this.refs.btn = document.getElementById('feedback-btn');
    this.refs.wrapper = document.getElementById('feedback-wrapper');
    this.refs.form = document.getElementById('feedback-form');
    this.refs.submitBtn = document.getElementById('feedback-submit-btn');
    this.refs.previewImg = document.getElementById('feedback-preview-img');
    this.refs.closeBtn = document.getElementById('feedback-close-btn');
    this.refs.note = document.getElementById('feedback-note');
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

    if (this.canvas) {
      data.img = this.canvas.toDataURL();
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
  }

  screenshot() {
    if (!this.opts.html2canvas) {
      return;
    }
    this.opts.html2canvas(this.body, {
      onrendered: (canvas) => {
        this.refs.previewImg.setAttribute('src', canvas.toDataURL());
        this.canvas = canvas;
      },
    });
  }

  getButton() {
    return `
      <a class="btn btn-default" id="feedback-btn">Feedback</a>
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
    this.screenshot();
  }

  unmount() {
    this.refs.wrapper.parentNode.removeChild(this.refs.wrapper);
  }
}

module.exports = Feedback;
