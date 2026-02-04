// Common/shared types for SOARCA API

export type UUID = string;
export type ISODateString = string;

export type ErrorResponse = {
  message: string;
  "original-call": string;
  status: number;
  "downstream-call"?: string;
  example?: string; // free-form example from swagger
};

export type Uptime = {
  milliseconds: number;
  since: ISODateString;
};

export type ApiResponse<T> = {
  data: T;
  error?: ErrorResponse;
  status?: number;
};
