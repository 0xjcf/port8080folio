/**
 * Web Components Barrel Export
 * Atomic Design Pattern with Progressive Enhancement
 * All components render in light DOM for SEO
 * 
 * IMPORTANT: Each component should have its own file
 * This index maps out the expected structure after refactoring
 */

// ===========================
// ATOMS (Smallest Building Blocks)
// ===========================

// CORE ATOMS (from web-components-strategy.md)
// --------------------------------------------

// Form Enhancement Atoms (Core - Strategy Doc lines 23-29)
import { FormInput } from './atoms/form-input.js';
import { FormTextarea } from './atoms/form-textarea.js';
import { FormSelect } from './atoms/form-select.js';
import { FormCheckbox } from './atoms/form-checkbox.js';
import { FormRadio } from './atoms/form-radio.js';
import { FormValidate } from './atoms/form-validate.js';

// UI Element Atoms (Core - Strategy Doc lines 31-35, 50-51)
import { ThemeToggle } from './atoms/theme-toggle.js';
import { CopyButton } from './atoms/copy-button.js';
import { TooltipTip } from './atoms/tooltip-tip.js';
import { LoadingSpinner } from './atoms/loading-spinner.js';
import { ScrollIndicator } from './atoms/scroll-indicator.js';
import { BackToTop } from './atoms/back-to-top.js';

// EXTENDED ATOMS (Additional components we've created)
// ----------------------------------------------------

// Extended Form Atoms
import { FormCheckboxGroup } from './atoms/form-checkbox-group.js'; // TODO: Split from form-checkbox.ts
import { FormRadioButton } from './atoms/form-radio-button.js'; // TODO: Split from form-radio.ts
import { InputMask } from './atoms/input-mask.js';
import { CharCounter } from './atoms/char-counter.js';

// Extended UI Atoms  
import { CodeBlock } from './atoms/code-block.js'; // TODO: Split from copy-button.ts
import { TooltipProvider } from './atoms/tooltip-provider.js'; // TODO: Split from tooltip-tip.ts
import { LoadingButton } from './atoms/loading-button.js';
import { SkeletonLoader } from './atoms/skeleton-loader.js';
import { ProgressBar } from './atoms/progress-bar.js';

// Badge/Tag Atoms (CSS exists in badges.css)
import { BadgeTag } from './atoms/badge-tag.js';
import { TagElement } from './atoms/tag-element.js';
import { IconChip } from './atoms/icon-chip.js';
import { MetricElement } from './atoms/metric-element.js';

// Navigation Atoms (CSS exists in navigation.css)
import { NavToggle } from './atoms/nav-toggle.js';
import { ProgressNav } from './atoms/progress-nav.js';
import { ProgressDots } from './atoms/progress-dots.js';

// ===========================
// MOLECULES (Composed of Atoms)
// ===========================

// Content Block Molecules
import { TestimonialCard } from './molecules/testimonial-card.js';
import { TestimonialSlider } from './molecules/testimonial-slider.js'; // TODO: Split from testimonial-card.ts
import { ServiceCard } from './molecules/service-card.js';
import { KpiTile } from './molecules/kpi-tile.js';
import { KpiProgress } from './molecules/kpi-progress.js'; // TODO: Split from kpi-tile.ts
import { KpiChart } from './molecules/kpi-chart.js'; // TODO: Split from kpi-tile.ts
import { ProcessStep } from './molecules/process-step.js';
import { ProcessTimeline } from './molecules/process-timeline.js'; // TODO: Split from process-step.ts
import { TrustLogos } from './molecules/trust-logos.js';
import { SocialProof } from './molecules/social-proof.js';
import { TrustIndicator } from './molecules/trust-indicator.js'; // TODO: Split from social-proof.ts
import { ActivityFeed } from './molecules/activity-feed.js'; // TODO: Split from social-proof.ts

// Interactive Molecules
import { FormToggle } from './molecules/form-toggle.js';
import { StickyCta } from './molecules/sticky-cta.js';
import { FloatingContact } from './molecules/floating-contact.js'; // TODO: Split from sticky-cta.ts
import { NewsletterBar } from './molecules/newsletter-bar.js'; // TODO: Split from sticky-cta.ts

// ===========================
// ORGANISMS (Composed of Molecules + Atoms)
// ===========================

import { SiteHeader } from './organisms/site-header.js';
import { HeroSection } from './organisms/hero-section.js';
import { ServicesSection } from './organisms/services-section.js';
import { ContactSection } from './organisms/contact-section.js';
import { FooterSection } from './organisms/footer-section.js';

// ===========================
// EXPORT ALL COMPONENTS
// ===========================

export {
  // Atoms - Form
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormCheckboxGroup,
  FormRadio,
  FormRadioButton,
  FormValidate,
  InputMask,
  CharCounter,
  
  // Atoms - UI Elements
  ThemeToggle,
  CopyButton,
  CodeBlock,
  TooltipTip,
  TooltipProvider,
  LoadingSpinner,
  LoadingButton,
  SkeletonLoader,
  ProgressBar,
  BadgeTag,
  TagElement,
  IconChip,
  MetricElement,
  BackToTop,
  ScrollIndicator,
  NavToggle,
  ProgressNav,
  ProgressDots,
  
  // Molecules - Content
  TestimonialCard,
  TestimonialSlider,
  ServiceCard,
  KpiTile,
  KpiProgress,
  KpiChart,
  ProcessStep,
  ProcessTimeline,
  TrustLogos,
  SocialProof,
  TrustIndicator,
  ActivityFeed,
  
  // Molecules - Interactive
  FormToggle,
  StickyCta,
  FloatingContact,
  NewsletterBar,
  
  // Organisms
  SiteHeader,
  HeroSection,
  ServicesSection,
  ContactSection,
  FooterSection
};

// ===========================
// AUTO-REGISTRATION
// ===========================
// Components auto-register when imported
// No need to call customElements.define() manually

/**
 * Usage Example:
 * 
 * // In HTML (works without JS for basic content):
 * <section id="hero" class="hero">
 *   <h1>Title</h1>
 *   <p>Content</p>
 * </section>
 * 
 * // Progressive Enhancement (adds behavior):
 * <script type="module">
 *   import './components/index.js';
 *   // Components are now registered and will enhance matching elements
 * </script>
 */

/**
 * ATOMS ALIGNMENT WITH STRATEGY DOCUMENT
 * ========================================
 * 
 * CORE ATOMS (Required by web-components-strategy.md):
 * ✅ form-input.ts - Single component
 * ✅ form-textarea.ts - Single component  
 * ✅ form-select.ts - Single component
 * ✅ form-checkbox.ts - Single component (split completed)
 * ✅ form-radio.ts - Single component (split completed)
 * ✅ form-validate.ts - Single component (split completed)
 * ✅ theme-toggle.ts - Single component
 * ✅ copy-button.ts - Single component (split completed)
 * ✅ tooltip-tip.ts - Single component (split completed)
 * ✅ loading-spinner.ts - Single component (split completed)
 * ✅ scroll-indicator.ts - Single component
 * ✅ back-to-top.ts - Single component (after refactor)
 * 
 * EXTENDED ATOMS (Additional useful components):
 * ❌ badge-tag.ts - Has 5 components! (needs major split)
 * ✅ nav-toggle.ts - Created from back-to-top refactor
 * ✅ progress-nav.ts - Created from back-to-top refactor
 * ✅ progress-dots.ts - Single component (needs implementation)
 * 
 * CSS ALIGNMENT:
 * ✅ badges.css - Has styles for badge, icon-chip, metric elements
 * ✅ loading.css - Has styles for loading, progress, skeleton
 * ✅ navigation.css - Has styles for nav-toggle, scroll-indicator, back-to-top
 * ✅ Forms styles in molecules/forms.css
 * 
 * Component Refactoring Status:
 * 
 * COMPLETED:
 * ✅ back-to-top.ts - Refactored (extracted NavToggle, ProgressNav)
 * ✅ nav-toggle.ts - Created
 * ✅ progress-nav.ts - Created
 * ✅ scroll-indicator.ts - Already single component
 * ✅ loading-spinner.ts - Split into 4 separate files
 * ✅ loading-button.ts - Created from loading-spinner.ts
 * ✅ skeleton-loader.ts - Created from loading-spinner.ts
 * ✅ progress-bar.ts - Created from loading-spinner.ts
 * ✅ badge-tag.ts - Single component
 * ✅ tag-element.ts - Single component
 * ✅ icon-chip.ts - Single component  
 * ✅ metric-element.ts - Single component
 * ✅ form-checkbox-group.ts - Single component (created from split)
 * ✅ form-radio-button.ts - Single component (created from split)
 * ✅ input-mask.ts - Single component (created from split)
 * ✅ char-counter.ts - Single component (created from split)
 * ✅ code-block.ts - Single component (created from split)
 * ✅ tooltip-provider.ts - Single component (created from split)
 * 
 * TODO - Files with multiple components that need splitting:
 * 
 * ATOMS - ALL COMPLETED:
 * ✅ form-validate.ts - Split into: form-validate.ts, input-mask.ts, char-counter.ts
 * ✅ copy-button.ts - Split into: copy-button.ts, code-block.ts
 * ✅ form-checkbox.ts - Split into: form-checkbox.ts, form-checkbox-group.ts
 * ✅ form-radio.ts - Split into: form-radio.ts, form-radio-button.ts
 * ✅ tooltip-tip.ts - Split into: tooltip-tip.ts, tooltip-provider.ts
 * 
 * MOLECULES:
 * ❌ kpi-tile.ts - Contains: KpiTile, KpiProgress, KpiChart
 * ❌ process-step.ts - Contains: ProcessStep, ProcessTimeline (and duplicate TrustLogos, FormToggle?)
 * ❌ social-proof.ts - Contains: SocialProof, TrustIndicator, ActivityFeed
 * ❌ sticky-cta.ts - Contains: StickyCta, FloatingContact, NewsletterBar
 * ❌ testimonial-card.ts - Contains: TestimonialCard, TestimonialSlider
 * 
 * SINGLE COMPONENT FILES (Good):
 * ✅ form-input.ts
 * ✅ form-select.ts
 * ✅ form-textarea.ts
 * ✅ theme-toggle.ts
 * ✅ progress-dots.ts
 * ✅ form-toggle.ts (molecules)
 * ✅ service-card.ts (molecules)
 * ✅ trust-logos.ts (molecules)
 * ✅ All organism files
 */