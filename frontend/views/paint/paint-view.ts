import {LitElement, html, css, customElement, query} from 'lit-element';

@customElement('paint-view')
export class PaintView extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
      #canvas {
        border: 3px solid white;
        border-radius: 10px;
      }
    `;
  }

  private readonly WIDTH: number = 1000;
  private readonly HEIGHT: number = 1000;

  @query('#canvas')
  private canvas: any;
  private ctx: any;

  private mouseX: number = 0;
  private mouseY: number = 0;

  async firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    this.ctx = this.canvas.getContext('2d');
  }

  render() {
    return html`
      <canvas id="canvas"
        width=${this.WIDTH}
        height=${this.HEIGHT}
        @mousemove="${this.onMousemove}"
      ></canvas>
    `;
  }

  private onMousemove = (e: MouseEvent) => {
    if (e.buttons === 1) {
      const {x: offsetX, y: offsetY} =
          this.canvas.getBoundingClientRect();
      const {clientX: mouseX, clientY: mouseY} = e;
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 10;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(this.mouseX - offsetX,
          this.mouseY - offsetY);
      this.ctx.lineTo(mouseX - offsetX,
          mouseY - offsetY);
      this.ctx.stroke();
    }
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

}
