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

### 🚧 In Progress

#### Task Group: CSS-Only Form Functionality
- [ ] **Implement CSS-only tab switching with ARIA** (2 hours)
  - [ ] Convert to radio button pattern with visually-hidden class
  - [ ] Add ARIA roles (tablist, tab, tabpanel)
  - [ ] Add aria-controls and aria-labelledby
  - [ ] Update CSS for :checked states
  - [ ] Reserve space for form-alert to prevent CLS
  - [ ] Test without JavaScript
  - [ ] Verify keyboard navigation

### 📋 Next Priority Tasks

#### Task Group: Mailchimp Newsletter Form
- [ ] **Configure Mailchimp for no-JS support** (1 hour)
  - [ ] Get form action URL and IDs from Mailchimp
  - [ ] Configure custom thank-you page redirect
  - [ ] Disable JavaScript in embedded form settings
  - [ ] Set up double opt-in if needed
  - [ ] Test redirect flow with JS disabled

- [ ] **Implement newsletter form HTML** (30 min)
  - [ ] Add Mailchimp action URL
  - [ ] Keep Mailchimp honeypot field
  - [ ] Add autocomplete and inputmode attributes
  - [ ] Add noscript message about redirect
  - [ ] Test submission to Mailchimp

#### Task Group: Contact Form with Server Endpoint
- [ ] **Set up contact form server endpoint** (2 hours)
  - [ ] Create /api/contact endpoint (Cloudflare Worker/Vercel/Netlify)
  - [ ] Integrate email service (Resend/Postmark/SES)
  - [ ] Add honeypot validation
  - [ ] Add timestamp validation for bot detection
  - [ ] Implement 303 redirects to thank-you pages
  - [ ] Test with and without JavaScript

- [ ] **Update contact form HTML** (30 min)
  - [ ] Change action to /api/contact
  - [ ] Add honeypot field (website input)
  - [ ] Add fieldset and legend for semantics
  - [ ] Add minlength/maxlength attributes
  - [ ] Add noscript fallback with direct email

#### Task Group: Progressive JavaScript Module
- [ ] **Implement minimal enhancement script** (1 hour)
  - [ ] Add js-enabled class (feature detection)
  - [ ] Prevent double form submissions
  - [ ] Add "Sending..." state to buttons
  - [ ] Tab focus management for accessibility
  - [ ] Keep under 1.5KB minified
  - [ ] Test with JS enabled/disabled

#### Task Group: Performance Optimization
- [ ] **Optimize JavaScript delivery** (2 hours)
  - [ ] Inline critical feature detection
  - [ ] Move enhancements to external file
  - [ ] Add defer attribute to script tags
  - [ ] Minify and compress JavaScript
  - [ ] Measure load impact

- [ ] **Add noscript fallbacks** (1 hour)
  - [ ] Add noscript message for critical features
  - [ ] Provide alternative instructions
  - [ ] Style noscript content appropriately
  - [ ] Test with JS disabled

#### Task Group: Testing & Validation
- [ ] **No-JavaScript testing** (2 hours)
  - [ ] Test all pages with JS disabled
  - [ ] Verify forms submit correctly
  - [ ] Check all navigation works
  - [ ] Validate mobile experience
  - [ ] Document any issues

- [ ] **Performance testing** (1 hour)
  - [ ] Measure JavaScript parse time
  - [ ] Check First Input Delay
  - [ ] Verify no layout shifts
  - [ ] Test on slow 3G connection
  - [ ] Record metrics

- [ ] **Accessibility testing** (1 hour)
  - [ ] Test with screen readers
  - [ ] Verify keyboard navigation
  - [ ] Check ARIA attributes
  - [ ] Test focus management

### 🔄 Backlog (Future Enhancements)
- [ ] Add service worker for offline support
- [ ] Implement lazy loading for images
- [ ] Add intersection observer for animations
- [ ] Create loading skeletons for async content
- [ ] Add web components for reusable elements

## Success Metrics
- [ ] All features work without JavaScript
- [ ] JavaScript bundle < 5KB minified
- [ ] First Input Delay < 100ms
- [ ] Time to Interactive < 3s on 3G
- [ ] Zero accessibility violations
- [ ] 100% keyboard navigable
- [ ] Forms submit successfully without JS

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
4. ⬜ JavaScript enhances experience
5. ⬜ Features degrade gracefully

## Priority Order
1. **Critical**: CSS-only form tabs (blocks no-JS users)
2. **High**: HTML5 form validation (improves UX)
3. **Medium**: Progressive JS module (enhances experience)
4. **Low**: Performance optimizations (already fast)

## Testing Checklist
- [ ] Disable JavaScript - site still works
- [ ] Disable CSS - content still readable
- [ ] Slow 3G - site loads under 3s
- [ ] Screen reader - all content accessible
- [ ] Keyboard only - fully navigable
- [ ] Print stylesheet - content prints well

## Notes
- Keep JavaScript optional, not required
- CSS can handle most interactions
- Server-side processing is the fallback
- Progressive enhancement > graceful degradation
- Accessibility is not optional
- Performance budget is strict (< 5KB JS)