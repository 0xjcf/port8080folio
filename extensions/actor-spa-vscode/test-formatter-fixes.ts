// Test file to verify syntax highlighting and formatting fixes
import { createMachine } from 'xstate';

// Mock functions
export function html(strings: TemplateStringsArray, ..._values: unknown[]): string {
  return strings.raw[0];
}

export function css(strings: TemplateStringsArray, ..._values: unknown[]): string {
  return strings.raw[0];
}

// Test data
const userName = 'TestUser';
const userColor = '#4CAF50';
const padding = '1rem';

// Test HTML template - should have proper syntax highlighting
const testHtml = html`
<div class="container">
<h1>Welcome, ${userName}!</h1>
<button send="LOGIN_CLICK" payload="user-data">Login</button>
<button send:delay="DELAYED_ACTION">Delayed Action</button>
<form class="login-form">
<input type="text" placeholder="Username" />
<input type="password" placeholder="Password" />
</form>
</div>
`;

// Test CSS template - should have proper syntax highlighting
const testCss = css`
.container {
background-color: ${userColor};
padding: ${padding};
border-radius: 8px;
}

.login-form {
display: flex;
flex-direction: column;
gap: 1rem;
}

.login-form input {
padding: 0.5rem;
border: 1px solid #ddd;
border-radius: 4px;
}

.login-form button {
padding: 0.75rem;
background-color: #007bff;
color: white;
border: none;
border-radius: 4px;
cursor: pointer;
}

.login-form button:hover {
background-color: #0056b3;
}
`;

// Test XState machine
const testMachine = createMachine({
  id: 'test',
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOGIN_CLICK: 'authenticating',
        DELAYED_ACTION: 'processing',
      },
    },
    authenticating: {
      on: {
        SUCCESS: 'authenticated',
        FAILURE: 'error',
      },
    },
    authenticated: {
      type: 'final',
    },
    error: {
      on: {
        RETRY: 'authenticating',
      },
    },
    processing: {
      on: {
        COMPLETE: 'idle',
      },
    },
  },
});

// Export to avoid unused variable warnings
export { testHtml, testCss, testMachine };
