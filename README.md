# GenDocX



## Next-Generation README Automation for Developers

GenDocX is a VS Code extension that automatically generates comprehensive, professional README files for your projects by analyzing your codebase using AI.

## Features

- **One-Click README Generation**: Create detailed README.md files with a single command
- **Smart Project Analysis**: Automatically identifies technologies, dependencies, and key project features
- **Professional Documentation**: Creates well-structured, Markdown-formatted documentation that follows best practices
- **Comprehensive Content**: Includes project description, installation instructions, usage examples, API documentation, and more
- **Customizable Output**: Use the generated README as a solid foundation, then customize it to your needs

## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "GenDocX"
4. Click Install

## Requirements

- VS Code 1.97.0 or newer
- A MindsDB API key (see Configuration section)

## Usage

1. Open your project in VS Code
2. Run the command `GenDocX: Generate README` from the Command Palette (Ctrl+Shift+P)
3. If you haven't configured your API key yet, you'll be prompted to enter it
4. Wait while GenDocX analyzes your project and generates your README
5. Review and customize the generated README.md file


## Configuration

To set your MindsDB API key:

1. Run the command `GenDocX: Configure API Key` from the Command Palette
2. Enter your MindsDB API key when prompted
3. The key will be securely stored in your VS Code settings

Alternatively, you can set it in your settings.json file:

```json
{
  "gendocx.mindsdbApiKey": "your-api-key-here"
}
```

## How It Works

GenDocX performs a comprehensive analysis of your codebase:

1. **Project Discovery**: Identifies main files, configuration files, and key source files
2. **Technology Detection**: Detects frameworks, libraries, and technologies used in your project
3. **Structure Analysis**: Maps your project's directory structure
4. **AI-Powered Documentation**: Utilizes MindsDB's AI to generate detailed, accurate documentation
5. **Markdown Formatting**: Structures the README with proper headings, code blocks, and formatting

## Extension Settings

This extension contributes the following settings:

* `gendocx.mindsdbApiKey`: MindsDB API key for README generation

## Known Issues

- Currently supports JavaScript, TypeScript, Python, and other common languages. More specialized language support coming soon.
- Large projects may take more time to analyze.

## Release Notes

### 0.0.1

- Initial release
- Basic README generation functionality
- MindsDB integration
- Project structure analysis

## License

[MIT](LICENSE)

## Privacy

GenDocX sends your project structure and sample code snippets to MindsDB for analysis. No data is stored beyond what's necessary for generating your README.

## Feedback and Contributions

- File bugs or feature requests on [GitHub](https://github.com/sneha-4-22/gendocx)
- Pull requests are welcome!

---

Made with ❤️ by Sneha Kumari