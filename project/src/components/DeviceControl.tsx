import React, { useState, useEffect } from 'react';
import { Power, Lock, Smartphone, Apple as Apps } from 'lucide-react';
import { messaging } from '../config/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { connectDB, collections } from '../config/mongodb';

const DeviceControl = () => {
  const [isDeviceOn, setIsDeviceOn] = useState(true);
  const [restrictedApps, setRestrictedApps] = useState(['TikTok', 'Instagram']);
  const [deviceToken, setDeviceToken] = useState('');

  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        const token = await getToken(messaging);
        setDeviceToken(token);
        
        const db = await connectDB();
        await db.collection(collections.devices).updateOne(
          { userId: 'current-user-id' },
          { $set: { fcmToken: token } },
          { upsert: true }
        );
      } catch (error) {
        console.error('Error initializing messaging:', error);
      }
    };

    initializeMessaging();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Received message:', payload);
      if (payload.data?.deviceStatus) {
        setIsDeviceOn(payload.data.deviceStatus === 'on');
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleDevice = async () => {
    try {
      const newStatus = !isDeviceOn;
      setIsDeviceOn(newStatus);
      
      const db = await connectDB();
      await db.collection(collections.devices).updateOne(
        { userId: 'current-user-id' },
        { $set: { status: newStatus ? 'on' : 'off' } }
      );

      // Send FCM message to device
      await fetch('/api/send-device-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: deviceToken,
          command: newStatus ? 'enable' : 'disable'
        })
      });
    } catch (error) {
      console.error('Error toggling device:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Smartphone className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Device Control</h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Device Status</span>
          <button
            onClick={toggleDevice}
            className={`px-4 py-2 rounded-md ${
              isDeviceOn ? 'bg-green-500' : 'bg-red-500'
            } text-white transition-colors duration-200`}
          >
            <Power className="h-5 w-5" />
          </button>
        </div>

        <div>
          <h3 className="text-gray-700 mb-2">Restricted Apps</h3>
          <div className="space-y-2">
            {restrictedApps.map((app) => (
              <div key={app} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{app}</span>
                <button className="text-red-500">
                  <Lock className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceControl;