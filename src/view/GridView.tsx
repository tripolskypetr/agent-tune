import { Add, CloudUpload, CopyAll, Delete, DeleteForever, Edit, FileOpen, MoveToInbox, Outbox, Publish, Refresh, Save } from "@mui/icons-material";
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
} from "react-declarative";
import history from "../config/history";
import { Container, Paper } from "@mui/material";
import { downloadFinetune } from "../utils/downloadFinetune";
import { convertFromFinetune } from "../utils/convertFromFinetune";
import { fields } from "./OneView";
import { downloadStorage } from "../utils/downloadStorage";

const columns: IGridColumn[] = [
  {
    label: "User input",
    field: "input_content",
    format: (data: IStorageItem) => {
      return data?.input?.content || "Empty";
    },
  },
  {
    label: "Prefered output",
    field: "prefered_output",
    format: (data: IStorageItem) => {
      return data?.preferred_output?.content || "Empty";
    },
  },
  {
    label: "Non-Prefered output",
    field: "non_prefered_output",
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
    action: "export-action",
    label: "Export to jsonl",
    icon: Outbox,
  },
  {
    label: "Import from jsonl",
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
  }
];

export const GridView = () => {

  const pickConfirm = useConfirm({
    title: "Are you sure?",
    msg: "This action will remove everything from the card. Continue?",
    canCancel: true,
  });

  const [data, { loading, execute }] = useAsyncValue(() => {
    const items = storage.getValue();
    return items ? items : [];
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

  const handleOpen = async () => {
    const blob = await chooseFile("*.json");
    if (!blob) {
      return;
    }
    const text = await blob.text();
    const json = JSON.parse(text);
    storage.setValue(json);
    execute();
  }

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
    if (action === "import-action") {
      handleImport();
    }
  };

  const handleRowClick = ({ id }: IStorageItem) => {
    history.push(`/${id}`);
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
