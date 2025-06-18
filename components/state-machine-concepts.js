class StateMachineConcepts extends HTMLElement {
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
        <div class="concept-section" style="margin-bottom: 3rem;">
          <h3 class="concept-title">🔄 The Problem: State Chaos</h3>
          <p class="concept-description">
            Traditional React/Vue apps scatter state everywhere - components, stores, hooks, contexts. 
            Each developer adds their own pattern. Soon you have race conditions, edge cases, and bugs 
            that only appear on Tuesdays. Sound familiar?
          </p>
          <div class="code-example">
            <pre><code><span class="comment">// The typical chaos - coffee shop with useState everywhere!</span>
<span class="keyword">const</span> <span class="function">CoffeeShopUI</span> = () => {
  <span class="keyword">const</span> [customerState, setCustomerState] = <span class="function">useState</span>(<span class="string">'browsing'</span>);
  <span class="keyword">const</span> [baristaState, setBaristaState] = <span class="function">useState</span>(<span class="string">'idle'</span>);
  <span class="keyword">const</span> [isPaid, setIsPaid] = <span class="function">useState</span>(<span class="constant">false</span>);
  <span class="keyword">const</span> [coffeeReady, setCoffeeReady] = <span class="function">useState</span>(<span class="constant">false</span>);
  
  <span class="comment">// 🐛 Bug #1: Multiple useEffects fighting each other</span>
  <span class="function">useEffect</span>(() => {
    <span class="keyword">if</span> (coffeeReady) {
      setCustomerState(<span class="string">'enjoying'</span>); <span class="comment">// What if they didn't pay?</span>
    }
  }, [coffeeReady]);
  
  <span class="comment">// 🐛 Bug #2: Race condition with payment</span>
  <span class="function">useEffect</span>(() => {
    <span class="keyword">if</span> (customerState === <span class="string">'ordering'</span> && !isPaid) {
      <span class="comment">// Start making coffee before payment confirmed</span>
      setBaristaState(<span class="string">'makingCoffee'</span>);
    }
  }, [customerState, isPaid]);
  
  <span class="comment">// 🐛 Bug #3: Cleanup? What cleanup?</span>
  <span class="function">useEffect</span>(() => {
    <span class="keyword">if</span> (baristaState === <span class="string">'makingCoffee'</span>) {
      <span class="comment">// No way to cancel if customer leaves!</span>
      setCoffeeReady(<span class="constant">true</span>);
    }
  }, [baristaState]);
  
  <span class="keyword">return</span> <span class="string">&lt;div&gt;{customerState}&lt;/div&gt;</span>; <span class="comment">// Good luck debugging this!</span>
};</code></pre>
          </div>
        </div>

        <div class="concept-section">
          <h3 class="concept-title">✨ The Solution: Actor-Based Architecture</h3>
          <p class="concept-description">
            What if each part of your app was a self-contained "actor" with its own brain? 
            No shared state. No race conditions. Just actors sending messages to each other, 
            like a well-orchestrated coffee shop where everyone knows their job.
          </p>
          <div class="code-example">
            <pre><code><span class="comment">// ✨ The Solution: Actor-Based Architecture</span>
<span class="comment">// Complete, working state machine - no magic!</span>
<span class="keyword">const</span> <span class="constant">customerMachine</span> = <span class="function">createMachine</span>({
  <span class="constant">id</span>: <span class="string">'customer'</span>,
  <span class="constant">initial</span>: <span class="string">'browsing'</span>,
  <span class="constant">states</span>: {
    <span class="constant">browsing</span>: { 
      <span class="constant">on</span>: { 
        <span class="constant">ORDER</span>: {
          <span class="constant">target</span>: <span class="string">'ordering'</span>,
          <span class="constant">actions</span>: <span class="function">sendParent</span>({
            <span class="constant">type</span>: <span class="string">'customer.WANTS_TO_ORDER'</span>,
            <span class="constant">message</span>: <span class="string">'☕ Customer: "I\'d like a cappuccino please!"'</span>
          })
        }
      } 
    },
    <span class="constant">ordering</span>: { 
      <span class="constant">on</span>: { <span class="constant">ORDER_CONFIRMED</span>: <span class="string">'paying'</span> } 
    },
    <span class="constant">paying</span>: { 
      <span class="constant">on</span>: { <span class="constant">PAYMENT_COMPLETE</span>: <span class="string">'waiting'</span> } 
    },
    <span class="constant">waiting</span>: { 
      <span class="constant">on</span>: { <span class="constant">RECEIVE_COFFEE</span>: <span class="string">'enjoying'</span> } 
    },
    <span class="constant">enjoying</span>: {
      <span class="comment">// Customer is happy! Maybe they'll order again?</span>
      <span class="constant">after</span>: {
        <span class="constant">5000</span>: <span class="string">'browsing'</span> <span class="comment">// Browse menu again after 5 seconds</span>
      }
    }
  }
});

<span class="comment">// In your React component - clean and simple!</span>
<span class="keyword">const</span> <span class="function">CoffeeShopUI</span> = () => {
  <span class="keyword">const</span> [state, send] = <span class="function">useMachine</span>(customerMachine);
  
  <span class="keyword">return</span> (
    <span class="string">&lt;div&gt;</span>
      <span class="string">&lt;h2&gt;Customer: {state.value}&lt;/h2&gt;</span>
      
      {state.<span class="function">matches</span>(<span class="string">'browsing'</span>) && (
        <span class="string">&lt;button onClick={() =&gt; send('ORDER')}&gt;</span>
          <span class="string">Order Coffee ☕</span>
        <span class="string">&lt;/button&gt;</span>
      )}
      
      {state.<span class="function">matches</span>(<span class="string">'ordering'</span>) && (
        <span class="string">&lt;button onClick={() =&gt; send('ORDER_CONFIRMED')}&gt;</span>
          <span class="string">Confirm Order ✓</span>
        <span class="string">&lt;/button&gt;</span>
      )}
      
      {state.<span class="function">matches</span>(<span class="string">'paying'</span>) && (
        <span class="string">&lt;button onClick={() =&gt; send('PAYMENT_COMPLETE')}&gt;</span>
          <span class="string">Complete Payment 💳</span>
        <span class="string">&lt;/button&gt;</span>
      )}
      
      {state.<span class="function">matches</span>(<span class="string">'waiting'</span>) && (
        <span class="string">&lt;div&gt;</span>
          <span class="string">&lt;p&gt;Waiting for coffee...&lt;/p&gt;</span>
          <span class="string">&lt;button onClick={() =&gt; send('RECEIVE_COFFEE')}&gt;</span>
            <span class="string">Receive Coffee ☕</span>
          <span class="string">&lt;/button&gt;</span>
        <span class="string">&lt;/div&gt;</span>
      )}
      
      {state.<span class="function">matches</span>(<span class="string">'enjoying'</span>) && (
        <span class="string">&lt;p&gt;☕ Enjoying coffee! (Will browse again soon...)&lt;/p&gt;</span>
      )}
    <span class="string">&lt;/div&gt;</span>
  );
};</code></pre>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-concepts', StateMachineConcepts);