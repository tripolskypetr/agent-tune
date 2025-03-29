import {
  Add,
  CloudUpload,
  CopyAll,
  DataObject,
  Delete,
  DeleteForever,
  Edit,
  FileOpen,
  MoveToInbox,
  Outbox,
  Publish,
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
} from "react-declarative";
import history from "../config/history";
import { Checkbox, Container, Paper } from "@mui/material";
import { downloadFinetune } from "../utils/downloadFinetune";
import { convertFromFinetune } from "../utils/convertFromFinetune";
import { fields } from "./OneView";
import { downloadStorage } from "../utils/downloadStorage";
import draft from "../config/draft";
import { downloadFinetuneSft } from "../utils/downloadFinetune.sft";
import { convertFromFinetuneSft } from "../utils/convertFromFinetune.sft";

const getDraftId = singleshot(() => draft.getValue()?.id ?? null);

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
    type: Breadcrumbs2Type.Link,
    label: "Fine tune",
  },
  {
    type: Breadcrumbs2Type.Link,
    label: "Grid",
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

export const GridView = () => {
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

  const [data, { loading, execute }] = useAsyncValue(() => {
    getDraftId.clear();
    const items = storage.getValue();
    return items ? items : [];
  });

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
      downloadFinetune(storage.getValue());
    }
    if (action === "import-action-sft") {
      handleImportSft();
    }
    if (action === "export-action-sft") {
      downloadFinetuneSft(storage.getValue());
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
    </Container>
  );
};

export default GridView;
