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
var __importDefault =
  (this && this.__importDefault) || ((mod) => (mod && mod.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, '__esModule', { value: true });
exports.run = run;
const fs = __importStar(require('node:fs'));
const path = __importStar(require('node:path'));
const mocha_1 = __importDefault(require('mocha'));
function run() {
  // Create the mocha test
  const mocha = new mocha_1.default({
    ui: 'tdd',
    color: true,
  });
  const testsRoot = path.resolve(__dirname, '..');
  return new Promise((resolve, reject) => {
    try {
      // Simple approach: look for test files in the current directory
      const testFiles = fs
        .readdirSync(testsRoot)
        .filter((file) => file.endsWith('.test.js'))
        .map((file) => path.resolve(testsRoot, file));
      // Add files to the test suite
      for (const file of testFiles) {
        mocha.addFile(file);
      }
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
//# sourceMappingURL=index.js.map
