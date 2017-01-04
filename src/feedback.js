/* globals document, html2canvas */
import defaultsDeep from 'lodash.defaultsdeep';

// import './feedback.scss';

const LittleFetch = function(baseUrl) {
  return {
    request: function(method, url, data) {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, `${baseUrl}${url}`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = () => {
          resolve({ data: xhr.responseText });
        };
        xhr.send(JSON.stringify(data));
      });
    },
    post: function(url, data) {
      return this.request('POST', url, data);
    }
  }
};

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
      serverUrl: '',
      postBrowserInfo: true,
      postHtml: true,
      postUrl: true,
    });

    this.body = document.querySelector('body');
    this.refs = {};
    this.canvas = null;
    this.server = LittleFetch(this.serverUrl);
  }

  setRefs() {
    this.refs.btn = document.getElementById('feedback-btn');
    this.refs.wrapper = document.getElementById('feedback-wrapper');
    this.refs.form = document.getElementById('feedback-form');
    this.refs.submitBtn = document.getElementById('feedback-submit-btn');
    this.refs.previewImg = document.getElementById('feedback-preview-img');
    this.refs.closeBtn = document.getElementById('feedback-close-btn');
  }

  postData() {
    const data = {};
    if (this.opts.postBrowserInfo) {
      data.browser = {};
      ['appCodeName', 'appName', 'appVersion', 'cookieEnabled', 'onLine', 'platform', 'userAgent'].forEach((key) => {
        data.browser[key] = navigator[key];
      });
      data.browser.plugins = [];
      for (const key of Object.keys(navigator.plugins)) {
        const plugin = navigator.plugins[key];
        data.browser.plugins.push(plugin.name);
      };
    }

    if (this.opts.postUrl) {
      data.url = document.URL;
    }

    if (this.opts.postHtml) {
      data.html = document.querySelector('html').innerHTML;
    }

    data.img = this.canvas.toDataURL();

    if (this.opts.serverUrl) {
      this.server.post('', data).then(() => {
        // success
        this.unmount();
        alert('Feedback submitted');
      }).catch((res) => {
        // fail
        alert('Error sending feedback');
      });
    } else {
      console.log(data);
    }
  }

  addHandlers() {
    this.refs.submitBtn.addEventListener('click', () => {
      this.postData();
    });
    this.refs.closeBtn.addEventListener('click', () => {
      this.unmount();
    });
  }

  screenshot() {
    html2canvas(this.body, {
      onrendered: (canvas) => {
        this.refs.previewImg.setAttribute('src', canvas.toDataURL());
        this.canvas = canvas;
      },
    })
  }

  getButton() {
    return `
    <div id="feedback-btn-wrapper" data-html2canvas-ignore>
      <a class="btn btn-default" id="feedback-btn">Feedback</a>
    </div>
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
            <label for="feedback-comment">Comment</label>
            <textarea class="form-control"></textarea>
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
