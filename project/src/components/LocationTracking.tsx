import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { connectDB, collections } from '../config/mongodb';

const LocationTracking = () => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safeZones, setSafeZones] = useState<Array<{ name: string; radius: number; center: { lat: number; lng: number } }>>([]);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const db = await connectDB();
        const locationData = await db.collection(collections.locations)
          .findOne({ userId: 'current-user-id' });

        if (locationData) {
          setCurrentLocation(locationData.currentLocation);
          setSafeZones(locationData.safeZones || []);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };

    fetchLocationData();
    const interval = setInterval(fetchLocationData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const addSafeZone = async () => {
    if (!currentLocation) return;

    try {
      const newZone = {
        name: `Safe Zone ${safeZones.length + 1}`,
        radius: 500, // 500 meters
        center: currentLocation
      };

      const db = await connectDB();
      await db.collection(collections.locations).updateOne(
        { userId: 'current-user-id' },
        { 
          $push: { safeZones: newZone },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      setSafeZones([...safeZones, newZone]);
    } catch (error) {
      console.error('Error adding safe zone:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <MapPin className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Location Tracking</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-gray-700 mb-2">Current Location</h3>
          <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
            {currentLocation ? (
              <div className="text-sm text-gray-600">
                <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                <p>Lng: {currentLocation.lng.toFixed(6)}</p>
              </div>
            ) : (
              <Navigation className="h-24 w-24 text-gray-400" />
            )}
          </div>
        </div>

        <div>
          <h3 className="text-gray-700 mb-2">Geofencing</h3>
          <button 
            onClick={addSafeZone}
            className="w-full bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 transition-colors duration-200"
          >
            Set Safe Zone
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationTracking;