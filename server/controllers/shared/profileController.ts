import { Response }    from "express";
import { catchAsync }  from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProfileService } from "../../services/shared/profileService";

export class ProfileController {

  /** GET /api/profile — fetch current user profile */
  static getProfile = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) { sendResponse(res, { statusCode: 401, message: "Unauthorized" }); return; }
    const data = await ProfileService.getProfile(userId);
    sendResponse(res, { statusCode: 200, success: true, data });
  });

  /** PUT /api/profile — update fullName, alternatePhone, nidNumber, profileImage */
  static updateProfile = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) { sendResponse(res, { statusCode: 401, message: "Unauthorized" }); return; }
    const data = await ProfileService.updateProfile(userId, req.body);
    sendResponse(res, { statusCode: 200, success: true, message: "Profile updated successfully", data });
  });

  /** POST /api/profile/password — change password */
  static changePassword = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) { sendResponse(res, { statusCode: 401, message: "Unauthorized" }); return; }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      sendResponse(res, { statusCode: 400, message: "currentPassword and newPassword are required" }); return;
    }
    await ProfileService.changePassword(userId, currentPassword, newPassword);
    sendResponse(res, { statusCode: 200, success: true, message: "Password changed successfully" });
  });

  /** GET /api/profile/preferences — fetch notification preferences */
  static getPreferences = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) { sendResponse(res, { statusCode: 401, message: "Unauthorized" }); return; }
    const data = await ProfileService.getPreferences(userId);
    sendResponse(res, { statusCode: 200, success: true, data });
  });

  /** POST /api/profile/preferences — save notification preferences */
  static savePreferences = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) { sendResponse(res, { statusCode: 401, message: "Unauthorized" }); return; }
    const data = await ProfileService.savePreferences(userId, req.body);
    sendResponse(res, { statusCode: 200, success: true, message: "Preferences saved successfully", data });
  });
}
