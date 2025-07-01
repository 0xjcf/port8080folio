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
  const [orderInProgress, setOrderInProgress] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [waitTime, setWaitTime] = useState(0);
  const [baristaError, setBaristaError] = useState(false);
  
  // 🐛 Bug #1: Multiple useEffects fighting each other
  useEffect(() => {
    if (coffeeReady) {
      setCustomerState('enjoying'); // What if they didn't pay?
      setOrderInProgress(false); // What if there's another order?
    }
  }, [coffeeReady]);
  
  // 🐛 Bug #2: Race condition with payment
  useEffect(() => {
    if (customerState === 'ordering' && !isPaid) {
      // Start making coffee before payment confirmed
      setBaristaState('makingCoffee');
      setOrderInProgress(true);
      
      // Forgot to handle payment failure!
      setTimeout(() => {
        if (Math.random() > 0.7) {
          setPaymentError('Card declined');
          // Barista already started making coffee!
        }
      }, 2000);
    }
  }, [customerState, isPaid]);
  
  // 🐛 Bug #3: Cleanup? What cleanup?
  useEffect(() => {
    if (baristaState === 'makingCoffee') {
      const timer = setTimeout(() => {
        setCoffeeReady(true);
        setBaristaState('idle');
      }, 5000);
      
      // Oops, forgot to clear timer if customer cancels!
      // return () => clearTimeout(timer);
    }
  }, [baristaState]);
  
  // 🐛 Bug #4: Impossible states everywhere
  useEffect(() => {
    if (isProcessingPayment && paymentError) {
      // How did we get here? Processing AND error?
      setCustomerState('confused');
    }
  }, [isProcessingPayment, paymentError]);
  
  // 🐛 Bug #5: State updates causing infinite loops
  useEffect(() => {
    if (waitTime > 30) {
      setCustomerState('angry');
      setWaitTime(0); // This might trigger other effects!
    }
  }, [waitTime, customerState]); // Missing dependency!
  
  const handleOrder = () => {
    // 🐛 Bug #6: No validation of current state
    setCustomerState('ordering');
    setOrderDetails({ type: 'cappuccino', size: 'large' });
    setIsProcessingPayment(true);
    
    // What if barista is on break?
    // What if we're already processing another order?
    // What if the shop is closed?
  };
  
  const handleCancel = () => {
    // 🐛 Bug #7: Incomplete state reset
    setCustomerState('browsing');
    setIsPaid(false);
    // Forgot: orderDetails, orderInProgress, baristaState, etc.
    // Barista keeps making the cancelled coffee!
  };
  
  return (
    &lt;div&gt;
      {/* UI with complex conditional logic */}
      {customerState === 'browsing' && !coffeeReady && !orderInProgress && (
        &lt;button onClick={handleOrder}&gt;
          Order Coffee
        &lt;/button&gt;
      )}
      
      {customerState === 'ordering' && !isPaid && !paymentError && (
        &lt;button onClick={() => setIsPaid(true)}&gt;
          Pay Now
        &lt;/button&gt;
      )}
      
      {/* 🐛 Bug #8: Impossible UI states */}
      {isPaid && !coffeeReady && baristaError && (
        &lt;p&gt;Your paid order failed... somehow?&lt;/p&gt;
      )}
      
      {/* 50 more conditional renders with edge cases... */}
    &lt;/div&gt;
  );
};
      </syntax-highlighter-with-themes>
    `;
  }
}

customElements.define('chaos-coffee-shop-code', ChaosCoffeeShopCode);