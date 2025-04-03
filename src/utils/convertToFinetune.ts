import {
  IStorageItem,
  ITool,
  IToolArgumentMetadata,
  IToolDefinition,
} from "../config/storage";

interface BaseMessage {
  role: string;
  content: string;
}

interface ToolCallMessage extends BaseMessage {
  role: "assistant";
  tool_calls: ReturnType<typeof convertToolCall>[];
}

type Message = BaseMessage | ToolCallMessage;

interface InputData {
  messages: Message[];
  tools: {
    type: "function";
    function: ReturnType<typeof convertToolDefinition>;
  }[];
  parallel_tool_calls: boolean;
}

function convertToFinetune(storageItems: IStorageItem[]): string {
  const jsonlLines = storageItems
    .map((item) => {
      const input = buildInput(item);
      const preferredOutput = buildOutput(item.preferred_output);
      const nonPreferredOutput = buildOutput(item.non_preferred_output);

      const dpoFormat = {
        input,
        preferred_output: preferredOutput,
        non_preferred_output: nonPreferredOutput,
      };

      if (
        !input.messages.length ||
        !preferredOutput.length ||
        !nonPreferredOutput.length
      ) {
        return null;
      }

      return JSON.stringify(dpoFormat);
    })
    .filter((v) => v);

  return jsonlLines.join("\n");
}

function buildInput(item: IStorageItem): InputData {
  const messages: (Message | null)[] = [
    buildHistoryMessage(item.history.message1),
    buildHistoryMessage(item.history.message2),
    buildHistoryMessage(item.history.message3),
    buildHistoryMessage(item.history.message4),
    buildHistoryMessage(item.history.message5),
    {
      role: item.input.role,
      content: item.input.content,
    },
  ].filter(
    (msg) =>
      msg !== null &&
      (msg.content || ("tool_calls" in msg && msg.tool_calls.length > 0))
  );

  const tools = [
    item.input.tool1,
    item.input.tool2,
    item.input.tool3,
    item.input.tool4,
    item.input.tool5,
  ]
    .filter((tool): tool is IToolDefinition => !!tool?.name)
    .map((tool) => ({
      type: "function" as const,
      function: convertToolDefinition(tool),
    }));

  return {
    messages,
    tools: tools.length > 0 ? tools : [],
    parallel_tool_calls: true,
  };
}

function buildHistoryMessage(
  message: IStorageItem["history"]["message1"]
): Message | null {
  if (!message?.role) return null;

  return {
    role: message.role,
    content: message.content,
    ...(message.role === "assistant" && message.tool1?.name
      ? { tool_calls: [convertToolCall(message.tool1)] }
      : {}),
  } as Message;
}

function buildOutput(
  output:
    | IStorageItem["preferred_output"]
    | IStorageItem["non_preferred_output"]
): Message[] {
  const tool_calls = [
    output.tool1,
    output.tool2,
    output.tool3,
    output.tool4,
    output.tool5,
  ]
    .filter((tool): tool is ITool => !!tool?.name)
    .map((tool) => convertToolCall(tool));

  const message: Message = {
    role: output.role,
    content: output.content,
    ...(tool_calls.length > 0 ? { tool_calls } : {}),
  };

  return [message].filter(
    (msg: Message) =>
      msg.content || ("tool_calls" in msg && msg.tool_calls.length > 0)
  );
}

function convertToolDefinition(tool: IToolDefinition): any {
  const properties: { [key: string]: any } = {};
  const required: string[] = [];

  if (tool.arg1?.name) {
    properties[tool.arg1.name] = convertArgMetadata(tool.arg1);
    if (tool.arg1.required) required.push(tool.arg1.name);
  }
  if (tool.arg2?.name) {
    properties[tool.arg2.name] = convertArgMetadata(tool.arg2);
    if (tool.arg2.required) required.push(tool.arg2.name);
  }
  if (tool.arg3?.name) {
    properties[tool.arg3.name] = convertArgMetadata(tool.arg3);
    if (tool.arg3.required) required.push(tool.arg3.name);
  }
  if (tool.arg4?.name) {
    properties[tool.arg4.name] = convertArgMetadata(tool.arg4);
    if (tool.arg4.required) required.push(tool.arg4.name);
  }
  if (tool.arg5?.name) {
    properties[tool.arg5.name] = convertArgMetadata(tool.arg5);
    if (tool.arg5.required) required.push(tool.arg5.name);
  }

  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    },
  };
}

function convertArgMetadata(arg: IToolArgumentMetadata): any {
  const param: any = {
    type: arg.type,
    description: arg.description,
  };

  if (arg.enum) {
    param.enum = arg.enum;
  }

  return param;
}

function convertToolCall(tool: ITool): any {
  const args: { [key: string]: any } = {};

  if (tool.arg1?.key && tool.arg1.key.trim() !== "") {
    args[tool.arg1.key] = tool.arg1.value;
  }
  if (tool.arg2?.key && tool.arg2.key.trim() !== "") {
    args[tool.arg2.key] = tool.arg2.value;
  }
  if (tool.arg3?.key && tool.arg3.key.trim() !== "") {
    args[tool.arg3.key] = tool.arg3.value;
  }
  if (tool.arg4?.key && tool.arg4.key.trim() !== "") {
    args[tool.arg4.key] = tool.arg4.value;
  }
  if (tool.arg5?.key && tool.arg5.key.trim() !== "") {
    args[tool.arg5.key] = tool.arg5.value;
  }

  const toolCallId = `call_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: toolCallId,
    type: "function",
    function: {
      name: tool.name,
      arguments: JSON.stringify(args),
    },
  };
}

export { convertToFinetune };
