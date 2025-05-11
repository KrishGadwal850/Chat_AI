import { WebContainer } from "@webcontainer/api";

// Call only once
let webcontainerInstance = null;
export const getWebcontainer = async () => {
  if (webcontainerInstance === null) {
    webcontainerInstance = await WebContainer.boot();
    console.log(window.crossOriginIsolated);
  }
  return webcontainerInstance;
};
