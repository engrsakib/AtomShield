import { PermissionEnum, PermissionGroup } from "./permission.enum";

import { Types } from "mongoose";

export interface IPermission {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  key: PermissionEnum;
  note?: string;
  group?: PermissionGroup;
  isActive?: boolean;
  createdBy?: Types.ObjectId | null | string;
  createdAt?: Date;
  updatedAt?: Date;
}
