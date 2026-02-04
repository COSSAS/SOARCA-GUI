import "styled-components";
import { Theme } from "./theme";

// Extend styled-components types to include our theme
declare module "styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}
