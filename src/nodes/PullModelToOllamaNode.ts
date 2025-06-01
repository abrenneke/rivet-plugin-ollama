import type {
  ChartNode,
  NodeId,
  NodeInputDefinition,
  NodeUIData,
  PluginNodeImpl,
  PortId,
  Rivet,
} from "@ironclad/rivet-core";

export type PullModelToOllamaNode = ChartNode<
  "pullModelToOllama",
  {
    modelName: string;
    useModelNameInput?: boolean;

    insecure: boolean;

    host?: string;
    useHostInput?: boolean;

    apiKey?: string;
    useApiKeyInput?: boolean;

    headers?: { key: string; value: string }[];
    useHeadersInput?: boolean;
  }
>;

export const pullModelToOllama = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<PullModelToOllamaNode> = {
    create() {
      return {
        id: rivet.newId<NodeId>(),
        data: {
          modelName: "",
          useModelNameInput: true,
          insecure: false,
        },
        title: "Pull Model to Ollama",
        type: "pullModelToOllama",
        visualData: {
          x: 0,
          y: 0,
          width: 250,
        },
      } satisfies PullModelToOllamaNode;
    },

    getInputDefinitions(data) {
      const inputs: NodeInputDefinition[] = [];

      if (data.useModelNameInput) {
        inputs.push({
          id: "modelName" as PortId,
          dataType: "string",
          title: "Model Name",
          description: "The name of the model to pull from the ollama library.",
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

    getOutputDefinitions() {
      return [
        {
          id: "modelName" as PortId,
          dataType: "string",
          title: "Model Name",
          description: "The name of the model that was pulled.",
        },
      ];
    },

    getEditors() {
      return [
        {
          type: "string",
          dataKey: "modelName",
          useInputToggleDataKey: "useModelNameInput",
          label: "Model Name",
          helperMessage: "The name of the model to get.",
          placeholder: "Model Name",
        },
        {
          type: "toggle",
          dataKey: "insecure",
          label: "Insecure",
          helperMessage:
            "Allow insecure connections to the library. Only use this if you are pulling from your own library during development.",
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
        Model: ${
          data.useModelNameInput ? "(From Input)" : data.modelName || "Unset!"
        }
      `;
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Pull Model to Ollama",
        group: "Ollama",
        infoBoxTitle: "Pull Model to Ollama Node",
        infoBoxBody:
          "Downloads a model from the Ollama library to the Ollama server.",
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

      const modelName = rivet.getInputOrData(data, inputData, "modelName");

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

      const response = await fetch(`${host}/api/pull`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: modelName,
          insecure: data.insecure,
          stream: true,
        }),
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

      // Stream the response to avoid fetch timeout
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Response body was not readable.");
      }

      while (true) {
        const { done } = await reader.read();

        if (done) {
          break;
        }

        // Nothing to do with the value right now
      }

      return {
        ["modelName" as PortId]: {
          type: "string",
          value: modelName,
        },
      };
    },
  };

  return rivet.pluginNodeDefinition(impl, "List Ollama Models");
};
