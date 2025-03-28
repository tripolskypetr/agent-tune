import { ISwitchItem, Switch, useLocalHistory } from "react-declarative";
import GridView from "./view/GridView";
import OneView from "./view/OneView";
import windowHistory from "./config/history";

const routes: ISwitchItem[] = [
  {
    path: "/",
    element: GridView,
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
