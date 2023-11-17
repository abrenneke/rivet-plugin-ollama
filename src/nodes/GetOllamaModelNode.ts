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
      const host = context.getPluginConfig("host") || "http://localhost:11434";

      const modelName = rivet.getInputOrData(data, inputData, "modelName");

      const response = await fetch(`${host}/api/show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
