import { setBackend } from "@tensorflow/tfjs-core";
import { setWasmPaths } from "@tensorflow/tfjs-backend-wasm";

setWasmPaths('/wasm/');
setBackend("wasm");
