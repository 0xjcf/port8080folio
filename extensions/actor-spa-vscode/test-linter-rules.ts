/**
 * Test file for demonstrating template linter rules
 * This file contains examples that would trigger the prefer-extracted-templates rule
 */

// Mock template literal tag functions for testing
const html = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');
};

const css = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');
};

// ❌ BAD: Deeply nested template (3 levels) - would trigger linter warning
const deeplyNestedBad = html`
  <div class="container">
    ${items.map(
      (item) => html`
      <div class="item">
        <h3>${item.title}</h3>
        ${item.children.map(
          (child) => html`
          <div class="child">
            <span class="name">${child.name}</span>
            ${child.tags.map(
              (tag) => html`
              <span class="tag">${tag}</span>
            `
            )}
          </div>
        `
        )}
      </div>
    `
    )}
  </div>
`;

// ❌ BAD: Complex nested template with mixed types
const mixedNestedBad = html`
  <div class="styled-container">
    <style>
      ${css`
        .styled-container {
          ${
            isDarkMode
              ? css`
            background: #000;
            color: #fff;
          `
              : css`
            background: #fff;
            color: #000;
          `
          }
        }
      `}
    </style>
    ${content.map(
      (item) => html`
      <article>
        <h2>${item.title}</h2>
        ${item.sections.map(
          (section) => html`
          <section>
            <h3>${section.heading}</h3>
            <p>${section.text}</p>
          </section>
        `
        )}
      </article>
    `
    )}
  </div>
`;

// ✅ GOOD: Extracted template functions
const tagTemplate = (tag: string) => html`
  <span class="tag">${tag}</span>
`;

const childTemplate = (child: any) => html`
  <div class="child">
    <span class="name">${child.name}</span>
    ${child.tags.map(tagTemplate)}
  </div>
`;

const itemTemplate = (item: any) => html`
  <div class="item">
    <h3>${item.title}</h3>
    ${item.children.map(childTemplate)}
  </div>
`;

const deeplyNestedGood = html`
  <div class="container">
    ${items.map(itemTemplate)}
  </div>
`;

// ✅ GOOD: Simple two-level nesting is acceptable
const simpleTwoLevel = html`
  <ul class="list">
    ${items.map(
      (item) => html`
      <li>${item.name}</li>
    `
    )}
  </ul>
`;

// ✅ GOOD: Extracted complex styles
const darkModeStyles = css`
  background: #000;
  color: #fff;
`;

const lightModeStyles = css`
  background: #fff;
  color: #000;
`;

const containerStyles = css`
  .styled-container {
    ${isDarkMode ? darkModeStyles : lightModeStyles}
  }
`;

// ✅ GOOD: Extracted section template
const sectionTemplate = (section: any) => html`
  <section>
    <h3>${section.heading}</h3>
    <p>${section.text}</p>
  </section>
`;

const articleTemplate = (item: any) => html`
  <article>
    <h2>${item.title}</h2>
    ${item.sections.map(sectionTemplate)}
  </article>
`;

const mixedNestedGood = html`
  <div class="styled-container">
    <style>${containerStyles}</style>
    ${content.map(articleTemplate)}
  </div>
`;

// Example data (would normally come from elsewhere)
declare const items: any[];
declare const content: any[];
declare const isDarkMode: boolean;

// Export to avoid unused variable warnings
export { deeplyNestedBad, mixedNestedBad, deeplyNestedGood, simpleTwoLevel, mixedNestedGood };
