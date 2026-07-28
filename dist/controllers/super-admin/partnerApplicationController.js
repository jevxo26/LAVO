"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePartnerApplicationController = exports.getAllPartnerApplicationsController = exports.createPartnerApplicationController = void 0;
const partnerApplicationService_1 = require("../../services/super-admin/partnerApplicationService");
// Create Partner Application
const createPartnerApplicationController = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const application = await (0, partnerApplicationService_1.createPartnerApplication)(userId, req.body);
        return res.status(201).json({
            success: true,
            message: "Partner application submitted successfully",
            data: application,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to submit partner application",
        });
    }
};
exports.createPartnerApplicationController = createPartnerApplicationController;
// Get All Applications
const getAllPartnerApplicationsController = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = String(req.query.search || "");
        const result = await (0, partnerApplicationService_1.getAllPartnerApplications)(page, limit, search);
        return res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch applications",
        });
    }
};
exports.getAllPartnerApplicationsController = getAllPartnerApplicationsController;
const updatePartnerApplicationController = async (req, res) => {
    var _a;
    try {
        const id = String(req.params.id);
        const application = await (0, partnerApplicationService_1.updatePartnerApplication)(id, req.body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        return res.status(200).json({
            success: true,
            message: "Partner application updated successfully",
            data: application,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update partner application",
        });
    }
};
exports.updatePartnerApplicationController = updatePartnerApplicationController;
