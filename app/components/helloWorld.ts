class MyComponent extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
      <style>
        .module {
           padding: 2rem;
        }
      </style>
      <div class="module">
        <slot name="text"></slot>
      </div>
      `;
  }
}

customElements.define("my-component", MyComponent);
