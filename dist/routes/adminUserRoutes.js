"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminUserController_1 = require("../controllers/adminUserController");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const rbac_middleware_1 = require("../middlewares/rbac.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// GET: Allowed for both SUPER_ADMIN and ADMIN (View-only for normal admins)
router.get("/", (0, rbac_middleware_1.restrictTo)("SUPER_ADMIN", "ADMIN"), adminUserController_1.AdminUserController.getUsers);
// Write actions: Strictly SUPER_ADMIN only
router.post("/", rbac_middleware_1.requireSuperAdmin, adminUserController_1.AdminUserController.createUser);
router.put("/:id", rbac_middleware_1.requireSuperAdmin, adminUserController_1.AdminUserController.updateUser);
router.patch("/:id/ban", rbac_middleware_1.requireSuperAdmin, adminUserController_1.AdminUserController.banUser);
router.delete("/:id", rbac_middleware_1.requireSuperAdmin, adminUserController_1.AdminUserController.deleteUser);
exports.default = router;
