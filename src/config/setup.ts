import { copyToClipboard } from "react-declarative";

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    const msg = successful ? "successful" : "unsuccessful";
    console.log(`Fallback: Copying text command was ${msg}`);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

copyToClipboard.override(async (text: string) => {
  if (window.self !== window.top) {
    window.top?.postMessage(
      {
        type: "copy-action",
        text,
      },
      "*"
    );
    return;
  }
  try {
    if ("copyToClipboard" in navigator) {
      // @ts-ignore
      await navigator.copyToClipboard(text);
      return;
    }
    await navigator.clipboard.writeText(text);
  } catch {
    fallbackCopyTextToClipboard(text);
  }
});
