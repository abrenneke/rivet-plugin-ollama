import type {
  ChartNode,
  NodeId,
  NodeInputDefinition,
  NodeUIData,
  PluginNodeImpl,
  PortId,
  Rivet,
  pluginNodeDefinition,
} from "@ironclad/rivet-core";

export type GetOllamaModelNode = ChartNode<
  "getOllamaModel",
  {
    modelName: string;
    useModelNameInput?: boolean;

    host?: string;
    useHostInput?: boolean;

    apiKey?: string;
    useApiKeyInput?: boolean;

    headers?: { key: string; value: string }[];
    useHeadersInput?: boolean;
  }
>;

export const getOllamaModel = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<GetOllamaModelNode> = {
    create() {
      return {
        id: rivet.newId<NodeId>(),
        data: {
          modelName: "",
          useModelNameInput: true,
        },
        title: "Get Ollama Model",
        type: "getOllamaModel",
        visualData: {
          x: 0,
          y: 0,
          width: 250,
        },
      } satisfies GetOllamaModelNode;
    },

    getInputDefinitions(data) {
      const inputs: NodeInputDefinition[] = [];

      if (data.useModelNameInput) {
        inputs.push({
          id: "modelName" as PortId,
          dataType: "string",
          title: "Model Name",
          description: "The name of the model to get.",
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
          id: "license" as PortId,
          dataType: "string",
          title: "License",
          description: "Contents of the license block of the model",
        },
        {
          id: "modelfile" as PortId,
          dataType: "string",
          title: "Modelfile",
          description: "The Ollama modelfile for the model",
        },
        {
          id: "parameters" as PortId,
          dataType: "string",
          title: "Parameters",
          description: "The parameters for the model",
        },
        {
          id: "template" as PortId,
          dataType: "string",
          title: "Template",
          description: "The template for the model",
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
        contextMenuTitle: "Get Ollama Model",
        group: "Ollama",
        infoBoxTitle: "Get Ollama Model Node",
        infoBoxBody: "Gets information about a model from Ollama.",
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

      const response = await fetch(`${host}/api/show`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (response.status === 404) {
        return {
          ["license" as PortId]: {
            type: "control-flow-excluded",
            value: undefined,
          },
          ["modelfile" as PortId]: {
            type: "control-flow-excluded",
            value: undefined,
          },
          ["parameters" as PortId]: {
            type: "control-flow-excluded",
            value: undefined,
          },
          ["template" as PortId]: {
            type: "control-flow-excluded",
            value: undefined,
          },
        };
      }

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

      const { license, modelfile, parameters, template } =
        (await response.json()) as {
          license: string;
          modelfile: string;
          parameters: string;
          template: string;
        };

      return {
        ["license" as PortId]: {
          type: "string",
          value: license,
        },
        ["modelfile" as PortId]: {
          type: "string",
          value: modelfile,
        },
        ["parameters" as PortId]: {
          type: "string",
          value: parameters,
        },
        ["template" as PortId]: {
          type: "string",
          value: template,
        },
      };
    },
  };

  return rivet.pluginNodeDefinition(impl, "List Ollama Models");
};
