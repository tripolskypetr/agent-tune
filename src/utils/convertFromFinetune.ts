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
    const messages = parsed.messages;

    if (!messages || messages.length < 2) continue;

    // Separate history messages from input/output
    const historyMessages = messages.slice(0, -2); // All except last two
    const inputMessage = messages[messages.length - 2]; // Second to last
    const outputMessage = messages[messages.length - 1]; // Last

    if (!inputMessage || !outputMessage) continue;

    const inputTools = (inputMessage.tools || []).map(
      (tool: any, index: number) =>
        convertToolToDefinition(tool.function, index + 1)
    );

    const outputTools = (outputMessage.tool_calls || []).map((toolCall: any) =>
      convertToolCallToTool(toolCall)
    );

    const emptyTool: ITool = {
      name: "",
      arg1: { key: "arg1", value: "" },
      arg2: { key: "arg2", value: "" },
      arg3: { key: "arg3", value: "" },
      arg4: { key: "arg4", value: "" },
      arg5: { key: "arg5", value: "" },
    };
    const emptyToolDef: IToolDefinition = {
      name: "",
      description: "",
      arg1: {
        name: "arg1",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg2: {
        name: "arg2",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg3: {
        name: "arg3",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg4: {
        name: "arg4",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
      arg5: {
        name: "arg5",
        type: "",
        description: "",
        enum: null,
        required: false,
      },
    };
    const emptyHistoryMessage: IHistoryMessage = {
      role: null,
      content: "",
    };

    // Convert history messages
    const history = {
      message1: historyMessages[0]
        ? { role: historyMessages[0].role, content: historyMessages[0].content || "" }
        : emptyHistoryMessage,
      message2: historyMessages[1]
        ? { role: historyMessages[1].role, content: historyMessages[1].content || "" }
        : emptyHistoryMessage,
      message3: historyMessages[2]
        ? { role: historyMessages[2].role, content: historyMessages[2].content || "" }
        : emptyHistoryMessage,
      message4: historyMessages[3]
        ? { role: historyMessages[3].role, content: historyMessages[3].content || "" }
        : emptyHistoryMessage,
      message5: historyMessages[4]
        ? { role: historyMessages[4].role, content: historyMessages[4].content || "" }
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
        role: outputMessage.role,
        content: outputMessage.content || "",
        tool1: outputTools[0] || emptyTool,
        tool2: outputTools[1] || emptyTool,
        tool3: outputTools[2] || emptyTool,
        tool4: outputTools[3] || emptyTool,
        tool5: outputTools[4] || emptyTool,
      },
      non_preferred_output: {
        role: outputMessage.role,
        content: "",
        tool1: emptyTool,
        tool2: emptyTool,
        tool3: emptyTool,
        tool4: emptyTool,
        tool5: emptyTool,
      },
      history: history,
    };

    storageItems.push(storageItem);
  }

  return storageItems;
}

function convertToolToDefinition(func: any, index: number): IToolDefinition {
  const params = func.parameters?.properties || {};
  return {
    name: func.name || "",
    description: func.description || "",
    arg1: convertParamToMetadata(
      params.arg1,
      "arg1",
      func.parameters?.required?.includes("arg1")
    ),
    arg2: convertParamToMetadata(
      params.arg2,
      "arg2",
      func.parameters?.required?.includes("arg2")
    ),
    arg3: convertParamToMetadata(
      params.arg3,
      "arg3",
      func.parameters?.required?.includes("arg3")
    ),
    arg4: convertParamToMetadata(
      params.arg4,
      "arg4",
      func.parameters?.required?.includes("arg4")
    ),
    arg5: convertParamToMetadata(
      params.arg5,
      "arg5",
      func.parameters?.required?.includes("arg5")
    ),
  };
}

function convertParamToMetadata(
  param: any,
  name: string,
  required: boolean = false
): IToolArgumentMetadata {
  return {
    name: name,
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
