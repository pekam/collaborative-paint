import { LitElement, html, css, customElement } from 'lit-element';

@customElement('paint-view')
export class PaintView extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  render() {
    return html`
      <br />
      Content placeholder
    `;
  }
}
