import { Response } from 'express';
import Inventory from '../models/Inventory';
import { AuthRequest } from '../middleware/authMiddleware';

export const getInventory = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    const items = await Inventory.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createInventory = async (req: AuthRequest, res: Response) => {
  try {
    const newItem = new Inventory({
      ...req.body,
      companyId: req.companyId,
      ownerId: req.userId,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateInventory = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = { _id: req.params.id };
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    const updated = await Inventory.findOneAndUpdate(filter, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInventory = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = { _id: req.params.id };
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    const deleted = await Inventory.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }
    res.json({ message: 'Item deleted.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
