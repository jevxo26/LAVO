import { Request, Response } from "express";
import {
    createPartnerApplication,
    getAllPartnerApplications,
    updatePartnerApplication,
} from "../services/partnerApplicationService";
import { AuthRequest } from "../middlewares/auth.middleware";

// Create Partner Application
export const createPartnerApplicationController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.userId;

        const application = await createPartnerApplication(
            userId,
            req.body
        );

        return res.status(201).json({
            success: true,
            message: "Partner application submitted successfully",
            data: application,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit partner application",
        });
    }
};

// Get All Applications
export const getAllPartnerApplicationsController = async (
    req: Request,
    res: Response
) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || "");


        const result = await getAllPartnerApplications(
            page,
            limit,
            search
        );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch applications",
        });
    }
};

export const updatePartnerApplicationController = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const id = String(req.params.id);

        const application = await updatePartnerApplication(
            id,
            req.body,
            req.user?.userId
        );

        return res.status(200).json({
            success: true,
            message: "Partner application updated successfully",
            data: application,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to update partner application",
        });
    }
};