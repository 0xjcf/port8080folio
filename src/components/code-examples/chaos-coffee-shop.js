import '../ui/syntax-highlighter-with-themes.js';

class ChaosCoffeeShopCode extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <syntax-highlighter-with-themes language="jsx">
// The typical chaos - coffee shop with useState everywhere!
const CoffeeShopUI = () => {
  const [customerState, setCustomerState] = useState('browsing');
  const [baristaState, setBaristaState] = useState('idle');
  const [isPaid, setIsPaid] = useState(false);
  const [coffeeReady, setCoffeeReady] = useState(false);
  
  // 🐛 Bug #1: Multiple useEffects fighting each other
  useEffect(() => {
    if (coffeeReady) {
      setCustomerState('enjoying'); // What if they didn't pay?
    }
  }, [coffeeReady]);
  
  // 🐛 Bug #2: Race condition with payment
  useEffect(() => {
    if (customerState === 'ordering' && !isPaid) {
      // Start making coffee before payment confirmed
      setBaristaState('makingCoffee');
    }
  }, [customerState, isPaid]);
  
  // 🐛 Bug #3: Cleanup? What cleanup?
  useEffect(() => {
    if (baristaState === 'makingCoffee') {
      // No way to cancel if customer leaves!
      setCoffeeReady(true);
    }
  }, [baristaState]);
  
  return (
    &lt;div&gt;
      {/* UI with complex conditional logic */}
      {customerState === 'browsing' && !coffeeReady && (
        &lt;button onClick={() => setCustomerState('ordering')}&gt;
          Order Coffee
        &lt;/button&gt;
      )}
      {/* 50 more conditional renders... */}
    &lt;/div&gt;
  );
};
      </syntax-highlighter-with-themes>
    `;
  }
}

customElements.define('chaos-coffee-shop-code', ChaosCoffeeShopCode);