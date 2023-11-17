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
      const host = context.getPluginConfig("host") || "http://localhost:11434";

      const modelName = rivet.getInputOrData(data, inputData, "modelName");

      const response = await fetch(`${host}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
