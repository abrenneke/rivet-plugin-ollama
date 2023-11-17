// node_modules/ts-pattern/dist/index.js
var t = Symbol.for("@ts-pattern/matcher");
var e = Symbol.for("@ts-pattern/isVariadic");
var n = "@ts-pattern/anonymous-select-key";
var r = (t2) => Boolean(t2 && "object" == typeof t2);
var i = (e2) => e2 && !!e2[t];
var s = (n2, o2, c2) => {
  if (i(n2)) {
    const e2 = n2[t](), { matched: r2, selections: i2 } = e2.match(o2);
    return r2 && i2 && Object.keys(i2).forEach((t2) => c2(t2, i2[t2])), r2;
  }
  if (r(n2)) {
    if (!r(o2))
      return false;
    if (Array.isArray(n2)) {
      if (!Array.isArray(o2))
        return false;
      let t2 = [], r2 = [], a = [];
      for (const s2 of n2.keys()) {
        const o3 = n2[s2];
        i(o3) && o3[e] ? a.push(o3) : a.length ? r2.push(o3) : t2.push(o3);
      }
      if (a.length) {
        if (a.length > 1)
          throw new Error("Pattern error: Using `...P.array(...)` several times in a single pattern is not allowed.");
        if (o2.length < t2.length + r2.length)
          return false;
        const e2 = o2.slice(0, t2.length), n3 = 0 === r2.length ? [] : o2.slice(-r2.length), i2 = o2.slice(t2.length, 0 === r2.length ? Infinity : -r2.length);
        return t2.every((t3, n4) => s(t3, e2[n4], c2)) && r2.every((t3, e3) => s(t3, n3[e3], c2)) && (0 === a.length || s(a[0], i2, c2));
      }
      return n2.length === o2.length && n2.every((t3, e2) => s(t3, o2[e2], c2));
    }
    return Object.keys(n2).every((e2) => {
      const r2 = n2[e2];
      return (e2 in o2 || i(a = r2) && "optional" === a[t]().matcherType) && s(r2, o2[e2], c2);
      var a;
    });
  }
  return Object.is(o2, n2);
};
var o = (e2) => {
  var n2, s2, a;
  return r(e2) ? i(e2) ? null != (n2 = null == (s2 = (a = e2[t]()).getSelectionKeys) ? void 0 : s2.call(a)) ? n2 : [] : Array.isArray(e2) ? c(e2, o) : c(Object.values(e2), o) : [];
};
var c = (t2, e2) => t2.reduce((t3, n2) => t3.concat(e2(n2)), []);
function u(t2) {
  return Object.assign(t2, { optional: () => l(t2), and: (e2) => m(t2, e2), or: (e2) => y(t2, e2), select: (e2) => void 0 === e2 ? p(t2) : p(e2, t2) });
}
function l(e2) {
  return u({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return void 0 === t2 ? (o(e2).forEach((t3) => r2(t3, void 0)), { matched: true, selections: n2 }) : { matched: s(e2, t2, r2), selections: n2 };
  }, getSelectionKeys: () => o(e2), matcherType: "optional" }) });
}
function m(...e2) {
  return u({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return { matched: e2.every((e3) => s(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, o), matcherType: "and" }) });
}
function y(...e2) {
  return u({ [t]: () => ({ match: (t2) => {
    let n2 = {};
    const r2 = (t3, e3) => {
      n2[t3] = e3;
    };
    return c(e2, o).forEach((t3) => r2(t3, void 0)), { matched: e2.some((e3) => s(e3, t2, r2)), selections: n2 };
  }, getSelectionKeys: () => c(e2, o), matcherType: "or" }) });
}
function d(e2) {
  return { [t]: () => ({ match: (t2) => ({ matched: Boolean(e2(t2)) }) }) };
}
function p(...e2) {
  const r2 = "string" == typeof e2[0] ? e2[0] : void 0, i2 = 2 === e2.length ? e2[1] : "string" == typeof e2[0] ? void 0 : e2[0];
  return u({ [t]: () => ({ match: (t2) => {
    let e3 = { [null != r2 ? r2 : n]: t2 };
    return { matched: void 0 === i2 || s(i2, t2, (t3, n2) => {
      e3[t3] = n2;
    }), selections: e3 };
  }, getSelectionKeys: () => [null != r2 ? r2 : n].concat(void 0 === i2 ? [] : o(i2)) }) });
}
function v(t2) {
  return "number" == typeof t2;
}
function b(t2) {
  return "string" == typeof t2;
}
function w(t2) {
  return "bigint" == typeof t2;
}
var S = u(d(function(t2) {
  return true;
}));
var j = (t2) => Object.assign(u(t2), { startsWith: (e2) => {
  return j(m(t2, (n2 = e2, d((t3) => b(t3) && t3.startsWith(n2)))));
  var n2;
}, endsWith: (e2) => {
  return j(m(t2, (n2 = e2, d((t3) => b(t3) && t3.endsWith(n2)))));
  var n2;
}, minLength: (e2) => j(m(t2, ((t3) => d((e3) => b(e3) && e3.length >= t3))(e2))), maxLength: (e2) => j(m(t2, ((t3) => d((e3) => b(e3) && e3.length <= t3))(e2))), includes: (e2) => {
  return j(m(t2, (n2 = e2, d((t3) => b(t3) && t3.includes(n2)))));
  var n2;
}, regex: (e2) => {
  return j(m(t2, (n2 = e2, d((t3) => b(t3) && Boolean(t3.match(n2))))));
  var n2;
} });
var E = j(d(b));
var K = (t2) => Object.assign(u(t2), { between: (e2, n2) => K(m(t2, ((t3, e3) => d((n3) => v(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => K(m(t2, ((t3) => d((e3) => v(e3) && e3 < t3))(e2))), gt: (e2) => K(m(t2, ((t3) => d((e3) => v(e3) && e3 > t3))(e2))), lte: (e2) => K(m(t2, ((t3) => d((e3) => v(e3) && e3 <= t3))(e2))), gte: (e2) => K(m(t2, ((t3) => d((e3) => v(e3) && e3 >= t3))(e2))), int: () => K(m(t2, d((t3) => v(t3) && Number.isInteger(t3)))), finite: () => K(m(t2, d((t3) => v(t3) && Number.isFinite(t3)))), positive: () => K(m(t2, d((t3) => v(t3) && t3 > 0))), negative: () => K(m(t2, d((t3) => v(t3) && t3 < 0))) });
var A = K(d(v));
var x = (t2) => Object.assign(u(t2), { between: (e2, n2) => x(m(t2, ((t3, e3) => d((n3) => w(n3) && t3 <= n3 && e3 >= n3))(e2, n2))), lt: (e2) => x(m(t2, ((t3) => d((e3) => w(e3) && e3 < t3))(e2))), gt: (e2) => x(m(t2, ((t3) => d((e3) => w(e3) && e3 > t3))(e2))), lte: (e2) => x(m(t2, ((t3) => d((e3) => w(e3) && e3 <= t3))(e2))), gte: (e2) => x(m(t2, ((t3) => d((e3) => w(e3) && e3 >= t3))(e2))), positive: () => x(m(t2, d((t3) => w(t3) && t3 > 0))), negative: () => x(m(t2, d((t3) => w(t3) && t3 < 0))) });
var P = x(d(w));
var T = u(d(function(t2) {
  return "boolean" == typeof t2;
}));
var k = u(d(function(t2) {
  return "symbol" == typeof t2;
}));
var B = u(d(function(t2) {
  return null == t2;
}));
var W = { matched: false, value: void 0 };
function N(t2) {
  return new $(t2, W);
}
var $ = class _$ {
  constructor(t2, e2) {
    this.input = void 0, this.state = void 0, this.input = t2, this.state = e2;
  }
  with(...t2) {
    if (this.state.matched)
      return this;
    const e2 = t2[t2.length - 1], r2 = [t2[0]];
    let i2;
    3 === t2.length && "function" == typeof t2[1] ? (r2.push(t2[0]), i2 = t2[1]) : t2.length > 2 && r2.push(...t2.slice(1, t2.length - 1));
    let o2 = false, c2 = {};
    const a = (t3, e3) => {
      o2 = true, c2[t3] = e3;
    }, u2 = !r2.some((t3) => s(t3, this.input, a)) || i2 && !Boolean(i2(this.input)) ? W : { matched: true, value: e2(o2 ? n in c2 ? c2[n] : c2 : this.input, this.input) };
    return new _$(this.input, u2);
  }
  when(t2, e2) {
    if (this.state.matched)
      return this;
    const n2 = Boolean(t2(this.input));
    return new _$(this.input, n2 ? { matched: true, value: e2(this.input, this.input) } : W);
  }
  otherwise(t2) {
    return this.state.matched ? this.state.value : t2(this.input);
  }
  exhaustive() {
    return this.run();
  }
  run() {
    if (this.state.matched)
      return this.state.value;
    let t2;
    try {
      t2 = JSON.stringify(this.input);
    } catch (e2) {
      t2 = this.input;
    }
    throw new Error(`Pattern matching error: no pattern matches value ${t2}`);
  }
  returnType() {
    return this;
  }
};

// src/nodes/OllamaChatNode.ts
var ollamaChat = (rivet) => {
  const impl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          model: "",
          useModelInput: false,
          promptFormat: "llama2",
          outputFormat: "",
          advancedOutputs: false,
          stop: ""
        },
        title: "Ollama Chat",
        type: "ollamaChat",
        visualData: {
          x: 0,
          y: 0,
          width: 250
        }
      };
      return node;
    },
    getInputDefinitions(data) {
      const inputs = [];
      inputs.push({
        id: "system-prompt",
        dataType: "string",
        title: "System Prompt",
        description: "The system prompt to prepend to the messages list.",
        required: false,
        coerced: true
      });
      inputs.push({
        id: "messages",
        dataType: ["chat-message[]", "chat-message"],
        title: "Messages",
        description: "The chat messages to use as the prompt."
      });
      if (data.useModelInput) {
        inputs.push({
          id: "model",
          dataType: "string",
          title: "Model"
        });
      }
      if (data.useMirostatInput) {
        inputs.push({
          id: "mirostat",
          dataType: "number",
          title: "Mirostat",
          description: 'The "mirostat" parameter.'
        });
      }
      if (data.useMirostatEtaInput) {
        inputs.push({
          id: "mirostatEta",
          dataType: "number",
          title: "Mirostat Eta",
          description: 'The "mirostat_eta" parameter.'
        });
      }
      if (data.useMirostatTauInput) {
        inputs.push({
          id: "mirostatTau",
          dataType: "number",
          title: "Mirostat Tau",
          description: 'The "mirostat_tau" parameter.'
        });
      }
      if (data.useNumCtxInput) {
        inputs.push({
          id: "numCtx",
          dataType: "number",
          title: "Num Ctx",
          description: 'The "num_ctx" parameter.'
        });
      }
      if (data.useNumGqaInput) {
        inputs.push({
          id: "numGqa",
          dataType: "number",
          title: "Num GQA",
          description: 'The "num_gqa" parameter.'
        });
      }
      if (data.useNumGpuInput) {
        inputs.push({
          id: "numGpu",
          dataType: "number",
          title: "Num GPUs",
          description: 'The "num_gpu" parameter.'
        });
      }
      if (data.useNumThreadInput) {
        inputs.push({
          id: "numThread",
          dataType: "number",
          title: "Num Threads",
          description: 'The "num_thread" parameter.'
        });
      }
      if (data.useRepeatLastNInput) {
        inputs.push({
          id: "repeatLastN",
          dataType: "number",
          title: "Repeat Last N",
          description: 'The "repeat_last_n" parameter.'
        });
      }
      if (data.useRepeatPenaltyInput) {
        inputs.push({
          id: "repeatPenalty",
          dataType: "number",
          title: "Repeat Penalty",
          description: 'The "repeat_penalty" parameter.'
        });
      }
      if (data.useTemperatureInput) {
        inputs.push({
          id: "temperature",
          dataType: "number",
          title: "Temperature",
          description: 'The "temperature" parameter.'
        });
      }
      if (data.useSeedInput) {
        inputs.push({
          id: "seed",
          dataType: "number",
          title: "Seed",
          description: 'The "seed" parameter.'
        });
      }
      if (data.useStopInput) {
        inputs.push({
          id: "stop",
          dataType: "string[]",
          title: "Stop",
          description: 'The "stop" parameter.'
        });
      }
      if (data.useTfsZInput) {
        inputs.push({
          id: "tfsZ",
          dataType: "number",
          title: "TFS Z",
          description: 'The "tfs_z" parameter.'
        });
      }
      if (data.useNumPredictInput) {
        inputs.push({
          id: "numPredict",
          dataType: "number",
          title: "Num Predict",
          description: 'The "num_predict" parameter.'
        });
      }
      if (data.useTopKInput) {
        inputs.push({
          id: "topK",
          dataType: "number",
          title: "Top K",
          description: 'The "top_k" parameter.'
        });
      }
      if (data.useTopPInput) {
        inputs.push({
          id: "topP",
          dataType: "number",
          title: "Top P",
          description: 'The "top_p" parameter.'
        });
      }
      return inputs;
    },
    getOutputDefinitions(data) {
      let outputs = [
        {
          id: "output",
          dataType: "string",
          title: "Output",
          description: "The output from Ollama."
        },
        {
          id: "prompt",
          dataType: "string",
          title: "Prompt",
          description: "The full prompt, with formattting, that was sent to Ollama."
        },
        {
          id: "messages-sent",
          dataType: "chat-message[]",
          title: "Messages Sent",
          description: "The messages sent to Ollama, including the system prompt."
        },
        {
          id: "all-messages",
          dataType: "chat-message[]",
          title: "All Messages",
          description: "All messages, including the reply from Ollama."
        }
      ];
      if (data.advancedOutputs) {
        outputs = [
          ...outputs,
          {
            id: "total-duration",
            dataType: "number",
            title: "Total Duration",
            description: "Time spent generating the response"
          },
          {
            id: "load-duration",
            dataType: "number",
            title: "Load Duration",
            description: "Time spent in nanoseconds loading the model"
          },
          {
            id: "sample-count",
            dataType: "number",
            title: "Sample Count",
            description: "Number of samples generated"
          },
          {
            id: "sample-duration",
            dataType: "number",
            title: "Sample Duration",
            description: "Time spent generating samples"
          },
          {
            id: "prompt-eval-count",
            dataType: "number",
            title: "Prompt Eval Count",
            description: "Number of tokens in the prompt"
          },
          {
            id: "prompt-eval-duration",
            dataType: "number",
            title: "Prompt Eval Duration",
            description: "Time spend in nanoseconds evaluating the prompt"
          },
          {
            id: "eval-count",
            dataType: "number",
            title: "Eval Count",
            description: "Number of tokens in the response"
          },
          {
            id: "eval-duration",
            dataType: "number",
            title: "Eval Duration",
            description: "Time in nanoseconds spent generating the response"
          },
          {
            id: "tokens-per-second",
            dataType: "number",
            title: "Tokens Per Second",
            description: "Tokens generated per second"
          },
          {
            id: "parameters",
            dataType: "object",
            title: "Parameters",
            description: "The parameters sent to Ollama"
          }
        ];
      }
      return outputs;
    },
    getEditors() {
      return [
        {
          type: "string",
          dataKey: "model",
          label: "Model",
          useInputToggleDataKey: "useModelInput",
          helperMessage: "The LLM model to use in Ollama."
        },
        {
          type: "dropdown",
          dataKey: "promptFormat",
          label: "Prompt Format",
          options: [
            { value: "", label: "Raw" },
            { value: "llama2", label: "Llama 2 Instruct" }
          ],
          defaultValue: "",
          helperMessage: "The way to format chat messages for the prompt being sent to the ollama model. Raw means no formatting is applied."
        },
        {
          type: "toggle",
          dataKey: "advancedOutputs",
          label: "Advanced Outputs",
          helperMessage: "Add additional outputs with detailed information about the Ollama execution."
        },
        {
          type: "group",
          label: "Parameters",
          editors: [
            {
              type: "number",
              dataKey: "mirostat",
              useInputToggleDataKey: "useMirostatInput",
              label: "Mirostat",
              helperMessage: "Enable Mirostat sampling for controlling perplexity. (default: 0, 0 = disabled, 1 = Mirostat, 2 = Mirostat 2.0)",
              min: 0,
              max: 1,
              step: 1,
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "mirostatEta",
              useInputToggleDataKey: "useMirostatEtaInput",
              label: "Mirostat Eta",
              helperMessage: "Influences how quickly the algorithm responds to feedback from the generated text. A lower learning rate will result in slower adjustments, while a higher learning rate will make the algorithm more responsive. (Default: 0.1)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "mirostatTau",
              useInputToggleDataKey: "useMirostatTauInput",
              label: "Mirostat Tau",
              helperMessage: "Controls the balance between coherence and diversity of the output. A lower value will result in more focused and coherent text. (Default: 5.0)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "numCtx",
              useInputToggleDataKey: "useNumCtxInput",
              label: "Num Ctx",
              helperMessage: "Sets the size of the context window used to generate the next token. (Default: 2048)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "numGqa",
              useInputToggleDataKey: "useNumGqaInput",
              label: "Num GQA",
              helperMessage: "The number of GQA groups in the transformer layer. Required for some models, for example it is 8 for llama2:70b",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "numGpu",
              useInputToggleDataKey: "useNumGpuInput",
              label: "Num GPUs",
              helperMessage: "The number of layers to send to the GPU(s). On macOS it defaults to 1 to enable metal support, 0 to disable.",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "numThread",
              useInputToggleDataKey: "useNumThreadInput",
              label: "Num Threads",
              helperMessage: "Sets the number of threads to use during computation. By default, Ollama will detect this for optimal performance. It is recommended to set this value to the number of physical CPU cores your system has (as opposed to the logical number of cores).",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "repeatLastN",
              useInputToggleDataKey: "useRepeatLastNInput",
              label: "Repeat Last N",
              helperMessage: "Sets how far back for the model to look back to prevent repetition. (Default: 64, 0 = disabled, -1 = num_ctx)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "repeatPenalty",
              useInputToggleDataKey: "useRepeatPenaltyInput",
              label: "Repeat Penalty",
              helperMessage: "Sets how strongly to penalize repetitions. A higher value (e.g., 1.5) will penalize repetitions more strongly, while a lower value (e.g., 0.9) will be more lenient. (Default: 1.1)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "temperature",
              useInputToggleDataKey: "useTemperatureInput",
              label: "Temperature",
              helperMessage: "The temperature of the model. Increasing the temperature will make the model answer more creatively. (Default: 0.8)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "seed",
              useInputToggleDataKey: "useSeedInput",
              label: "Seed",
              helperMessage: "Sets the random number seed to use for generation. Setting this to a specific number will make the model generate the same text for the same prompt. (Default: 0)",
              allowEmpty: true
            },
            {
              type: "string",
              dataKey: "stop",
              useInputToggleDataKey: "useStopInput",
              label: "Stop",
              helperMessage: "Sets the stop sequences to use. When this pattern is encountered the LLM will stop generating text and return."
            },
            {
              type: "number",
              dataKey: "tfsZ",
              useInputToggleDataKey: "useTfsZInput",
              label: "TFS Z",
              helperMessage: "Tail free sampling is used to reduce the impact of less probable tokens from the output. A higher value (e.g., 2.0) will reduce the impact more, while a value of 1.0 disables this setting. (default: 1)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "numPredict",
              useInputToggleDataKey: "useNumPredictInput",
              label: "Num Predict",
              helperMessage: "Maximum number of tokens to predict when generating text. (Default: 128, -1 = infinite generation, -2 = fill context)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "topK",
              useInputToggleDataKey: "useTopKInput",
              label: "Top K",
              helperMessage: "Reduces the probability of generating nonsense. A higher value (e.g. 100) will give more diverse answers, while a lower value (e.g. 10) will be more conservative. (Default: 40)",
              allowEmpty: true
            },
            {
              type: "number",
              dataKey: "topP",
              useInputToggleDataKey: "useTopPInput",
              label: "Top P",
              helperMessage: "Works together with top-k. A higher value (e.g., 0.95) will lead to more diverse text, while a lower value (e.g., 0.5) will generate more focused and conservative text. (Default: 0.9)",
              allowEmpty: true
            },
            {
              type: "keyValuePair",
              dataKey: "additionalParameters",
              useInputToggleDataKey: "useAdditionalParametersInput",
              label: "Additional Parameters",
              keyPlaceholder: "Parameter",
              valuePlaceholder: "Value",
              helperMessage: "Additional parameters to pass to Ollama. Numbers will be parsed and sent as numbers, otherwise they will be sent as strings."
            }
          ]
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
        Model: ${data.useModelInput ? "(From Input)" : data.model || "Unset!"}
        Format: ${data.promptFormat || "Raw"}
      `;
    },
    getUIData() {
      return {
        contextMenuTitle: "Ollama Chat",
        group: "Ollama",
        infoBoxBody: "This is an Ollama Chat node.",
        infoBoxTitle: "Ollama Chat Node"
      };
    },
    async process(data, inputData, context) {
      let outputs = {};
      const host = context.getPluginConfig("host") || "http://localhost:11434";
      if (!host.trim()) {
        throw new Error("No host set!");
      }
      const model = rivet.getInputOrData(data, inputData, "model", "string");
      if (!model) {
        throw new Error("No model set!");
      }
      const systemPrompt = rivet.coerceTypeOptional(
        inputData["system-prompt"],
        "string"
      );
      const messages = rivet.coerceTypeOptional(
        inputData["messages"],
        "chat-message[]"
      ) ?? [];
      const allMessages = systemPrompt ? [{ type: "system", message: systemPrompt }, ...messages] : messages;
      const prompt = formatChatMessages(allMessages, data.promptFormat);
      let additionalParameters = (data.additionalParameters ?? []).reduce((acc, { key, value }) => {
        const parsedValue = Number(value);
        acc[key] = isNaN(parsedValue) ? value : parsedValue;
        return acc;
      }, {});
      if (data.useAdditionalParametersInput) {
        additionalParameters = rivet.coerceTypeOptional(
          inputData["additionalParameters"],
          "object"
        ) ?? {};
      }
      let stop = void 0;
      if (data.useStopInput) {
        stop = rivet.coerceTypeOptional(
          inputData["stop"],
          "string[]"
        );
      } else {
        stop = data.stop ? [data.stop] : void 0;
      }
      const parameters = {
        mirostat: rivet.getInputOrData(data, inputData, "mirostat", "number"),
        mirostat_eta: rivet.getInputOrData(
          data,
          inputData,
          "mirostatEta",
          "number"
        ),
        mirostat_tau: rivet.getInputOrData(
          data,
          inputData,
          "mirostatTau",
          "number"
        ),
        num_ctx: rivet.getInputOrData(data, inputData, "numCtx", "number"),
        num_gqa: rivet.getInputOrData(data, inputData, "numGqa", "number"),
        num_gpu: rivet.getInputOrData(data, inputData, "numGpu", "number"),
        num_thread: rivet.getInputOrData(
          data,
          inputData,
          "numThread",
          "number"
        ),
        repeat_last_n: rivet.getInputOrData(
          data,
          inputData,
          "repeatLastN",
          "number"
        ),
        repeat_penalty: rivet.getInputOrData(
          data,
          inputData,
          "repeatPenalty",
          "number"
        ),
        temperature: rivet.getInputOrData(
          data,
          inputData,
          "temperature",
          "number"
        ),
        seed: rivet.getInputOrData(data, inputData, "seed", "number"),
        stop,
        tfs_z: rivet.getInputOrData(data, inputData, "tfsZ", "number"),
        num_predict: rivet.getInputOrData(
          data,
          inputData,
          "numPredict",
          "number"
        ),
        top_k: rivet.getInputOrData(data, inputData, "topK", "number"),
        top_p: rivet.getInputOrData(data, inputData, "topP", "number"),
        ...additionalParameters
      };
      let apiResponse;
      try {
        apiResponse = await fetch(`${host}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            prompt,
            format: data.outputFormat || void 0,
            raw: true,
            stream: true,
            options: parameters
          })
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
      let finalResponse;
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
              const json = JSON.parse(line);
              if (!("done" in json)) {
                throw new Error(`Invalid response from Ollama: ${line}`);
              }
              if (!json.done) {
                if (llmResponseText === "") {
                  llmResponseText += json.response.trimStart();
                } else {
                  llmResponseText += json.response;
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
          outputs["output"] = {
            type: "string",
            value: llmResponseText
          };
          context.onPartialOutputs?.(outputs);
        }
      }
      if (!finalResponse) {
        throw new Error("No final response from Ollama!");
      }
      outputs["prompt"] = {
        type: "string",
        value: prompt
      };
      outputs["messages-sent"] = {
        type: "chat-message[]",
        value: allMessages
      };
      outputs["all-messages"] = {
        type: "chat-message[]",
        value: [
          ...allMessages,
          {
            type: "assistant",
            message: llmResponseText,
            function_call: void 0
          }
        ]
      };
      if (data.advancedOutputs) {
        outputs["total-duration"] = {
          type: "number",
          value: finalResponse.total_duration
        };
        outputs["load-duration"] = {
          type: "number",
          value: finalResponse.load_duration
        };
        outputs["sample-count"] = {
          type: "number",
          value: finalResponse.sample_count ?? 0
        };
        outputs["sample-duration"] = {
          type: "number",
          value: finalResponse.sample_duration ?? 0
        };
        outputs["prompt-eval-count"] = {
          type: "number",
          value: finalResponse.prompt_eval_count
        };
        outputs["prompt-eval-duration"] = {
          type: "number",
          value: finalResponse.prompt_eval_duration
        };
        outputs["eval-count"] = {
          type: "number",
          value: finalResponse.eval_count
        };
        outputs["eval-duration"] = {
          type: "number",
          value: finalResponse.eval_duration
        };
        outputs["tokens-per-second"] = {
          type: "number",
          value: finalResponse.eval_count / (finalResponse.eval_duration / 1e9)
        };
        outputs["parameters"] = {
          type: "object",
          value: parameters
        };
      }
      return outputs;
    }
  };
  return rivet.pluginNodeDefinition(impl, "Ollama Chat");
};
function formatChatMessages(messages, format) {
  return N(format).with(
    "",
    () => messages.map((message) => formatChatMessage(message, format)).join("\n")
    // Hopefully \n is okay? Instead of joining with empty string?
  ).with("llama2", () => formatLlama2Instruct(messages)).otherwise(() => {
    throw new Error(`Unsupported format: ${format}`);
  });
}
function formatLlama2Instruct(messages) {
  let inMessage = false;
  let inInstruction = false;
  let prompt = "";
  for (const message of messages) {
    if (!inMessage) {
      prompt += "<s>";
      inMessage = true;
    }
    if (message.type === "system" || message.type === "user") {
      if (inInstruction) {
        prompt += "\n\n";
      } else {
        prompt += "[INST] ";
        inInstruction = true;
      }
      prompt += formatChatMessage(message, "llama2");
    } else if (message.type === "assistant") {
      if (inInstruction) {
        prompt += " [/INST] ";
        inInstruction = false;
      }
      prompt += formatChatMessage(message, "llama2");
      prompt += " </s>";
      inMessage = false;
    } else {
      throw new Error(`Unsupported message type: ${message.type}`);
    }
  }
  if (inInstruction) {
    prompt += "[/INST] ";
    inInstruction = false;
  }
  if (!inMessage) {
    prompt += "<s>";
    inMessage = true;
  }
  return prompt;
}
function formatChatMessage(message, format) {
  return N(format).with("", () => chatMessageToString(message.message)).with(
    "llama2",
    () => N(message).with(
      { type: "user" },
      (message2) => chatMessageToString(message2.message)
    ).with(
      { type: "system" },
      (message2) => `<<SYS>>
${chatMessageToString(message2.message)}
<</SYS>>
`
      // Two more \n added by formatLlama2Instruct to make 3 total
    ).with(
      { type: "assistant" },
      (message2) => chatMessageToString(message2.message)
    ).otherwise(() => "")
  ).otherwise(() => chatMessageToString(message.message));
}
function chatMessageToString(messageParts) {
  const parts = Array.isArray(messageParts) ? messageParts : [messageParts];
  const stringMessage = parts.map((part) => {
    if (typeof part === "string") {
      return part;
    } else if (part.type === "url") {
      return `(Image at ${part.url})`;
    } else if (part.type === "image") {
      return `(Embedded Image)`;
    } else {
      return `(Unknown Message Part)`;
    }
  }).join("\n\n");
  return stringMessage;
}

// src/nodes/GetOllamaModelNode.ts
var getOllamaModel = (rivet) => {
  const impl = {
    create() {
      return {
        id: rivet.newId(),
        data: {
          modelName: "",
          useModelNameInput: true
        },
        title: "Get Ollama Model",
        type: "getOllamaModel",
        visualData: {
          x: 0,
          y: 0,
          width: 250
        }
      };
    },
    getInputDefinitions(data) {
      const inputs = [];
      if (data.useModelNameInput) {
        inputs.push({
          id: "modelName",
          dataType: "string",
          title: "Model Name",
          description: "The name of the model to get."
        });
      }
      return inputs;
    },
    getOutputDefinitions() {
      return [
        {
          id: "license",
          dataType: "string",
          title: "License",
          description: "Contents of the license block of the model"
        },
        {
          id: "modelfile",
          dataType: "string",
          title: "Modelfile",
          description: "The Ollama modelfile for the model"
        },
        {
          id: "parameters",
          dataType: "string",
          title: "Parameters",
          description: "The parameters for the model"
        },
        {
          id: "template",
          dataType: "string",
          title: "Template",
          description: "The template for the model"
        }
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
          placeholder: "Model Name"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
        Model: ${data.useModelNameInput ? "(From Input)" : data.modelName || "Unset!"}
      `;
    },
    getUIData() {
      return {
        contextMenuTitle: "Get Ollama Model",
        group: "Ollama",
        infoBoxTitle: "Get Ollama Model Node",
        infoBoxBody: "Gets information about a model from Ollama."
      };
    },
    async process(data, inputData, context) {
      const host = context.getPluginConfig("host") || "http://localhost:11434";
      const modelName = rivet.getInputOrData(data, inputData, "modelName");
      const response = await fetch(`${host}/api/show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: modelName
        })
      });
      if (response.status === 404) {
        return {
          ["license"]: {
            type: "control-flow-excluded",
            value: void 0
          },
          ["modelfile"]: {
            type: "control-flow-excluded",
            value: void 0
          },
          ["parameters"]: {
            type: "control-flow-excluded",
            value: void 0
          },
          ["template"]: {
            type: "control-flow-excluded",
            value: void 0
          }
        };
      }
      if (!response.ok) {
        try {
          const body = await response.text();
          throw new Error(`Error from Ollama: ${body}`);
        } catch (err) {
          throw new Error(
            `Error ${response.status} from Ollama: ${rivet.getError(err).message}`
          );
        }
      }
      const { license, modelfile, parameters, template } = await response.json();
      return {
        ["license"]: {
          type: "string",
          value: license
        },
        ["modelfile"]: {
          type: "string",
          value: modelfile
        },
        ["parameters"]: {
          type: "string",
          value: parameters
        },
        ["template"]: {
          type: "string",
          value: template
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "List Ollama Models");
};

// src/nodes/ListOllamaModelsNode.ts
var listOllamaModels = (rivet) => {
  const impl = {
    create() {
      return {
        id: rivet.newId(),
        data: {},
        title: "List Ollama Models",
        type: "listOllamaModels",
        visualData: {
          x: 0,
          y: 0,
          width: 300
        }
      };
    },
    getInputDefinitions() {
      return [];
    },
    getOutputDefinitions() {
      return [
        {
          id: "modelNames",
          dataType: "string[]",
          title: "Model Names"
        }
      ];
    },
    getEditors() {
      return [];
    },
    getBody() {
      return "";
    },
    getUIData() {
      return {
        contextMenuTitle: "List Ollama Models",
        group: "Ollama",
        infoBoxTitle: "List Ollama Models Node",
        infoBoxBody: "Lists all models that are available in Ollama."
      };
    },
    async process(_data, _inputData, context) {
      const host = context.getPluginConfig("host") || "http://localhost:11434";
      const response = await fetch(`${host}/api/tags`, {
        method: "GET"
      });
      if (!response.ok) {
        try {
          const body = await response.text();
          throw new Error(`Error from Ollama: ${body}`);
        } catch (err) {
          throw new Error(
            `Error ${response.status} from Ollama: ${rivet.getError(err).message}`
          );
        }
      }
      const { models } = await response.json();
      return {
        ["modelNames"]: {
          type: "string[]",
          value: models.map((model) => model.name)
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "List Ollama Models");
};

// src/nodes/PullModelToOllamaNode.ts
var pullModelToOllama = (rivet) => {
  const impl = {
    create() {
      return {
        id: rivet.newId(),
        data: {
          modelName: "",
          useModelNameInput: true,
          insecure: false
        },
        title: "Pull Model to Ollama",
        type: "pullModelToOllama",
        visualData: {
          x: 0,
          y: 0,
          width: 250
        }
      };
    },
    getInputDefinitions(data) {
      const inputs = [];
      if (data.useModelNameInput) {
        inputs.push({
          id: "modelName",
          dataType: "string",
          title: "Model Name",
          description: "The name of the model to pull from the ollama library."
        });
      }
      return inputs;
    },
    getOutputDefinitions() {
      return [
        {
          id: "modelName",
          dataType: "string",
          title: "Model Name",
          description: "The name of the model that was pulled."
        }
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
          placeholder: "Model Name"
        },
        {
          type: "toggle",
          dataKey: "insecure",
          label: "Insecure",
          helperMessage: "Allow insecure connections to the library. Only use this if you are pulling from your own library during development."
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
        Model: ${data.useModelNameInput ? "(From Input)" : data.modelName || "Unset!"}
      `;
    },
    getUIData() {
      return {
        contextMenuTitle: "Pull Model to Ollama",
        group: "Ollama",
        infoBoxTitle: "Pull Model to Ollama Node",
        infoBoxBody: "Downloads a model from the Ollama library to the Ollama server."
      };
    },
    async process(data, inputData, context) {
      const host = context.getPluginConfig("host") || "http://localhost:11434";
      const modelName = rivet.getInputOrData(data, inputData, "modelName");
      const response = await fetch(`${host}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: modelName,
          insecure: data.insecure,
          stream: true
        })
      });
      if (!response.ok) {
        try {
          const body = await response.text();
          throw new Error(`Error from Ollama: ${body}`);
        } catch (err) {
          throw new Error(
            `Error ${response.status} from Ollama: ${rivet.getError(err).message}`
          );
        }
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body was not readable.");
      }
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
      return {
        ["modelName"]: {
          type: "string",
          value: modelName
        }
      };
    }
  };
  return rivet.pluginNodeDefinition(impl, "List Ollama Models");
};

// src/index.ts
var plugin = (rivet) => {
  const examplePlugin = {
    id: "ollama",
    name: "Ollama Plugin",
    configSpec: {
      host: {
        label: "Host",
        type: "string",
        default: "http://localhost:11434",
        description: "The host to use for the Ollama API. Defaults to http://localhost:11434.",
        helperText: "The host to use for the Ollama API. Defaults to http://localhost:11434."
      }
    },
    contextMenuGroups: [
      {
        id: "ollama",
        label: "Ollama"
      }
    ],
    register: (register) => {
      register(ollamaChat(rivet));
      register(getOllamaModel(rivet));
      register(listOllamaModels(rivet));
      register(pullModelToOllama(rivet));
    }
  };
  return examplePlugin;
};
var src_default = plugin;
export {
  src_default as default
};
