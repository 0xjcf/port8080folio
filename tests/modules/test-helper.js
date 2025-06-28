// Helper functions for syntax highlighting tests

export function extractHighlightedContent(element) {
    // For syntax highlighters that use shadow DOM
    if (element.shadowRoot) {
        // Clone the shadow root content to preserve styles
        const shadowContent = element.shadowRoot.innerHTML;
        
        // Extract the styles and code content
        const styleMatch = shadowContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        const codeElement = element.shadowRoot.querySelector('code, pre, .highlighted-code');
        
        if (codeElement && styleMatch) {
            // Return both styles and content for proper rendering
            return `<style>${styleMatch[1]}</style>${codeElement.outerHTML}`;
        } else if (codeElement) {
            return codeElement.outerHTML;
        }
        
        // Fallback - return full shadow content
        return shadowContent;
    }
    
    // For regular elements, return the innerHTML
    return element.innerHTML;
}

export function createTestContainer(html, title = '') {
    // Create a unique container ID for scoped styles
    const containerId = `test-container-${Math.random().toString(36).substr(2, 9)}`;
    
    // Extract any embedded styles and scope them to this container
    let scopedHtml = html;
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (styleMatch) {
        // Scope the styles to this container
        const scopedStyles = styleMatch[1].replace(/([^{]+){/g, (match, selector) => {
            // Don't scope keyframes or media queries
            if (selector.includes('@') || selector.includes(':root')) {
                return match;
            }
            return `#${containerId} ${selector.trim()} {`;
        });
        scopedHtml = html.replace(styleMatch[0], `<style>${scopedStyles}</style>`);
    }
    
    return `
        <div id="${containerId}" style="
            padding: 15px; 
            overflow: auto; 
            max-height: 350px;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 12px;
            line-height: 1.5;
            position: relative;
        ">
            ${scopedHtml}
        </div>
    `;
}

export function validateHighlighting(html) {
    if (!html || html.includes('Error:')) {
        return false;
    }
    
    // Check for basic highlighting indicators
    const hasSpans = html.includes('<span');
    const hasClasses = /class\s*=\s*["'][^"']*["']/.test(html);
    const hasStyles = /style\s*=\s*["'][^"']*["']/.test(html);
    
    return hasSpans && (hasClasses || hasStyles);
}

export async function waitForHighlighting(element, timeout = 200) {
    // Wait for the element to be fully rendered
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // For elements with async highlighting
    if (element.highlightingComplete) {
        await element.highlightingComplete;
    }
    
    // Additional wait for safety
    await new Promise(resolve => setTimeout(resolve, timeout));
}