import {
  IStorageItem,
  ITool,
  IToolArgumentMetadata,
  IToolDefinition,
} from "../config/storage";

function convertToFinetune(storageItems: IStorageItem[]): string {
  const jsonlLines = storageItems
    .map((item) => {
      // Construct input messages (history + input prompt)
      const inputMessages = [
        item.history.message1?.role
          ? {
              role: item.history.message1.role,
              content: item.history.message1.content,
              ...(item.history.message1.role === "assistant" &&
              item.history.message1.tool1?.name
                ? {
                    tool_calls: [convertToolCall(item.history.message1.tool1)],
                  }
                : {}),
            }
          : null,
        item.history.message2?.role
          ? {
              role: item.history.message2.role,
              content: item.history.message2.content,
              ...(item.history.message2.role === "assistant" &&
              item.history.message2.tool1?.name
                ? {
                    tool_calls: [convertToolCall(item.history.message2.tool1)],
                  }
                : {}),
            }
          : null,
        item.history.message3?.role
          ? {
              role: item.history.message3.role,
              content: item.history.message3.content,
              ...(item.history.message3.role === "assistant" &&
              item.history.message3.tool1?.name
                ? {
                    tool_calls: [convertToolCall(item.history.message3.tool1)],
                  }
                : {}),
            }
          : null,
        item.history.message4?.role
          ? {
              role: item.history.message4.role,
              content: item.history.message4.content,
              ...(item.history.message4.role === "assistant" &&
              item.history.message4.tool1?.name
                ? {
                    tool_calls: [convertToolCall(item.history.message4.tool1)],
                  }
                : {}),
            }
          : null,
        item.history.message5?.role
          ? {
              role: item.history.message5.role,
              content: item.history.message5.content,
              ...(item.history.message5.role === "assistant" &&
              item.history.message5.tool1?.name
                ? {
                    tool_calls: [convertToolCall(item.history.message5.tool1)],
                  }
                : {}),
            }
          : null,
        {
          role: item.input.role,
          content: item.input.content,
        },
        // @ts-ignore
      ].filter((msg) => msg && (msg.content || msg.tool_calls?.length > 0));

      // Construct tools array for input
      const tools = [
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
      ].filter(Boolean);

      // Construct preferred output
      const preferredOutput = [
        {
          role: item.preferred_output.role,
          content: item.preferred_output.content,
          ...(item.preferred_output.tool1?.name
            ? {
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
              }
            : {}),
        },
      ].filter((msg) => msg.content || msg.tool_calls?.length > 0);

      // Construct non-preferred output
      const nonPreferredOutput = [
        {
          role: item.non_preferred_output.role,
          content: item.non_preferred_output.content,
          ...(item.non_preferred_output.tool1?.name
            ? {
                tool_calls: [
                  item.non_preferred_output.tool1?.name
                    ? convertToolCall(item.non_preferred_output.tool1)
                    : null,
                  item.non_preferred_output.tool2?.name
                    ? convertToolCall(item.non_preferred_output.tool2)
                    : null,
                  item.non_preferred_output.tool3?.name
                    ? convertToolCall(item.non_preferred_output.tool3)
                    : null,
                  item.non_preferred_output.tool4?.name
                    ? convertToolCall(item.non_preferred_output.tool4)
                    : null,
                  item.non_preferred_output.tool5?.name
                    ? convertToolCall(item.non_preferred_output.tool5)
                    : null,
                ].filter(Boolean),
              }
            : {}),
        },
      ].filter((msg) => msg.content || msg.tool_calls?.length > 0);

      const dpoFormat = {
        input: {
          messages: inputMessages,
          tools: tools,
          parallel_tool_calls: true,
        },
        preferred_output: preferredOutput,
        non_preferred_output: nonPreferredOutput,
      };

      if (
        !inputMessages.length ||
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

// Keep the supporting functions as they are since they're still needed
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
