import { customElement, html, LitElement, query, unsafeCSS } from 'lit-element';

import '@vaadin/vaadin-button/vaadin-button';
import '@vaadin/vaadin-form-layout/vaadin-form-item';
import '@vaadin/vaadin-form-layout/vaadin-form-layout';
import '@vaadin/vaadin-grid/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-column';
import '@vaadin/vaadin-notification/vaadin-notification';
import '@vaadin/vaadin-ordered-layout/vaadin-horizontal-layout';
import '@vaadin/vaadin-split-layout/vaadin-split-layout';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import { until } from 'lit-html/directives/until';

import { EndpointError } from '@vaadin/flow-frontend/Connect';

// import the remote endpoint
import * as PersonEndpoint from '../../generated/PersonEndpoint';

// import types used in the endpoint
import Person from '../../generated/org/vaadin/maanpaa/data/entity/Person';

// utilities to import style modules
import { CSSModule } from '@vaadin/flow-frontend/css-utils';

import styles from './foo-view.css';

@customElement('foo-view')
export class FooViewElement extends LitElement {
  static get styles() {
    return [CSSModule('lumo-typography'), unsafeCSS(styles)];
  }

  @query('#grid')
  private grid: any;

  @query('#notification')
  private notification: any;

  @query('#firstName') private firstName: any;

  @query('#lastName') private lastName: any;

  @query('#email') private email: any;

  @query('#password') private password: any;

  private gridDataProvider = this.getGridData.bind(this);

  private employeeId: any;

  render() {
    return html`
      <vaadin-split-layout class="full-size">
        <div class="grid-wrapper">
          <vaadin-grid
            id="grid"
            class="full-size"
            theme="no-border"
            .size="${until(this.getGridDataSize(), 0)}"
            .dataProvider="${this.gridDataProvider}"
          >
            <vaadin-grid-column path="firstName" header="First Name"></vaadin-grid-column>
            <vaadin-grid-column path="lastName" header="Last Name"></vaadin-grid-column>
            <vaadin-grid-column path="email" header="Email"></vaadin-grid-column>
          </vaadin-grid>
        </div>

        <div id="editor-layout">
          <vaadin-form-layout>
            <vaadin-form-item>
              <label slot="label">First Name</label>
              <vaadin-text-field class="full-width" id="firstName"></vaadin-text-field>
            </vaadin-form-item>
            <vaadin-form-item>
              <label slot="label">Last Name</label>
              <vaadin-text-field class="full-width" id="lastName"></vaadin-text-field>
            </vaadin-form-item>
            <vaadin-form-item>
              <label slot="label">Email</label>
              <vaadin-text-field class="full-width" id="email"></vaadin-text-field>
            </vaadin-form-item>
            <vaadin-form-item>
              <label slot="label">Password</label>
              <vaadin-password-field class="full-width" id="password"></vaadin-password-field>
            </vaadin-form-item>
          </vaadin-form-layout>
          <vaadin-horizontal-layout id="button-layout" theme="spacing">
            <vaadin-button theme="tertiary" @click="${this.clearForm}">
              Cancel
            </vaadin-button>
            <vaadin-button theme="primary" @click="${this.save}">
              Save
            </vaadin-button>
          </vaadin-horizontal-layout>
        </div>
      </vaadin-split-layout>
      <vaadin-notification duration="5000" id="notification"> </vaadin-notification>
    `;
  }

  async getGridDataSize() {
    return await PersonEndpoint.count();
  }
  async getGridData(params: any, callback: any) {
    const index = params.page * params.pageSize;
    const data = await PersonEndpoint.list(index, params.pageSize);
    callback(data);
  }

  // Wait until all elements in the template are ready to set their properties
  async firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);

    this.grid.addEventListener('active-item-changed', (event: CustomEvent) => {
      const item: Person = event.detail.value as Person;
      this.grid.selectedItems = item ? [item] : [];

      if (item) {
        this.firstName.value = item.firstName;
        this.lastName.value = item.lastName;
        this.email.value = item.email;
        this.password.value = '----';
        this.employeeId = item.id;
      } else {
        this.clearForm();
      }
    });
  }

  private async save() {
    const employee: Person = {
      id: this.employeeId,
      email: this.email.value,
      firstName: this.firstName.value,
      lastName: this.lastName.value,
    };
    try {
      await PersonEndpoint.update(employee);
    } catch (error) {
      if (error instanceof EndpointError) {
        this.notification.renderer = (root: Element) => {
          root.textContent = `Server error. ${error.message}`;
        };
        this.notification.open();
      } else {
        throw error;
      }
    }
  }

  private clearForm() {
    this.grid.selectedItems = [];
    this.firstName.value = '';
    this.lastName.value = '';
    this.email.value = '';
    this.password.value = '';
    this.employeeId = '';
  }
}
