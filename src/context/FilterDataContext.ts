import { createStateProvider } from "react-declarative";

export interface IFilterData {
  user_input: string;
  prefered_output: string;
  non_prefered_output: string;
}

export const INITIAL_FILTERS: IFilterData = {
  non_prefered_output: "",
  prefered_output: "",
  user_input: "",
};

export const [FilterDataProvider, useFilterData] = createStateProvider<IFilterData>();
