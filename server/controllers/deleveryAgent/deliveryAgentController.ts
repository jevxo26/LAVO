import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthRequest } from "../../middlewares/authMiddleware";
// import deliveryAgentService from "../services/deliveryAgentService";
import * as overviewService from '../../services/deleveryAgent/overviewService'
import * as availablePickupsService from '../../services/deleveryAgent/availablePickupsService'

export const getOverview = catchAsync(
  async (req: AuthRequest, res: Response) => {
    console.log("req.user =", req.user);
    // const agentId = req.user?.id;
    const userId = req.user?.userId;
    console.log("userID =", userId);

    const result = await overviewService.getOverview(userId!);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Overview fetched successfully",
      data: result,
    });
  }
);

export const getAvailablePickups = catchAsync(
  async (req: AuthRequest, res: Response) => {

    const userId = req.user?.userId;

    const result = await availablePickupsService.getAvailablePickups(
      userId!
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Available pickups fetched successfully",
      data: result,
    });

  }
);

export const acceptPickup = catchAsync(
 async(req: AuthRequest,res:Response)=>{

   const userId = req.user?.userId;
   const {deliveryId}=req.params;

   console.log("Delivery ID:", deliveryId);
   console.log("User ID:", userId);

   if(!deliveryId || Array.isArray(deliveryId)){
      throw new Error("Invalid delivery id");
   }

   const result =
     await availablePickupsService.acceptPickup(
       userId!,
       deliveryId
     );

   sendResponse(res,{
     statusCode:200,
     success:true,
     message:"Pickup accepted successfully",
     data:result
   });
 }
);