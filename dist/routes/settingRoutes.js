"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settingController_1 = require("../controllers/settingController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Protect all settings routes - must be logged in
router.use(authMiddleware_1.verifyToken);
// All settings access is restricted to Admin levels
// We restrict creation/deletion exclusively to SUPER_ADMIN to prevent tampering
router
    .route('/')
    .get((0, roleMiddleware_1.restrictTo)('ADMIN', 'SUPER_ADMIN'), settingController_1.SettingController.getAllSettings)
    .post((0, roleMiddleware_1.restrictTo)('SUPER_ADMIN'), settingController_1.SettingController.createSetting);
router
    .route('/:key')
    .get((0, roleMiddleware_1.restrictTo)('ADMIN', 'SUPER_ADMIN'), settingController_1.SettingController.getSettingByKey)
    .patch((0, roleMiddleware_1.restrictTo)('SUPER_ADMIN'), settingController_1.SettingController.updateSetting)
    .delete((0, roleMiddleware_1.restrictTo)('SUPER_ADMIN'), settingController_1.SettingController.deleteSetting);
exports.default = router;
