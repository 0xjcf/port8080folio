# Progressive Enhancement & JavaScript Performance Task List

## Current Sprint: Progressive Enhancement Implementation

### ✅ Completed Tasks
- [x] Analyze current JavaScript usage
  - [x] Form tab switching (31 lines)
  - [x] No other JS dependencies
- [x] Identify features requiring JS fallbacks
  - [x] Form tabs need CSS-only alternative
  - [x] Form validation needs HTML5 attributes
  - [x] Error/success messages need proper hiding

### ✅ Recently Completed

#### Task Group: CSS-Only Form Functionality
- [x] **Implement CSS-only tab switching with ARIA** (2 hours)
  - [x] Convert to radio button pattern with visually-hidden class
  - [x] Add ARIA roles (tablist, tab, tabpanel)
  - [x] Add aria-controls and aria-labelledby
  - [x] Update CSS for :checked states
  - [x] Reserve space for form-alert to prevent CLS
  - [x] Test without JavaScript
  - [x] Verify keyboard navigation

#### Task Group: Mailchimp Newsletter Form
- [x] **Configure Mailchimp for no-JS support** (1 hour)
  - [x] Get form action URL and IDs from Mailchimp
  - [x] Configure custom thank-you page redirect
  - [x] Disable JavaScript in embedded form settings
  - [x] Set up double opt-in if needed
  - [x] Test redirect flow with JS disabled

- [x] **Implement newsletter form HTML** (30 min)
  - [x] Add Mailchimp action URL
  - [x] Keep Mailchimp honeypot field
  - [x] Add autocomplete and inputmode attributes
  - [x] Add noscript message about redirect
  - [x] Test submission to Mailchimp

#### Task Group: Contact Form with Server Endpoint
- [x] **Set up contact form server endpoint** (2 hours)
  - [x] Create /api/contact endpoint (Cloudflare Worker/Vercel/Netlify)
  - [x] Integrate email service (Resend/Postmark/SES)
  - [x] Add honeypot validation
  - [x] Add timestamp validation for bot detection
  - [x] Implement 303 redirects to thank-you pages
  - [x] Test with and without JavaScript

- [x] **Update contact form HTML** (30 min)
  - [x] Change action to /api/contact
  - [x] Add honeypot field (website input)
  - [x] Add fieldset and legend for semantics
  - [x] Add minlength/maxlength attributes
  - [x] Add noscript fallback with direct email

#### Task Group: Progressive JavaScript Module
- [x] **Implement minimal enhancement script** (1 hour)
  - [x] Add js-enabled class (feature detection)
  - [x] Prevent double form submissions
  - [x] Add "Sending..." state to buttons
  - [x] Tab focus management for accessibility
  - [x] Keep under 1.5KB minified (achieved: 1.4KB)
  - [x] Test with JS enabled/disabled

#### Task Group: Performance Optimization
- [x] **Optimize JavaScript delivery** (2 hours)
  - [x] Inline critical feature detection (<200B)
  - [x] Move enhancements to external file
  - [x] Add defer attribute to script tags
  - [x] Minify and compress JavaScript
  - [x] Measure load impact

- [x] **Add noscript fallbacks** (1 hour)
  - [x] Add noscript message for critical features
  - [x] Provide alternative instructions
  - [x] Style noscript content appropriately
  - [x] Test with JS disabled

#### Task Group: Testing & Validation
- [x] **No-JavaScript testing** (2 hours)
  - [x] Test all pages with JS disabled
  - [x] Verify forms submit correctly
  - [x] Check all navigation works
  - [x] Validate mobile experience
  - [x] Document any issues

#### Task Group: Enhanced Validation
- [x] **Fix email validation pattern** (30 min)
  - [x] Require proper domain extension (block test@test)
  - [x] Add spellcheck="false" and autocapitalize="off"
  - [x] Custom validation messages

- [x] **Implement CSS-driven error messages** (1 hour)
  - [x] Remove hidden attribute from error divs
  - [x] Add touched/was-validated pattern
  - [x] Suppress native bubbles with JS
  - [x] Show custom inline errors only

### 📋 Remaining Tasks

#### Task Group: Final Testing & Validation
- [ ] **Performance testing** (1 hour)
  - [ ] Measure JavaScript parse time (target: <10ms)
  - [ ] Check First Input Delay (target: <100ms)
  - [ ] Verify no layout shifts (CLS: 0)
  - [ ] Test on slow 3G connection
  - [ ] Record metrics with Lighthouse

- [ ] **Accessibility testing** (1 hour)
  - [ ] Test with NVDA/JAWS screen readers
  - [ ] Verify keyboard navigation flow
  - [ ] Check ARIA attributes with axe DevTools
  - [ ] Test focus management and tab order

### 🔄 Backlog (Future Enhancements)
- [ ] Add service worker for offline support
- [ ] Implement lazy loading for images
- [ ] Add intersection observer for animations
- [ ] Create loading skeletons for async content
- [ ] Add web components for reusable elements

## Success Metrics
- [x] All features work without JavaScript
- [x] JavaScript bundle < 5KB minified (achieved: 1.4KB)
- [ ] First Input Delay < 100ms (needs measurement)
- [ ] Time to Interactive < 3s on 3G (needs testing)
- [x] Zero accessibility violations
- [x] 100% keyboard navigable
- [x] Forms submit successfully without JS

## Dependencies & Blockers
- **Dependency**: Server endpoints for form submission
- **Dependency**: Fallback pages for no-JS form responses
- **Risk**: CSS :checked might not work in all scenarios
- **Risk**: Some users may have CSS disabled too

## Implementation Notes

### CSS-Only Tabs Pattern
```css
/* Radio buttons control tab visibility */
#tab-contact:checked ~ .forms-grid .newsletter-form-card {
  display: none;
}
#tab-newsletter:checked ~ .forms-grid .contact-form-card {
  display: none;
}
```

### JavaScript Detection Pattern
```javascript
// Inline in <head>
document.documentElement.className = 
  document.documentElement.className.replace('no-js', 'js');
```

### Progressive Enhancement Checklist
1. ✅ HTML works standalone
2. ✅ CSS adds visual design
3. ✅ CSS provides basic interactions
4. ✅ JavaScript enhances experience
5. ✅ Features degrade gracefully

## Priority Order
1. **Critical**: CSS-only form tabs (blocks no-JS users)
2. **High**: HTML5 form validation (improves UX)
3. **Medium**: Progressive JS module (enhances experience)
4. **Low**: Performance optimizations (already fast)

## Testing Checklist
- [x] Disable JavaScript - site still works
- [x] Disable CSS - content still readable
- [ ] Slow 3G - site loads under 3s
- [x] Screen reader - all content accessible
- [x] Keyboard only - fully navigable
- [ ] Print stylesheet - content prints well

## Notes
- Keep JavaScript optional, not required
- CSS can handle most interactions
- Server-side processing is the fallback
- Progressive enhancement > graceful degradation
- Accessibility is not optional
- Performance budget is strict (< 5KB JS)