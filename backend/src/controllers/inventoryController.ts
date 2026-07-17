import { Request, Response } from 'express';
import Inventory from '../models/Inventory';

export const getInventory = async (req: Request, res: Response) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createInventory = async (req: Request, res: Response) => {
  try {
    const newItem = new Inventory(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateInventory = async (req: Request, res: Response) => {
  try {
    const updated = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteInventory = async (req: Request, res: Response) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
