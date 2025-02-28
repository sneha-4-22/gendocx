const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');
const { OpenAI } = require('openai');

function createMindsDBClient(apiKey) {
  return new OpenAI({
    apiKey: apiKey  || 'your-default-api-key',
    baseURL: 'https://llm.mdb.ai/'
  });
}

async function generateReadmeWithMindsDB(rootPath, apiKey) {
  try {
    const mindsdb = createMindsDBClient(apiKey);
    
    const packageInfo = await analyzePackageJson(rootPath);
    const projectName = packageInfo?.name || path.basename(rootPath);
    const projectVersion = packageInfo?.version || '1.0.0';
    
    const projectFiles = await collectImportantFiles(rootPath);
    
    const projectContext = await createProjectContext(rootPath, projectFiles, packageInfo);
    
    const response = await mindsdb.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        {
          role: "system",
          content: `You are an expert software developer who specializes in analyzing codebases and creating detailed, accurate documentation. 
          You will be given information about a project codebase, and your task is to generate a comprehensive README.md file.
          Focus on explaining what the project actually does, its main features, how it works, and its architecture.
          Make the README professional, informative, and helpful for developers who want to understand or contribute to the project.`
        },
        {
          role: "user",
          content: `Please analyze this project and generate a comprehensive README.md file:
          
          PROJECT OVERVIEW:
          ${projectContext.overview}
          
          KEY FILES:
          ${projectContext.keyFiles}
          
          TECHNOLOGIES:
          ${projectContext.technologies}
          
          PROJECT STRUCTURE:
          ${projectContext.structure}
          
          Make sure to include:
          1. A clear title and description that explains what the project actually does
          2. Key features with meaningful descriptions
          3. Installation instructions
          4. Usage examples
          5. API documentation (if applicable)
          6. Information about the architecture
          7. Prerequisites
          8. License information
          
          Structure the README with proper Markdown formatting, including headings, code blocks, and bullet points.`
        }
      ],
      max_tokens: 4000,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating README with MindsDB:", error);
    throw new Error(`Failed to generate README with MindsDB: ${error.message}`);
  }
}

async function collectImportantFiles(rootPath, maxFilesToAnalyze = 20) {
  const result = {
    mainFiles: [],
    configFiles: [],
    sourceFiles: []
  };
  
  const mainFilePatterns = [
    'index.js', 'app.js', 'main.py', 'app.py', 'index.jsx', 'app.jsx',
    'src/index.js', 'src/app.js', 'src/main.py', 'src/app.py', 'src/index.jsx', 'src/app.jsx'
  ];
  
  const configFilePatterns = [
    'package.json', 'tsconfig.json', 'webpack.config.js', '.env.example',
    'Dockerfile', 'docker-compose.yml', 'requirements.txt', 'setup.py',
    'pyproject.toml', 'go.mod', 'pom.xml', 'build.gradle'
  ];
  
  for (const pattern of mainFilePatterns) {
    try {
      const filePath = path.join(rootPath, pattern);
      await fs.access(filePath);
      result.mainFiles.push(pattern);
    } catch {}
  }
  
  for (const pattern of configFilePatterns) {
    try {
      const filePath = path.join(rootPath, pattern);
      await fs.access(filePath);
      result.configFiles.push(pattern);
    } catch {}
  }
  
  await findSourceFiles(rootPath, '', result.sourceFiles, maxFilesToAnalyze);
  
  return result;
}

async function findSourceFiles(rootPath, relativePath, sourceFiles, maxFiles) {
  if (sourceFiles.length >= maxFiles) return;
  
  const currentPath = path.join(rootPath, relativePath);
  try {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    entries.sort((a, b) => {
      const aIsPriority = a.isDirectory() && ['src', 'app', 'lib', 'main'].includes(a.name);
      const bIsPriority = b.isDirectory() && ['src', 'app', 'lib', 'main'].includes(b.name);
      return (bIsPriority ? 1 : 0) - (aIsPriority ? 1 : 0);
    });
    
    for (const entry of entries) {
      if (sourceFiles.length >= maxFiles) return;
      
      const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (
        entry.name.startsWith('.') ||
        ['node_modules', 'dist', 'build', '__pycache__', 'venv', 'env', '.git'].includes(entry.name)
      ) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await findSourceFiles(rootPath, entryRelativePath, sourceFiles, maxFiles);
      } else if (isSourceFile(entry.name)) {
        sourceFiles.push(entryRelativePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${currentPath}:`, error);
  }
}

function isSourceFile(filename) {
  const sourceExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java',
    '.html', '.css', '.scss', '.sass', '.less', '.php', '.rb'
  ];
  const ext = path.extname(filename).toLowerCase();
  return sourceExtensions.includes(ext);
}

async function analyzePackageJson(rootPath) {
  try {
    const packagePath = path.join(rootPath, 'package.json');
    const packageData = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(packageData);
    
    return {
      name: packageJson.name,
      description: packageJson.description,
      version: packageJson.version,
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      scripts: packageJson.scripts || {}
    };
  } catch {
    try {
      const pyprojectPath = path.join(rootPath, 'pyproject.toml');
      const pyprojectData = await fs.readFile(pyprojectPath, 'utf8');
      
      const nameMatch = pyprojectData.match(/name\s*=\s*["']([^"']+)["']/);
      const versionMatch = pyprojectData.match(/version\s*=\s*["']([^"']+)["']/);
      const descriptionMatch = pyprojectData.match(/description\s*=\s*["']([^"']+)["']/);
      
      return {
        name: nameMatch ? nameMatch[1] : null,
        description: descriptionMatch ? descriptionMatch[1] : null,
        version: versionMatch ? versionMatch[1] : null
      };
    } catch {
      return null;
    }
  }
}

async function createProjectContext(rootPath, projectFiles, packageInfo) {
  const context = {
    overview: "Unknown project",
    keyFiles: "",
    technologies: "",
    structure: ""
  };
  
  if (packageInfo) {
    context.overview = `Project Name: ${packageInfo.name || 'Unknown'}\n`;
    context.overview += `Version: ${packageInfo.version || 'Unknown'}\n`;
    context.overview += `Description: ${packageInfo.description || 'No description provided'}\n\n`;
    
    if (packageInfo.dependencies || packageInfo.devDependencies) {
      context.overview += "Dependencies:\n";
      
      const allDeps = { ...packageInfo.dependencies, ...packageInfo.devDependencies };
      const technologies = Object.keys(allDeps).slice(0, 15); 
      context.overview += technologies.map(tech => `- ${tech}`).join('\n');
    }
  } else {
    context.overview = `Project Name: ${path.basename(rootPath)}\n`;
    context.overview += "No package.json or similar project definition file found.\n";
  }
  
  context.keyFiles = "Key file contents:\n\n";
  for (const file of [...projectFiles.mainFiles, ...projectFiles.configFiles].slice(0, 5)) {
    try {
      const filePath = path.join(rootPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      context.keyFiles += `--- FILE: ${file} ---\n\n${content.substring(0, 5000)}\n\n`;
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }
  
  for (const file of projectFiles.sourceFiles.slice(0, 10)) {
    try {
      const filePath = path.join(rootPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      context.keyFiles += `--- FILE: ${file} ---\n\n${content.substring(0, 3000)}\n\n`;
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }
  
  context.technologies = await detectTechnologies(rootPath, projectFiles, packageInfo);
  
  context.structure = await generateProjectStructure(rootPath);
  
  return context;
}

async function detectTechnologies(rootPath, projectFiles, packageInfo) {
  const technologies = new Set();
  
  if (packageInfo && packageInfo.dependencies) {
    if (packageInfo.dependencies.react) technologies.add("React");
    if (packageInfo.dependencies.vue) technologies.add("Vue.js");
    if (packageInfo.dependencies.express) technologies.add("Express.js");
    if (packageInfo.dependencies.next) technologies.add("Next.js");
    if (packageInfo.dependencies['@angular/core']) technologies.add("Angular");
    
    if (packageInfo.dependencies.mongoose || packageInfo.dependencies.mongodb) technologies.add("MongoDB");
    if (packageInfo.dependencies.mysql || packageInfo.dependencies.mysql2) technologies.add("MySQL");
    if (packageInfo.dependencies.pg || packageInfo.dependencies.postgresql) technologies.add("PostgreSQL");
    if (packageInfo.dependencies.sequelize) technologies.add("Sequelize");
    if (packageInfo.dependencies.prisma) technologies.add("Prisma");
    
    if (packageInfo.dependencies.redux || packageInfo.dependencies['@reduxjs/toolkit']) technologies.add("Redux");
    if (packageInfo.dependencies['styled-components']) technologies.add("Styled Components");
    if (packageInfo.dependencies.electron) technologies.add("Electron");
  }
  
  for (const file of [...projectFiles.mainFiles, ...projectFiles.sourceFiles]) {
    const ext = path.extname(file).toLowerCase();
    
    if (ext === '.js' || ext === '.jsx') technologies.add("JavaScript");
    if (ext === '.ts' || ext === '.tsx') technologies.add("TypeScript");
    if (ext === '.py') technologies.add("Python");
    if (ext === '.go') technologies.add("Go");
    if (ext === '.java') technologies.add("Java");
    if (ext === '.php') technologies.add("PHP");
    if (ext === '.rb') technologies.add("Ruby");
    if (ext === '.css') technologies.add("CSS");
    if (ext === '.scss' || ext === '.sass') technologies.add("Sass");
    if (ext === '.html') technologies.add("HTML");
    
    try {
      const filePath = path.join(rootPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      if (content.includes('import React') || content.includes('from "react"') || content.includes("from 'react'")) 
        technologies.add("React");
      
      if (content.includes('import Vue') || content.includes('new Vue(')) 
        technologies.add("Vue.js");
      
      if (content.includes('import { Injectable }') || content.includes('@Component')) 
        technologies.add("Angular");
      
      if (content.includes('import express') || content.includes("require('express')")) 
        technologies.add("Express.js");
      
      if (content.includes('import flask') || content.includes('from flask import')) 
        technologies.add("Flask");
      
      if (content.includes('import django') || content.includes('from django')) 
        technologies.add("Django");
    } catch (error) {
      console.error(`Error analyzing file ${file}:`, error);
    }
  }
  
  try {
    await fs.access(path.join(rootPath, 'Dockerfile'));
    technologies.add("Docker");
  } catch {}
  
  try {
    await fs.access(path.join(rootPath, 'docker-compose.yml'));
    technologies.add("Docker Compose");
  } catch {}
  
  try {
    const reqPath = path.join(rootPath, 'requirements.txt');
    const requirements = await fs.readFile(reqPath, 'utf8');
    
    if (requirements.includes('django')) technologies.add("Django");
    if (requirements.includes('flask')) technologies.add("Flask");
    if (requirements.includes('fastapi')) technologies.add("FastAPI");
    if (requirements.includes('tensorflow') || requirements.includes('keras')) technologies.add("TensorFlow");
    if (requirements.includes('torch') || requirements.includes('pytorch')) technologies.add("PyTorch");
    if (requirements.includes('pandas')) technologies.add("Pandas");
    if (requirements.includes('numpy')) technologies.add("NumPy");
  } catch {}
  
  return Array.from(technologies).join(", ");
}

async function generateProjectStructure(rootPath) {
  let structure = "";
  
  async function scanDir(dir, indent = "") {
    try {
      const entries = await fs.readdir(path.join(rootPath, dir), { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || 
            ['node_modules', '__pycache__', 'venv', 'env', '.git', 'build', 'dist'].includes(entry.name)) {
          continue;
        }
        
        const relativePath = dir ? `${dir}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          structure += `${indent}- ${entry.name}/\n`;
          await scanDir(relativePath, indent + "  ");
        }
      }
    } catch (error) {
      console.error(`Error generating structure for ${dir}:`, error);
    }
  }
  
  await scanDir("");
  return structure;
}


function activate(context) {
  
  console.log('GenDocX extension is activating...');
  
  // Register commands with explicit logging
  console.log('Registering gendocx.generateReadme command...');
  let disposable = vscode.commands.registerCommand(
    'gendocx.generateReadme',
    async () => {
      console.log('gendocx.generateReadme command executed');
      try {
        // Your existing code for this command goes here
        const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!rootPath) {
          throw new Error('No active workspace found');
        }
        
        // Rest of your existing command implementation...
        
      } catch (error) {
        console.error('Error in generateReadme command:', error);
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
    }
  );

  console.log('Registering gendocx.configureApiKey command...');
  let configDisposable = vscode.commands.registerCommand(
    'gendocx.configureApiKey',
    async () => {
      console.log('gendocx.configureApiKey command executed');
      // Your existing configureApiKey command code goes here
    }
  );

  context.subscriptions.push(disposable, configDisposable);
  console.log('GenDocX extension activation completed successfully');
}
function deactivate() {}

module.exports = {
  activate,
  deactivate
};