import React from 'react';
import { Shield, Clock, MapPin, Phone, Power, Apple as Apps, AlertTriangle } from 'lucide-react';
import DeviceControl from './components/DeviceControl';
import ScreenTime from './components/ScreenTime';
import LocationTracking from './components/LocationTracking';
import EmergencyAccess from './components/EmergencyAccess';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">ParentGuard</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Parental Control Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DeviceControl />
          <ScreenTime />
          <LocationTracking />
          <EmergencyAccess />
        </div>
      </main>
    </div>
  );
}

export default App;