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

export type OllamaChatNodeData = {
  model: string;
  useModelInput?: boolean;

  promptFormat: string;

  jsonMode: boolean;

  outputFormat: string;

  advancedOutputs: boolean;

  // PARAMETERS

  mirostat?: number;
  useMirostatInput?: boolean;

  mirostatEta?: number;
  useMirostatEtaInput?: boolean;

  mirostatTau?: number;
  useMirostatTauInput?: boolean;

  numCtx?: number;
  useNumCtxInput?: boolean;

  numGqa?: number;
  useNumGqaInput?: boolean;

  numGpu?: number;
  useNumGpuInput?: boolean;

  numThread?: number;
  useNumThreadInput?: boolean;

  repeatLastN?: number;
  useRepeatLastNInput?: boolean;

  repeatPenalty?: number;
  useRepeatPenaltyInput?: boolean;

  temperature?: number;
  useTemperatureInput?: boolean;

  seed?: number;
  useSeedInput?: boolean;

  stop: string;
  useStopInput?: boolean;

  tfsZ?: number;
  useTfsZInput?: boolean;

  numPredict?: number;
  useNumPredictInput?: boolean;

  topK?: number;
  useTopKInput?: boolean;

  topP?: number;
  useTopPInput?: boolean;

  additionalParameters?: { key: string; value: string }[];
  useAdditionalParametersInput?: boolean;
};

export type OllamaChatNode = ChartNode<"ollamaChat2", OllamaChatNodeData>;

type OllamaStreamingContentResponse = {
  model: string;
  created_at: string;
  done: false;
  message: {
    role: string;
    content: string;
  };
};

type OllamaStreamingFinalResponse = {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: true;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
};

type OllamaStreamingGenerateResponse =
  | OllamaStreamingContentResponse
  | OllamaStreamingFinalResponse;

export const ollamaChat2 = (rivet: typeof Rivet) => {
  const impl: PluginNodeImpl<OllamaChatNode> = {
    create(): OllamaChatNode {
      const node: OllamaChatNode = {
        id: rivet.newId<NodeId>(),
        data: {
          model: "",
          useModelInput: false,
          promptFormat: "auto",
          jsonMode: false,
          outputFormat: "",
          advancedOutputs: false,
          stop: "",
        },
        title: "Ollama Chat",
        type: "ollamaChat2",
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

      inputs.push({
        id: "system-prompt" as PortId,
        dataType: "string",
        title: "System Prompt",
        description: "The system prompt to prepend to the messages list.",
        required: false,
        coerced: true,
      });

      inputs.push({
        id: "messages" as PortId,
        dataType: ["chat-message[]", "chat-message"],
        title: "Messages",
        description: "The chat messages to use as the prompt.",
      });

      if (data.useModelInput) {
        inputs.push({
          id: "model" as PortId,
          dataType: "string",
          title: "Model",
        });
      }

      return inputs;
    },

    getOutputDefinitions(data): NodeOutputDefinition[] {
      let outputs: NodeOutputDefinition[] = [
        {
          id: "output" as PortId,
          dataType: "string",
          title: "Output",
          description: "The output from Ollama.",
        },
        {
          id: "messages-sent" as PortId,
          dataType: "chat-message[]",
          title: "Messages Sent",
          description:
            "The messages sent to Ollama, including the system prompt.",
        },
        {
          id: "all-messages" as PortId,
          dataType: "chat-message[]",
          title: "All Messages",
          description: "All messages, including the reply from Ollama.",
        },
      ];

      return outputs;
    },

    getEditors(): EditorDefinition<OllamaChatNode>[] {
      return [
        {
          type: "string",
          dataKey: "model",
          label: "Model",
          useInputToggleDataKey: "useModelInput",
          helperMessage: "The LLM model to use in Ollama.",
        },
        {
          type: "toggle",
          dataKey: "jsonMode",
          label: "JSON mode",
          helperMessage: "Activates Ollamas JSON mode. Make sure to also instruct the model to return JSON"
        },
      ];
    },

    getBody(data) {
      return rivet.dedent`
        Model: ${data.useModelInput ? "(From Input)" : data.model || "Unset!"}
        JSON Mode: ${data.jsonMode || false}
      `;
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "Ollama Chat",
        group: "Ollama",
        infoBoxBody: "This is an Ollama Chat node using /api/chat.",
        infoBoxTitle: "Ollama Chat Node",
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

      const systemPrompt = rivet.coerceTypeOptional(
        inputData["system-prompt" as PortId],
        "string"
      );

      const chatMessages =
        rivet.coerceTypeOptional(
          inputData["messages" as PortId],
          "chat-message[]"
        ) ?? [];
      const allMessages: ChatMessage[] = systemPrompt
        ? [{ type: "system", message: systemPrompt }, ...chatMessages]
        : chatMessages;

        const inputMessages: InputMessage[] = allMessages.map(message => {
          if (typeof message.message === 'string') {
            return { type: message.type, message: message.message };
          } else {
            return { type: message.type, message: JSON.stringify(message.message) };
          }
        }); 
      const openAiMessages = formatChatMessages(inputMessages);

      let apiResponse: Response;
      
      type RequestBodyType = {
        model: string;
        messages: OutputMessage[];
        format?: string;
        stream: boolean;
      };

      const requestBody: RequestBodyType = {
        model,
        messages: openAiMessages,
        stream: true
      };
      
      if (data.jsonMode === true) {
        requestBody.format = "json";
      }

      try {
        apiResponse = await fetch(`${host}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody)
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

      let streamingResponseText = "";
      let llmResponseText = "";

      let finalResponse: OllamaStreamingFinalResponse | undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        if (value) {
          const chunk = new TextDecoder().decode(value);

          streamingResponseText += chunk;

          const lines = streamingResponseText.split("\n");
          streamingResponseText = lines.pop() ?? "";

          for (const line of lines) {
            try {
              const json = JSON.parse(line) as OllamaStreamingGenerateResponse;

              if (!("done" in json)) {
                throw new Error(`Invalid response from Ollama: ${line}`);
              }

              if (!json.done) {
                if (llmResponseText === "") {
                  llmResponseText += (json.message.content as string).trimStart();
                } else {
                  llmResponseText += json.message.content;
                }
              } else {
                finalResponse = json;
              }
            } catch (err) {
              throw new Error(
                `Error parsing line from Ollama streaming response: ${line}`
              );
            }
          }

          outputs["output" as PortId] = {
            type: "string",
            value: llmResponseText,
          };

          context.onPartialOutputs?.(outputs);
        }
      }

      if (!finalResponse) {
        throw new Error("No final response from Ollama!");
      }

      outputs["messages-sent" as PortId] = {
        type: "chat-message[]",
        value: allMessages,
      };

      outputs["all-messages" as PortId] = {
        type: "chat-message[]",
        value: [
          ...allMessages,
          {
            type: "assistant",
            message: llmResponseText,
            function_call: undefined,
          },
        ],
      };

      return outputs;
    },
  };

  return rivet.pluginNodeDefinition(impl, "Ollama Chat");
};

type InputMessage = {
  type: string;
  message: string;
};

type OutputMessage = {
  role: string;
  content: string;
};

function formatChatMessages(messages: InputMessage[]): OutputMessage[] {
  return messages.map((message) => ({
    role: message.type,
    content: message.message,
  }));
}