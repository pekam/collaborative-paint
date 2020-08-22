import {css, customElement, html, LitElement, query} from 'lit-element';
import DrawOperation
  from "../../generated/org/vaadin/maanpaa/data/entity/DrawOperation";
import {update} from "../../generated/DrawEndpoint";
import Position from "../../generated/org/vaadin/maanpaa/data/entity/Position";

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

  private mousePosition: Position = {x:0, y:0};

  private color: string = "#ffffff";
  private brushSize: number = 3;

  private pendingOps: DrawOperation[] = [];

  async firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    this.ctx = this.canvas.getContext('2d');

    setInterval(() => this.syncWithServer(), 500);
  }

  render() {
    return html`
      <label>Brush color:</label>
      <input type="color"
        value="${this.color}"
        @change="${(e:any) => this.color = e.target.value}"
      >
      <br>
      <label>Brush size:</label>
      <input type="range"
        min="1"
        max="5"
        value="${this.brushSize}"
        @change="${(e:any) => this.brushSize = e.target.value}"
      >
      <canvas id="canvas"
        width=${this.WIDTH}
        height=${this.HEIGHT}
        @mousemove="${this.onMousemove}"
        @mouseenter="${this.onMouseenter}"
      ></canvas>
    `;
  }

  private syncWithServer() {
    update(this.pendingOps).then(
        allOps => allOps.forEach(op => this.applyOperation(op)));
    this.pendingOps = [];
  }

  private onMousemove = (e: MouseEvent) => {
    if (e.buttons === 1) {
      const {x: offsetX, y: offsetY} =
          this.canvas.getBoundingClientRect();
      const {clientX: mouseX, clientY: mouseY} = e;

      const op: DrawOperation = {
        color: this.color,
        brushSize: this.brushSize,
        startPosition: {
          x: this.mousePosition.x - offsetX,
          y: this.mousePosition.y - offsetY
        },
        endPosition: {
          x: mouseX - offsetX,
          y: mouseY - offsetY
        }
      }
      this.pendingOps = [...this.pendingOps, op];
      this.applyOperation(op);
    }
    this.mousePosition = {x: e.clientX, y: e.clientY};
  }

  private onMouseenter = (e: MouseEvent) => {
    this.mousePosition = {x: e.clientX, y: e.clientY};
  }

  private applyOperation(op: DrawOperation) {
    this.ctx.strokeStyle = op.color;
    this.ctx.lineWidth = (op.brushSize * 2) ** 2;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(op.startPosition.x, op.startPosition.y);
    this.ctx.lineTo(op.endPosition.x, op.endPosition.y);
    this.ctx.stroke();
  }

}
