import { IStorageItem } from "../config/storage";

export function validateMessageOrder(item: IStorageItem): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
  
    // Existing tool validation logic...
  
    // Validate chat history structure
    const historyMessages = [
      { message: item.history.message1, position: 'message1' },
      { message: item.history.message2, position: 'message2' },
      { message: item.history.message3, position: 'message3' },
      { message: item.history.message4, position: 'message4' },
      { message: item.history.message5, position: 'message5' },
    ];
  
    let foundNull = false;
    let hasMessages = false;
    let allowSystemMessages = true;
  
    historyMessages.forEach(({ message, position }) => {
      const role = message.role;
  
      if (role === null) {
        foundNull = true;
      } else {
        hasMessages = true;
  
        // Check for gaps
        if (foundNull) {
          errors.push(`history.${position}: Messages must be contiguous without gaps`);
        }
  
        // Check system message placement
        if (role === 'system') {
          if (!allowSystemMessages) {
            errors.push(`history.${position}: System messages must be at the beginning`);
          }
        } else {
          // Disallow system messages after first non-system message
          allowSystemMessages = false;
        }
      }
    });
  
    if (!hasMessages) {
      errors.push('history: Must contain at least one message');
    }
  
    return {
      valid: errors.length === 0,
      errors,
    };
  }