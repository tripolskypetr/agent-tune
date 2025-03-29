import { Save, SaveAs } from "@mui/icons-material";
import { Container } from "@mui/material";
import { get, set } from "lodash-es";
import {
  Breadcrumbs2,
  Breadcrumbs2Type,
  FieldType,
  getAvailableFields,
  IBreadcrumbs2Option,
  One,
  TypedField,
  useActualCallback,
  useAlert,
  useConfirm,
  useSnack,
  getInitialData,
  IBreadcrumbs2Action,
  useActualState,
  sleep,
} from "react-declarative";
import history from "../config/history";
import storage, { IStorageItem } from "../config/storage";
import { validateToolCalls } from "../validation/validateToolCalls";
import { validateMessageOrder } from "../validation/validateMessageOrder";
import draft from "../config/draft";
import { validateMessageTools } from "../validation/validateMessageTools";

const createToolParameter = (name: string, index: number): TypedField => ({
  type: FieldType.Outline,
  isVisible: (data) => !!get(data, `${name}.name`),
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
      isVisible: (data) => !!get(data, `${name}.arg${index}.name`),
      fields: [
        {
          type: FieldType.Combo,
          itemList: [
            "string"
          ],
          isVisible: (data) => !!get(data, `${name}.arg${index}.name`),
          isIncorrect: (data) => {
            if (!get(data, `${name}.arg${index}.type`)) {
              return "Required"
            }
            return null;
          },
          dirty: true,
          name: `${name}.arg${index}.type`,
          title: "Type",
          defaultValue: "string",
        },
        {
          type: FieldType.Text,
          isVisible: (data) => !!get(data, `${name}.arg${index}.name`),
          isIncorrect: (data) => {
            if (!get(data, `${name}.arg${index}.description`)) {
              return "Required"
            }
            return null;
          },
          dirty: true,
          inputRows: 3,
          name: `${name}.arg${index}.description`,
          title: "Description",
        },
        {
          type: FieldType.Items,
          isVisible: (data) => !!get(data, `${name}.arg${index}.name`),
          name: `${name}.arg${index}.enum`,
          title: "Enum",
          freeSolo: true,
        },
        {
          type: FieldType.Checkbox,
          isVisible: (data) => !!get(data, `${name}.arg${index}.name`),
          name: `${name}.arg${index}.required`,
          title: "Required",
        },
      ],
    },
  ],
});

const createTool = (name: string, index: number): TypedField => ({
  type: FieldType.Group,
  fields: [
    {
      type: FieldType.Text,
      outlined: true,
      labelShrink: true,
      name: `${name}.name`,
      title: `Tool ${index} name`,
      placeholder: "Start to type to expand",
    },
    {
      type: FieldType.Text,
      outlined: true,
      isVisible: (data) => !!get(data, `${name}.name`),
      dirty: true,
      isIncorrect: (data) => {
        if (!get(data, `${name}.description`)) {
          return "Required"
        }
        return null;
      },
      inputRows: 5,
      name: `${name}.description`,
      title: "Tool description",
    },
    {
      type: FieldType.Group,
      fieldBottomMargin: "4",
      isVisible: (data) => !!get(data, `${name}.name`),
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

const createToolOutputArgument = (
  name: string,
  index: number
): TypedField[] => [
  {
    type: FieldType.Combo,
    itemList: (data: IStorageItem) => {
      const toolName = get(data, `${name}.name`);
      if (!toolName) return [];
      const toolsMap = new Map(
        [
          [data.input.tool1.name, data.input.tool1] as const,
          [data.input.tool2.name, data.input.tool2] as const,
          [data.input.tool3.name, data.input.tool3] as const,
          [data.input.tool4.name, data.input.tool4] as const,
          [data.input.tool5.name, data.input.tool5] as const,
        ].filter(([name]) => name)
      );
      const tool = toolsMap.get(toolName);
      if (!tool) return [];
      return Object.values(tool)
        .map((arg) => arg?.name)
        .filter(Boolean) as string[];
    },
    isVisible: (data) => !!get(data, `${name}.name`),
    columns: "4",
    name: `${name}.arg${index}.key`,
    title: `Argument ${index} Key`,
    labelShrink: true,
    placeholder: "Type a name to unlock the value",
  },
  {
    type: FieldType.Text,
    isVisible: (data: IStorageItem) => {
      const toolName = get(data, `${name}.name`);
      const argKey = get(data, `${name}.arg${index}.key`);
      if (!toolName || !argKey) return false;
      const toolsMap = new Map(
        [
          [data.input.tool1.name, data.input.tool1] as const,
          [data.input.tool2.name, data.input.tool2] as const,
          [data.input.tool3.name, data.input.tool3] as const,
          [data.input.tool4.name, data.input.tool4] as const,
          [data.input.tool5.name, data.input.tool5] as const,
        ].filter(([name]) => name)
      );
      const tool = toolsMap.get(toolName);
      return (
        tool &&
        !Object.values(tool).some((arg) => arg?.name === argKey && arg.enum)
      );
    },
    columns: "8",
    name: `${name}.arg${index}.value`,
    title: "",
    placeholder: `Argument ${index} Value`,
  },
  {
    type: FieldType.Combo,
    freeSolo: true,
    itemList: (data: IStorageItem) => {
      const toolName = get(data, `${name}.name`);
      const argKey = get(data, `${name}.arg${index}.key`);
      if (!toolName || !argKey) return [];
      const toolsMap = new Map(
        [
          [data.input.tool1.name, data.input.tool1] as const,
          [data.input.tool2.name, data.input.tool2] as const,
          [data.input.tool3.name, data.input.tool3] as const,
          [data.input.tool4.name, data.input.tool4] as const,
          [data.input.tool5.name, data.input.tool5] as const,
        ].filter(([name]) => name)
      );
      const tool = toolsMap.get(toolName);
      if (!tool) return [];
      const arg = Object.values(tool).find((arg) => arg?.name === argKey);
      return arg?.enum || [];
    },
    isVisible: (data: IStorageItem) => {
      const toolName = get(data, `${name}.name`);
      const argKey = get(data, `${name}.arg${index}.key`);
      if (!toolName || !argKey) return false;
      const toolsMap = new Map(
        [
          [data.input.tool1.name, data.input.tool1] as const,
          [data.input.tool2.name, data.input.tool2] as const,
          [data.input.tool3.name, data.input.tool3] as const,
          [data.input.tool4.name, data.input.tool4] as const,
          [data.input.tool5.name, data.input.tool5] as const,
        ].filter(([name]) => name)
      );
      const tool = toolsMap.get(toolName);
      return (
        tool && !!Object.values(tool).find((arg) => arg?.name === argKey)?.enum
      );
    },
    columns: "8",
    name: `${name}.arg${index}.value`,
    title: "",
    placeholder: `Argument ${index} Value`,
  },
];

const createToolOutput = (name: string, index: number): TypedField => ({
  type: FieldType.Group,
  fields: [
    {
      type: FieldType.Combo,
      outlined: true,
      labelShrink: true,
      name: `${name}.name`,
      itemList: (data: IStorageItem) => {
        return Object.values({
          tool1: data.input.tool1.name,
          tool2: data.input.tool2.name,
          tool3: data.input.tool3.name,
          tool4: data.input.tool4.name,
          tool5: data.input.tool5.name,
        }).filter(Boolean) as string[];
      },
      title: `Tool name ${index}`,
      placeholder: "Start to type to expand",
    },
    {
      type: FieldType.Outline,
      fieldBottomMargin: "5",
      isVisible: (data) => !!get(data, `${name}.name`),
      fields: [
        {
          type: FieldType.Group,
          fields: createToolOutputArgument(name, 1),
        },
        {
          type: FieldType.Group,
          fields: createToolOutputArgument(name, 2),
        },
        {
          type: FieldType.Group,
          fields: createToolOutputArgument(name, 3),
        },
        {
          type: FieldType.Group,
          fields: createToolOutputArgument(name, 4),
        },
        {
          type: FieldType.Group,
          fields: createToolOutputArgument(name, 5),
        },
      ],
    },
  ],
});

const createMessage = (name: string, index: number): TypedField => ({
  type: FieldType.Outline,
  fieldBottomMargin: "3",
  fields: [
    {
      type: FieldType.Combo,
      fieldBottomMargin: "5",
      name: `${name}.message${index}.role`,
      labelShrink: true,
      title: "Message role",
      description: "Select to unlock the content",
      itemList: ["user", "assistant", "system", "tool"],
    },
    {
      type: FieldType.Text,
      fieldBottomMargin: "2",
      inputRows: 5,
      name: `${name}.message${index}.content`,
      isVisible: (data) => get(data, `${name}.message${index}.role`) === "user",
      title: "",
      placeholder: `Message ${index} content (user)`,
    },
    {
      type: FieldType.Text,
      fieldBottomMargin: "4",
      inputRows: 5,
      name: `${name}.message${index}.content`,
      isVisible: (data) =>
        get(data, `${name}.message${index}.role`) === "assistant",
      title: "",
      placeholder: `Message ${index} content (assistant)`,
    },
    {
      type: FieldType.Fragment,
      isVisible: (data) =>
        get(data, `${name}.message${index}.role`) === "assistant",
      fields: [createToolOutput(`${name}.message${index}.tool1`, 1)],
    },
    {
      type: FieldType.Text,
      fieldBottomMargin: "2",
      inputRows: 5,
      name: `${name}.message${index}.content`,
      isVisible: (data) =>
        get(data, `${name}.message${index}.role`) === "system",
      title: "",
      placeholder: `Message ${index} content (system)`,
    },
    {
      type: FieldType.Text,
      fieldBottomMargin: "2",
      inputRows: 5,
      name: `${name}.message${index}.content`,
      isVisible: (data) => get(data, `${name}.message${index}.role`) === "tool",
      title: "",
      placeholder: `Message ${index} content (tool)`,
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
    title: "Conversation context",
  },
  {
    type: FieldType.Expansion,
    title: "Chat history",
    description: "Several chat messages to get the model to Context",
    fields: [
      createMessage("history", 1),
      createMessage("history", 2),
      createMessage("history", 3),
      createMessage("history", 4),
      createMessage("history", 5),
    ],
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
        fieldBottomMargin: "2",
        readonly: true,
        name: "input.role",
        title: "Message Role",
        description: "Select the role of the message sender",
      },
      {
        type: FieldType.Text,
        fieldBottomMargin: "2",
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
      createTool("input.tool1", 1),
      createTool("input.tool2", 2),
      createTool("input.tool3", 3),
      createTool("input.tool4", 4),
      createTool("input.tool5", 5),
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
      createToolOutput("preferred_output.tool1", 1),
      createToolOutput("preferred_output.tool2", 2),
      createToolOutput("preferred_output.tool3", 3),
      createToolOutput("preferred_output.tool4", 4),
      createToolOutput("preferred_output.tool5", 5),
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
      createToolOutput("non_preferred_output.tool1", 1),
      createToolOutput("non_preferred_output.tool2", 2),
      createToolOutput("non_preferred_output.tool3", 3),
      createToolOutput("non_preferred_output.tool4", 4),
      createToolOutput("non_preferred_output.tool5", 5),
    ],
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
    label: "Chat Card",
  },
  {
    type: Breadcrumbs2Type.Button,
    label: "Save",
    icon: Save,
    action: "save-action",
  },
];

const actions: IBreadcrumbs2Action[] = [
  {
    action: "draft-action",
    icon: SaveAs,
    label: "Save as draft",
  },
];

interface IOneViewProps {
  id: string;
}

const INITIAL_DATA = getInitialData(fields);

const polishData = async (data: IStorageItem) => {
  const output: Partial<IStorageItem> = {};
  const { visible, hidden } = await getAvailableFields(fields, data, {});
  visible.forEach(({ name }) => {
    if (name) {
      const value = get(data, name);
      set(output, name, value);
    }
  });
  hidden.forEach(({ name }) => {
    if (name) {
      set(output, name, get(INITIAL_DATA, name));
    }
  });
  output.id = data.id;
  return output as IStorageItem;
};

export const OneView = ({ id }: IOneViewProps) => {
  const [data$, setData] = useActualState<IStorageItem | null>(null);

  const notify = useSnack();

  const pickConfirm = useConfirm({
    title: "Are you sure?",
    msg: "You are going to leave the page without saving changes. Continue?",
    canCancel: true,
  });

  const pickAlert = useAlert({
    title: "Validation error",
    large: true,
  });

  const handleDraft = useActualCallback(() => {
    if (!data$.current) {
      notify("There are no changes to make a draft");
      return;
    }
    draft.setValue({
      ...data$.current,
      id,
    });
    notify("Changes saved as draft");
  });

  const handleSave = useActualCallback(async () => {
    if (!data$.current) {
      notify("There are no changes to save");
      return;
    }
    const pendingData = await polishData(data$.current);
    {
      const { errors, valid } = validateToolCalls(pendingData);
      if (!valid) {
        pickAlert({
          title: "The invalid tool calls",
          description: errors
            .map((text, idx) => `${idx + 1}) ${text}`)
            .join("\n\n"),
        });
        return;
      }
    }
    {
      const { errors, valid } = validateMessageOrder(pendingData);
      if (!valid) {
        pickAlert({
          title: "The invalid chat history order",
          description: errors
            .map((text, idx) => `${idx + 1}) ${text}`)
            .join("\n\n"),
        });
        return;
      }
    }
    {
      const { errors, valid } = validateMessageTools(pendingData);
      if (!valid) {
        pickAlert({
          title: "The invalid chat history tool calls",
          description: errors
            .map((text, idx) => `${idx + 1}) ${text}`)
            .join("\n\n"),
        });
        return;
      }
    }
    const items = storage.getValue();
    storage.setValue(
      items.map((row) => {
        if (row.id === id) {
          return { ...pendingData, id };
        }
        return row;
      })
    );
    {
      const data = draft.getValue();
      if (data?.id === id) {
        draft.setValue(null);
      }
    }
    setData(null);
    notify("Changes saved");
  });

  const handleBack = async () => {
    if (!data$.current) {
      history.push("/");
      return;
    }
    if (await pickConfirm().toPromise()) {
      history.push("/");
    }
  };

  const handleAction = async (action: string) => {
    if (action === "draft-action") {
      handleDraft();
    }
    if (action === "back-action") {
      handleBack();
    }
    if (action === "save-action") {
      await sleep(2_000).then(handleSave);
    }
  };

  return (
    <Container>
      <Breadcrumbs2 items={options} actions={actions} onAction={handleAction} />
      <One
        handler={() => {
          const data = draft.getValue();
          if (data?.id === id) {
            return data;
          }
          return storage.getValue().find((row) => row.id === id) ?? null;
        }}
        fields={fields}
        onChange={(value, initial) => {
          if (!initial) {
            setData(value);
          }
        }}
      />
    </Container>
  );
};

export default OneView;
