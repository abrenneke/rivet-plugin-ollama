<h1 align="center"><img src="https://rivet.ironcladapp.com/img/logo-banner-wide.png" alt="Rivet Logo"></h1>

# Rivet Example Plugin

This project is an example of a [Rivet](https://github.com/Ironclad/rivet) plugin. It is a minimal TypeScript Rivet plugin that adds a single node called Example Plugin Node.

- [Using the plugin](#using-the-plugin)
  - [In Rivet](#in-rivet)
  - [In Code](#in-code)
- [Making your own plugin](#making-your-own-plugin)
  - [⚠️ Important Notes ⚠️](#️-important-notes-️)
  - [1. Plugin Definition](#1-plugin-definition)
  - [2. Node Definitions](#2-node-definitions)
  - [3. Bundling](#3-bundling)
  - [4. NPM](#4-npm)
- [Local Development](#local-development)

## Using the plugin

### In Rivet

To use this plugin in Rivet:

1. Open the plugins overlay at the top of the screen.
2. Search for "rivet-plugin-example"
3. Click the "Install" button to install the plugin into your current project.

### In Code

Load your plugin and Rivet into your application:

```ts
import * as Rivet from "@ironclad/rivet-core";
import examplePlugin from "rivet-plugin-example";
```

Register your plugin with Rivet be using the `globalRivetNodeRegistry` or creating a new `NodeRegistration` and registering with that:

```ts
Rivet.globalRivetNodeRegistry.registerPlugin(examplePlugin(Rivet));
```

## Making your own plugin

### ⚠️ Important Notes ⚠️

- You must bundle your plugins, or include all code for your plugin in the ESM files. Plugins are loaded using `import(pluginUrl)` so must follow all rules for ESM modules. This means that you cannot use `require` or `module.exports` in your plugin code. If you need to use external libraries, you must bundle them.

- You also cannot import nor bundle `@ironclad/rivet-core` in your plugin. The rivet core library is passed into your default export function as an argument. Be careful to only use `import type` statements for the core library, otherwise your plugin will not bundle successfully.

This repository has examples for both bundling with [ESBuild](https://esbuild.github.io/) and only importing types from `@ironclad/rivet-core`.

### 1. Plugin Definition

Follow the example in [src/index.ts](src/index.ts) to define your plugin. Your plugin must default-export a function that takes in the Rivet Core library as its only argument, and returns a valid `RivetPlugin` object.

### 2. Node Definitions

Follow the example in [src/nodes/ExamplePluginNode.ts](src/nodes/ExamplePluginNode.ts) to define your plugin's nodes. You should follow a simlar syntax of exporting functions that take in the Rivet Core library.

- Nodes must implement `PluginNodeDefinition<T>` by calling `pluginNodeDefinition(yourPluginImpl, "Node Name")`.
- Node implementations must implement `PluginNodeImpl<T>`.
- `T` should be your plugin's type definition.

### 3. Bundling

See [bundle.ts](bundle.ts) for an example of how to bundle your plugin. You can use any bundler you like, but you must bundle your plugin into a single file. You can use the [ESBuild](https://esbuild.github.io/) bundler to bundle your plugin into a single file.

It is important that all external libraries are bundled, because browsers cannot load bare imports.

### 4. NPM

You must finally publish your plugin to NPM so that Rivet users can install it using the UI in Rivet, or using the SDK.

## Local Development

1. Run `yarn dev` to start the compiler and bundler in watch mode. This will automatically recombine and rebundle your changes into the `dist` folder. This will also copy the bundled files into the plugin install directory.
2. After each change, you must restart Rivet to see the changes.
