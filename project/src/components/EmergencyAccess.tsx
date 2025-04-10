import React, { useState, useEffect } from 'react';
import { Phone, Camera, AlertTriangle } from 'lucide-react';
import { connectDB, collections } from '../config/mongodb';
import { messaging } from '../config/firebase';
import { getToken } from 'firebase/messaging';

const EmergencyAccess = () => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    const initializeEmergencyAccess = async () => {
      try {
        const token = await getToken(messaging);
        setDeviceToken(token);

        const db = await connectDB();
        const emergencyStatus = await db.collection(collections.devices)
          .findOne({ userId: 'current-user-id' });

        if (emergencyStatus) {
          setEmergencyMode(emergencyStatus.emergencyMode || false);
        }
      } catch (error) {
        console.error('Error initializing emergency access:', error);
      }
    };

    initializeEmergencyAccess();
  }, []);

  const toggleEmergencyMode = async () => {
    try {
      const newMode = !emergencyMode;
      setEmergencyMode(newMode);

      const db = await connectDB();
      await db.collection(collections.devices).updateOne(
        { userId: 'current-user-id' },
        { 
          $set: { 
            emergencyMode: newMode,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      // Send FCM message to device
      await fetch('/api/emergency-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: deviceToken,
          mode: newMode ? 'enable' : 'disable'
        })
      });
    } catch (error) {
      console.error('Error toggling emergency mode:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
        <h2 className="text-xl font-semibold">Emergency Access</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Emergency Mode</span>
          <button
            onClick={toggleEmergencyMode}
            className={`px-4 py-2 rounded-md ${
              emergencyMode ? 'bg-red-500' : 'bg-gray-200'
            } text-white transition-colors duration-200`}
          >
            {emergencyMode ? 'Active' : 'Inactive'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Phone className="h-5 w-5 text-gray-600" />
            <span>Emergency Calls Only</span>
          </div>
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-gray-600" />
            <span>Limited Camera Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAccess;