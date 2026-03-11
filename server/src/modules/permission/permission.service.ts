import { AdminModel } from "../admin/admin.model";
import { PermissionModel } from "./permission.mode";
import { PermissionEnum } from "./permission.enum";
import ApiError from "@/middlewares/error";
import { HttpStatusCode } from "@/lib/httpStatus";
import mongoose, { ClientSession, Types } from "mongoose";
import { IRoles, ROLES } from "@/constants/roles";

class Service {
  /**
   * hierarchy validation: Creator can only modify permissions of users with lower roles (unless it's self-editing)
   * Admin > Manager > Agent > Customer
   */
  private validateHierarchy(
    creatorRole: string,
    targetRole: string,
    isSelf: boolean
  ): void {
    const roleWeight: Record<string, number> = {
      [ROLES.ADMIN]: 3,
      [ROLES.MANAGER]: 2,
      [ROLES.AGENT]: 1,
      [ROLES.CUSTOMER]: 0,
    };

    const creatorWeight = roleWeight[creatorRole as IRoles] || 0;
    const targetWeight = roleWeight[targetRole as IRoles] || 0;

    if (!isSelf && creatorRole !== ROLES.ADMIN) {
      if (creatorWeight <= targetWeight) {
        throw new ApiError(
          HttpStatusCode.FORBIDDEN,
          "Hierarchy Violation: You cannot modify permissions of a higher or equal role user."
        );
      }
    }
  }

  /**
   * Grant Ceiling Validation: Creator can only grant permissions they possess
   */
  // private validateGrantCeiling(
  //   creatorRole: string,
  //   creatorKeys: string[],
  //   requestedKeys: string[]
  // ): void {

  //   if (creatorRole !== ROLES.ADMIN) {
  //     const invalidKeys = requestedKeys.filter((p) => !creatorKeys.includes(p));
  //     if (invalidKeys.length > 0) {
  //       throw new ApiError(
  //         HttpStatusCode.FORBIDDEN,
  //         `Grant Ceiling Violation: You cannot grant permissions you don't possess: ${invalidKeys.join(", ")}`
  //       );
  //     }
  //   }
  // }

  private validateGrantCeiling(
    creatorRole: string,
    creatorKeys: string[],
    requestedKeys: string[],
    isSelfRegistration: boolean 
  ): void {
    
    if (creatorRole === ROLES.ADMIN) return;

    
    if (isSelfRegistration) return;

    
    const invalidKeys = requestedKeys.filter((p) => !creatorKeys.includes(p));

    if (invalidKeys.length > 0) {
      throw new ApiError(
        HttpStatusCode.FORBIDDEN,
        `Grant Ceiling Violation: You cannot grant permissions you don't possess: ${invalidKeys.join(", ")}`
      );
    }
  }

  async CreateAndUpdatePermissions(
    userId: string,
    requestedPermissions: PermissionEnum[],
    creatorId: string,
    note?: string,
    existingSession?: ClientSession
  ) {
    const session = existingSession || (await mongoose.startSession());

    if (!existingSession) {
      session.startTransaction();
    }

    try {
      const creator = await AdminModel.findById(creatorId)
        .populate("permissions")
        .session(session);
      const targetUser = await AdminModel.findById(userId).session(session);

      if (!targetUser || !creator) {
        throw new ApiError(
          HttpStatusCode.NOT_FOUND,
          "Target user or creator not found"
        );
      }

      this.validateHierarchy(
        creator.role,
        targetUser.role,
        creatorId === userId
      );

      const creatorPermDoc = creator.permissions as any;
      const creatorKeys: string[] = creatorPermDoc?.key || [];

        const isSelfRegistration = creatorId === userId && creatorKeys.length === 0;
      this.validateGrantCeiling(
        creator.role,
        creatorKeys,
        requestedPermissions,
        isSelfRegistration
      );

      let permissionDoc = await PermissionModel.findOne({
        user: userId,
      }).session(session);

      const actionType = permissionDoc ? "updated" : "created";

      if (!permissionDoc) {
        permissionDoc = new PermissionModel({
          user: new Types.ObjectId(userId),
          key: requestedPermissions,
          note: note || "Initial permissions assigned",
          createdBy: new Types.ObjectId(creatorId),
          audit_logs: [
            {
              action: "created",
              changedBy: new Types.ObjectId(creatorId),
              changes: `Initial permissions: ${requestedPermissions.join(", ")}`,
              added: requestedPermissions,
              removed: [],
            },
          ],
        });

        await permissionDoc.save({ session });

        targetUser.permissions = permissionDoc._id as any;
        await targetUser.save({ session });
      } else {
        const oldKeysArray = [...permissionDoc.key];

        const addedPermissions = requestedPermissions.filter(
          (p) => !oldKeysArray.includes(p as any)
        );

        const removedPermissions = oldKeysArray.filter(
          (p) => !requestedPermissions.includes(p as any)
        );

        permissionDoc.key = requestedPermissions;
        if (note) permissionDoc.note = note;
        permissionDoc.createdBy = new Types.ObjectId(creatorId) as any;

        permissionDoc.audit_logs.push({
          action: "updated",
          changedBy: new Types.ObjectId(creatorId),
          timestamp: new Date(),
          changes: `Changed from [${oldKeysArray.join(", ")}] to [${requestedPermissions.join(", ")}]`,
          added: addedPermissions,
          removed: removedPermissions,
        });

        await permissionDoc.save({ session });
      }

      if (!existingSession) {
        await session.commitTransaction();
      }

      return {
        success: true,
        message: `Permissions ${actionType} successfully`,
        data: permissionDoc,
      };
    } catch (error: any) {
      if (!existingSession) {
        await session.abortTransaction();
      }
      console.error("Permission Service Error:", error);
      throw new ApiError(
        error.statusCode || HttpStatusCode.INTERNAL_SERVER_ERROR,
        error.message || "Failed to process permission request"
      );
    } finally {
      if (!existingSession) {
        session.endSession();
      }
    }
  }
}

export const PermissionService = new Service();
