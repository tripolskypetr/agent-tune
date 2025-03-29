import { createLsManager } from "react-declarative";
import { IStorageItem } from "./storage";

export const draft = createLsManager<IStorageItem | null>("jsonl_tune_draft");

export default draft;
