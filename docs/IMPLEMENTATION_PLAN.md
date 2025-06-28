# Website Restructure Implementation Plan

## Project Overview
Transform the current single-page portfolio into a structured multi-page website while maintaining the 5 levels of market awareness on the home page and reducing excessive scrolling.

## Current State
- Single-page portfolio with coffee shop demo
- Long scrolling experience (user feedback: "too big")
- State machine education integrated into home page
- Working actor-based coffee shop demo

## Target Structure
```
/
├── index.html (Home - 5 levels of market awareness)
├── about/
├── blog/
├── case-studies/
└── resources/
```

## Implementation Phases

### Phase 1: Foundation (HIGH PRIORITY)
**Goal**: Create basic page structure and routing

#### 1.1 Create Page Structure
- [ ] Create `/about/` directory and index.html
- [ ] Create `/blog/` directory and index.html  
- [ ] Create `/case-studies/` directory and index.html
- [ ] Create `/resources/` directory and index.html

#### 1.2 Add Routing System
- [ ] Implement client-side routing or simple navigation
- [ ] Update all internal links to use new structure
- [ ] Add navigation header component

#### 1.3 Content Migration Planning
- [ ] Audit current home page content
- [ ] Map content to appropriate pages
- [ ] Identify what stays on home page (5 levels focus)

### Phase 2: Content Migration (HIGH PRIORITY)
**Goal**: Move content off home page while preserving core messaging

#### 2.1 Home Page Optimization
- [ ] Keep: Hero section (Problem Unaware → Solution Aware)
- [ ] Keep: Coffee shop demo (Product Aware → Most Aware)
- [ ] Keep: Essential state machine intro
- [ ] Keep: Contact form and newsletter
- [ ] Remove: Detailed technical explanations
- [ ] Remove: Extended project showcases

#### 2.2 About Page (/about/)
- [ ] Company/personal story
- [ ] Team information
- [ ] Mission and values
- [ ] Experience and credentials

#### 2.3 Case Studies Page (/case-studies/)
- [ ] Detailed project examples
- [ ] Before/after comparisons
- [ ] Technical implementation details
- [ ] Client testimonials

#### 2.4 Resources Page (/resources/)
- [ ] State machine concepts (moved from home)
- [ ] Tools and templates
- [ ] Guides and tutorials
- [ ] Code examples

#### 2.5 Blog Page (/blog/)
- [ ] Technical articles
- [ ] Industry insights
- [ ] How-to guides
- [ ] Framework for future content

### Phase 3: Optimization (MEDIUM PRIORITY)
**Goal**: Polish user experience and performance

#### 3.1 Home Page Refinement
- [ ] Optimize loading performance
- [ ] Ensure mobile responsiveness
- [ ] A/B test content order
- [ ] Validate 5 levels of market awareness flow

#### 3.2 Navigation Enhancement
- [ ] Add breadcrumbs
- [ ] Implement search functionality
- [ ] Add related content suggestions
- [ ] Mobile-friendly navigation

#### 3.3 SEO and Metadata
- [ ] Add meta tags for each page
- [ ] Implement structured data
- [ ] Optimize for search engines
- [ ] Add Open Graph tags

### Phase 4: Cleanup (MEDIUM PRIORITY)
**Goal**: Remove redundant code and optimize codebase

#### 4.1 Component Cleanup
- [ ] Remove unused components
- [ ] Consolidate similar functionality
- [ ] Optimize bundle size
- [ ] Update component imports

#### 4.2 Code Organization
- [ ] Organize components by page/feature
- [ ] Update file structure
- [ ] Clean up CSS dependencies
- [ ] Remove dead code

## Key Principles

### 5 Levels of Market Awareness (Home Page Focus)
1. **Problem Unaware**: Hero section with problem introduction
2. **Problem Aware**: Problem definition and pain points
3. **Solution Aware**: State machine solution introduction
4. **Product Aware**: Coffee shop demo showcase
5. **Most Aware**: CTA and contact information

### Content Strategy
- **Home Page**: Conversion-focused, awareness funnel
- **About Page**: Trust-building, credibility
- **Case Studies**: Social proof, detailed examples
- **Resources**: Value delivery, SEO content
- **Blog**: Thought leadership, ongoing content

## Success Metrics
- [ ] Reduce home page scroll time by 60%
- [ ] Maintain coffee shop demo prominence
- [ ] Improve page load performance
- [ ] Increase user engagement across pages
- [ ] Maintain SEO rankings

## Technical Considerations
- Preserve existing coffee shop demo functionality
- Maintain component-based architecture
- Ensure all XState implementations continue working
- Keep responsive design principles
- Maintain accessibility standards

## Rollback Plan
- Keep current index.html as backup
- Implement changes incrementally
- Test each phase before proceeding
- Maintain git history for easy rollback

## Notes
- Coffee shop demo stays on home page (critical for conversion)
- State machine education gets condensed on home, detailed on /resources/
- Navigation should be intuitive and fast
- Focus on mobile-first design
- Maintain current brand colors and styling