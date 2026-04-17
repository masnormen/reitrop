//  @ts-expect-error
import type { DataRecord, User } from "@repo/db";
import type { PermixDefinition } from "permix";

import { createPermix } from "permix";
import { createPermix as createExpressPermix } from "permix/express";

export type Definition = PermixDefinition<{
  dataRecord: {
    dataType: Pick<DataRecord, "departmentId">;
    action: "view" | "edit" | "edit_flag" | "download";
  };
  user: {
    dataType: Pick<User, "departmentId">;
    action: "view" | "edit";
  };
}>;

export const permix = createPermix<Definition>();
export const apiPermix = createExpressPermix<Definition>();
