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

export type OllamaEmbeddingNodeData = {
  model: string;
  useModelInput?: boolean;
  embedding: number[];
  text: string;
  useTextInput?: boolean;
};

export type OllamaEmbeddingNode = ChartNode<
  "ollamaEmbed",
  OllamaEmbeddingNodeData
>;

type OllamaEmbeddingResponse = {
  embedding: number[];
};

export const ollamaEmbed = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<OllamaEmbeddingNode> = {
    create(): OllamaEmbeddingNode {
      const node: OllamaEmbeddingNode = {
        id: rivet.newId<NodeId>(),
        data: {
          model: "mxbai-embed-large",
          useModelInput: false,
          embedding: [],
          text: "I thought what I'd do was, I'd pretend I was one of those deaf-mutes.",
          useTextInput: false,
        },
        title: "Ollama Embedding",
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

      if (data.useTextInput) {
        inputs.push({
          id: "text" as PortId,
          dataType: "string",
          title: "Text",
        });
      }

      return inputs;
    },

    getOutputDefinitions(data): NodeOutputDefinition[] {
      let outputs: NodeOutputDefinition[] = [
        {
          id: "embedding" as PortId,
          dataType: "vector",
          title: "Embedding",
          description: "The embedding output from Ollama.",
        },
      ];

      return outputs;
    },

    getEditors(): EditorDefinition<OllamaEmbeddingNode>[] {
      return [
        {
          type: "string",
          dataKey: "model",
          useInputToggleDataKey: "useModelInput",
          label: "Model",
        },
        {
          type: "string",
          dataKey: "text",
          useInputToggleDataKey: "useTextInput",
          label: "Text",
        },
      ];
    },

    getBody(data) {
      return rivet.dedent`
        Model: ${data.useModelInput ? "(From Input)" : data.model || "Unset!"}
        Text: ${data.useTextInput ? "(From Input)" : data.text || "Unset!"}
      `;
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Ollama Embedding",
        group: "Ollama",
        infoBoxBody: "This is an Ollama Embedding node using /api/embeddings.",
        infoBoxTitle: "Ollama Embedding Node",
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

      const prompt = rivet.getInputOrData(data, inputData, "text", "string");
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
        throw new Error(
          `Error from Ollama {POST}: ${rivet.getError(err).message}`,
        );
      }

      if (!apiResponse.ok) {
        try {
          const error = await apiResponse.json();
          throw new Error(`Error from Ollama {JSON}: ${error.message}`);
        } catch (err) {
          throw new Error(`Error from Ollama {RAW}: ${apiResponse.statusText}`);
        }
      }

      const reader = apiResponse.body?.getReader();

      if (!reader) {
        throw new Error("No response body!");
      }

      let streamingResponseText = "";
      let llmResponseText = "";
      const { value, done } = await reader.read();
      const line = new TextDecoder().decode(value);
      const response = JSON.parse(line) as OllamaEmbeddingResponse;

      outputs["embedding" as PortId] = {
        type: "vector",
        value: response.embedding,
      };

      return outputs;
    },
  };

  return rivet.pluginNodeDefinition(impl, "Ollama Embedding");
};
