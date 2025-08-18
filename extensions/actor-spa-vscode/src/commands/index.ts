import * as vscode from 'vscode';

export async function generateComponent(): Promise<void> {
  const componentName = await vscode.window.showInputBox({
    prompt: 'Enter component name',
    placeHolder: 'MyComponent',
  });

  if (!componentName) {
    return;
  }

  const template = `import { setup, assign, type SnapshotFrom } from 'xstate';
import { html, createComponent } from '../framework/core/minimal-api';

const ${componentName.toLowerCase()}Machine = setup({
  types: {
    context: {} as { value: string },
    events: {} as { type: 'UPDATE'; value: string }
  },
  actions: {
    updateValue: assign({ value: ({ event }) => event.value })
  }
}).createMachine({
  id: '${componentName.toLowerCase()}',
  initial: 'idle',
  context: { value: '' },
  states: {
    idle: {
      on: {
        UPDATE: { actions: 'updateValue' }
      }
    }
  }
});

const ${componentName.toLowerCase()}Template = (state: SnapshotFrom<typeof ${componentName.toLowerCase()}Machine>) => {
  const { value } = state.context;
  return html\`
    <div class="${componentName.toLowerCase()}" data-state="\${state.value}">
      <h2>${componentName}</h2>
      <input 
        send="UPDATE" 
        value="\${value}" 
        aria-label="${componentName} input"
      />
      <p>Value: \${value}</p>
    </div>
  \`;
};

export const ${componentName.toLowerCase()}Component = createComponent({
  machine: ${componentName.toLowerCase()}Machine,
  template: ${componentName.toLowerCase()}Template
});
`;

  const document = await vscode.workspace.openTextDocument({
    content: template,
    language: 'typescript',
  });

  await vscode.window.showTextDocument(document);
}

export async function generateMachine(): Promise<void> {
  const machineName = await vscode.window.showInputBox({
    prompt: 'Enter machine name',
    placeHolder: 'myMachine',
  });

  if (!machineName) {
    return;
  }

  const template = `import { setup, assign } from 'xstate';

export const ${machineName} = setup({
  types: {
    context: {} as { 
      // Add your context properties here
    },
    events: {} as 
      | { type: 'START' }
      | { type: 'STOP' }
      | { type: 'RESET' }
  },
  actions: {
    // Add your actions here
    reset: assign(() => ({}))
  }
}).createMachine({
  id: '${machineName}',
  initial: 'idle',
  context: {
    // Initial context values
  },
  states: {
    idle: {
      on: {
        START: 'active'
      }
    },
    active: {
      on: {
        STOP: 'idle',
        RESET: { target: 'idle', actions: 'reset' }
      }
    }
  }
});
`;

  const document = await vscode.workspace.openTextDocument({
    content: template,
    language: 'typescript',
  });

  await vscode.window.showTextDocument(document);
}

export async function validateTemplate(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active editor');
    return;
  }

  const document = editor.document;
  const text = document.getText();

  // Find html template literals
  const templateRegex = /html`([^`]*)`/g;
  const issues: string[] = [];

  let match = templateRegex.exec(text);
  while (match !== null) {
    const content = match[1];

    // Basic validation
    if (!content.trim()) {
      issues.push('Empty template literal found');
    }

    if (content.includes('<button') && !content.includes('send=')) {
      issues.push('Button missing send attribute');
    }

    if (content.includes('<input') && !content.includes('aria-label')) {
      issues.push('Input missing aria-label');
    }

    match = templateRegex.exec(text);
  }

  if (issues.length === 0) {
    vscode.window.showInformationMessage('✅ No template issues found!');
  } else {
    vscode.window.showWarningMessage(
      `⚠️ Found ${issues.length} template issues:\n${issues.join('\n')}`
    );
  }
}
