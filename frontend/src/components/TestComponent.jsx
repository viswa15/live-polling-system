import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Tailwind CSS Test</h1>
      <p className="text-lg">If you can see this styled properly, Tailwind CSS is working!</p>
      <button className="mt-4 px-4 py-2 bg-white text-blue-500 rounded hover:bg-gray-100 transition-colors">
        Test Button
      </button>
    </div>
  );
};

export default TestComponent;
