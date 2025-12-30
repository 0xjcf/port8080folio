# Project Planning Documentation Generator Prompt

Use this prompt to generate comprehensive project planning documents for any development task:

---

## Prompt Template

```text

I need to implement [FEATURE/CHANGE DESCRIPTION]. Here is the context:

 

**Acceptance Criteria:**

[PASTE ACCEPTANCE CRITERIA HERE]

 

Please analyze the current codebase to understand:

1. Current implementation state - examine relevant files and components

2. Available libraries and dependencies from package.json

3. Existing patterns and architecture

 

Then create a plan in the plans/ directory structure:

 

1. Create a plans/[feature-name]/ directory

2. Generate three files in that directory:

   - **requirements.md** - Define the problem, acceptance criteria, affected components, current state, functional and non-functional requirements

   - **design.md** - Technical approach, implementation options, library analysis, proposed solution architecture, integration points, error handling strategy, performance considerations, browser compatibility

   - **task-list.md** - Detailed implementation phases with specific tasks, time estimates, dependencies, and risk mitigation

3. Add plans/ to .gitignore if not already present

 

Focus on:

- Clear problem definition and scope

- Technical feasibility analysis using existing codebase patterns

- Maintainable and scalable solutions that fit current architecture

- Comprehensive task breakdown with realistic time estimates

- Risk identification and mitigation strategies

```

---

## Example Usage

```text

I need to implement form validation for a user registration form. Here is the context:

 

**Acceptance Criteria:**

- Email field must be a valid email format

- Password must be at least 8 characters with uppercase, lowercase, and number

- Confirm password must match password field

- Display real-time validation errors

- Prevent form submission if validation fails

```

---

## Directory Structure

```text

project-root/

├── plans/

│   ├── feature-name-1/

│   │   ├── requirements.md

│   │   ├── design.md

│   │   └── task-list.md

│   ├── feature-name-2/

│   │   ├── requirements.md

│   │   ├── design.md

│   │   └── task-list.md

│   └── ...

├── .gitignore (includes plans/)

└── ...

```

## Document Structure Templates

### requirements.md Template

```markdown

# [Feature Name] Requirements

 

## Overview

[Brief description of what needs to be implemented]

 

## Acceptance Criteria

[List specific acceptance criteria]

 

## Affected Components/Files

[List files, components, or systems that will be modified]

 

## Current State

[Describe existing implementation]

 

## Requirements

[Numbered list of functional requirements]

 

## Non-Functional Requirements

[Performance, usability, maintainability requirements]

```

### design.md Template

```markdown

# [Feature Name] Design

 

## Technical Approach

[High-level approach description]

 

## Implementation Options

[Compare different approaches with pros/cons]

 

## Available Libraries Analysis

[Review relevant libraries and their capabilities]

 

## Proposed Solution Architecture

[Detailed technical design with code examples]

 

## Integration Points

[How this integrates with existing code]

 

## Error Handling Strategy

[How errors will be handled and displayed]

 

## Performance Considerations

[Performance impact and optimizations]

 

## Browser Compatibility

[Compatibility requirements and considerations]

```

### task-list.md Template

```markdown

# [Feature Name] Task List

 

## Phase 1: [Phase Name]

### Task 1.1: [Task Name]

- [ ] [Specific action item]

- [ ] [Specific action item]

- **Estimated Time**: [Time estimate]

 

## Phase 2: [Phase Name]

[Continue with phases and tasks...]

 

## Phase N: Documentation and Deployment

### Task N.1: Code Documentation

- [ ] Add JSDoc comments to new functions

- [ ] Update component documentation for changes

- [ ] Create Jira-formatted documentation for sharing

- **Estimated Time**: [Time estimate]

 

### Task N.2: Code Review and Deployment

- [ ] Submit pull request with changes

- [ ] Address code review feedback

- [ ] Deploy to test environment

- [ ] Verify functionality in test environment

- [ ] Monitor for any issues

- **Estimated Time**: [Time estimate]

 

## Total Estimated Time: [Total time]

 

## Dependencies

[List any dependencies or prerequisites]

 

## Risk Mitigation

[Identify risks and mitigation strategies]

```

---

## Setup Instructions

1. **Create plans/ directory**: `mkdir plans`

2. **Add to .gitignore**: Add `plans/` to your .gitignore file

3. **Create feature directory**: `mkdir plans/[feature-name]`

4. **Generate documents**: Use the prompt to create the three planning files

## Tips for Best Results

1. **Clear Acceptance Criteria**: Copy directly from Jira tickets or requirements documents

2. **Descriptive Feature Names**: Use clear directory names (e.g., form-validation, user-authentication, api-integration)

3. **Include Context Files**: Add relevant files to context (@package.json, @component-files) for better analysis

4. **Specify Constraints**: Mention any technical or business constraints in acceptance criteria

5. **Define Scope**: Clearly state what is and isn't included in the acceptance criteria

6. **Think End-to-End**: Include full user journey requirements in acceptance criteria

7. **Document for Sharing**: Always include a final documentation task to create Jira-formatted documentation using proper syntax (h2., h3., h4., {*}bold{*}, {{monospace}}, {code:language}, {quote}) for sharing implementation details with the team
