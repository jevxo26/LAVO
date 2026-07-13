import express from 'express';
import * as branchController from '../controllers/branchController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(restrictTo('ADMIN', 'SUPER_ADMIN'));

// Standard CRUD API for branches
router.route('/')
  .get(branchController.getAllBranches)
  .post(branchController.createBranch);

router.route('/:id')
  .get(branchController.getBranchById)
  .patch(branchController.updateBranch)
  .delete(branchController.deleteBranch);

export default router;
