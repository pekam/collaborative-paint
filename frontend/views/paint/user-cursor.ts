import {
  css,
  customElement,
  html,
  LitElement, property, PropertyValues,
} from 'lit-element';

@customElement('user-cursor')
export class UserCursor extends LitElement {
  static get styles() {
    return css`
      :host {
        position: absolute;
        height: 20px;
        background-color: var(--lumo-shade-50pct);
        border: 3px solid;
        border-bottom: none;
        border-right: none;
        user-select: none;
      }
      .name {
        white-space: nowrap;
        margin-left: 3px;
      }
    `;
  }
  @property()
  color: string = "#ffffff";
  @property()
  x: number = 0;
  @property()
  y: number = 0;
  @property()
  name: string = "";
  @property()
  userId: string = "";

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
  }

  render() {
    this.style.left = this.x + 'px';
    this.style.top = this.y + 'px';
    this.style.borderColor = this.color;
    return html`
      <div class="name">${this.name}</div>
    `;
  }
}
