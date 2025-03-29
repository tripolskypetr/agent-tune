import {
  IStorageItem,
  ITool,
  IToolArgumentMetadata,
  IToolDefinition,
} from "../config/storage";

export function validateToolCalls(item: IStorageItem): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const outputTools = {
    preferred: [
      item.preferred_output.tool1,
      item.preferred_output.tool2,
      item.preferred_output.tool3,
      item.preferred_output.tool4,
      item.preferred_output.tool5,
    ],
    nonPreferred: [
      item.non_preferred_output.tool1,
      item.non_preferred_output.tool2,
      item.non_preferred_output.tool3,
      item.non_preferred_output.tool4,
      item.non_preferred_output.tool5,
    ],
  };

  const inputTools = [
    item.input.tool1,
    item.input.tool2,
    item.input.tool3,
    item.input.tool4,
    item.input.tool5,
  ];

  const inputToolMap = new Map<string, IToolDefinition>();
  inputTools.forEach((toolDef, index) => {
    const toolPosition = `tool${index + 1}`;
    
    if (!toolDef) return;

    // Validate input tool parameter names
    const parameterNames = new Set<string>();
    for (let argNum = 1; argNum <= 5; argNum++) {
      const argKey = `arg${argNum}` as keyof IToolDefinition;
      const arg = toolDef[argKey];

      if (typeof arg === "string") {
        continue;
      }
      
      if (arg?.name) {
        if (parameterNames.has(arg.name)) {
          errors.push(
            `input.${toolPosition}.${argKey}: Duplicate parameter name '${arg.name}'`
          );
        } else {
          parameterNames.add(arg.name);
        }
      }
    }

    if (toolDef.name) {
      if (inputToolMap.has(toolDef.name)) {
        errors.push(
          `input.${toolPosition}: Tool name '${toolDef.name}' is not unique`
        );
      }
      inputToolMap.set(toolDef.name, toolDef);
    }
  });

  validateOutputTools(
    outputTools.preferred,
    inputToolMap,
    "preferred_output",
    errors
  );
  validateOutputTools(
    outputTools.nonPreferred,
    inputToolMap,
    "non_preferred_output",
    errors
  );

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateOutputTools(
  outputTools: ITool[],
  inputToolMap: Map<string, IToolDefinition>,
  context: string,
  errors: string[]
) {
  outputTools.forEach((tool, index) => {
    const toolPosition = `tool${index + 1}`;

    if (!tool?.name) return;

    const toolDef = inputToolMap.get(tool.name);
    if (!toolDef) {
      errors.push(
        `${context}.${toolPosition}: Tool '${tool.name}' is not defined in input`
      );
      return;
    }

    // Track parameter names to check for duplicates
    const parameterNames = new Set<string>();

    for (let argNum = 1; argNum <= 5; argNum++) {
      const argKey = `arg${argNum}` as keyof ITool;
      const arg = tool[argKey];

      if (typeof arg === "string") {
        continue;
      }

      // Check for duplicate parameter names
      if (arg?.key) {
        if (parameterNames.has(arg.key)) {
          errors.push(
            `${context}.${toolPosition}.${argKey}: Duplicate parameter name '${arg.key}'`
          );
        } else {
          parameterNames.add(arg.key);
        }
      }

      // Existing validation checks
      const argDef = toolDef[argKey] as IToolArgumentMetadata | undefined;

      if (!argDef?.name) continue;

      if (argDef.required && (!arg?.key || !arg?.value)) {
        errors.push(
          `${context}.${toolPosition}.${argKey}: Required argument '${argDef.name}' is missing`
        );
        continue;
      }

      if (!arg?.key) continue;

      if (arg.key !== argDef.name) {
        errors.push(
          `${context}.${toolPosition}.${argKey}: Argument name '${arg.key}' doesn't match definition '${argDef.name}'`
        );
        continue;
      }

      if (argDef.enum?.length && !argDef.enum.includes(arg.value)) {
        errors.push(
          `${context}.${toolPosition}.${argKey}: Value '${
            arg.value
          }' is not in allowed values [${argDef.enum.join(", ")}]`
        );
      }

      if (argDef.type === "number" && isNaN(Number(arg.value))) {
        errors.push(
          `${context}.${toolPosition}.${argKey}: Value '${arg.value}' is not a valid number`
        );
      } else if (
        argDef.type === "boolean" &&
        !["true", "false"].includes(arg.value.toLowerCase())
      ) {
        errors.push(
          `${context}.${toolPosition}.${argKey}: Value '${arg.value}' is not a valid boolean`
        );
      }
    }
  });
}
