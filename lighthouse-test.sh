#!/bin/bash

# Lighthouse Performance Testing Script
# Generates comprehensive reports for FOUC detection and performance

echo "🚀 Starting Lighthouse Performance Tests..."

# Create reports directory
mkdir -p lighthouse-reports

# Test 1: Navigation mode (full page load - best for FOUC detection)
echo "📊 Running Navigation test (detects FOUC)..."
npx lighthouse http://localhost:8080 \
  --output=json,html \
  --output-path=./lighthouse-reports/navigation \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --chrome-flags="--headless" \
  --preset=perf \
  --view

# Test 2: Desktop test
echo "💻 Running Desktop test..."
npx lighthouse http://localhost:8080 \
  --output=json,html \
  --output-path=./lighthouse-reports/desktop \
  --preset=desktop \
  --chrome-flags="--headless"

# Test 3: Trace with screenshots (shows FOUC frame-by-frame)
echo "📸 Capturing performance trace with screenshots..."
npx lighthouse http://localhost:8080 \
  --output=json,html \
  --output-path=./lighthouse-reports/trace \
  --emulated-form-factor=mobile \
  --throttling-method=simulate \
  --chrome-flags="--headless" \
  --extra-headers "{\"Cache-Control\":\"no-cache\"}" \
  --gather-mode \
  --save-assets

echo "✅ Tests complete! Check lighthouse-reports/ for results"
echo "📝 Look for:"
echo "   - CLS (Cumulative Layout Shift) > 0.1 indicates FOUC"
echo "   - Screenshots in trace showing style changes"
echo "   - Render-blocking resources warnings"