import {
    IStorageItem,
    ITool,
    IToolArgument,
    IToolArgumentMetadata,
    IToolDefinition,
} from "../config/storage";

export function validateToolCalls(item: IStorageItem): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    const inputToolMap = buildInputToolMap(item.input, errors);

    validateOutputTools(
        outputToolsFrom(item.preferred_output),
        inputToolMap,
        "preferred_output",
        errors
    );
    validateOutputTools(
        outputToolsFrom(item.non_preferred_output),
        inputToolMap,
        "non_preferred_output",
        errors
    );

    return {
        valid: errors.length === 0,
        errors,
    };
}

function buildInputToolMap(
    input: IStorageItem["input"],
    errors: string[]
): Map<string, IToolDefinition> {
    const inputToolMap = new Map<string, IToolDefinition>();
    const tools = [input.tool1, input.tool2, input.tool3, input.tool4, input.tool5];

    tools.forEach((toolDef, index) => {
        if (!toolDef?.name) return;

        const toolPosition = `tool${index + 1}`;

        const paramNames = new Set<string>();
        const args = [toolDef.arg1, toolDef.arg2, toolDef.arg3, toolDef.arg4, toolDef.arg5]
            .filter(arg => arg?.name) as IToolArgumentMetadata[];

        args.forEach((arg, argIndex) => {
            if (paramNames.has(arg.name)) {
                errors.push(
                    `input.${toolPosition}.arg${argIndex + 1}: Duplicate parameter name '${arg.name}'`
                );
            }
            paramNames.add(arg.name);
        });

        if (inputToolMap.has(toolDef.name)) {
            errors.push(`input.${toolPosition}: Duplicate tool name '${toolDef.name}'`);
        } else {
            inputToolMap.set(toolDef.name, toolDef);
        }
    });

    return inputToolMap;
}

function outputToolsFrom(output: IStorageItem["preferred_output" | "non_preferred_output"]) {
    return [output.tool1, output.tool2, output.tool3, output.tool4, output.tool5];
}

export function validateOutputTools(
    outputTools: ITool[],
    inputToolMap: Map<string, IToolDefinition>,
    context: string,
    errors: string[]
) {
    outputTools.forEach((tool, index) => {
        if (!tool?.name) return;

        const toolPosition = `tool${index + 1}`;
        const toolDef = inputToolMap.get(tool.name);

        if (!toolDef) {
            errors.push(`${context}.${toolPosition}: Tool '${tool.name}' not defined in input`);
            return;
        }

        const outputArgs = [tool.arg1, tool.arg2, tool.arg3, tool.arg4, tool.arg5]
            .filter(arg => arg?.key) as IToolArgument[];
        const definedArgs = [toolDef.arg1, toolDef.arg2, toolDef.arg3, toolDef.arg4, toolDef.arg5]
            .filter(arg => arg?.name) as IToolArgumentMetadata[];

        const outputArgMap = new Map(outputArgs.map(arg => [arg.key, arg]));
        const definedArgMap = new Map(definedArgs.map(arg => [arg.name, arg]));

        // Check for duplicate keys in output
        if (outputArgs.length !== new Set(outputArgs.map(arg => arg.key)).size) {
            const duplicates = findDuplicates(outputArgs.map(arg => arg.key));
            duplicates.forEach(key => {
                errors.push(`${context}.${toolPosition}: Duplicate argument key '${key}'`);
            });
        }

        // Validate all defined arguments against output
        definedArgs.forEach((defArg) => {
            const outputArg = outputArgMap.get(defArg.name);

            if (defArg.required && !outputArg) {
                errors.push(
                    `${context}.${toolPosition}: Required argument '${defArg.name}' is missing`
                );
                return;
            }

            if (defArg.required && !outputArg?.value) {
                errors.push(
                    `${context}.${toolPosition}: Required argument '${defArg.name}' is empty`
                );
                return;
            }

            if (!outputArg) return;

            if (outputArg.key !== defArg.name) {
                errors.push(
                    `${context}.${toolPosition}: Argument key '${outputArg.key}' doesn't match definition '${defArg.name}'`
                );
            }

            validateArgumentValue(defArg, outputArg, context, toolPosition, errors);
        });

        // Check for undefined arguments in output
        outputArgMap.forEach((arg, key) => {
            if (!definedArgMap.has(key)) {
                errors.push(
                    `${context}.${toolPosition}: Argument '${key}' not defined in tool '${tool.name}'`
                );
            }
        });
    });
}

function validateArgumentValue(
    def: IToolArgumentMetadata,
    arg: IToolArgument,
    context: string,
    toolPosition: string,
    errors: string[]
) {
    if (def.enum?.length && !def.enum.includes(arg.value)) {
        errors.push(
            `${context}.${toolPosition}.${arg.key}: Value '${arg.value
            }' not in [${def.enum.join(", ")}]`
        );
    }

    if (def.type === "number" && isNaN(Number(arg.value))) {
        errors.push(
            `${context}.${toolPosition}.${arg.key}: '${arg.value}' is not a number`
        );
    } else if (
        def.type === "boolean" &&
        !["true", "false"].includes(arg.value.toLowerCase())
    ) {
        errors.push(
            `${context}.${toolPosition}.${arg.key}: '${arg.value}' is not a boolean`
        );
    }
}

function findDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    arr.forEach(item => {
        if (seen.has(item)) duplicates.add(item);
        seen.add(item);
    });

    return Array.from(duplicates);
}