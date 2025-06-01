import type {
  ChartNode,
  NodeId,
  NodeInputDefinition,
  NodeUIData,
  PluginNodeImpl,
  PortId,
  Rivet,
} from "@ironclad/rivet-core";

export type ListOllamaModelsNode = ChartNode<
  "listOllamaModels",
  {
    host?: string;
    useHostInput?: boolean;

    apiKey?: string;
    useApiKeyInput?: boolean;

    headers?: { key: string; value: string }[];
    useHeadersInput?: boolean;
  }
>;

export const listOllamaModels = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<ListOllamaModelsNode> = {
    create() {
      return {
        id: rivet.newId<NodeId>(),
        data: {},
        title: "List Ollama Models",
        type: "listOllamaModels",
        visualData: {
          x: 0,
          y: 0,
          width: 300,
        },
      } satisfies ListOllamaModelsNode;
    },

    getInputDefinitions(data) {
      const inputs: NodeInputDefinition[] = [];

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

    getOutputDefinitions() {
      return [
        {
          id: "modelNames" as PortId,
          dataType: "string[]",
          title: "Model Names",
        },
      ];
    },

    getEditors() {
      return [
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

    getBody() {
      return "";
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "List Ollama Models",
        group: "Ollama",
        infoBoxTitle: "List Ollama Models Node",
        infoBoxBody: "Lists all models that are available in Ollama.",
      };
    },

    async process(data, inputData, context) {
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

      const headers: Record<string, string> = {};

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

      const response = await fetch(`${host}/api/tags`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        try {
          const body = await response.text();
          throw new Error(`Error from Ollama: ${body}`);
        } catch (err) {
          throw new Error(
            `Error ${response.status} from Ollama: ${
              rivet.getError(err).message
            }`
          );
        }
      }

      const { models } = (await response.json()) as {
        models: {
          name: string;
          modified_at: string;
          size: number;
        }[];
      };

      return {
        ["modelNames" as PortId]: {
          type: "string[]",
          value: models.map((model) => model.name),
        },
      };
    },
  };

  return rivet.pluginNodeDefinition(impl, "List Ollama Models");
};
