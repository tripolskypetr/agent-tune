import {
  One,
  FieldType,
  TypedField,
  Breadcrumbs2,
  IBreadcrumbs2Option,
  Breadcrumbs2Type,
} from "react-declarative";
import { get } from "lodash-es";
import { IStorageItem } from "../config/storage";
import { Container } from "@mui/material";
import history from "../config/history";

interface IData {
  input: {
    tool1: ITool;
  };
}

interface ITool {
  name: string;
  description: string;
  arg1: IArgument;
  arg2: IArgument;
  arg3: IArgument;
  arg4: IArgument;
  arg5: IArgument;
}

interface IArgument {
  name: string;
  type: string;
  description: string;
  enum: string[] | null;
  required: boolean;
}

interface IOpenAIFunction {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<
        string,
        {
          type: string;
          description: string;
          enum?: string[] | null;
        }
      >;
      required: string[];
    };
  };
}

function transformToOpenAIFunction(data: IData): IOpenAIFunction {
  const tool = data.input.tool1;

  // Explicitly include all arguments in the properties dictionary using their 'name' as keys
  const properties: Record<
    string,
    { type: string; description: string; enum?: string[] | null }
  > = {
    [tool.arg1.name]: {
      type: tool.arg1.type,
      description: tool.arg1.description,
      ...(tool.arg1.enum && { enum: tool.arg1.enum }),
    },
    [tool.arg2.name]: {
      type: tool.arg2.type,
      description: tool.arg2.description,
      ...(tool.arg2.enum && { enum: tool.arg2.enum }),
    },
    [tool.arg3.name]: {
      type: tool.arg3.type,
      description: tool.arg3.description,
      ...(tool.arg3.enum && { enum: tool.arg3.enum }),
    },
    [tool.arg4.name]: {
      type: tool.arg4.type,
      description: tool.arg4.description,
      ...(tool.arg4.enum && { enum: tool.arg4.enum }),
    },
    [tool.arg5.name]: {
      type: tool.arg5.type,
      description: tool.arg5.description,
      ...(tool.arg5.enum && { enum: tool.arg5.enum }),
    },
  };

  delete properties[""];

  // Collect required argument names explicitly
  const required: string[] = [
    tool.arg1.required ? tool.arg1.name : null,
    tool.arg2.required ? tool.arg2.name : null,
    tool.arg3.required ? tool.arg3.name : null,
    tool.arg4.required ? tool.arg4.name : null,
    tool.arg5.required ? tool.arg5.name : null,
  ].filter(Boolean) as string[];

  // Construct the OpenAI function object
  const openAIFunction: IOpenAIFunction = {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties,
        required,
      },
    },
  };

  return openAIFunction;
}

// Helper function to create tool parameter fields (for input tool definitions)
const createToolParameter = (name: string, index: number): TypedField => ({
  type: FieldType.Outline,
  fieldBottomMargin: "2",
  fields: [
    {
      type: FieldType.Text,
      name: `${name}.arg${index}.name`,
      dirty: true,
      validation: {
        required: true,
      },
      labelShrink: true,
      title: `Argument ${index} Name`,
    },
    {
      type: FieldType.Combo,
      itemList: ["string", "number", "boolean"],
      validation: {
        required: true,
      },
      dirty: true,
      name: `${name}.arg${index}.type`,
      title: "Type",
      defaultValue: "string",
    },
    {
      type: FieldType.Text,
      validation: {
        required: true,
      },
      dirty: true,
      inputRows: 3,
      name: `${name}.arg${index}.description`,
      title: "Description",
    },
    {
      type: FieldType.Items,
      name: `${name}.arg${index}.enum`,
      title: "Enum (optional)",
      freeSolo: true,
    },
    {
      type: FieldType.Checkbox,
      name: `${name}.arg${index}.required`,
      title: "Required",
      defaultValue: false,
    },
  ],
});

// Helper function to create tool definition fields
const createTool = (name: string, index: number): TypedField => ({
  type: FieldType.Group,
  fields: [
    {
      type: FieldType.Text,
      validation: {
        required: true,
      },
      dirty: true,
      outlined: true,
      labelShrink: true,
      name: `${name}.name`,
      title: `Tool ${index} Name`,
      placeholder: "Start typing to expand",
    },
    {
      type: FieldType.Text,
      outlined: true,
      validation: {
        required: true,
      },
      dirty: true,
      inputRows: 3,
      name: `${name}.description`,
      title: "Tool Description",
    },
    createToolParameter(name, 1),
    createToolParameter(name, 2),
    createToolParameter(name, 3),
    createToolParameter(name, 4),
    createToolParameter(name, 5),
  ],
});

// Main fields array
export const fields: TypedField[] = [
  {
    type: FieldType.Paper,
    sx: {
        overflow: "hidden",
    },
    innerPadding: "0px",
    desktopColumns: "6",
    tabletColumns: "6",
    phoneColumns: "12",
    fieldBottomMargin: "1",
    fieldRightMargin: "1",
    child: {
        type: FieldType.Box,
        sx: {
            minHeight: 'calc(100vh - 100px)',
            maxHeight: 'calc(100vh - 100px)',
            overflowX: "hidden",
            overflowY: "auto",
            p: 1,
        },
        child: createTool("input.tool1", 1),
    }
  },
  {
    type: FieldType.Paper,
    sx: {
        minHeight: 'calc(100vh - 100px)',
        maxHeight: 'calc(100vh - 100px)',
        overflowX: "hidden",
        overflowY: "auto",
    },
    desktopColumns: "6",
    tabletColumns: "6",
    phoneColumns: "12",
    fieldBottomMargin: "1",
    fieldRightMargin: "1",
    child: {
      type: FieldType.Component,
      fieldBottomMargin: "3",
      element: ({ _fieldData }) => (
        <pre>
          {JSON.stringify(transformToOpenAIFunction(_fieldData), null, 2)}
        </pre>
      ),
    },
  },
];

const options: IBreadcrumbs2Option[] = [
  {
    type: Breadcrumbs2Type.Link,
    action: "back-action",
    label: "Fine tune",
  },
  {
    type: Breadcrumbs2Type.Link,
    action: "back-action",
    label: "Tool builder",
  },
];

export const ToolPage = () => {
  const handleAction = (action: string) => {
    if (action === "back-action") {
      history.push("/");
    }
  };

  return (
    <Container>
      <Breadcrumbs2 items={options} onAction={handleAction} />
      <One fields={fields} />
    </Container>
  );
};

export default ToolPage;
