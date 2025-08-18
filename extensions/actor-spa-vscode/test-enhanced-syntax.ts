// Test file for enhanced Actor-SPA syntax highlighting
import { createMachine } from 'xstate';

// Mock functions for demonstration
function html(strings: TemplateStringsArray, ..._values: unknown[]): string {
  return strings.raw[0];
}

function css(strings: TemplateStringsArray, ..._values: unknown[]): string {
  return strings.raw[0];
}

// Mock data for template substitution
const userName = 'TestUser';
const userContext = { id: 1, role: 'user' };
const themeColor = '#4CAF50';
const spacing = { large: '2rem' };
const textColor = '#333';
const fontSize = 16;

// HTML Template with enhanced send attribute highlighting
const loginForm = html`
  <form class="login-form">
    <h2>Login</h2>
    <input type="text" placeholder="Username" />
    <input type="password" placeholder="Password" />

    <!-- Enhanced send attribute highlighting -->
    <button send="LOGIN_SUBMIT" type="submit">Login</button>
    <button send="RESET_FORM">Reset</button>
    <button send="FORGOT_PASSWORD">Forgot Password?</button>

    <!-- Send with modifiers -->
    <button send:delay="DELAYED_LOGIN" payload="user-data">Login Later</button>
    <button send:once="SINGLE_CLICK" payload="click-data">Click Once</button>

    <!-- Payload attribute -->
    <div payload="form-context">Context Data</div>
  </form>`;

// CSS Template with enhanced CSS highlighting
const loginStyles = css`
  .login-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    border-radius: 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }

  .login-form h2 {
    color: white;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }

  .login-form input {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .login-form button {
    width: 100%;
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
  }

  .login-form button:hover {
    background: #45a049;
  }

  /* Actor-SPA specific CSS classes */
  .state--idle {
    opacity: 0.6;
  }

  .state--loading {
    opacity: 0.8;
    pointer-events: none;
  }

  .state--error {
    border-color: #f44336;
    background-color: #ffebee;
  }

  .event--login-submit {
    background-color: #2196F3;
  }

  .event--reset-form {
    background-color: #FF9800;
  }

  .component--login-form {
    --primary-color: #4CAF50;
    --secondary-color: #2196F3;
    --error-color: #f44336;
  }

  /* CSS custom properties */
  :root {
    --login-form-width: 400px;
    --login-form-padding: 2rem;
    --login-button-color: #4CAF50;
  }

  .login-form {
    width: var(--login-form-width);
    padding: var(--login-form-padding);
  }

  .login-form button {
    background-color: var(--login-button-color);
  }`;

// XState machine with enhanced highlighting
const loginMachine = createMachine({
  id: 'login',
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOGIN_SUBMIT: 'authenticating',
        RESET_FORM: 'resetting',
        FORGOT_PASSWORD: 'forgot',
      },
    },
    authenticating: {
      on: {
        LOGIN_SUCCESS: 'authenticated',
        LOGIN_FAILURE: 'error',
      },
    },
    authenticated: {
      type: 'final',
    },
    error: {
      on: {
        RETRY: 'authenticating',
        RESET_FORM: 'idle',
      },
    },
    resetting: {
      on: {
        RESET_COMPLETE: 'idle',
      },
    },
    forgot: {
      on: {
        BACK_TO_LOGIN: 'idle',
        RESET_SENT: 'idle',
      },
    },
  },
});

// Mixed content with template substitution
const dynamicContent = html`
  <div class="dynamic-content">
    <h3>Welcome, ${userName}!</h3>
    <button send="LOG_OUT" payload="${userContext}">Logout</button>
  </div>`;

const dynamicStyles = css`
  .dynamic-content {
    background-color: ${themeColor};
    padding: ${spacing.large};
  }

  .dynamic-content h3 {
    color: ${textColor};
    font-size: ${fontSize}px;
  }`;

// Export to avoid unused variable warnings
export { loginForm, loginStyles, loginMachine, dynamicContent, dynamicStyles };
