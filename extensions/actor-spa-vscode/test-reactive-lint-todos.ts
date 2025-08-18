/**
 * Test file for reactive-lint TODO syntax highlighting
 * 
 * With the new uniform highlighting:
 * - The entire reactive-lint TODO comment should be highlighted uniformly
 * - Bold italic style for visibility
 * - Warm colors (orange/amber) for the entire comment
 * - The TODO keyword itself may have additional emphasis
 */

// Regular TODO comment (should use default TODO highlighting)
// TODO: This is a regular TODO

// Reactive-lint TODO comments (should have UNIFORM highlighting)
/* TODO [reactive-lint]: Replace boolean flags with machine states */
// TODO [reactive-lint]: Use send="EVENT_NAME" attribute in template

// Mixed with code
const example = {
  /* TODO [reactive-lint]: Replace loading boolean with states: idle | loading | success | error */
  loading: false,
  data: null,
};

// In a function
function processData() {
  // TODO [reactive-lint]: Use reactive refs instead of DOM queries
  const element = document.querySelector('.element');
  
  /* TODO [reactive-lint]: Use declarative event mapping through state machines instead of addEventListener */
  element?.addEventListener('click', () => {
    console.log('clicked');
  });
}

// Template example
const template = () => /* TODO [reactive-lint]: Extract to function extracted1234567890 */
html`
  <div>
    <h1>Hello World</h1>
    <!-- TODO [reactive-lint]: Use send attribute instead of onclick -->
    <button onclick="handleClick()">Click me</button>
  </div>
`;

// Edge cases
/* TODO [reactive-lint]: This is a multiline
   reactive-lint TODO that spans
   multiple lines */

// Inline comment with TODO
const value = 42; /* TODO [reactive-lint]: Replace magic number with constant */

// Multiple TODOs in one comment
/* TODO [reactive-lint]: Fix issue 1, TODO [reactive-lint]: Also fix issue 2 */

// Test all the different reactive-lint rule messages
/* TODO [reactive-lint]: Use reactive refs instead of DOM queries */
/* TODO [reactive-lint]: Use declarative event mapping through state machines */
/* TODO [reactive-lint]: Use template functions with state instead of DOM manipulation */
/* TODO [reactive-lint]: Use state machine delays/services instead of timers */
/* TODO [reactive-lint]: Use machine states instead of boolean flags in context */
/* TODO [reactive-lint]: Use data-state attribute instead of multiple data attributes */
/* TODO [reactive-lint]: Extract nested templates into separate functions */