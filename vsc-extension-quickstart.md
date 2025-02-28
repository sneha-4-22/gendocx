# GenDocX - VS Code Extension

## Overview

GenDocX is a VS Code extension that automates the creation of professional README files for software projects. By analyzing your codebase with AI, it generates comprehensive documentation that explains your project's purpose, features, architecture, and usage.

## Features in Detail

### Intelligent Project Analysis

GenDocX performs a multi-layered analysis of your project:

- **Configuration Detection**: Identifies package.json, requirements.txt, and other configuration files
- **Technology Identification**: Detects frameworks (React, Vue, Angular, Express, Django, etc.)
- **Dependency Mapping**: Lists and categorizes your project dependencies
- **Entry Point Location**: Finds main application files and entry points
- **Directory Structure**: Maps the overall architecture of your project

### Professional Documentation Generation

The extension creates READMEs with:

- **Project Title and Description**: Clear explanation of what your project does
- **Feature Lists**: Comprehensive breakdown of key functionality
- **Installation Instructions**: Step-by-step setup guidance
- **Usage Examples**: Code samples showing how to use your project
- **API Documentation**: Function/endpoint documentation when applicable
- **Architecture Information**: Explains how components fit together
- **Prerequisites**: Lists required tools and dependencies
- **License Information**: Includes appropriate licensing details

### MindsDB Integration

GenDocX uses MindsDB's AI capabilities to:

- Parse and understand your codebase
- Identify patterns and architectural choices
- Generate natural language explanations
- Structure information in a developer-friendly format

## Extension Development

### Structure

The extension consists of these key components:

- **activation**: Registers VS Code commands and sets up event handlers
- **collectImportantFiles**: Identifies key files in the project 
- **analyzePackageJson**: Extracts metadata from package.json or similar
- **createProjectContext**: Builds a comprehensive context about the project
- **detectTechnologies**: Identifies technologies and frameworks
- **generateProjectStructure**: Maps the directory structure
- **generateReadmeWithMindsDB**: Handles API communication with MindsDB

### Commands

The extension provides two commands:

1. `gendocx.generateReadme`: Analyzes the project and generates a README
2. `gendocx.configureApiKey`: Saves the MindsDB API key in settings

### Settings

- `gendocx.mindsdbApiKey`: Stores the MindsDB API key securely

## Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Press F5 in VS Code to run the extension in development mode

## Building and Publishing

### Building

```bash
npm run lint
vsce package
```

This will create a `.vsix` file that can be installed locally.

### Publishing

To publish to the VS Code Marketplace:

1. Create a personal access token (PAT) in Azure DevOps
2. Install vsce: `npm install -g @vscode/vsce`
3. Log in: `vsce login YourPublisherName`
4. Publish: `vsce publish`

## Technical Notes

- The extension requires a connection to MindsDB's API
- API keys are stored securely in VS Code's settings storage
- The extension can analyze JavaScript, TypeScript, Python, and other common languages

## Debugging Tips

- Check VS Code's Output panel for extension logs
- Ensure your MindsDB API key is correctly configured
- For large projects, the analysis might take more time

## Future Development

Planned features include:

- Custom README templates
- Support for more specialized languages and frameworks
- Ability to update existing READMEs
- Integration with other documentation platforms
- Additional document types (Contributing guidelines, API docs, etc.)