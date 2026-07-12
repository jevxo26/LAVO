"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Protect all user routes - must be logged in
router.use(authMiddleware_1.verifyToken);
// Only admins can manage users directly
router.use((0, roleMiddleware_1.restrictTo)('ADMIN', 'SUPER_ADMIN'));
router
    .route('/')
    .get(userController_1.UserController.getAllUsers)
    .post(userController_1.UserController.createUser);
router
    .route('/:id')
    .get(userController_1.UserController.getUserById)
    .patch(userController_1.UserController.updateUser)
    .delete(userController_1.UserController.deleteUser);
exports.default = router;
