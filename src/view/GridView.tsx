import { Add, CopyAll, Delete, Edit, Publish, Save } from "@mui/icons-material";
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
} from "react-declarative";
import history from "../config/history";
import { Container, Paper } from "@mui/material";
import { downloadFinetune } from "../utils/downloadFinetune";
import { convertFromFinetune } from "../utils/convertFromFinetune";
import { fields } from "./OneView";

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
    label: "Download",
    icon: Save,
    action: "download-action",
  },
  {
    type: Breadcrumbs2Type.Fab,
    action: "open-action",
    icon: Publish,
  },
];

export const GridView = () => {
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

  const handleOpen = async () => {
    const blob = await chooseFile("*.jsonl");
    if (!blob) {
      return;
    }
    const text = await blob.text();
    const items = convertFromFinetune(text);
    storage.setValue(items);
    execute();
  };

  const handleCreate = () => {
    console.log("here");
    const newItem: Partial<IStorageItem> = {
      id: randomString(),
      ...getInitialData(fields),
    };
    storage.setValue([newItem as IStorageItem, ...(storage.getValue() ?? [])]);
    history.push(`/${newItem.id}`);
  };

  const handleAction = async (action: string) => {
    if (action === "create-action") {
      handleCreate();
    }
    if (action === "download-action") {
      console.log("here");
      downloadFinetune(storage.getValue());
    }
    if (action === "open-action") {
      handleOpen();
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
      <Breadcrumbs2 items={options} onAction={handleAction} />
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
