import {
  IStorageItem,
  ITool,
  IToolArgumentMetadata,
  IToolDefinition,
} from "../config/storage";

function convertToFinetune(storageItems: IStorageItem[]): string {
  const jsonlLines = storageItems
    .map((item) => {
      const messages = [
        {
          role: item.input.role,
          content: item.input.content,
          tools: [
            item.input.tool1?.name
              ? {
                  type: "function",
                  function: convertToolDefinition(item.input.tool1),
                }
              : null,
            item.input.tool2?.name
              ? {
                  type: "function",
                  function: convertToolDefinition(item.input.tool2),
                }
              : null,
            item.input.tool3?.name
              ? {
                  type: "function",
                  function: convertToolDefinition(item.input.tool3),
                }
              : null,
            item.input.tool4?.name
              ? {
                  type: "function",
                  function: convertToolDefinition(item.input.tool4),
                }
              : null,
            item.input.tool5?.name
              ? {
                  type: "function",
                  function: convertToolDefinition(item.input.tool5),
                }
              : null,
          ].filter(Boolean),
        },
        {
          role: item.preferred_output.role,
          content: item.preferred_output.content,
          tool_calls: [
            item.preferred_output.tool1?.name
              ? convertToolCall(item.preferred_output.tool1)
              : null,
            item.preferred_output.tool2?.name
              ? convertToolCall(item.preferred_output.tool2)
              : null,
            item.preferred_output.tool3?.name
              ? convertToolCall(item.preferred_output.tool3)
              : null,
            item.preferred_output.tool4?.name
              ? convertToolCall(item.preferred_output.tool4)
              : null,
            item.preferred_output.tool5?.name
              ? convertToolCall(item.preferred_output.tool5)
              : null,
          ].filter(Boolean),
        },
      ];

      const openAIFormat = {
        messages: messages.filter(
          (msg) => msg.content || msg.tool_calls?.length > 0
        ),
      };

      if (!openAIFormat.messages.length) {
        return null;
      }

      return JSON.stringify(openAIFormat);
    })
    .filter((v) => v);

  return jsonlLines.join("\n");
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

  return {
    id: `call_${Math.random().toString(36).substr(2, 9)}`,
    type: "function",
    function: {
      name: tool.name,
      arguments: JSON.stringify(args),
    },
  };
}

export { convertToFinetune };
