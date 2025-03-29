import {
  IHistoryMessage,
  IStorageItem,
  ITool,
  IToolDefinition,
} from "../config/storage";
import { validateOutputTools } from "./validateToolCalls";

function validateTools(
  historyMessages: Array<{ message: IHistoryMessage; position: string }>,
  inputToolMap: Map<string, IToolDefinition>,
  errors: string[]
) {
  let assistantToolCall: { position: string; tool: ITool } | null = null;
  const toolResponses: string[] = [];

  // First pass: Validate tool calls and responses
  historyMessages.forEach(({ message, position }) => {
    // Track tool responses
    if (message.role === "tool") {
      toolResponses.push(position);

      if (!message.content) {
        errors.push(`history.${position}: Tool response requires content`);
      }
    }

    // Validate assistant tool calls
    if (message.role === "assistant" && message.tool1.name) {
      if (assistantToolCall) {
        errors.push(`history.${position}: Multiple assistant tool calls found`);
        return;
      }

      assistantToolCall = { position, tool: message.tool1 };
      validateOutputTools(
        [message.tool1],
        inputToolMap,
        `history.${position}`,
        errors
      );
    }
  });

  // Validate tool response count and order
  if (toolResponses.length > 0) {
    // Rule: Must have exactly one tool response per tool call
    if (!assistantToolCall) {
      errors.push(
        `history.${toolResponses[0]}: Tool response without corresponding tool call`
      );
      return;
    }

    // Rule: Only one tool response allowed
    if (toolResponses.length > 1) {
      toolResponses.slice(1).forEach((pos) => {
        errors.push(`history.${pos}: Only one tool response allowed`);
      });
    }

    // Rule: Tool response must come after tool call
    const callIndex = parseInt(
      assistantToolCall.position.replace("message", "")
    );
    toolResponses.forEach((pos) => {
      const responseIndex = parseInt(pos.replace("message", ""));
      if (responseIndex <= callIndex) {
        errors.push(`history.${pos}: Tool response must come after tool call`);
      }
    });
  }

  // Rule: Tool call requires exactly one tool response
  if (assistantToolCall && toolResponses.length !== 1) {
    errors.push(
      `history.${assistantToolCall.position}: Tool call requires exactly one tool response`
    );
  }
}

export function validateMessageTools(item: IStorageItem): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const historyMessages = [
    { message: item.history.message1, position: "message1" },
    { message: item.history.message2, position: "message2" },
    { message: item.history.message3, position: "message3" },
    { message: item.history.message4, position: "message4" },
    { message: item.history.message5, position: "message5" },
  ];

  const inputTools = [
    item.input.tool1,
    item.input.tool2,
    item.input.tool3,
    item.input.tool4,
    item.input.tool5,
  ];

  const inputToolMap = new Map<string, IToolDefinition>();
  inputTools.forEach((toolDef, index) => {
    const toolPosition = `tool${index + 1}`;

    if (!toolDef) return;

    // Validate input tool parameter names
    const parameterNames = new Set<string>();
    for (let argNum = 1; argNum <= 5; argNum++) {
      const argKey = `arg${argNum}` as keyof IToolDefinition;
      const arg = toolDef[argKey];

      if (typeof arg === "string") {
        continue;
      }

      if (arg?.name) {
        if (parameterNames.has(arg.name)) {
          errors.push(
            `input.${toolPosition}.${argKey}: Duplicate parameter name '${arg.name}'`
          );
        } else {
          parameterNames.add(arg.name);
        }
      }
    }

    if (toolDef.name) {
      if (inputToolMap.has(toolDef.name)) {
        errors.push(
          `input.${toolPosition}: Tool name '${toolDef.name}' is not unique`
        );
      }
      inputToolMap.set(toolDef.name, toolDef);
    }
  });

  validateTools(historyMessages, inputToolMap, errors);

  return {
    valid: errors.length === 0,
    errors,
  };
}
