import { IStorageItem } from "../config/storage";

function downloadStorage(
  storageItems: IStorageItem[],
  filename: string = `storage.${new Date().toISOString()}.json`
): void {

  if (!storageItems) {
    return;
  }

  const jsonlContent = JSON.stringify(storageItems);

  const blob = new Blob([jsonlContent], { type: "text/plain;charset=utf-8" });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.target = "_blank";

  link.click();

  setTimeout(() => window.URL.revokeObjectURL(url));
}

export { downloadStorage };
