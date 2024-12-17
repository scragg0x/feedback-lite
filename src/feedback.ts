/* globals document, html2canvas */
const dom = {
  createNode(tag: string, attrs: Record<string, string>, html: string) {
    const node = document.createElement(tag);
    for (const key of Object.keys(attrs)) {
      node.setAttribute(key, attrs[key]);
    }
    node.innerHTML = html;
    return node;
  },
};

interface FeedbackData {
  browser: Record<string, any>;
  html: string;
  img: string;
  url: string;
  note: string;
}

interface FeedbackOptions {
  includeBrowserInfo?: boolean;
  includeHtml?: boolean;
  includeUrl?: boolean;
  html2canvas?: any;
  onSubmit?: (data: FeedbackData) => void;
}

class Feedback {
  opts: FeedbackOptions;
  body: HTMLElement;
  refs: any;
  ssCanvas: any;
  clickX: number[];
  clickY: number[];
  clickDrag: boolean[];
  painting: boolean;
  context?: CanvasRenderingContext2D;

  constructor(opts: FeedbackOptions = {}) {
    this.opts = {
      includeBrowserInfo: true,
      includeHtml: true,
      includeUrl: true,
      html2canvas: (window as any).html2canvas,
      onSubmit: console.log,
      ...opts,
    };

    this.body = document.body;
    this.refs = {};
    this.ssCanvas = null;

    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.painting = false;
  }

  setRefs() {
    this.refs.btn = document.getElementById("feedback-btn");
    this.refs.wrapper = document.getElementById("feedback-wrapper");
    this.refs.form = document.getElementById("feedback-form");
    this.refs.submitBtn = document.getElementById("feedback-submit-btn");
    this.refs.previewImg = document.getElementById("feedback-preview-img");
    this.refs.closeBtn = document.getElementById("feedback-close-btn");
    this.refs.note = document.getElementById("feedback-note");
    this.refs.canvas = document.getElementById("feedback-canvas");

    this.refs.canvas.height = document.body.scrollHeight;
    this.refs.canvas.width = document.body.scrollWidth;

    this.refs.wrapper.style.width = document.body.scrollWidth + "px";
    this.refs.wrapper.style.height = document.body.scrollHeight + "px";

    this.refs.canvas.style.width = document.body.scrollWidth + "px";
    this.refs.canvas.style.height = document.body.scrollHeight + "px";

    this.context = this.refs.canvas.getContext("2d");
  }

  submitData() {
    const data: Partial<FeedbackData> = {};
    data.note = this.refs.note.value;
    if (this.opts.includeBrowserInfo) {
      data.browser = {};
      [
        "appCodeName",
        "appName",
        "appVersion",
        "cookieEnabled",
        "onLine",
        "platform",
        "userAgent",
      ].forEach((key) => {
        if (data.browser) {
          data.browser[key] = (navigator as any)[key];
        }
      });
      data.browser.plugins = [];
    }

    if (this.opts.includeUrl) {
      data.url = document.URL;
    }

    if (this.opts.includeHtml) {
      data.html = document.querySelector("html")?.innerHTML;
    }

    if (this.ssCanvas) {
      data.img = this.ssCanvas.toDataURL();
    }

    if (this.opts.onSubmit) {
      this.opts.onSubmit(data as FeedbackData);
    }
    this.unmount();
  }

  addHandlers() {
    this.refs.submitBtn.addEventListener("click", () => {
      this.submitData();
    });

    this.refs.closeBtn.addEventListener("click", () => {
      this.unmount();
    });

    this.refs.canvas.addEventListener("mousedown", (e: MouseEvent) => {
      this.painting = true;
      this.addClick(e.pageX, e.pageY);

      this.redraw();
    });

    this.refs.canvas.addEventListener("mousemove", (e: MouseEvent) => {
      if (this.painting) {
        this.addClick(e.pageX, e.pageY, true);
        this.redraw();
      }
    });

    ["mouseup", "mouseleave"].forEach((ev) => {
      this.refs.canvas.addEventListener(ev, () => {
        this.painting = false;
        this.screenshot();
      });
    });
  }

  redraw() {
    const { context, clickX, clickY, clickDrag } = this;
    if (!context) {
      return;
    }

    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

    context.strokeStyle = "red";
    context.lineJoin = "round";
    context.lineWidth = 5;

    for (let i = 0; i < clickX.length; i++) {
      context.beginPath();
      if (clickDrag[i] && i) {
        context.moveTo(clickX[i - 1], clickY[i - 1]);
      } else {
        context.moveTo(clickX[i] - 1, clickY[i]);
      }
      context.lineTo(clickX[i], clickY[i]);
      context.closePath();
      context.stroke();
    }
  }

  addClick(x: number, y: number, dragging = false) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
  }

  screenshot() {
    if (!this.opts.html2canvas) {
      return;
    }

    this.opts.html2canvas(this.body).then((canvas: HTMLCanvasElement) => {
      this.refs.previewImg.setAttribute("src", canvas.toDataURL());
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

  attach(el: HTMLElement) {
    el.addEventListener("click", () => {
      this.mount();
    });
  }

  showButton() {
    this.body.appendChild(
      dom.createNode("div", { id: "feedback-btn-wrapper" }, this.getButton())
    );

    const btn = document.getElementById("feedback-btn");
    if (btn) {
      this.attach(btn);
    }
  }

  mount() {
    this.body.appendChild(
      dom.createNode("div", { id: "feedback-wrapper" }, this.getWrapper())
    );
    this.setRefs();
    this.addHandlers();
    // Add small delay to allow UI to settle
    setTimeout(() => {
      this.screenshot();
    }, 500);
  }

  unmount() {
    this.refs.wrapper.parentNode.removeChild(this.refs.wrapper);
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
  }
}

export default Feedback;
