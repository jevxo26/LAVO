"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = void 0;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // If the user's role is not in the array of allowed roles
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to perform this action.'
            });
            return;
        }
        // User is authorized
        next();
    };
};
exports.restrictTo = restrictTo;
