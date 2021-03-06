import {
  css,
  customElement,
  html,
  LitElement,
  property,
  query
} from 'lit-element';
import DrawOperation
  from "../../generated/org/vaadin/maanpaa/data/entity/DrawOperation";
import Position from "../../generated/org/vaadin/maanpaa/data/entity/Position";
import {deserializeCanvas, serializeCanvas} from "./canvas-serializer";
import {update, updateCursors} from "../../generated/DrawEndpoint";
import "./user-cursor";
import CursorInfo
  from "../../generated/org/vaadin/maanpaa/data/entity/CursorInfo";
import "@vaadin/vaadin-text-field";

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

  private userId: string = Math.random() + '';
  private name: string = "Anonymous";

  private mousePosition: Position | undefined;

  private color: string = "#ffffff";
  private brushSize: number = 3;

  private pendingOps: DrawOperation[] = [];

  @property()
  private cursors: CursorInfo[] = [];

  private shouldAddSyncStateOp = false;

  async firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    this.ctx = this.canvas.getContext('2d');

    setInterval(() => this.syncWithServer(), 500);
    setInterval(() => this.addSyncStateOp(), 5000);
    setInterval(() => this.syncCursors(), 500);
  }

  render() {
    const {x: offsetX, y: offsetY} = this.canvas ? this.canvas.getBoundingClientRect() : {x: 0, y: 0};
    return html`
      <form>
        <vaadin-text-field
          label="Username"
          value="${this.name}"
          @value-changed="${(e:any) => this.name = e.detail.value}"
          >
        </vaadin-text-field>
        <br>
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
      </form>
      <br>

      ${this.cursors
        .filter(c => c.id !== this.userId)
        .filter(c => c.position)
        .map(c => html`
        <user-cursor
          name="${c.name}"
          x="${(c.position || {x:0}).x + offsetX}"
          y="${(c.position || {y:0}).y + offsetY}"
          color="${c.color}"
          userId="${c.id}"
        ></user-cursor>`)}

      <canvas id="canvas"
        width=${this.WIDTH}
        height=${this.HEIGHT}
        @mousemove="${this.onMousemove}"
        @mouseenter="${this.onMouseenter}"
        @mouseleave="${this.onMouseleave}"
        ondragstart="return false;" ondrop="return false;"
      ></canvas>
    `;
  }

  private pendingUpdate = false;
  private firstRequestSent = false;
  private syncWithServer() {
    if (this.pendingUpdate) {
      return;
    }
    this.pendingUpdate = true;
    update(this.pendingOps, !this.firstRequestSent).then(
        allOps => this.handleOpsFromServer(allOps));
    this.pendingOps = [];
    this.firstRequestSent = true;
  }

  private handleOpsFromServer(allOps: DrawOperation[]) {
    this.pendingUpdate = false;
    allOps.forEach(op => this.applyOperation(op))
    this.shouldAddSyncStateOp = allOps.length >= 100;
  }

  private onMousemove = (e: MouseEvent) => {
    const newMousePosition = this.getMousePosition(e);

    if (e.buttons === 1 && this.mousePosition) {

      const op: DrawOperation = {
        color: this.color,
        brushSize: this.brushSize,
        startPosition: this.mousePosition,
        endPosition: newMousePosition,
        state: ""
      }
      this.pendingOps = [...this.pendingOps, op];
      this.applyOperation(op);
    }
    this.mousePosition = newMousePosition;
  }

  private onMouseenter = (e: MouseEvent) => {
    this.mousePosition = this.getMousePosition(e);
  }

  private getMousePosition = (e: MouseEvent) => {
    const {x: offsetX, y: offsetY} =
        this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - offsetX,
      y: e.clientY - offsetY
    };
  }

  private onMouseleave = () => {
    this.mousePosition = undefined;
  }

  private isSyncState = (op: DrawOperation) => !!(op.state && op.state.length);

  private stateSynced = false;
  private applyOperation(op: DrawOperation) {
    if (this.isSyncState(op)) {
      if (!this.stateSynced) {
        deserializeCanvas(op.state, this.canvas);
        this.stateSynced = true;
      }
    } else {
      this.ctx.strokeStyle = op.color;
      this.ctx.lineWidth = (op.brushSize * 2) ** 2;
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(op.startPosition.x, op.startPosition.y);
      this.ctx.lineTo(op.endPosition.x, op.endPosition.y);
      this.ctx.stroke();
    }
  }

  private addSyncStateOp(): void {
    if (this.shouldAddSyncStateOp && !this.pendingOps.find(op => this.isSyncState(op))) {

      this.pendingOps.push({
        color: "",
        endPosition: {x: 0, y: 0},
        startPosition: {x: 0, y: 0},
        brushSize: 0,
        state: serializeCanvas(this.canvas)
      });

    }
  }

  private pendingCursorsUpdate = false;
  private syncCursors(): void {
    if (this.pendingCursorsUpdate) {
      return;
    }
    this.pendingCursorsUpdate = true;
    updateCursors({
      id: this.userId,
      color: this.color,
      name: this.name,
      position: this.mousePosition
    }).then(cursors => {
      this.pendingCursorsUpdate = false;
      this.cursors = cursors;
    });
  }

}
