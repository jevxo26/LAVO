import express from 'express';
import * as branchController from '../controllers/branchController';
import { verifyToken } from '../middlewares/authMiddleware';
import { restrictTo } from '../middlewares/roleMiddleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Standard CRUD API for branches
router.route('/')
  .get(restrictTo('SUPER_ADMIN', 'BRANCH_MANAGER'), branchController.getAllBranches)
  .post(restrictTo('SUPER_ADMIN'), branchController.createBranch);

router.route('/:id')
  .get(restrictTo('SUPER_ADMIN', 'BRANCH_MANAGER'), branchController.getBranchById)
  .patch(restrictTo('SUPER_ADMIN'), branchController.updateBranch)
  .delete(restrictTo('SUPER_ADMIN'), branchController.deleteBranch);

export default router;
