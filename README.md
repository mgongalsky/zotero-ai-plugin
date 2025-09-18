# Zotero AI Plugin

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

An AI-powered plugin for [Zotero](https://www.zotero.org/) that enhances your research workflow with intelligent features.

## Features (Planned)

🤖 **AI-Powered Research Assistant**
- Smart paper summarization
- Intelligent tag suggestions
- Research question generation
- Literature gap analysis

📚 **Enhanced Library Management**
- Automated metadata enrichment
- Duplicate detection and merging
- Smart collections organization
- Citation relationship mapping

🔍 **Advanced Search & Discovery**
- Semantic search across your library
- Related papers recommendation
- Research trend analysis
- Cross-reference validation

💡 **Writing & Analysis Support**
- Bibliography generation assistance
- Citation context analysis
- Research note organization
- Export to various formats

## Installation

### Method 1: Manual Installation
1. Download the latest `zotero-ai-plugin-v*.xpi` file from [Releases](https://github.com/mgongalsky/zotero-ai-plugin/releases)
2. In Zotero, go to Tools → Add-ons
3. Click the gear icon and select "Install Add-on From File"
4. Select the downloaded `.xpi` file
5. Restart Zotero

### Method 2: Development Version
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Install the generated `.xpi` file from `.scaffold/build/`

## Development

This plugin is built using the [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) with TypeScript and modern development tools.

### Requirements
- Node.js 22.0+ (LTS recommended)
- Zotero 7.0+ beta

### Setup
```bash
# Clone the repository
git clone https://github.com/mgongalsky/zotero-ai-plugin.git
cd zotero-ai-plugin

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Zotero path

# Start development server with hot reload
npm start

# Build for production
npm run build

# Create release
npm run release
```

### Development Features
- 🔥 **Hot Reload**: Changes automatically applied during development
- 📝 **TypeScript**: Full type safety with Zotero API definitions
- 🎯 **ESLint & Prettier**: Code quality and formatting
- 🔧 **Auto Build**: Automated build and release workflow

## Project Structure

```
├── src/                    # TypeScript source code
│   ├── index.ts           # Main entry point
│   ├── hooks.ts           # Plugin lifecycle hooks
│   ├── modules/           # Feature modules
│   └── utils/             # Utility functions
├── addon/                 # Static resources
│   ├── manifest.json      # Plugin manifest
│   ├── content/           # UI files and assets
│   └── locale/            # Localization files
└── typings/               # TypeScript type definitions
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap

- [ ] Basic AI integration setup
- [ ] Paper summarization feature
- [ ] Smart tagging system
- [ ] Literature review assistant
- [ ] Citation analysis tools
- [ ] Multi-language support
- [ ] Cloud sync capabilities
- [ ] Advanced search features

## License

This project is licensed under the AGPL-3.0-or-later License - see the [LICENSE](LICENSE) file for details.

## Author

**Maxim Gongalsky**

## Acknowledgments

- Built with [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template)
- Powered by [Zotero Plugin Toolkit](https://github.com/windingwind/zotero-plugin-toolkit)
- Thanks to the Zotero development team for their excellent platform

## Support

If you find this plugin helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 📖 Contributing to documentation

---

*This plugin is in active development. Features and APIs may change.*