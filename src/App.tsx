import { get } from "lodash-es";
import { FieldType, One, TypedField } from "react-declarative";

const createToolParameter = (name: string, index: number): TypedField => ({
  type: FieldType.Outline,
  fieldBottomMargin: "2",
  fields: [
    {
      type: FieldType.Text,
      name: `${name}.arg${index}.name`,
      labelShrink: true,
      title: `Argument ${index} name`,
      placeholder: "Start to type to expand",
    },
    {
      type: FieldType.Fragment,
      isVisible: (data) => {
        return get(data, `${name}.arg${index}.name`);
      },
      fields: [
        {
          type: FieldType.Text,
          readonly: true,
          name: `${name}.arg${index}.type`,
          title: "Type",
          defaultValue: "string",
        },
        {
          type: FieldType.Text,
          inputRows: 3,
          name: `${name}.arg${index}.description`,
          title: "Description",
        },
        {
          type: FieldType.Items,
          name: `${name}.arg${index}.enum`,
          title: "Enum",
          freeSolo: true,
        },
        {
          type: FieldType.Checkbox,
          name: `${name}.arg${index}.required`,
          title: "Required",
        },
      ],
    },
  ],
});

const createTool = (name: string): TypedField => ({
  type: FieldType.Group,
  fieldBottomMargin: "4",
  fields: [
    {
      type: FieldType.Text,
      outlined: true,
      labelShrink: true,
      name: `${name}.name`,
      title: "Tool name",
      placeholder: "Start to type to expand",
    },
    {
      type: FieldType.Text,
      outlined: true,
      isVisible: (data) => {
        return get(data, `${name}.name`);
      },
      inputRows: 5,
      name: `${name}.description`,
      title: "Tool description",
    },
    {
      type: FieldType.Fragment,
      isVisible: (data) => {
        return get(data, `${name}.name`);
      },
      fields: [
        createToolParameter(name, 1),
        createToolParameter(name, 2),
        createToolParameter(name, 3),
        createToolParameter(name, 4),
        createToolParameter(name, 5),
      ],
    },
  ],
});

const createToolOutput = (name: string): TypedField => ({
  type: FieldType.Group,
  fieldBottomMargin: "5",
  fields: [
    {
      type: FieldType.Text,
      outlined: true,
      labelShrink: true,
      name: `${name}.name`,
      title: "Tool name",
      placeholder: "Start to type to expand",
    },
    {
      type: FieldType.Fragment,
      isVisible: (data) => {
        return get(data, `${name}.name`);
      },
      fields: [
        {
          type: FieldType.Text,
          name: `${name}.arg1`,
          title: "Argument 1",
        },
        {
          type: FieldType.Text,
          name: `${name}.arg2`,
          title: "Argument 2",
        },
        {
          type: FieldType.Text,
          name: `${name}.arg3`,
          title: "Argument 3",
        },
        {
          type: FieldType.Text,
          name: `${name}.arg4`,
          title: "Argument 4",
        },
        {
          type: FieldType.Text,
          name: `${name}.arg5`,
          title: "Argument 5",
        },
      ],
    },
  ],
});

export const fields: TypedField[] = [
  {
    type: FieldType.Init,
    name: "preferred_output.role",
    defaultValue: "assistant",
  },
  {
    type: FieldType.Init,
    name: "non_preferred_output.role",
    defaultValue: "assistant",
  },
  {
    type: FieldType.Init,
    name: "input.parallel_tool_calls",
    defaultValue: true,
  },
  {
    type: FieldType.Init,
    name: "input.role",
    defaultValue: "user",
  },
  {
    type: FieldType.Line,
    title: "User input",
  },
  {
    type: FieldType.Paper,
    fieldBottomMargin: "1",
    fields: [
      {
        type: FieldType.Text,
        readonly: true,
        name: "input.role",
        title: "Message Role",
        description: "Select the role of the message sender",
      },
      {
        type: FieldType.Text,
        name: "input.content",
        title: "Message Content",
        description: "Enter the message content",
        inputRows: 3,
        placeholder: "Type the message here...",
      },
    ],
  },
  {
    type: FieldType.Expansion,
    fieldBottomMargin: "3",
    title: "Input Tools",
    description: "List of tools available",
    fields: [
      createTool("input.tool1"),
      createTool("input.tool2"),
      createTool("input.tool3"),
      createTool("input.tool4"),
      createTool("input.tool5"),
    ],
  },
  {
    type: FieldType.Line,
    title: "Preferred Output",
  },
  {
    type: FieldType.Paper,
    fieldBottomMargin: "1",
    fields: [
      {
        type: FieldType.Text,
        fieldBottomMargin: "5",
        readonly: true,
        name: "preferred_output.role",
        title: "Preferred Response Role",
        description: "Select the role of the preferred response",
      },
      {
        type: FieldType.Text,
        fieldBottomMargin: "5",
        labelShrink: true,
        name: "preferred_output.content",
        title: "Preferred Response Content",
        description: "Enter the preferred response content",
        inputRows: 3,
        placeholder: "Type the preferred response here...",
      },
    ],
  },
  {
    type: FieldType.Expansion,
    fieldBottomMargin: "3",
    title: "Preferred Output Tools",
    description: "List of tools in prefered output",
    fields: [
      createToolOutput("preferred_output.tool1"),
      createToolOutput("preferred_output.tool2"),
      createToolOutput("preferred_output.tool3"),
      createToolOutput("preferred_output.tool4"),
      createToolOutput("preferred_output.tool5"),
    ],
  },
  {
    type: FieldType.Line,
    title: "Non-Preferred Output",
  },
  {
    type: FieldType.Paper,
    fieldBottomMargin: "1",
    fields: [
      {
        type: FieldType.Text,
        fieldBottomMargin: "5",
        readonly: true,
        name: "non_preferred_output.role",
        title: "Preferred Response Role",
        description: "Select the role of the preferred response",
      },
      {
        type: FieldType.Text,
        fieldBottomMargin: "5",
        name: "non_preferred_output.content",
        labelShrink: true,
        title: "Non-Preferred Response Content",
        description: "Enter the non-preferred response content",
        inputRows: 3,
        placeholder: "Type the non-preferred response here...",
      },
    ],
  },
  {
    type: FieldType.Expansion,
    fieldBottomMargin: "3",
    title: "Non-Preferred Output Tools",
    description: "List of tools in non-prefered output",
    fields: [
      createToolOutput("non_preferred_output.tool1"),
      createToolOutput("non_preferred_output.tool2"),
      createToolOutput("non_preferred_output.tool3"),
      createToolOutput("non_preferred_output.tool4"),
      createToolOutput("non_preferred_output.tool5"),
    ],
  },
];

export const App = () => (
  <One fields={fields} />
);

export default App;
