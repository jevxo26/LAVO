"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// Protect all user routes - must be logged in
// TEMPORARY BYPASS FOR UI TESTING
// router.use(verifyToken);
// Only admins can manage users directly
// router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));
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
