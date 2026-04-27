import React, { useState, useEffect } from 'react';
import GoogleSheetsDemo from '../components/GoogleSheetsDemo';

const GoogleSheetsTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Google Sheets Integration Test</h1>
        <GoogleSheetsDemo />
      </div>
    </div>
  );
};

export default GoogleSheetsTest;
