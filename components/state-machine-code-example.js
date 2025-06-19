class StateMachineCodeExample extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./components/state-machine-education.css">
      
      <div class="container">
        <div class="concept-section">
          <h3 class="concept-title">💻 Scaling Up: The Actor Model</h3>
          <p class="concept-description">
            Now that you understand state machines, let's see how to orchestrate multiple actors for complex apps. 
            Each actor runs independently, communicating only through messages:
          </p>
          <div class="code-example">
            <pre><code><span class="comment">// Now with multiple actors coordinating through an orchestrator!</span>
<span class="keyword">export const</span> <span class="constant">coffeeShopOrchestrator</span> = <span class="function">setup</span>({
  <span class="constant">actors</span>: {
    <span class="constant">customer</span>: customerMachine,  <span class="comment">// We already know how this works</span>
    <span class="constant">cashier</span>: cashierMachine,    <span class="comment">// Each actor has its own logic</span>
    <span class="constant">barista</span>: baristaMachine,    <span class="comment">// No shared state!</span>
    <span class="constant">messageLog</span>: messageLogMachine
  },
  <span class="constant">actions</span>: {
    <span class="constant">announceToShop</span>: ({ context, event }) => {
      <span class="comment">// Announce what's happening so everyone knows!</span>
      <span class="keyword">if</span> (event.message && context.messageLogActor) {
        context.messageLogActor.<span class="function">send</span>({ 
          <span class="constant">type</span>: <span class="string">'LOG_MESSAGE'</span>, 
          <span class="constant">message</span>: event.message 
        });
      }
    }
  }
}).<span class="function">createMachine</span>({
  <span class="constant">entry</span>: <span class="function">assign</span>({
    <span class="comment">// Spawn all actors when shop opens</span>
    <span class="constant">customerActor</span>: ({ spawn }) => <span class="function">spawn</span>(<span class="string">'customer'</span>, { <span class="constant">id</span>: <span class="string">'customer'</span> }),
    <span class="constant">cashierActor</span>: ({ spawn }) => <span class="function">spawn</span>(<span class="string">'cashier'</span>, { <span class="constant">id</span>: <span class="string">'cashier'</span> }),
    <span class="constant">baristaActor</span>: ({ spawn }) => <span class="function">spawn</span>(<span class="string">'barista'</span>, { <span class="constant">id</span>: <span class="string">'barista'</span> }),
    <span class="constant">messageLogActor</span>: ({ spawn }) => <span class="function">spawn</span>(<span class="string">'messageLog'</span>, { <span class="constant">id</span>: <span class="string">'messageLog'</span> })
  }),
  <span class="constant">on</span>: {
    <span class="comment">// Actors communicate through the orchestrator</span>
    <span class="string">'customer.WANTS_TO_ORDER'</span>: {
      <span class="constant">actions</span>: [
        <span class="string">'announceToShop'</span>,
        <span class="function">sendTo</span>(({ context }) => context.cashierActor, { <span class="constant">type</span>: <span class="string">'TAKE_ORDER'</span> })
      ]
    }
    <span class="comment">// ... more event routing</span>
  }
});</code></pre>
          </div>
          <p class="concept-description" style="margin-top: 20px;">
            <strong>Why Actor Model?</strong> Each actor is completely isolated, managing its own state and lifecycle. 
            They communicate only through events, making the system modular, testable, and scalable. 
            No shared state, no race conditions, just clean actor-to-actor communication.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="#projects" class="action-button">
              See Real World Examples →
            </a>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-code-example', StateMachineCodeExample);