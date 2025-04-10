import React, { useState, useEffect } from 'react';
import { Clock, BarChart } from 'lucide-react';
import { connectDB, collections } from '../config/mongodb';

const ScreenTime = () => {
  const [dailyLimit, setDailyLimit] = useState('02:00');
  const [usageData, setUsageData] = useState<{ app: string; duration: number }[]>([]);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        const db = await connectDB();
        const data = await db.collection(collections.screenTime)
          .find({ userId: 'current-user-id' })
          .sort({ timestamp: -1 })
          .limit(1)
          .toArray();

        if (data.length > 0) {
          setUsageData(data[0].appUsage);
          setDailyLimit(data[0].dailyLimit);
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
      }
    };

    fetchUsageData();
  }, []);

  const updateDailyLimit = async (newLimit: string) => {
    try {
      const db = await connectDB();
      await db.collection(collections.screenTime).updateOne(
        { userId: 'current-user-id' },
        { 
          $set: { 
            dailyLimit: newLimit,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
      setDailyLimit(newLimit);
    } catch (error) {
      console.error('Error updating daily limit:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <Clock className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold">Screen Time</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-gray-700 mb-2">Daily Usage</h3>
          <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
            <BarChart className="h-24 w-24 text-gray-400" />
          </div>
        </div>

        <div>
          <h3 className="text-gray-700 mb-2">Time Limits</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Daily Limit</span>
              <input
                type="time"
                className="border rounded-md px-2 py-1"
                value={dailyLimit}
                onChange={(e) => updateDailyLimit(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenTime;