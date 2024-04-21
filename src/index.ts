import type { RivetPlugin, RivetPluginInitializer } from "@ironclad/rivet-core";
import { ollamaChat } from "./nodes/OllamaGenerateNode";
import { ollamaChat2 } from "./nodes/OllamaChatNode";
import { ollamaEmbed } from "./nodes/OllamaEmbeddingsNode";
import { getOllamaModel } from "./nodes/GetOllamaModelNode";
import { listOllamaModels } from "./nodes/ListOllamaModelsNode";
import { pullModelToOllama } from "./nodes/PullModelToOllamaNode";

const plugin: RivetPluginInitializer = (rivet) => {
  const examplePlugin: RivetPlugin = {
    id: "ollama",
    name: "Ollama Plugin",

    configSpec: {
      host: {
        label: "Host",
        type: "string",
        default: "http://localhost:11434",
        description:
          "The host to use for the Ollama API. Defaults to http://localhost:11434.",
        helperText:
          "The host to use for the Ollama API. Defaults to http://localhost:11434.",
      },
    },

    contextMenuGroups: [
      {
        id: "ollama",
        label: "Ollama",
      },
    ],

    register: (register) => {
      register(ollamaChat(rivet));
      register(ollamaChat2(rivet));
      register(ollamaEmbed(rivet));
      register(getOllamaModel(rivet));
      register(listOllamaModels(rivet));
      register(pullModelToOllama(rivet));
    },
  };

  return examplePlugin;
};

export default plugin;
