import * as assert from 'node:assert';
import { suite, test } from 'mocha';
import * as vscode from 'vscode';

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
