"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminPermissionController_1 = require("../controllers/adminPermissionController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
// Strictly SUPER_ADMIN only
router.use(auth_middleware_1.requireAuth);
router.use(rbac_middleware_1.requireSuperAdmin);
router.get("/", adminPermissionController_1.AdminPermissionController.getAllAdminPermissions);
router.get("/:adminId", adminPermissionController_1.AdminPermissionController.getAdminPermissionById);
router.put("/:adminId", adminPermissionController_1.AdminPermissionController.updateAdminPermissions);
exports.default = router;
