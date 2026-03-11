import { Schema, model, Types } from "mongoose";
import { PermissionEnum, PermissionGroup } from "./permission.enum";

const permissionSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    key: {
      type: [String],
      enum: Object.values(PermissionEnum),
      required: true,
      default: [],
    },
    note: {
      type: String,
      trim: true,
      default: "Permission updated by admin",
    },
    group: {
      type: String,
      enum: Object.values(PermissionGroup),
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "Admin",
    },
    audit_logs: [
      {
        action: {
          type: String,
          enum: ["created", "updated", "deleted"],
        },
        changedBy: {
          type: Types.ObjectId,
          ref: "Admin",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        changes: {
          type: String,
        },
      },
    ],  
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const PermissionModel = model("Permission", permissionSchema);
