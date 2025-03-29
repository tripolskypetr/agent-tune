import { ISwitchItem, Switch, useLocalHistory } from "react-declarative";
import GridView from "./view/GridView";
import OneView from "./view/OneView";
import windowHistory from "./config/history";
import ToolPage from "./view/ToolPage";

const routes: ISwitchItem[] = [
  {
    path: "/",
    element: GridView,
  },
  {
    path: "/tool",
    element: ToolPage,
  },
  {
    path: "/:id",
    element: OneView,
  },
  
];

export const App = () => {

  return (
    <Switch
      items={routes}
      history={windowHistory}
    />
  );
}

export default App;
