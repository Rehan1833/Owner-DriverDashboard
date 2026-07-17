import { Request, Response } from 'express';
import Trip from '../models/Trip';
import { emitTelemetryUpdate } from '../sockets/telemetrySocket';

export const getTrips = async (req: Request, res: Response) => {
  try {
    const trips = await Trip.find();
    res.json(trips);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    res.status(201).json(trip);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Broadcast real-time telemetry update over WebSocket connections
    emitTelemetryUpdate({ tripId: req.params.id, update: req.body });
    
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
