import {
  Add,
  Close,
  CopyAll,
  DataObject,
  Delete,
  DeleteForever,
  Edit,
  FileOpen,
  FilterList,
  MoveToInbox,
  Outbox,
  Refresh,
  Save,
} from "@mui/icons-material";
import storage, { IStorageItem } from "../config/storage";
import {
  Breadcrumbs2,
  Breadcrumbs2Type,
  chooseFile,
  Grid,
  IBreadcrumbs2Option,
  IGridAction,
  IGridColumn,
  randomString,
  useAsyncValue,
  getInitialData,
  IBreadcrumbs2Action,
  useConfirm,
  useOnce,
  not,
  singleshot,
  useOne,
  TypedField,
  FieldType,
  OneButton,
} from "react-declarative";
import history from "../config/history";
import {
  Box,
  Breadcrumbs,
  Checkbox,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { downloadFinetune } from "../utils/downloadFinetune";
import { convertFromFinetune } from "../utils/convertFromFinetune";
import { fields } from "./OneView";
import { downloadStorage } from "../utils/downloadStorage";
import draft from "../config/draft";
import { downloadFinetuneSft } from "../utils/downloadFinetune.sft";
import { convertFromFinetuneSft } from "../utils/convertFromFinetune.sft";
import { useFilterData } from "../context/FilterDataContext";

const getDraftId = singleshot(() => draft.getValue()?.id ?? null);

const compareFulltext = (search: string, data: string) => {
  const target = String(search || "")
    .toLowerCase()
    .split(" ");
  const source = String(data || "")
    .toLowerCase()
    .split(" ");
  return target.every(function (term) {
    return source.some((word) => word.includes(term));
  });
};

const columns: IGridColumn[] = [
  {
    label: "Draft",
    field: "draft",
    align: "left",
    width: () => 85,
    format: (data: IStorageItem) => (
      <Checkbox checked={data.id === getDraftId()} />
    ),
  },
  {
    label: "User input",
    field: "input_content",
    width: (fullWidth) => (fullWidth - 85) * 0.33,
    minWidth: 175,
    format: (data: IStorageItem) => {
      return data?.input?.content || "Empty";
    },
  },
  {
    label: "Prefered output",
    field: "prefered_output",
    width: (fullWidth) => (fullWidth - 85) * 0.33,
    minWidth: 175,
    format: (data: IStorageItem) => {
      return data?.preferred_output?.content || "Empty";
    },
  },
  {
    label: "Non-Prefered output",
    field: "non_prefered_output",
    width: (fullWidth) => (fullWidth - 85) * 0.33,
    minWidth: 175,
    format: (data: IStorageItem) => {
      return data?.non_preferred_output?.content || "Empty";
    },
  },
];

const rowActions: IGridAction[] = [
  {
    action: "copy-action",
    label: "Make a copy",
    icon: CopyAll,
  },
  {
    action: "edit-action",
    label: "Edit",
    icon: Edit,
  },
  {
    action: "remove-action",
    label: "Remove",
    icon: Delete,
  },
];

const options: IBreadcrumbs2Option[] = [
  {
    type: Breadcrumbs2Type.Component,
    element: () => {
      const [filterData, setFilterData] = useFilterData();
      return (
        <Stack direction="row" alignItems="center" gap={1}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit">
              Fine tune
            </Link>
            <Link underline="hover" color="inherit">
              Grid
            </Link>
          </Breadcrumbs>
          <Box sx={{ flex: 1 }} />
          <OneButton
            variant="outlined"
            oneSx={{
              background: "#000c",
            }}
            waitForChangesDelay={0}
            startIcon={<FilterList />}
            handler={() => filterData}
            fields={filter_fields}
            onChange={(filterData, initial) =>
              !initial && setFilterData(filterData)
            }
          >
            Filters
          </OneButton>
        </Stack>
      );
    },
  },
  {
    type: Breadcrumbs2Type.Button,
    label: "Create",
    icon: Add,
    action: "create-action",
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
    label: "Refresh",
    icon: Refresh,
    action: "refresh-action",
  },
  {
    label: "Save",
    icon: Save,
    action: "save-action",
  },
  {
    label: "Load",
    icon: FileOpen,
    action: "load-action",
  },
  {
    divider: true,
  },
  {
    action: "code-action",
    label: "Tool builder",
    icon: DataObject,
  },
  {
    divider: true,
  },
  {
    action: "export-action-sft",
    label: "Export to jsonl (SFT)",
    icon: Outbox,
  },
  {
    label: "Import from jsonl (SFT)",
    icon: MoveToInbox,
    action: "import-action-sft",
  },
  {
    divider: true,
  },
  {
    action: "export-action",
    label: "Export to jsonl (DPO)",
    icon: Outbox,
  },
  {
    label: "Import from jsonl (DPO)",
    icon: MoveToInbox,
    action: "import-action",
  },
  {
    divider: true,
  },
  {
    label: "Remove all",
    icon: DeleteForever,
    action: "remove-all-action",
  },
];

const filter_fields: TypedField[] = [
  {
    type: FieldType.Box,
    sx: {
      pr: 1,
      pl: 1,
    },
    fields: [
      {
        type: FieldType.Box,
        sx: {
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
        },
        fields: [
          {
            type: FieldType.Typography,
            typoVariant: "h6",
            placeholder: "Row filters",
          },
          {
            type: FieldType.Div,
          },
          {
            type: FieldType.Button,
            buttonVariant: "text",
            title: "Clear",
            click({}, {}, {}, {}, {}, onChange) {
              onChange({
                user_input: "",
                prefered_output: "",
                non_prefered_output: "",
              });
            },
          },
        ],
      },
      {
        type: FieldType.Text,
        fieldRightMargin: "0",
        outlined: true,
        name: "user_input",
        title: "User input",
        placeholder: "Text for fulltext search",
        trailingIcon: Close,
        trailingIconClick({}, {}, {}, onValueChange) {
          onValueChange("");
        },
      },
      {
        type: FieldType.Text,
        fieldRightMargin: "0",
        outlined: true,
        name: "prefered_output",
        title: "Prefered output",
        placeholder: "Text for fulltext search",
        trailingIcon: Close,
        trailingIconClick({}, {}, {}, onValueChange) {
          onValueChange("");
        },
      },
      {
        type: FieldType.Text,
        fieldRightMargin: "0",
        outlined: true,
        name: "non_prefered_output",
        title: "Non-Prefered output",
        placeholder: "Text for fulltext search",
        trailingIcon: Close,
        trailingIconClick({}, {}, {}, onValueChange) {
          onValueChange("");
        },
      },
    ],
  },
];

const export_fields: TypedField<{}, { isHfOnly: boolean }>[] = [
  {
    type: FieldType.Radio,
    name: "format",
    radioValue: "hf",
    title: "HuggingFace format",
    defaultValue: "hf",
  },
  {
    type: FieldType.Typography,
    sx: {
      opacity: 0.6,
    },
    typoVariant: "body2",
    click({}, {}, {}, {}, {}, onChange) {
      onChange({
        format: "hf",
      });
    },
    placeholder:
      'HuggingFace format means the next standart role fields will be user: "system", "user" and "assistant". Tools are included in this type of export',
  },
  {
    type: FieldType.Radio,
    name: "format",
    radioValue: "openai",
    title: "OpenAI format",
    isDisabled: ({}, { isHfOnly }) => {
      return isHfOnly || false;
    },
  },
  {
    type: FieldType.Typography,
    sx: {
      opacity: 0.6,
    },
    typoVariant: "body2",
    click({}, {}, {}, { isHfOnly }, {}, onChange) {
      if (isHfOnly) {
        return;
      }
      onChange({
        format: "openai",
      });
    },
    placeholder:
      'OpenAI format means the next standart role fields will be user: "system", "user" and "assistant". Tool calls are not being exported with that method',
  },
  {
    type: FieldType.Radio,
    name: "format",
    radioValue: "cohere",
    title: "Cohere format",
    isDisabled: ({}, { isHfOnly }) => {
      return isHfOnly || false;
    },
  },
  {
    type: FieldType.Typography,
    fieldBottomMargin: "5",
    sx: {
      opacity: 0.6,
    },
    typoVariant: "body2",
    click({}, {}, {}, { isHfOnly }, {}, onChange) {
      if (isHfOnly) {
        return;
      }
      onChange({
        format: "cohere",
      });
    },
    placeholder:
      'Cohere format means the next role field values will be user: "System", "User" and "Chatbot". Tool calls are not being exported with that method',
  },
];

export const GridView = () => {
  const [filterData] = useFilterData();

  const pickFinetuneFormat = useOne({
    title: "Pick finetune format",
    fields: export_fields,
    canCancel: true,
  });

  const pickDraft = useConfirm({
    title: "The unsaved draft found",
    msg: "Looks like there is unsaved draft. Would you like to open it?",
    canCancel: true,
  });

  const pickConfirm = useConfirm({
    title: "Are you sure?",
    msg: "This action will remove everything from the card. Continue?",
    canCancel: true,
  });

  const [data, { loading, execute }] = useAsyncValue(
    () => {
      getDraftId.clear();
      const data = storage.getValue();
      const items = data ? data : [];
      return items.filter((item) => {
        let isOk = true;
        if (filterData.user_input) {
          isOk =
            isOk &&
            compareFulltext(filterData.user_input, item?.input?.content);
        }
        if (filterData.prefered_output) {
          isOk =
            isOk &&
            compareFulltext(
              filterData.prefered_output,
              item?.preferred_output?.content
            );
        }
        if (filterData.non_prefered_output) {
          isOk =
            isOk &&
            compareFulltext(
              filterData.non_prefered_output,
              item?.non_preferred_output?.content
            );
        }
        return isOk;
      });
    },
    {
      deps: [filterData],
    }
  );

  useOnce(async () => {
    const data = draft.getValue();
    if (!data) {
      return;
    }
    if (await not(pickDraft().toPromise())) {
      return;
    }
    if (storage.getValue().some((row) => row.id === data.id)) {
      history.push(`/${data.id}`);
    } else {
      storage.setValue([...(storage.getValue() || []), data]);
      history.push(`/${data.id}`);
    }
  });

  const handleRowAction = (action: string, row: IStorageItem) => {
    if (action === "copy-action") {
      const items = storage.getValue();
      storage.setValue([...items, { ...row, id: randomString() }]);
      execute();
    }
    if (action === "remove-action") {
      const items = storage.getValue();
      storage.setValue(items.filter(({ id }) => id !== row.id));
      execute();
    }
    if (action === "edit-action") {
      history.push(`/${row.id}`);
    }
  };

  const handleImport = async () => {
    const isConfirmed = await pickFinetuneFormat({
      title: "Pick finetune import format",
      payload: {
        isHfOnly: true,
      },
    }).toPromise();
    if (!isConfirmed) {
      return;
    }
    const blob = await chooseFile("*.jsonl");
    if (!blob) {
      return;
    }
    const text = await blob.text();
    const items = convertFromFinetune(text);
    storage.setValue(items);
    execute();
  };

  const handleImportSft = async () => {
    const isConfirmed = await pickFinetuneFormat({
      title: "Pick finetune import format",
      payload: {
        isHfOnly: true,
      },
    }).toPromise();
    if (!isConfirmed) {
      return;
    }
    const blob = await chooseFile("*.jsonl");
    if (!blob) {
      return;
    }
    const text = await blob.text();
    const items = convertFromFinetuneSft(text);
    storage.setValue(items);
    execute();
  };

  const handleOpen = async () => {
    const blob = await chooseFile("*.json");
    if (!blob) {
      return;
    }
    const text = await blob.text();
    const json = JSON.parse(text);
    storage.setValue(json);
    execute();
  };

  const handleCreate = () => {
    const newItem: Partial<IStorageItem> = {
      id: randomString(),
      ...getInitialData(fields),
    };
    storage.setValue([newItem as IStorageItem, ...(storage.getValue() ?? [])]);
    history.push(`/${newItem.id}`);
  };

  const handleRemoveAll = async () => {
    if (await pickConfirm().toPromise()) {
      storage.setValue([]);
      execute();
    }
  };

  const handleExport = async () => {
    const data = await pickFinetuneFormat({
      title: "Pick finetune export format",
    }).toPromise();
    if (!data) {
      return;
    }
    downloadFinetune(storage.getValue(), data.format);
  };

  const handleExportSft = async () => {
    const data = await pickFinetuneFormat({
      title: "Pick finetune export format",
    }).toPromise();
    if (!data) {
      return;
    }
    downloadFinetuneSft(storage.getValue(), data.format);
  };

  const handleAction = async (action: string) => {
    if (action === "remove-all-action") {
      handleRemoveAll();
    }
    if (action === "save-action") {
      downloadStorage(storage.getValue());
    }
    if (action === "load-action") {
      handleOpen();
    }
    if (action === "refresh-action") {
      execute();
    }
    if (action === "create-action") {
      handleCreate();
    }
    if (action === "export-action") {
      handleExport();
    }
    if (action === "import-action-sft") {
      handleImportSft();
    }
    if (action === "export-action-sft") {
      handleExportSft();
    }
    if (action === "import-action") {
      handleImport();
    }
    if (action === "code-action") {
      history.push(`/tool`);
    }
  };

  const handleRowClick = ({ id }: IStorageItem) => {
    if (storage.getValue().some((row) => row.id === id)) {
      history.push(`/${id}`);
      return;
    }
    execute();
  };

  if (!data) {
    return null;
  }

  return (
    <Container>
      <Breadcrumbs2 items={options} actions={actions} onAction={handleAction} />
      <Paper>
        <Grid
          sx={{
            height: "calc(100vh - 100px)",
          }}
          data={data}
          loading={loading}
          rowActions={rowActions}
          columns={columns}
          onRowAction={handleRowAction}
          onRowClick={handleRowClick}
        />
      </Paper>
      <Typography variant="body2" sx={{ opacity: 0.5, mt: 0.5 }}>
        Total: {data.length}
      </Typography>
    </Container>
  );
};

export default GridView;
