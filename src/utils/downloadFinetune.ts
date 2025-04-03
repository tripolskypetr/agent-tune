import { IStorageItem } from "../config/storage";
import { convertToFinetune } from "./convertToFinetune";

const mapCohere = (storageItems: IStorageItem[]) =>
  storageItems.map((item) => ({
    ...item,
    preferred_output: {
      ...item.preferred_output,
      role: "System",
      tool1: undefined,
      tool2: undefined,
      tool3: undefined,
      tool4: undefined,
      tool5: undefined,
    },
    non_preferred_output: {
      ...item.non_preferred_output,
      role: "System",
      tool1: undefined,
      tool2: undefined,
      tool3: undefined,
      tool4: undefined,
      tool5: undefined,
    },
    input: {
      ...item.input,
      role: "User",
      tool1: undefined,
      tool2: undefined,
      tool3: undefined,
      tool4: undefined,
      tool5: undefined,
    },
    history: {
      message1: item.history.message1
        ? {
            ...item.history.message1,
            role:
              item.history.message1.role === "system"
                ? "System"
                : item.history.message1.role === "user"
                ? "User"
                : "Chatbot",
            tool1: undefined,
          }
        : undefined,
      message2: item.history.message2
        ? {
            ...item.history.message2,
            role:
              item.history.message2.role === "system"
                ? "System"
                : item.history.message2.role === "user"
                ? "User"
                : "Chatbot",
            tool1: undefined,
          }
        : undefined,
      message3: item.history.message3
        ? {
            ...item.history.message3,
            role:
              item.history.message3.role === "system"
                ? "System"
                : item.history.message3.role === "user"
                ? "User"
                : "Chatbot",
            tool1: undefined,
          }
        : undefined,
      message4: item.history.message4
        ? {
            ...item.history.message4,
            role:
              item.history.message4.role === "system"
                ? "System"
                : item.history.message4.role === "user"
                ? "User"
                : "Chatbot",
            tool1: undefined,
          }
        : undefined,
      message5: item.history.message5
        ? {
            ...item.history.message5,
            role:
              item.history.message5.role === "system"
                ? "System"
                : item.history.message5.role === "user"
                ? "User"
                : "Chatbot",
            tool1: undefined,
          }
        : undefined,
    },
  }));

const mapOpenAi = (storageItems: IStorageItem[]) =>
  storageItems.map((item) => ({
    ...item,
    preferred_output: {
      ...item.preferred_output,
      tool1: undefined,
      tool2: undefined,
      tool3: undefined,
      tool4: undefined,
      tool5: undefined,
    },
    non_preferred_output: {
      ...item.non_preferred_output,
      tool1: undefined,
      tool2: undefined,
      tool3: undefined,
      tool4: undefined,
      tool5: undefined,
    },
    input: {
      ...item.input,
      tool1: undefined,
      tool2: undefined,
      tool3: undefined,
      tool4: undefined,
      tool5: undefined,
    },
    history: {
      message1: item.history.message1
        ? {
            ...item.history.message1,
            tool1: undefined,
          }
        : undefined,
      message2: item.history.message2
        ? {
            ...item.history.message2,
            tool1: undefined,
          }
        : undefined,
      message3: item.history.message3
        ? {
            ...item.history.message3,
            tool1: undefined,
          }
        : undefined,
      message4: item.history.message4
        ? {
            ...item.history.message4,
            tool1: undefined,
          }
        : undefined,
      message5: item.history.message5
        ? {
            ...item.history.message5,
            tool1: undefined,
          }
        : undefined,
    },
  }));

function downloadFinetune(
  storageItems: IStorageItem[],
  format: "cohere" | "openai" | "hf",
  filename: string = `finetune.${new Date().toISOString()}.jsonl`
): void {
  if (!storageItems) {
    return;
  }

  if (format === "cohere") {
    storageItems = mapCohere(storageItems) as unknown as IStorageItem[];
  }

  if (format === "openai") {
    storageItems = mapOpenAi(storageItems) as unknown as IStorageItem[];
  }

  const jsonlContent = convertToFinetune(storageItems);

  const blob = new Blob([jsonlContent], { type: "text/plain;charset=utf-8" });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";

  link.click();

  setTimeout(() => window.URL.revokeObjectURL(url));
}

export { downloadFinetune };
