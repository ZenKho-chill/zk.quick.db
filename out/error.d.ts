export declare enum ErrorKind {
  MissingKey = "MISSING_KEY",
  MissingValue = "MISSING_VALUE",
  MissingDriver = "MISSING_DRIVER",
  ParseException = "PARSE_EXCEPTION",
  InvalidType = "INVALID_TYPE",
  InstanceNotFound = "INSTANCE_NOT_FOUND",
}

export declare class CustomError extends Error {
  message: string;
  kind: ErrorKind;
  constructor(message: string, kind: ErrorKind);
}