import { createLsManager } from "react-declarative";

export interface IHistoryMessage {
    role: "user" | "system" | "assistant" | null;
    content: string;
}

export interface IToolArgument {
    key: string;
    value: string;
}

export interface ITool {
    name: string;
    arg1: IToolArgument;
    arg2: IToolArgument;
    arg3: IToolArgument;
    arg4: IToolArgument;
    arg5: IToolArgument;
}

export interface IToolArgumentMetadata {
    name: string;
    type: string;
    description: string;
    enum: string[] | null;
    required: boolean;
}

export interface IToolDefinition {
    name: string;
    description: string;
    arg1: IToolArgumentMetadata;
    arg2: IToolArgumentMetadata;
    arg3: IToolArgumentMetadata;
    arg4: IToolArgumentMetadata;
    arg5: IToolArgumentMetadata;
}

export interface IStorageItem {
    id: string;
    preferred_output: {
        role: string;
        content: string;
        tool1: ITool;
        tool2: ITool;
        tool3: ITool;
        tool4: ITool;
        tool5: ITool;
    };
    non_preferred_output: {
        role: string;
        content: string;
        tool1: ITool;
        tool2: ITool;
        tool3: ITool;
        tool4: ITool;
        tool5: ITool;
    };
    input: {
        role: string;
        content: string;
        tool1: IToolDefinition;
        tool2: IToolDefinition;
        tool3: IToolDefinition;
        tool4: IToolDefinition;
        tool5: IToolDefinition;
    };
    history: {
        message1: IHistoryMessage;
        message2: IHistoryMessage;
        message3: IHistoryMessage;
        message4: IHistoryMessage;
        message5: IHistoryMessage;
    }
}

export const storage = createLsManager<IStorageItem[]>("jsonl_tune");

export default storage;
