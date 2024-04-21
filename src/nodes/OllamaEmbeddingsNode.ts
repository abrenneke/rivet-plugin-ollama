import type {
  ChartNode,
  ChatMessage,
  ChatMessageMessagePart,
  EditorDefinition,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Rivet,
} from "@ironclad/rivet-core";
import { match } from "ts-pattern";

export type OllamaEmbeddingsNodeData = {
  model: string;
  useModelInput?: boolean;
  embeddings: number[][];
  documents: string[];
  useDocsInput?: boolean;
};

export type OllamaEmbeddingsNode = ChartNode<
  "ollamaEmbed",
  OllamaEmbeddingsNodeData
>;

type OllamaEmmbeddingsResponse = {
  embedding: number[];
};

export const ollamaEmbed = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<OllamaEmbeddingsNode> = {
    create(): OllamaEmbeddingsNode {
      const node: OllamaEmbeddingsNode = {
        id: rivet.newId<NodeId>(),
        data: {
          model: "mxbai-embed-large",
          useModelInput: false,
          embeddings: [],
          documents: ["hello", "zig"],
          useDocsInput: false,
        },
        title: "Ollama Embeddings",
        type: "ollamaEmbed",
        visualData: {
          x: 0,
          y: 0,
          width: 250,
        },
      };
      return node;
    },

    getInputDefinitions(data): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      if (data.useModelInput) {
        inputs.push({
          id: "model" as PortId,
          dataType: "string",
          title: "Model",
        });
      }

      if (data.useDocsInput) {
        inputs.push({
          id: "documents" as PortId,
          dataType: "string[]",
          title: "Documents",
        });
      }

      return inputs;
    },

    getOutputDefinitions(data): NodeOutputDefinition[] {
      let outputs: NodeOutputDefinition[] = [
        {
          id: "embeddings" as PortId,
          dataType: "vector[]",
          title: "Embedding",
          description: "The embedding output from Ollama.",
        },
      ];

      return outputs;
    },

    getEditors(): EditorDefinition<OllamaEmbeddingsNode>[] {
      return [
        {
          type: "stringList",
          dataKey: "documents",
          useInputToggleDataKey: "useDocsInput",
          label: "Documents",
        },
      ];
    },

    getBody(data) {
      return rivet.dedent`
        Model: ${data.useModelInput ? "(From Input)" : data.model || "Unset!"}
        Dimensions: 512
      `;
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Ollama Embeddings",
        group: "Ollama",
        infoBoxBody: "This is an Ollama Embeddings node using /api/embeddings.",
        infoBoxTitle: "Ollama Embeddings Node",
      };
    },

    async process(data, inputData, context) {
      let outputs: Outputs = {};

      const host = context.getPluginConfig("host") || "http://localhost:11434";

      if (!host.trim()) {
        throw new Error("No host set!");
      }

      const model = rivet.getInputOrData(data, inputData, "model", "string");
      if (!model) {
        throw new Error("No model set!");
      }

      const docs = rivet.getInputOrData(
        data,
        inputData,
        "documents",
        "string[]",
      );

      const embeddings: number[][] = new Array(docs.length)
        .fill(0)
        .map(() => new Array(512).fill(0.0));

      for (let i = 0; docs.length - 1; i++) {
        const prompt = docs[i];
        let apiResponse: Response;

        type RequestBodyType = {
          model: string;
          prompt: string;
        };

        const requestBody: RequestBodyType = {
          model,
          prompt,
        };

        try {
          apiResponse = await fetch(`${host}/api/embeddings`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });
        } catch (err) {
          throw new Error(`Error from Ollama: ${rivet.getError(err).message}`);
        }

        if (!apiResponse.ok) {
          try {
            const error = await apiResponse.json();
            throw new Error(`Error from Ollama: ${error.message}`);
          } catch (err) {
            throw new Error(`Error from Ollama: ${apiResponse.statusText}`);
          }
        }

        const reader = apiResponse.body?.getReader();

        if (!reader) {
          throw new Error("No response body!");
        }

        let finalResponse: OllamaEmmbeddingsResponse | undefined;

        if (!finalResponse) {
          throw new Error("No final response from Ollama!");
        }

        embeddings[i] = finalResponse.embedding;
      }

      outputs["embeddings" as PortId] = {
        type: "vector[]",
        value: embeddings,
      };

      return outputs;
    },
  };

  return rivet.pluginNodeDefinition(impl, "Ollama Embeddings");
};
