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

  host?: string;
  useHostInput?: boolean;

  apiKey?: string;
  useApiKeyInput?: boolean;

  headers?: { key: string; value: string }[];
  useHeadersInput?: boolean;
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
          model: "",
          useModelInput: false,
          embedding: [],
          text: "",
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

      if (data.useHostInput) {
        inputs.push({
          dataType: "string",
          id: "host" as PortId,
          title: "Host",
          description:
            "The host to use for the Ollama API. You can use this to replace with any Ollama-compatible API. Leave blank for the default: http://localhost:11434",
        });
      }

      if (data.useApiKeyInput) {
        inputs.push({
          dataType: "string",
          id: "apiKey" as PortId,
          title: "API Key",
          description:
            "Optional API key for authentication with Ollama instances that require it.",
        });
      }

      if (data.useHeadersInput) {
        inputs.push({
          dataType: 'object',
          id: 'headers' as PortId,
          title: 'Headers',
          description: 'Additional headers to send to the API.',
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
        {
          type: "group",
          label: "Advanced",
          editors: [
            {
              type: "string",
              label: "Host",
              dataKey: "host",
              useInputToggleDataKey: "useHostInput",
              helperMessage:
                "The host to use for the Ollama API. You can use this to replace with any Ollama-compatible API. Leave blank for the default: http://localhost:11434",
            },
            {
              type: "string",
              label: "API Key",
              dataKey: "apiKey",
              useInputToggleDataKey: "useApiKeyInput",
              helperMessage:
                "Optional API key for authentication with Ollama instances that require it. Will be sent as Authorization Bearer token.",
            },
            {
              type: "keyValuePair",
              label: "Headers",
              dataKey: "headers",
              useInputToggleDataKey: "useHeadersInput",
              keyPlaceholder: "Header Name",
              valuePlaceholder: "Header Value",
              helperMessage:
                "Additional headers to send to the API.",
            },
          ],
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

      const hostInput = rivet.getInputOrData(data, inputData, "host", "string");
      const host =
        hostInput ||
        context.getPluginConfig("host") ||
        "http://localhost:11434";

      if (!host.trim()) {
        throw new Error("No host set!");
      }

      const apiKeyInput = rivet.getInputOrData(
        data,
        inputData,
        "apiKey",
        "string",
      );
      const apiKey = apiKeyInput || context.getPluginConfig("apiKey");

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
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (apiKey && apiKey.trim()) {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }

        // Add headers from data or input
        let additionalHeaders: Record<string, string> = {};
        if (data.useHeadersInput) {
          const headersInput = rivet.coerceTypeOptional(
            inputData["headers" as PortId],
            "object",
          ) as Record<string, string> | undefined;
          if (headersInput) {
            additionalHeaders = headersInput;
          }
        } else if (data.headers) {
          additionalHeaders = data.headers.reduce(
            (acc, { key, value }) => {
              acc[key] = value;
              return acc;
            },
            {} as Record<string, string>,
          );
        }
        
        Object.assign(headers, additionalHeaders);

        apiResponse = await fetch(`${host}/api/embeddings`, {
          method: "POST",
          headers,
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
