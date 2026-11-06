import "styled-components";
import { Theme } from "./theme";

// Extend styled-components types to include our theme
declare module "styled-components" {
  export interface DefaultTheme extends Theme {}
}
