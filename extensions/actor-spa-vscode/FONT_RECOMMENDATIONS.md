# 🎨 Font Recommendations for Actor-SPA Extension

The Actor-SPA extension provides beautiful syntax highlighting, and pairing it with the right font can significantly enhance your coding experience.

## 🏆 Recommended Fonts

### **JetBrains Mono** (Highly Recommended)
- **Features**: Programming ligatures, excellent readability
- **Why it's great**: Designed specifically for code, with clear distinction between similar characters
- **Install**: [Download JetBrains Mono](https://www.jetbrains.com/lp/mono/)

### **Fira Code**
- **Features**: Popular programming ligatures (->→, ==→, !=→)
- **Why it's great**: Makes template literals and operators more visually appealing
- **Install**: [Download Fira Code](https://github.com/tonsky/FiraCode)

### **Cascadia Code**
- **Features**: Microsoft's font with ligatures, optimized for terminals
- **Why it's great**: Excellent for both VS Code and terminal work
- **Install**: [Download Cascadia Code](https://github.com/microsoft/cascadia-code)

### **SF Mono** (macOS)
- **Features**: Clean, system font on macOS
- **Why it's great**: Consistent with macOS design, excellent readability

## ⚙️ VS Code Configuration

Add this to your VS Code `settings.json`:

```json
{
  // Font settings
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace",
  "editor.fontSize": 14,
  "editor.fontWeight": "400",
  "editor.lineHeight": 1.5,
  
  // Enable font ligatures (for Fira Code, JetBrains Mono, etc.)
  "editor.fontLigatures": true,
  
  // Enhanced syntax highlighting
  "editor.semanticHighlighting.enabled": true,
  "editor.bracketPairColorization.enabled": true,
  
  // Template literal specific improvements
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "string.template.actor-spa-html",
        "settings": {
          "fontStyle": ""
        }
      },
      {
        "scope": "support.type.property-name.actor-spa.event",
        "settings": {
          "fontStyle": "bold"
        }
      }
    ]
  }
}
```

## 🎯 Font Size Recommendations

- **13-14px**: Good for most screens, balanced readability
- **15-16px**: Larger screens, reduced eye strain
- **12px**: Compact view, more code visible

## 🌈 Theme Compatibility

The Actor-SPA extension works great with these themes:
- **One Dark Pro** - Excellent contrast for framework attributes
- **GitHub Dark** - Clean, modern look
- **Monokai Pro** - Rich colors, great for HTML highlighting
- **Dracula** - Popular dark theme with vibrant colors

## 🚀 Quick Setup

1. **Install a recommended font** (JetBrains Mono suggested)
2. **Open VS Code Settings** (`Cmd/Ctrl + ,`)
3. **Search for "font family"**
4. **Set to**: `'JetBrains Mono', monospace`
5. **Enable font ligatures**: Search for "font ligatures" and check the box

Your Actor-SPA templates will look amazing! ✨ 