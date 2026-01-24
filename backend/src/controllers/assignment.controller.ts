import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createAssignmentSchema, returnAssignmentSchema, returnAssetSchema, updateAssignmentSchema } from '../utils/zodSchemas';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignmentById,
  returnAssignment,
  returnAssetById,
  getAssignmentHistory,
} from '../services/assignment.service';

export const createAssignmentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const validatedData = createAssignmentSchema.parse(req.body);
    
    // Map accessories from frontend format to backend format
    // Frontend sends: ['Charger', 'Mouse'] -> Backend stores: ['Charger', 'Mouse'] in issuedAccessories
    const accessoriesArray = validatedData.accessories || validatedData.accessoriesIssued?.map(item => {
      const map: Record<string, string> = {
        'CHARGER': 'Charger',
        'MOUSE': 'Mouse',
        'HEADPHONES': 'Headphones',
        'MONITOR': 'Monitor',
      };
      return map[item] || item;
    }) || [];
    
    const assignment = await createAssignment({
      asset: new mongoose.Types.ObjectId(validatedData.assetId),
      employee: new mongoose.Types.ObjectId(validatedData.employeeId),
      assignedDate: new Date(validatedData.assignedDate),
      assignedAt: new Date(),
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      assignedBy: new mongoose.Types.ObjectId(req.user.userId),
      notes: validatedData.notes,
      accessories: accessoriesArray,
      issuedAccessories: accessoriesArray,
    });

    res.status(201).json({ message: 'Asset assigned successfully', assignment });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create assignment' });
  }
};

export const getAssignmentsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, assetId, status } = req.query;
    const filters: any = {};
    if (employeeId) filters.employeeId = employeeId as string;
    if (assetId) filters.assetId = assetId as string;
    if (status) filters.status = status as string;

    const assignments = await getAssignments(filters);
    res.status(200).json({ assignments });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch assignments' });
  }
};

export const getAssignmentByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) {
      res.status(404).json({ message: 'Assignment not found' });
      return;
    }
    res.status(200).json({ assignment });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch assignment' });
  }
};

export const returnAssignmentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validatedData = returnAssignmentSchema.parse(req.body);
    const assignment = await returnAssignment(
      validatedData.assignmentId,
      new Date(validatedData.returnDate),
      validatedData.notes
    );

    res.status(200).json({ message: 'Asset returned successfully', assignment });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to return asset' });
  }
};

export const returnAssetByIdController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignmentId = req.params.id;
    
    if (!assignmentId) {
      res.status(400).json({ message: 'Assignment ID is required' });
      return;
    }

    // Validate that ID is a valid MongoDB ObjectId format (24 hex characters)
    if (!assignmentId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ message: 'Invalid assignment ID format' });
      return;
    }

    // Validate request body (condition and optional remarks)
    const validatedData = returnAssetSchema.parse(req.body);
    
    // Return the asset
    const assignment = await returnAssetById(
      assignmentId,
      validatedData.condition,
      validatedData.remarks,
      validatedData.returnedAccessories
    );

    res.status(200).json({ 
      message: 'Asset returned successfully', 
      assignment 
    });
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        }))
      });
      return;
    }

    // Handle specific error cases
    if (error.message === 'Assignment not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    
    if (error.message === 'Assignment is already returned') {
      res.status(400).json({ message: error.message });
      return;
    }

    if (error.message === 'Asset not found') {
      res.status(404).json({ message: error.message });
      return;
    }

    // Generic error handling
    res.status(400).json({ message: error.message || 'Failed to return asset' });
  }
};

export const updateAssignmentController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignmentId = req.params.id;
    if (!assignmentId) {
      res.status(400).json({ message: 'Assignment ID is required' });
      return;
    }

    const forbiddenKeys = [
      'assetId',
      'employeeId',
      'assignedAt',
      'assignedDate',
      'returnedAt',
      'returnDate',
      'status',
      'assignedBy',
      'asset',
      'employee',
    ];
    const hasForbidden = forbiddenKeys.some((key) => Object.prototype.hasOwnProperty.call(req.body, key));
    if (hasForbidden) {
      res.status(400).json({ message: 'Only dueDate, notes, accessories, and condition can be updated' });
      return;
    }

    const validatedData = updateAssignmentSchema.parse(req.body);
    
    // Map accessories if provided (support both formats)
    const accessoriesArray = validatedData.accessories || validatedData.accessoriesIssued?.map(item => {
      const map: Record<string, string> = {
        'CHARGER': 'Charger',
        'MOUSE': 'Mouse',
        'HEADPHONES': 'Headphones',
        'MONITOR': 'Monitor',
      };
      return map[item] || item;
    });
    
    const assignment = await updateAssignmentById(assignmentId, {
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      notes: validatedData.notes,
      accessories: accessoriesArray,
      condition: validatedData.condition,
      returnedAccessories: validatedData.returnedAccessories,
    });

    res.status(200).json({ message: 'Assignment updated successfully', assignment });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({
        message: 'Validation error',
        errors: error.errors.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    if (error.message === 'Assignment not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    if (error.message === 'Assignment is not active' || error.message === 'Can only update returned accessories for returned assignments') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Failed to update assignment' });
  }
};

export const getAssignmentHistoryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assetId, employeeId } = req.query;
    const history = await getAssignmentHistory(
      assetId as string | undefined,
      employeeId as string | undefined
    );
    res.status(200).json({ history });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch assignment history' });
  }
};

