import BaseController from "@/shared/baseController";
import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "@/lib/httpStatus";
import { PermissionService } from "./permission.service";
import ApiError from "@/middlewares/error";
import { AdminModel } from "../admin/admin.model";

// class Controller extends BaseController {
//   createAndUpdatePermissions = this.catchAsync(
//     async (req: Request, res: Response) => {
//       const userId = req.body.id as string;

//       if (!userId) {
//         this.sendResponse(res, {
//           statusCode: HttpStatusCode.BAD_REQUEST,
//           success: false,
//           message: "User ID is required",
//         });
//         return;
//       }

//       const { permissions, note } = req.body;
//       const data = await PermissionService.CreateAndUpdatePermissions(
//         userId,
//         permissions,
//         note
//       );
//       this.sendResponse(res, {
//         statusCode: HttpStatusCode.OK,
//         success: true,
//         message: "Permissions updated successfully",
//         data,
//       });
//     }
//   );

//   private hasPermissions = (requiredPermission: string) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//       try {
//         const adminId = req.user?.id;

//         if (!adminId) {
//           return next(
//             new ApiError(
//               HttpStatusCode.UNAUTHORIZED,
//               "Unauthorized: No user found"
//             )
//           );
//         }

//         const admin = await AdminModel.findById(adminId)
//           .select("_id status")
//           .populate({ path: "permissions", select: "key isActive" })
//           .lean();

//         if (!admin || (admin as any).status !== "Active") {
//           return next(
//             new ApiError(
//               HttpStatusCode.FORBIDDEN,
//               "Account is suspended or not found"
//             )
//           );
//         }

//         const permissionDoc = admin.permissions as any;
//         const keys: string[] =
//           permissionDoc?.isActive && permissionDoc?.key
//             ? permissionDoc.key
//             : [];

//         if (!keys.includes(requiredPermission)) {
//           return next(
//             new ApiError(
//               HttpStatusCode.FORBIDDEN,
//               `Forbidden: You don't have '${requiredPermission}' permission`
//             )
//           );
//         }

//         next();
//       } catch (err) {
//         console.error("Permission Middleware Error:", err);
//         return next(
//           new ApiError(
//             HttpStatusCode.INTERNAL_SERVER_ERROR,
//             "Internal server error"
//           )
//         );
//       }
//     };
//   };
// }

class Controller extends BaseController {
  
  private hasPermissions = (requiredPermission: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const requesterId = req.user?.id; 
        const targetUserId = req.body.id || req.params.id;

        if (!requesterId) {
          return next(
            new ApiError(
              HttpStatusCode.UNAUTHORIZED,
              "Unauthorized: No user found"
            )
          );
        }

        
        const requester = await AdminModel.findById(requesterId)
          .select("_id status role")
          .populate({ path: "permissions", select: "key isActive" })
          .lean();

        if (!requester || (requester as any).status !== "Active") {
          return next(
            new ApiError(
              HttpStatusCode.FORBIDDEN,
              "Your account is suspended or not found"
            )
          );
        }

        
        const permissionDoc = requester.permissions as any;
        const keys: string[] =
          permissionDoc?.isActive && permissionDoc?.key
            ? permissionDoc.key
            : [];

        if (!keys.includes(requiredPermission)) {
          return next(
            new ApiError(
              HttpStatusCode.FORBIDDEN,
              `Access Denied: Missing '${requiredPermission}' permission`
            )
          );
        }

        // ৩. হায়ারআর্কি চেক (Hierarchy Enforcement) ---------------------------
        if (targetUserId) {
          const targetUser = await AdminModel.findById(targetUserId)
            .select("role")
            .lean();

          if (targetUser) {
            const roleWeight: Record<string, number> = {
              Admin: 3,
              Manager: 2,
              Agent: 1,
              Customer: 0,
            };

            const requesterWeight = roleWeight[(requester as any).role] || 0;
            const targetWeight = roleWeight[(targetUser as any).role] || 0;

            // নিয়ম: নিজের সমান বা উপরের রোলের কারো পারমিশন/ডাটা মডিফাই করা যাবে না (যদি সে নিজে এডমিন না হয়)
            // ডিজিটাল পাইলট স্পেক: Admin > Manager > Agent
            if (requesterId !== targetUserId.toString()) {
              // নিজের ক্ষেত্রে ছাড়
              if (
                requesterWeight <= targetWeight &&
                (requester as any).role !== "Admin"
              ) {
                return next(
                  new ApiError(
                    HttpStatusCode.FORBIDDEN,
                    "Hierarchy Violation: You cannot perform this action on a user with a higher or equal role."
                  )
                );
              }
            }
          }
        }
        // ---------------------------------------------------------------------

        next();
      } catch (err) {
        console.error("Permission Middleware Error:", err);
        return next(
          new ApiError(
            HttpStatusCode.INTERNAL_SERVER_ERROR,
            "Internal server error"
          )
        );
      }
    };
  };

  createAndUpdatePermissions = this.catchAsync(
    async (req: Request, res: Response) => {
      const userId = req.body.id as string;
      const creatorId = req.user?.id; // এডমিন/ম্যানেজারের আইডি

      const { permissions, note } = req.body;

      // সার্ভিসে এখন creatorId পাঠিয়ে দাও Grant Ceiling চেকের জন্য
      const data = await PermissionService.CreateAndUpdatePermissions(
        userId,
        permissions,
        creatorId as string,
        note
      );

      this.sendResponse(res, {
        statusCode: HttpStatusCode.OK,
        success: true,
        message: "Permissions updated successfully",
        data,
      });
    }
  );
}

export const PermissionController = new Controller();
