import type {
  ChartNode,
  NodeId,
  NodeUIData,
  PluginNodeImpl,
  PortId,
  Rivet,
} from "@ironclad/rivet-core";

export type ListOllamaModelsNode = ChartNode<"listOllamaModels", {}>;

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

    getInputDefinitions() {
      return [];
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
      return [];
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

    async process(_data, _inputData, context) {
      const host = context.getPluginConfig("host") || "http://localhost:11434";

      const response = await fetch(`${host}/api/tags`, {
        method: "GET",
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
