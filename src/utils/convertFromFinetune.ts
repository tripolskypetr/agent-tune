import { randomString } from "react-declarative";
import {
  IStorageItem,
  ITool,
  IToolArgumentMetadata,
  IToolDefinition,
  IHistoryMessage,
} from "../config/storage";

function convertFromFinetune(fileContent: string): IStorageItem[] {
  const lines = fileContent.trim().split("\n");
  const storageItems: IStorageItem[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parsed = JSON.parse(line);
    const { input, preferred_output, non_preferred_output } = parsed;

    if (!input?.messages || !preferred_output || !non_preferred_output)
      continue;

    // Separate history messages from input
    const historyMessages = input.messages.slice(0, -1); // All except last one
    const inputMessage = input.messages[input.messages.length - 1]; // Last message as input

    if (!inputMessage) continue;

    const inputTools = (input.tools || []).map((tool: any, index: number) =>
      convertToolToDefinition(tool.function, index + 1)
    );

    const preferredOutput = preferred_output[0] || {};
    const nonPreferredOutput = non_preferred_output[0] || {};

    const preferredTools = (preferredOutput.tool_calls || []).map(
      (toolCall: any) => convertToolCallToTool(toolCall)
    );
    const nonPreferredTools = (nonPreferredOutput.tool_calls || []).map(
      (toolCall: any) => convertToolCallToTool(toolCall)
    );

    const emptyTool: ITool = {
      name: "",
      arg1: { key: "", value: "" },
      arg2: { key: "", value: "" },
      arg3: { key: "", value: "" },
      arg4: { key: "", value: "" },
      arg5: { key: "", value: "" },
    };
    const emptyToolDef: IToolDefinition = {
      name: "",
      description: "",
      arg1: {
        name: "",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg2: {
        name: "",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg3: {
        name: "",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg4: {
        name: "",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg5: {
        name: "",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
    };
    const emptyHistoryMessage: IHistoryMessage = {
      role: null,
      content: "",
      tool1: emptyTool,
    };

    // Convert history messages with tool support
    const history = {
      message1: historyMessages[0]
        ? convertHistoryMessage(historyMessages[0], emptyTool)
        : emptyHistoryMessage,
      message2: historyMessages[1]
        ? convertHistoryMessage(historyMessages[1], emptyTool)
        : emptyHistoryMessage,
      message3: historyMessages[2]
        ? convertHistoryMessage(historyMessages[2], emptyTool)
        : emptyHistoryMessage,
      message4: historyMessages[3]
        ? convertHistoryMessage(historyMessages[3], emptyTool)
        : emptyHistoryMessage,
      message5: historyMessages[4]
        ? convertHistoryMessage(historyMessages[4], emptyTool)
        : emptyHistoryMessage,
    };

    const storageItem: IStorageItem = {
      id: randomString(),
      input: {
        role: inputMessage.role,
        content: inputMessage.content || "",
        tool1: inputTools[0] || emptyToolDef,
        tool2: inputTools[1] || emptyToolDef,
        tool3: inputTools[2] || emptyToolDef,
        tool4: inputTools[3] || emptyToolDef,
        tool5: inputTools[4] || emptyToolDef,
      },
      preferred_output: {
        role: preferredOutput.role || "assistant",
        content: preferredOutput.content || "",
        tool1: preferredTools[0] || emptyTool,
        tool2: preferredTools[1] || emptyTool,
        tool3: preferredTools[2] || emptyTool,
        tool4: preferredTools[3] || emptyTool,
        tool5: preferredTools[4] || emptyTool,
      },
      non_preferred_output: {
        role: nonPreferredOutput.role || "assistant",
        content: nonPreferredOutput.content || "",
        tool1: nonPreferredTools[0] || emptyTool,
        tool2: nonPreferredTools[1] || emptyTool,
        tool3: nonPreferredTools[2] || emptyTool,
        tool4: nonPreferredTools[3] || emptyTool,
        tool5: nonPreferredTools[4] || emptyTool,
      },
      history: history,
    };

    storageItems.push(storageItem);
  }

  return storageItems;
}

function convertHistoryMessage(
  message: any,
  emptyTool: ITool
): IHistoryMessage {
  const baseMessage = {
    role: message.role,
    content: message.content || "",
    tool1: emptyTool,
  };

  if (message.role === "assistant" && message.tool_calls?.length) {
    const toolCall = message.tool_calls[0];
    baseMessage.tool1 = convertToolCallToTool(toolCall);
  }

  return baseMessage;
}

function convertToolToDefinition(func: any, index: number): IToolDefinition {
  const params = func.parameters?.properties || {};
  const keys = Object.keys(params);
  const values = Object.values(params);
  return {
    name: func.name || "",
    description: func.description || "",
    arg1: convertParamToMetadata(
      values[0],
      keys[0],
      func.parameters?.required?.includes(keys[0])
    ),
    arg2: convertParamToMetadata(
      values[1],
      keys[1],
      func.parameters?.required?.includes(keys[1])
    ),
    arg3: convertParamToMetadata(
      values[2],
      keys[2],
      func.parameters?.required?.includes(keys[2])
    ),
    arg4: convertParamToMetadata(
      values[3],
      keys[3],
      func.parameters?.required?.includes(keys[3])
    ),
    arg5: convertParamToMetadata(
      values[4],
      keys[4],
      func.parameters?.required?.includes(keys[4])
    ),
  };
}

function convertParamToMetadata(
  param: any,
  name: string,
  required: boolean = false
): IToolArgumentMetadata {
  return {
    name: name || "",
    type: param?.type || "",
    description: param?.description || "",
    enum: param?.enum || null,
    required: required,
  };
}

function convertToolCallToTool(toolCall: any): ITool {
  const args = toolCall.function.arguments
    ? JSON.parse(toolCall.function.arguments)
    : {};
  const argEntries = Object.entries(args).slice(0, 5);

  const toolArgs = [
    { key: "", value: "" },
    { key: "", value: "" },
    { key: "", value: "" },
    { key: "", value: "" },
    { key: "", value: "" },
  ];

  argEntries.forEach(([key, value], index) => {
    toolArgs[index] = { key, value: String(value) };
  });

  return {
    name: toolCall.function.name || "",
    arg1: toolArgs[0],
    arg2: toolArgs[1],
    arg3: toolArgs[2],
    arg4: toolArgs[3],
    arg5: toolArgs[4],
  };
}

export { convertFromFinetune };
