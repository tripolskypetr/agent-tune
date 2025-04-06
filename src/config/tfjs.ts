import { enableProdMode, setBackend } from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";

setWasmPaths('/wasm/');
// setBackend("wasm");
setBackend("webgl");

enableProdMode();
