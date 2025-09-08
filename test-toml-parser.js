#!/usr/bin/env node

/**
 * Quick test to demonstrate the TOML parser improvement
 */

import * as toml from '@std/toml';
import * as fs from 'node:fs';

let wranglerContent;
try {
  wranglerContent = fs.readFileSync('./wrangler.toml', 'utf8');
} catch (error) {
  console.error(`Error reading wrangler.toml: ${error.message}`);
  process.exit(1);
}

console.log('🔍 Testing TOML Parser...\n');

try {
  const parsed = toml.parse(wranglerContent);
  
  console.log('✅ Successfully parsed TOML file!');
  console.log('\n📋 Top-level keys:', Object.keys(parsed));
  console.log('\n🔧 Base vars:', Object.keys(parsed.vars || {}));
  console.log('\n🌍 Environments:', Object.keys(parsed.env || {}));
  
  // Test dev environment parsing
  const devVars = {};
  if (parsed.vars) Object.assign(devVars, parsed.vars);
  if (parsed.env?.dev?.vars) Object.assign(devVars, parsed.env.dev.vars);
  
  console.log('\n🛠️  Dev environment variables:', Object.keys(devVars).length);
  
  // Test production environment parsing
  const prodVars = {};
  if (parsed.vars) Object.assign(prodVars, parsed.vars);
  if (parsed.env?.production?.vars) Object.assign(prodVars, parsed.env.production.vars);
  
  console.log('🚀 Production environment variables:', Object.keys(prodVars).length);
  
  console.log('\n✨ TOML parser is working correctly!');
  
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('❌ TOML parsing failed:', errorMessage);
  process.exit(1);
}
