import { ISwitchItem, Switch, useLocalHistory } from "react-declarative";
import GridView from "./view/GridView";
import OneView from "./view/OneView";
import windowHistory from "./config/history";
import ToolPage from "./view/ToolPage";
import { FilterDataProvider, INITIAL_FILTERS } from "./context/FilterDataContext";

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
    <FilterDataProvider initialState={INITIAL_FILTERS}>
      <Switch items={routes} history={windowHistory} />
    </FilterDataProvider>
  );
};

export default App;
