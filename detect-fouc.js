/**
 * Automated FOUC Detection using Puppeteer
 * Captures screenshots and measures style application timing
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function detectFOUC() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Set up performance tracking
    const metrics = {
        styleTiming: [],
        layoutShifts: [],
        screenshots: [],
        renderBlockingResources: []
    };
    
    // Enable CDP domains
    const client = await page.target().createCDPSession();
    await client.send('Performance.enable');
    await client.send('DOM.enable');
    await client.send('CSS.enable');
    
    // Track style recalculations
    await page.evaluateOnNewDocument(() => {
        window.__styleChanges = [];
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    window.__styleChanges.push({
                        time: performance.now(),
                        element: mutation.target.tagName,
                        attribute: mutation.attributeName
                    });
                }
            });
        });
        observer.observe(document.documentElement, {
            attributes: true,
            subtree: true,
            attributeOldValue: true
        });
    });
    
    // Track layout shifts
    await page.evaluateOnNewDocument(() => {
        if ('LayoutShift' in window) {
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        window.__layoutShifts = window.__layoutShifts || [];
                        window.__layoutShifts.push({
                            value: entry.value,
                            time: entry.startTime
                        });
                    }
                }
            }).observe({ entryTypes: ['layout-shift'] });
        }
    });
    
    // Navigate with screenshots
    console.log('📸 Capturing page load...');
    
    // Slow down to catch FOUC
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.emulateNetworkConditions({
        offline: false,
        downloadThroughput: 1.5 * 1024 * 1024 / 8,
        uploadThroughput: 750 * 1024 / 8,
        latency: 40
    });
    
    // Start navigation
    const startTime = Date.now();
    
    // Take screenshots during load
    const screenshotPromises = [];
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            screenshotPromises.push(
                page.screenshot({ 
                    path: `fouc-screenshots/frame-${i}.png`,
                    fullPage: false 
                }).catch(() => {})
            );
        }, i * 100);
    }
    
    await page.goto('http://localhost:8080', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
    });
    
    // Wait for all screenshots
    await Promise.all(screenshotPromises);
    
    // Collect metrics
    const performanceMetrics = await page.evaluate(() => {
        const paintMetrics = performance.getEntriesByType('paint');
        const resources = performance.getEntriesByType('resource');
        const cssResources = resources.filter(r => r.name.includes('.css'));
        
        return {
            firstPaint: paintMetrics.find(p => p.name === 'first-paint')?.startTime,
            firstContentfulPaint: paintMetrics.find(p => p.name === 'first-contentful-paint')?.startTime,
            cssLoadTime: cssResources[0]?.responseEnd,
            styleChanges: window.__styleChanges || [],
            layoutShifts: window.__layoutShifts || [],
            CLS: window.__layoutShifts?.reduce((sum, shift) => sum + shift.value, 0) || 0
        };
    });
    
    // Analyze results
    console.log('\n📊 FOUC Analysis Results:');
    console.log('========================');
    
    const foucDetected = [];
    
    // Check 1: CSS loads after first paint
    if (performanceMetrics.cssLoadTime > performanceMetrics.firstPaint) {
        foucDetected.push('CSS loaded AFTER first paint');
        console.log('❌ CSS loaded after first paint!');
        console.log(`   First Paint: ${performanceMetrics.firstPaint?.toFixed(0)}ms`);
        console.log(`   CSS Load: ${performanceMetrics.cssLoadTime?.toFixed(0)}ms`);
    } else {
        console.log('✅ CSS loaded before first paint');
    }
    
    // Check 2: Large gap between FP and FCP
    const gap = performanceMetrics.firstContentfulPaint - performanceMetrics.firstPaint;
    if (gap > 100) {
        foucDetected.push(`Large FP-FCP gap: ${gap.toFixed(0)}ms`);
        console.log(`⚠️  Large gap between FP and FCP: ${gap.toFixed(0)}ms`);
    } else {
        console.log('✅ Small FP-FCP gap');
    }
    
    // Check 3: Layout shifts
    if (performanceMetrics.CLS > 0.1) {
        foucDetected.push(`High CLS: ${performanceMetrics.CLS.toFixed(3)}`);
        console.log(`❌ High Cumulative Layout Shift: ${performanceMetrics.CLS.toFixed(3)}`);
        console.log(`   ${performanceMetrics.layoutShifts?.length || 0} shifts detected`);
    } else {
        console.log('✅ Low CLS');
    }
    
    // Check 4: Style mutations after paint
    const lateStyleChanges = performanceMetrics.styleChanges.filter(
        change => change.time > performanceMetrics.firstPaint
    );
    if (lateStyleChanges.length > 0) {
        foucDetected.push(`${lateStyleChanges.length} style changes after paint`);
        console.log(`⚠️  ${lateStyleChanges.length} style changes after first paint`);
    }
    
    // Final verdict
    console.log('\n🎯 FOUC Detection Result:');
    if (foucDetected.length > 0) {
        console.log('❌ FOUC DETECTED!');
        foucDetected.forEach(issue => console.log(`   - ${issue}`));
    } else {
        console.log('✅ No FOUC detected');
    }
    
    // Save detailed report
    const report = {
        timestamp: new Date().toISOString(),
        metrics: performanceMetrics,
        foucDetected,
        verdict: foucDetected.length > 0 ? 'FOUC_DETECTED' : 'CLEAN'
    };
    
    fs.writeFileSync('fouc-report.json', JSON.stringify(report, null, 2));
    console.log('\n📝 Detailed report saved to fouc-report.json');
    console.log('📸 Screenshots saved to fouc-screenshots/');
    
    await browser.close();
}

// Create screenshot directory
if (!fs.existsSync('fouc-screenshots')) {
    fs.mkdirSync('fouc-screenshots');
}

detectFOUC().catch(console.error);