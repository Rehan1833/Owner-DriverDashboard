import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createVehicle = async (req: Request, res: Response) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
