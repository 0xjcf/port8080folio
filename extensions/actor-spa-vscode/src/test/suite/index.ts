import * as fs from 'node:fs';
import * as path from 'node:path';
import Mocha from 'mocha';

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
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
      mocha.run((failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
