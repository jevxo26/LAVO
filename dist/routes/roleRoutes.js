"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleController_1 = require("../controllers/roleController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Protect all RBAC management routes
router.use(authMiddleware_1.verifyToken);
router.use((0, roleMiddleware_1.restrictTo)("SUPER_ADMIN", "ADMIN"));
router
    .route("/")
    .get(roleController_1.RoleController.getAllRoles)
    .post(roleController_1.RoleController.createRole);
router.get("/permissions", roleController_1.RoleController.getAllPermissions);
router.put("/:id/permissions", roleController_1.RoleController.updateRolePermissions);
router.post("/user/:id/assign", roleController_1.RoleController.assignUserRole);
exports.default = router;
