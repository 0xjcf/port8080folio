#!/bin/bash

# Install Actor-SPA VS Code Extension locally

EXTENSION_NAME="actor-spa-framework"
EXTENSION_DIR="$HOME/.vscode/extensions/$EXTENSION_NAME"

echo "Installing Actor-SPA Framework VS Code Extension..."

# Remove existing installation if it exists
if [ -d "$EXTENSION_DIR" ]; then
    echo "Removing existing extension..."
    rm -rf "$EXTENSION_DIR"
fi

# Create extension directory
echo "Creating extension directory..."
mkdir -p "$EXTENSION_DIR"

# Copy extension files
echo "Copying extension files..."
cp package.json "$EXTENSION_DIR/"
cp -r out "$EXTENSION_DIR/"
cp -r syntaxes "$EXTENSION_DIR/"

# Copy optional files if they exist
[ -f language-configuration.json ] && cp language-configuration.json "$EXTENSION_DIR/"
[ -d snippets ] && cp -r snippets "$EXTENSION_DIR/"

echo ""
echo "✅ Extension installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Restart VS Code"
echo "2. Open a TypeScript file with html\`\` template literals"
echo "3. You should see Actor-SPA syntax highlighting!"
echo ""
echo "📍 Extension installed at: $EXTENSION_DIR" 