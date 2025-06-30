import '../ui/syntax-highlighter-with-themes.js';
import '../code-examples/chaos-coffee-shop.js';

class StateMachineConceptsEnhanced extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Calculate the base path using import.meta.url
    const componentPath = new URL(import.meta.url).pathname;
    const basePath = componentPath.substring(0, componentPath.indexOf('/src/'));
    const styleHref = `${basePath}/src/styles/state-machine-education.css`;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${styleHref}">
      
      <style>
        .problem-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin: 2rem 0;
        }
        
        @media (max-width: 768px) {
          .problem-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
      
      <div class="container">
        <!-- Bridge from Level 1 to Level 2 -->
        <p class="transition-text" style="text-align: center; color: var(--jasper); margin-bottom: 2rem; font-size: 1.1rem;">
          You want to ship features faster? Let's talk about what's really slowing you down...
        </p>
        
        <!-- Clear problem statements -->
        <div class="problems-list" style="margin-bottom: 3rem;">
          <h3 class="concept-title">🚨 The Daily Struggles You Know Too Well</h3>
          
          <div class="problem-grid">
            <div class="problem-item" style="background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%); border: 1px solid rgba(13, 153, 255, 0.2); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--jasper), transparent); opacity: 0.4;"></div>
              <h4 style="color: var(--jasper-light); margin-bottom: 0.5rem;">⏰ "This Should Take 2 Days..."</h4>
              <p style="color: var(--teagreen); line-height: 1.6; margin: 0;">
                ...turns into 2 weeks because changing one component breaks three others. 
                Every feature becomes an archaeological dig through scattered state logic.
              </p>
            </div>
            
            <div class="problem-item" style="background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%); border: 1px solid rgba(13, 153, 255, 0.2); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--jasper), transparent); opacity: 0.4;"></div>
              <h4 style="color: var(--jasper-light); margin-bottom: 0.5rem;">🐛 "It Works on My Machine"</h4>
              <p style="color: var(--teagreen); line-height: 1.6; margin: 0;">
                Race conditions that only happen in production. Edge cases you never tested. 
                Users finding impossible states that crash your app.
              </p>
            </div>
            
            <div class="problem-item" style="background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%); border: 1px solid rgba(13, 153, 255, 0.2); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--jasper), transparent); opacity: 0.4;"></div>
              <h4 style="color: var(--jasper-light); margin-bottom: 0.5rem;">😤 "Who Wrote This Code?"</h4>
              <p style="color: var(--teagreen); line-height: 1.6; margin: 0;">
                (It was you, 6 months ago.) State scattered across 12 useEffects, 
                boolean flags everywhere, and logic that makes senior devs cry.
              </p>
            </div>
            
            <div class="problem-item" style="background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%); border: 1px solid rgba(13, 153, 255, 0.2); border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(10px); position: relative; overflow: hidden;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--jasper), transparent); opacity: 0.4;"></div>
              <h4 style="color: var(--jasper-light); margin-bottom: 0.5rem;">🔥 "Just Ship It"</h4>
              <p style="color: var(--teagreen); line-height: 1.6; margin: 0;">
                Technical debt piling up. New developers afraid to touch anything. 
                Features taking longer and longer to ship as complexity grows.
              </p>
            </div>
          </div>
        </div>

        <div class="concept-section" style="margin-bottom: 3rem;">
          <h3 class="concept-title">💻 Here's What Your Code Probably Looks Like</h3>
          <p class="concept-description">
            Sound familiar? You're not alone. Here's the typical useState/useEffect chaos 
            that's slowing down teams everywhere:
          </p>
          
          <chaos-coffee-shop-code></chaos-coffee-shop-code>
        </div>

        <!-- Transition to solution -->
        <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: linear-gradient(135deg, rgba(13, 153, 255, 0.06) 0%, rgba(13, 153, 255, 0.02) 100%); border-radius: 16px; border: 1px solid rgba(13, 153, 255, 0.2); backdrop-filter: blur(10px); position: relative; overflow: hidden;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--jasper), transparent); opacity: 0.4;"></div>
          <p style="color: var(--teagreen); font-size: 1.2rem; margin-bottom: 1rem; font-weight: 600;">
            What if your state logic was visual, predictable, and impossible to break?
          </p>
          <p style="color: rgba(255, 255, 255, 0.7); font-style: italic;">
            Let me show you a better way...
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('state-machine-concepts-enhanced', StateMachineConceptsEnhanced);