var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
const assert = __importStar(require('node:assert'));
const vscode = __importStar(require('vscode'));
suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');
  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('actor-spa.actor-spa-framework'));
  });
  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('actor-spa.actor-spa-framework');
    if (extension) {
      await extension.activate();
      assert.strictEqual(extension.isActive, true);
    }
  });
  test('Should register actor-spa commands', async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('actor-spa.generateComponent'));
    assert.ok(commands.includes('actor-spa.generateMachine'));
  });
});
//# sourceMappingURL=extension.test.js.map
