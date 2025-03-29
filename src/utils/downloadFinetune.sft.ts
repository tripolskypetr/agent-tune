import { IStorageItem } from "../config/storage";
import { convertToFinetuneSft } from "./convertToFinetune.sft";

function downloadFinetuneSft(
  storageItems: IStorageItem[],
  filename: string = `finetune.${new Date().toISOString()}.jsonl`
): void {

  if (!storageItems) {
    return;
  }

  const jsonlContent = convertToFinetuneSft(storageItems);

  const blob = new Blob([jsonlContent], { type: "text/plain;charset=utf-8" });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";

  link.click();

  setTimeout(() => window.URL.revokeObjectURL(url));
}

export { downloadFinetuneSft };
