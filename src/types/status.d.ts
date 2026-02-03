import { ISODateString, Uptime } from "./common";

export type Status = {
  mode: string;
  runtime: string;
  time: ISODateString;
  uptime: Uptime;
  version: string;
};
