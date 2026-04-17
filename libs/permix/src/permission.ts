//  @ts-expect-error
import type { User } from "@repo/db";

import { permix } from "./instance";

const generalUserPermission = permix.template(() => ({
  dataRecord: {
    view: true,
    edit: false,
    edit_flag: false,
    download: false,
  },
  user: {
    view: false,
    edit: false,
  },
}));

const managerPermission = permix.template(() => ({
  dataRecord: {
    view: true,
    edit: false,
    edit_flag: false,
    download: true,
  },
  user: {
    view: false,
    edit: false,
  },
}));

const operatorPermission = permix.template(() => ({
  dataRecord: {
    view: true,
    edit: false,
    edit_flag: true,
    download: true,
  },
  user: {
    view: false,
    edit: false,
  },
}));

const generalAdminPermission = permix.template(() => ({
  dataRecord: {
    view: true,
    edit: true,
    edit_flag: true,
    download: true,
  },
  user: {
    view: false,
    edit: false,
  },
}));

const superAdminPermission = permix.template(() => ({
  dataRecord: {
    view: true,
    edit: true,
    edit_flag: true,
    download: true,
  },
  user: {
    view: true,
    edit: true,
  },
}));

const departmentAdminPermission = permix.template((user: Partial<User>) => ({
  dataRecord: {
    view: (dataRecord) => !!dataRecord && dataRecord.departmentId === user.departmentId,
    edit: (dataRecord) => !!dataRecord && dataRecord.departmentId === user.departmentId,
    edit_flag: (dataRecord) => !!dataRecord && dataRecord.departmentId === user.departmentId,
    download: false,
  },
  user: {
    view: false,
    edit: false,
  },
}));

const departmentUserPermission = permix.template((user: Partial<User>) => ({
  dataRecord: {
    view: (dataRecord) => !!dataRecord && dataRecord.departmentId === user.departmentId,
    edit: false,
    edit_flag: false,
    download: false,
  },
  user: {
    view: false,
    edit: false,
  },
}));

const guestPermission = permix.template(() => ({
  dataRecord: {
    view: false,
    edit: false,
    edit_flag: false,
    download: false,
  },
  user: {
    view: false,
    edit: false,
  },
}));

export const permission = {
  generalUser: generalUserPermission,
  manager: managerPermission,
  operator: operatorPermission,
  generalAdmin: generalAdminPermission,
  superAdmin: superAdminPermission,
  departmentAdmin: departmentAdminPermission,
  departmentUser: departmentUserPermission,
  guest: guestPermission,
};
