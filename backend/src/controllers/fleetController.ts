import { Response } from 'express';
import Vehicle from '../models/Vehicle';
import { AuthRequest } from '../middleware/authMiddleware';

export const getVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = new Vehicle({
      ...req.body,
      companyId: req.companyId,
      ownerId: req.userId,
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = { _id: req.params.id };
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    const updated = await Vehicle.findOneAndUpdate(filter, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = { _id: req.params.id };
    if (req.companyId) {
      filter.companyId = req.companyId;
    }
    const deleted = await Vehicle.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ message: 'Vehicle not found.' });
    }
    res.json({ message: 'Vehicle deleted.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
