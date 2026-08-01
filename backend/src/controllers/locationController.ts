import { Request, Response } from 'express';
import Location from '../models/Location';
import User from '../models/User';
import { emitTelemetryUpdate } from '../sockets/telemetrySocket';

/**
 * Record a new live GPS location update for a driver
 * POST /api/driver/location
 */
export const recordLocation = async (req: Request, res: Response) => {
  try {
    const { driverId, tripId, latitude, longitude, accuracy, speed, heading, address, timestamp } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude coordinates are required.'
      });
    }

    const latNum = Number(latitude);
    const lngNum = Number(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      return res.status(400).json({ success: false, message: 'Invalid latitude value. Must be between -90 and 90.' });
    }

    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({ success: false, message: 'Invalid longitude value. Must be between -180 and 180.' });
    }

    // Determine target driver ID from auth payload or body
    const effectiveDriverId = driverId || (req as any).user?.driverId || (req as any).user?.id || 'DRV-9041';

    const locationRecord = new Location({
      driverId: effectiveDriverId,
      tripId: tripId || null,
      latitude: latNum,
      longitude: lngNum,
      accuracy: Number(accuracy) || 0,
      speed: Number(speed) || 0,
      heading: Number(heading) || 0,
      address: address || '',
      createdAt: timestamp ? new Date(timestamp) : new Date()
    });

    await locationRecord.save();

    // Optionally update user's last known location
    try {
      await User.updateOne(
        { $or: [{ driverId: effectiveDriverId }, { _id: effectiveDriverId }] },
        {
          $set: {
            currentLocation: address || `${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`,
            lastGpsUpdate: new Date()
          }
        }
      );
    } catch (uErr) {
      // Ignore user update failure
    }

    // Broadcast real-time location event via Socket.io
    emitTelemetryUpdate({
      action: 'driver-location-update',
      driverId: effectiveDriverId,
      tripId,
      latitude: latNum,
      longitude: lngNum,
      speed: Number(speed) || 0,
      heading: Number(heading) || 0,
      accuracy: Number(accuracy) || 0,
      address,
      timestamp: locationRecord.createdAt
    });

    res.status(201).json({
      success: true,
      message: 'Location recorded successfully.',
      data: locationRecord
    });
  } catch (err: any) {
    console.error('Error recording location:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get latest location for a driver
 * GET /api/driver/location/:driverId
 */
export const getDriverLatestLocation = async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const latest = await Location.findOne({ driverId }).sort({ createdAt: -1 });
    if (!latest) {
      return res.status(404).json({ success: false, message: 'No location history found for driver.' });
    }
    res.json({ success: true, data: latest });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get location history for a specific trip
 * GET /api/driver/location/trip/:tripId
 */
export const getTripLocationHistory = async (req: Request, res: Response) => {
  try {
    const { tripId } = req.params;
    const history = await Location.find({ tripId }).sort({ createdAt: 1 }).limit(500);
    res.json({ success: true, count: history.length, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
