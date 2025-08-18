function init(modules) {
  const typescript = modules.typescript;
  function create(info) {
    // Create a proper proxy that preserves all method signatures
    const languageServiceProxy = new Proxy(info.languageService, {
      get(target, property) {
        const originalMethod = target[property];
        if (typeof originalMethod === 'function') {
          return originalMethod.bind(target);
        }
        return originalMethod;
      },
    });
    // Enhance completions for html templates
    languageServiceProxy.getCompletionsAtPosition = (fileName, position, options) => {
      const originalCompletions = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        options
      );
      if (!originalCompletions) {
        return originalCompletions;
      }
      const sourceFile = info.languageService.getProgram()?.getSourceFile(fileName);
      if (!sourceFile) {
        return originalCompletions;
      }
      const templateContext = getTemplateContext(sourceFile, position);
      if (!templateContext || !isInHtmlTemplate(templateContext)) {
        return originalCompletions;
      }
      // Add framework-specific completions
      const frameworkCompletions = [
        {
          name: 'send',
          kind: typescript.ScriptElementKind.memberVariableElement,
          sortText: '0',
          insertText: 'send="${1:EVENT}"',
          isSnippet: true,
          labelDetails: {
            description: 'Send XState event',
          },
        },
        {
          name: 'send:click',
          kind: typescript.ScriptElementKind.memberVariableElement,
          sortText: '0',
          insertText: 'send:click="${1:EVENT}"',
          isSnippet: true,
          labelDetails: {
            description: 'Send event on click',
          },
        },
        {
          name: 'send:input',
          kind: typescript.ScriptElementKind.memberVariableElement,
          sortText: '0',
          insertText: 'send:input="${1:EVENT}"',
          isSnippet: true,
          labelDetails: {
            description: 'Send event on input',
          },
        },
        {
          name: 'payload',
          kind: typescript.ScriptElementKind.memberVariableElement,
          sortText: '0',
          insertText: 'payload=\'{"${1:key}": "${2:value}"}\'',
          isSnippet: true,
          labelDetails: {
            description: 'Event payload data',
          },
        },
      ];
      return {
        ...originalCompletions,
        entries: [...originalCompletions.entries, ...frameworkCompletions],
      };
    };
    // Enhance hover information
    languageServiceProxy.getQuickInfoAtPosition = (fileName, position) => {
      const originalQuickInfo = info.languageService.getQuickInfoAtPosition(fileName, position);
      const sourceFile = info.languageService.getProgram()?.getSourceFile(fileName);
      if (!sourceFile) {
        return originalQuickInfo;
      }
      const templateContext = getTemplateContext(sourceFile, position);
      if (!templateContext) {
        return originalQuickInfo;
      }
      const tokenAtPosition = findTokenAtPosition(sourceFile, position);
      const tokenText = tokenAtPosition?.getText() || '';
      // Provide hover info for framework attributes
      if (tokenText === 'send' || tokenText.includes('send:')) {
        if (!tokenAtPosition) {
          return originalQuickInfo;
        }
        return {
          kind: typescript.ScriptElementKind.memberVariableElement,
          kindModifiers: '',
          textSpan: {
            start: tokenAtPosition.getStart(),
            length: tokenAtPosition.getWidth(),
          },
          displayParts: [
            { text: 'send', kind: 'keyword' },
            { text: ': ', kind: 'punctuation' },
            { text: 'Actor-SPA Event Attribute', kind: 'text' },
          ],
          documentation: [
            {
              text: "Sends an XState event to the component's state machine.\n\n",
              kind: 'text',
            },
            {
              text: 'Usage:\n',
              kind: 'text',
            },
            {
              text: '• send="EVENT" - Send event directly\n',
              kind: 'text',
            },
            {
              text: '• send:click="EVENT" - Send on click\n',
              kind: 'text',
            },
            {
              text: '• send:input="EVENT" - Send on input\n',
              kind: 'text',
            },
            {
              text: '• send:change="EVENT" - Send on change',
              kind: 'text',
            },
          ],
          tags: [],
        };
      }
      if (tokenText === 'payload') {
        if (!tokenAtPosition) {
          return originalQuickInfo;
        }
        return {
          kind: typescript.ScriptElementKind.memberVariableElement,
          kindModifiers: '',
          textSpan: {
            start: tokenAtPosition.getStart(),
            length: tokenAtPosition.getWidth(),
          },
          displayParts: [
            { text: 'payload', kind: 'keyword' },
            { text: ': ', kind: 'punctuation' },
            { text: 'Event Payload Attribute', kind: 'text' },
          ],
          documentation: [
            {
              text: 'Attaches data to the XState event.\n\n',
              kind: 'text',
            },
            {
              text: 'The payload must be a valid JSON string.\n\n',
              kind: 'text',
            },
            {
              text: 'Example: payload=\'{"id": 123, "name": "test"}\'',
              kind: 'text',
            },
          ],
          tags: [],
        };
      }
      return originalQuickInfo;
    };
    // Add semantic tokens for better highlighting
    languageServiceProxy.getEncodedSemanticClassifications = (fileName, span, format) => {
      const originalSemanticClassifications =
        info.languageService.getEncodedSemanticClassifications(fileName, span, format);
      // TODO: Add custom semantic tokens for framework constructs
      return originalSemanticClassifications;
    };
    return languageServiceProxy;
  }
  function getTemplateContext(sourceFile, position) {
    const tokenAtPosition = findTokenAtPosition(sourceFile, position);
    if (!tokenAtPosition) {
      return null;
    }
    let currentNode = tokenAtPosition;
    while (currentNode) {
      if (typescript.isTaggedTemplateExpression(currentNode)) {
        const taggedTemplate = currentNode;
        if (taggedTemplate.tag.getText() === 'html') {
          return { fileName: sourceFile.fileName, position, node: currentNode };
        }
      }
      currentNode = currentNode.parent;
    }
    return null;
  }
  function isInHtmlTemplate(context) {
    if (!typescript.isTaggedTemplateExpression(context.node)) {
      return false;
    }
    const taggedTemplate = context.node;
    return taggedTemplate.tag.getText() === 'html';
  }
  function findTokenAtPosition(sourceFile, position) {
    function findNodeAtPosition(node) {
      if (position >= node.getStart() && position < node.getEnd()) {
        return typescript.forEachChild(node, findNodeAtPosition) || node;
      }
      return undefined;
    }
    return findNodeAtPosition(sourceFile);
  }
  return { create };
}
module.exports = init;
//# sourceMappingURL=typescript-plugin.js.map
