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

export const getActiveTrip = async (req: Request, res: Response) => {
  try {
    const activeTrip = await Trip.findOne({ status: { $nin: ['Completed', 'Cancelled'] } }).sort({ updatedAt: -1 });
    if (!activeTrip) {
      return res.status(404).json({ message: 'No active trip assignment found.' });
    }
    res.json(activeTrip);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTripById = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    res.json(trip);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const startTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.body.id ? req.body : req.params;
    const tripId = id || req.params.id;
    const updated = await Trip.findByIdAndUpdate(
      tripId,
      { status: 'In Transit' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    emitTelemetryUpdate({ tripId: updated._id.toString(), update: { status: 'In Transit' } });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id, latitude, longitude, distanceRemaining, eta } = req.body;
    const tripId = id || req.params.id;
    const updated = await Trip.findByIdAndUpdate(
      tripId,
      { 
        ...(latitude && longitude ? { currentLocation: `${latitude}, ${longitude}` } : {}),
        ...(distanceRemaining !== undefined ? { distanceRemaining } : {}),
        ...(eta ? { eta } : {})
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    emitTelemetryUpdate({ tripId: updated._id.toString(), update: req.body });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const completeTrip = async (req: Request, res: Response) => {
  try {
    const { id, signatureData, photo } = req.body;
    const tripId = id || req.params.id;
    const updated = await Trip.findByIdAndUpdate(
      tripId,
      { 
        status: 'Completed',
        ...(signatureData ? { signatureData } : {}),
        ...(photo ? { photo } : {})
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Trip not found.' });
    }
    emitTelemetryUpdate({ tripId: updated._id.toString(), update: { status: 'Completed' } });
    res.json(updated);
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

