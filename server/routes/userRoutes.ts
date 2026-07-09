import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = Router();

// Protect all user routes - must be logged in
// TEMPORARY BYPASS FOR UI TESTING
// router.use(verifyToken);

// Only admins can manage users directly
// router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

router
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.createUser);

router
  .route('/:id')
  .get(UserController.getUserById)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

export default router;
