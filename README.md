<h1 align="center"><img src="https://rivet.ironcladapp.com/img/logo-banner-wide.png" alt="Rivet Logo"></h1>

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" height="200px" srcset="https://github.com/jmorganca/ollama/assets/3325447/56ea1849-1284-4645-8970-956de6e51c3c">
    <img alt="logo" height="200px" src="https://github.com/jmorganca/ollama/assets/3325447/0d0b44e2-8f4a-4e99-9b52-a5c1c741c8f7">
  </picture>
</div>

# Rivet Ollama Plugin

The Rivet Ollama Plugin is a plugin for [Rivet](https://rivet.ironcladapp.com) to allow you to use [Ollama](https://ollama.ai/) to run and chat with LLMs locally and easily. It adds the following nodes:

- Ollama Chat
- Get Ollama Model
- List Ollama Models
- Pull Model to Ollama

**Table of Contents**

- [Running Ollama](#running-ollama)
- [Using the plugin](#using-the-plugin)
  - [In Rivet](#in-rivet)
  - [In the SDK](#in-the-sdk)
- [Configuration](#configuration)
  - [In Rivet](#in-rivet-1)
  - [In the SDK](#in-the-sdk-1)
- [Nodes](#nodes)
  - [Ollama Chat](#ollama-generate)
    - [Inputs](#inputs)
    - [Outputs](#outputs)
    - [Editor Settings](#editor-settings)
  - [Ollama Generate](#ollama-generate)
    - [Inputs](#inputs)
    - [Outputs](#outputs)
    - [Editor Settings](#editor-settings)
  - [List Ollama Models](#list-ollama-models)
    - [Inputs](#inputs-1)
    - [Outputs](#outputs-1)
    - [Editor Settings](#editor-settings-1)
  - [Get Ollama Model](#get-ollama-model)
    - [Inputs](#inputs-2)
    - [Outputs](#outputs-2)
    - [Editor Settings](#editor-settings-2)
  - [Pull Model to Ollama](#pull-model-to-ollama)
    - [Inputs](#inputs-3)
    - [Outputs](#outputs-3)
    - [Editor Settings](#editor-settings-3)
- [Local Development](#local-development)

## Running Ollama

To run Ollama so that Rivet's default [browser executor](https://rivet.ironcladapp.com/docs/user-guide/executors#browser) can communicate with it, you will want to start it with the following command:

```bash
OLLAMA_ORIGINS=* ollama serve
```

If you are using the [node executor](https://rivet.ironcladapp.com/docs/user-guide/executors#node), you can omit the `OLLAMA_ORIGINS` environment variable.

## Using the plugin

### In Rivet

To use this plugin in Rivet:

1. Open the plugins overlay at the top of the screen.
2. Search for "rivet-plugin-ollama"
3. Click the "Add" button to install the plugin into your current project.

### In the SDK

1. Import the plugin and Rivet into your project:

   ```ts
   import * as Rivet from "@ironclad/rivet-node";
   import RivetPluginOllama from "rivet-plugin-ollama";
   ```

2. Initialize the plugin and register the nodes with the `globalRivetNodeRegistry`:

   ```ts
   Rivet.globalRivetNodeRegistry.registerPlugin(RivetPluginOllama(Rivet));
   ```

   (You may also use your own node registry if you wish, instead of the global one.)

3. The nodes will now work when ran with `runGraphInFile` or `createProcessor`.

## Configuration

### In Rivet

By default, the plugin will attempt to connect to Ollama at `http://localhost:11434`. If you would like you change this, you can open the Settings window, navigate to the Plugins area, and you will see a `Host` setting for Ollama. You can change this to the URL of your Ollama instance. For some users it works using `http://127.0.0.1:11434` instead.

### In the SDK

When using the SDK, you can pass a `host` option to the plugin to configure the host:

Using `createProcessor` or `runGraphInFile`, pass in via `pluginSettings` in `RunGraphOptions`:

```ts
await createProcessor(project, {
  ...etc,
  pluginSettings: {
    ollama: {
      host: "http://localhost:11434",
    },
  },
});
```

## Nodes

### Ollama Chat
The main node of the plugin. Functions similarly to the [Chat Node](https://rivet.ironcladapp.com/docs/node-reference/chat) built in to Rivet. Uses /api/chat route

#### Inputs

| Title         | Data Type        | Description                                         | Default Value | Notes                                                                                                                                                                                                                                           |
| ------------- | ---------------- | --------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System Prompt | `string`         | The system prompt to prepend to the messages list.  | (none)        | Optional.                                                                                                                                                                                                                                       |
| Messages      | 'chat-message[]' | The chat messages to use as the prompt for the LLM. | (none)        | Chat messages are converted to the OpenAI message format using "role" and "content" keys |

#### Outputs

| Title                | Data Type        | Description                                                | Notes                                                       |
| -------------------- | ---------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Output               | `string`         | The response text from the LLM.                            |                                                             |
| Messages Sent        | `chat-message[]` | The messages that were sent to Ollama.                     |                                                             |
| All Messages         | `chat-message[]` | All messages, including the reply from the LLM.            |                                                             |

#### Editor Settings

| Setting               | Description                                                                                                                                                                                                                                             | Default Value    | Use Input Toggle | Input Data Type |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------- | --------------- |
| Model                 | The name of the LLM model in to use in Ollama.                                                                                                                                                                                                          | (Empty)          | Yes              | `string`        |
| Prompt Format         | The way to format chat messages for the prompt being sent to the ollama model. Raw means no formatting is applied. Llama 2 Instruct follows the [Llama 2 prompt format](https://gpus.llm-utils.org/llama-2-prompt-template/).                           | Llama 2 Instruct | No               | N/A             |
| JSON Mode        | Activates JSON output mode | false | Yes               | `boolean`             |



### Ollama Generate

Previously the main node of the plugin. Allows you to send prompts to Ollama and receive responses from the LLMs installed with deep customization options even including custom prompt formats. Uses /api/generate route

#### Inputs

| Title         | Data Type        | Description                                         | Default Value | Notes                                                                                                                                                                                                                                           |
| ------------- | ---------------- | --------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| System Prompt | `string`         | The system prompt to prepend to the messages list.  | (none)        | Optional.                                                                                                                                                                                                                                       |
| Messages      | 'chat-message[]' | The chat messages to use as the prompt for the LLM. | (none)        | Chat messages are converted to a prompt in Ollama based on the "Prompt Format" editor setting. If "Raw" is selected, no formatting is performed on the chat messages, and you are expected to have already formatted them in your Rivet graphs. |

Additional inputs available with toggles in the editor.

#### Outputs

| Title                | Data Type        | Description                                                | Notes                                                       |
| -------------------- | ---------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| Output               | `string`         | The response text from the LLM.                            |                                                             |
| Prompt               | `string`         | The full prompt, with formatting, that was sent to Ollama. |                                                             |
| Messages Sent        | `chat-message[]` | The messages that were sent to Ollama.                     |                                                             |
| All Messages         | `chat-message[]` | All messages, including the reply from the LLM.            |                                                             |
| Total Duration       | `number`         | Time spent generating the response.                        | Only available if the "Advanced Outputs" toggle is enabled. |
| Load Duration        | `number`         | Time spent in nanoseconds loading the model.               | Only available if the "Advanced Outputs" toggle is enabled. |
| Sample Count         | `number`         | Number of samples generated.                               | Only available if the "Advanced Outputs" toggle is enabled. |
| Sample Duration      | `number`         | Time spent in nanoseconds generating samples.              | Only available if the "Advanced Outputs" toggle is enabled. |
| Prompt Eval Count    | `number`         | Number of tokens in the prompt.                            | Only available if the "Advanced Outputs" toggle is enabled. |
| Prompt Eval Duration | `number`         | Time spent in nanoseconds evaluating the prompt.           | Only available if the "Advanced Outputs" toggle is enabled. |
| Eval Count           | `number`         | Number of tokens in the response.                          | Only available if the "Advanced Outputs" toggle is enabled. |
| Eval Duration        | `number`         | Time spent in nanoseconds evaluating the response.         | Only available if the "Advanced Outputs" toggle is enabled. |
| Tokens Per Second    | `number`         | Number of tokens generated per second.                     | Only available if the "Advanced Outputs" toggle is enabled. |
| Parameters           | `object`         | The parameters used to generate the response.              | Only available if the "Advanced Outputs" toggle is enabled. |

#### Editor Settings

| Setting               | Description                                                                                                                                                                                                                                             | Default Value    | Use Input Toggle | Input Data Type |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------- | --------------- |
| Model                 | The name of the LLM model in to use in Ollama.                                                                                                                                                                                                          | (Empty)          | Yes              | `string`        |
| Prompt Format         | The way to format chat messages for the prompt being sent to the ollama model. Raw means no formatting is applied. Llama 2 Instruct follows the [Llama 2 prompt format](https://gpus.llm-utils.org/llama-2-prompt-template/).                           | Llama 2 Instruct | No               | N/A             |
| JSON Mode        | Activates JSON output mode | false | Yes               | `boolean`             |
| Advanced Outputs      | Add additional outputs with detailed information about the Ollama execution.                                                                                                                                                                            | No               | No               | N/A             |
| Parameters Group      |                                                                                                                                                                                                                                                         |                  |                  |                 |
| Mirostat              | Enable Mirostat sampling for controlling perplexity. (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)                                                                                                                                         | (unset)          | Yes              | `number`        |
| Mirostat Eta          | Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive. (Default: 0.1)                        | (unset)          | Yes              | `number`        |
| Mirostat Tau          | Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text. (Default: 5.0)                                                                                                         | (unset)          | Yes              | `number`        |
| Num Ctx               | Sets the size of the context window used to generate the next token. (Default: 2048)                                                                                                                                                                    | (unset)          | Yes              | `number`        |
| Num GQA               | The number of GQA groups in the transformer layer. Required for some models, for example it is 8 for llama2:70b                                                                                                                                         | (unset)          | Yes              | `number`        |
| Num GPUs              | The number of layers to send to the GPU(s). On macOS it defaults to 1 to enable metal support, 0 to disable.                                                                                                                                            | (unset)          | Yes              | `number`        |
| Num Threads           | Sets the number of threads to use during computation. By default, Ollama will detect this for optimal performance. It is recommended to set this value to the number of physical CPU cores your system has (as opposed to the logical number of cores). | (unset)          | Yes              | `number`        |
| Repeat Last N         | Sets how far back for the model to look back to prevent repetition. (Default: 64, 0 = disabled, -1 = num_ctx)                                                                                                                                           | (unset)          | Yes              | `number`        |
| Repeat Penalty        | Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (Default: 1.1)                                                                     | (unset)          | Yes              | `number`        |
| Temperature           | The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)                                                                                                                                     | (unset)          | Yes              | `number`        |
| Seed                  | Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (Default: 0)                                                                                       | (unset)          | Yes              | `number`        |
| Stop                  | Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return.                                                                                                                                          | (unset)          | Yes              | `string`        |
| TFS Z                 | Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (default: 1)                                               | (unset)          | Yes              | `number`        |
| Num Predict           | Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)                                                                                                                                   | (unset)          | Yes              | `number`        |
| Top K                 | Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (Default: 40)                                                                        | (unset)          | Yes              | `number`        |
| Top P                 | Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)                                                                 | (unset)          | Yes              | `number`        |
| Additional Parameters | Additional parameters to pass to Ollama. Numbers will be parsed and sent as numbers, otherwise they will be sent as strings. [See all supported parameters in Ollama](https://github.com/jmorganca/ollama/blob/main/docs/modelfile.md)                  | (none)           | Yes              | `object`        |

### List Ollama Models

Lists the models installed in Ollama.

#### Inputs

This node has no inputs.

#### Outputs

| Title       | Data Type  | Description                                  | Notes |
| ----------- | ---------- | -------------------------------------------- | ----- |
| Model Names | `string[]` | The names of the models installed in Ollama. |       |

#### Editor Settings

This node has no editor settings.

### Get Ollama Model

Gets the model with the given name from Ollama.

#### Inputs

See Editor Settings for all possible inputs.

#### Outputs

| Title      | Data Type | Description                                 | Notes |
| ---------- | --------- | ------------------------------------------- | ----- |
| License    | `string`  | Contents of the license block of the model. |       |
| Modelfile  | `string`  | The Ollama modelfile for the model"         |       |
| Parameters | `string`  | The parameters for the model.               |       |
| Template   | `string`  | The template for the model.                 |       |

#### Editor Settings

| Setting    | Description                   | Default Value | Use Input Toggle | Input Data Type |
| ---------- | ----------------------------- | ------------- | ---------------- | --------------- |
| Model Name | The name of the model to get. | (Empty)       | Yes (default on) | `string`        |

### Pull Model to Ollama

Downloads a model from the Ollama library to the Ollama server.

#### Inputs

See Editor Settings for all possible inputs.

#### Outputs

| Title      | Data Type | Description                            | Notes |
| ---------- | --------- | -------------------------------------- | ----- |
| Model Name | `string`  | The name of the model that was pulled. |       |

#### Editor Settings

| Setting    | Description                                                                                                           | Default Value | Use Input Toggle | Input Data Type |
| ---------- | --------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------- | --------------- |
| Model Name | The name of the model to pull.                                                                                        | (Empty)       | Yes (default on) | `string`        |
| Insecure   | Allow insecure connections to the library. Only use this if you are pulling from your own library during development. | No            | No               | N/A             |

## Local Development

1. Run `yarn dev` to start the compiler and bundler in watch mode. This will automatically recombine and rebundle your changes into the `dist` folder. This will also copy the bundled files into the plugin install directory.
2. After each change, you must restart Rivet to see the changes.
