import { createStateProvider } from "react-declarative";

export interface IFilterData {
  vector_search: string;
  user_input: string;
  prefered_output: string;
  non_prefered_output: string;
}

export const INITIAL_FILTERS: IFilterData = {
  non_prefered_output: "",
  prefered_output: "",
  user_input: "",
  vector_search: "",
};

export const [FilterDataProvider, useFilterData] = createStateProvider<IFilterData>();
