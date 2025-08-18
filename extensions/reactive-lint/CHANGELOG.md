# Changelog

All notable changes to the Reactive Lint project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-07-08

### Added
- **Working Reporter System**: Fixed all three output formats (Pretty, JSON, SARIF)
  - Pretty reporter with colorized console output, icons, and human-readable formatting
  - JSON reporter with structured machine-readable data for CI/CD integration
  - SARIF reporter compatible with GitHub Security tab and other SARIF tools
- **Comprehensive CLI Interface**: Full command-line functionality
  - Multiple output format support (`--format pretty|json|sarif`)
  - Rules documentation command (`reactive-lint rules`)
  - Proper exit codes for CI/CD integration
  - Verbose mode and configuration options
- **Event-Driven Architecture**: Fixed event bus integration
  - Resolved duplicate output issues
  - Proper event listener setup and teardown
  - Real-time violation reporting during scan
- **Performance Metrics**: Added timing and statistics
  - Scan duration tracking
  - Files scanned count
  - Rules executed count
  - Violation categorization (errors/warnings/info)

### Fixed
- **Duplicate Output Bug**: Removed duplicate event listener registration
- **Silent Failures**: All reporters now properly output results to console
- **CLI Configuration**: Fixed reporter creation and config merging
- **Event Bus Stats**: Proper violation counting and categorization
- **Duration Calculation**: Fixed NaN duration issues

### Changed
- **Reporter Architecture**: Moved event listener setup from constructors to explicit calls
- **Output Format**: Enhanced pretty output with better formatting and icons
- **Error Handling**: Improved error reporting and debugging information

### Technical Details
- Fixed event listener duplication in reporter constructors
- Added proper console output to all reporter methods
- Improved CLI argument parsing and config merging
- Enhanced event bus statistics tracking
- Better error handling and debugging support

## [1.0.0] - 2025-07-08

### Added
- **Initial Release**: AST-based reactive pattern linter for Actor-SPA framework
- **Core Rules Engine**: 7 comprehensive rules for detecting anti-patterns
  - `no-dom-query`: Detect direct DOM queries (querySelector, getElementById, etc.)
  - `no-event-listeners`: Detect manual event listener management
  - `no-dom-manipulation`: Detect direct DOM manipulation
  - `no-timers`: Detect setTimeout/setInterval usage
  - `no-context-booleans`: Detect boolean flags in state machine context
  - `no-multiple-data-attributes`: Detect multiple data attributes instead of data-state
  - `prefer-extracted-templates`: Detect deeply nested template literals
- **XState Orchestration**: State machine-driven linting process
- **AST Analysis**: TypeScript AST parsing with ts-morph
- **Parallel Processing**: Configurable concurrency for large codebases
- **Configuration System**: YAML-based rule configuration
- **Multiple Output Formats**: Pretty, JSON, and SARIF support (framework only)

### Technical Architecture
- Event-driven architecture with reactive event bus
- TypeScript AST analysis using ts-morph
- XState state machines for process orchestration
- Modular rule system with base rule class
- Configurable parallel file processing
- Comprehensive violation reporting with source context 