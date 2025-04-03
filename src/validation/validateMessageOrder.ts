import { IStorageItem } from "../config/storage";

export function validateMessageOrder(item: IStorageItem): {
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

  let foundNull = false;
  let allowSystemMessages = true;
  let lastNonSystemRole: "user" | "assistant" | "tool" | null = null;

  historyMessages.forEach(({ message, position }) => {
    const role = message.role;

    if (role === null) {
      foundNull = true;
      return;
    }

    // Check for gaps in message sequence
    if (foundNull) {
      errors.push(
        `history.${position}: Messages must be contiguous without gaps`
      );
    }

    // Validate system message placement
    if (role === "system") {
      if (!allowSystemMessages) {
        errors.push(
          `history.${position}: System messages must be at the beginning`
        );
      }
    } else {
      // Disallow system messages after first non-system message
      allowSystemMessages = false;

      // Validate assistant message order
      if (role === "assistant" && lastNonSystemRole !== "user") {
        errors.push(
          `history.${position}: Assistant message must be preceded by a user message`
        );
      }

      // Update last valid role for context tracking
      lastNonSystemRole = role;
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
