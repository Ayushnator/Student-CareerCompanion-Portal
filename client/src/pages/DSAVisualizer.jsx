import React, { useState } from 'react';
import SortingVisualizer from '../components/dsa/SortingVisualizer';
import PathfindingVisualizer from '../components/dsa/PathfindingVisualizer';
import DataStructureVisualizer from '../components/dsa/DataStructureVisualizer';

const DSAVisualizer = () => {
  const [activeTab, setActiveTab] = useState('sorting');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">DSA Visualizer</h1>
        <p className="text-gray-600">Interactive visualizations for Data Structures and Algorithms.</p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow p-1 inline-flex flex-wrap justify-center gap-1">
          <button
            onClick={() => setActiveTab('sorting')}
            className={`px-2 sm:px-4 py-2 rounded transition-colors ${
              activeTab === 'sorting'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sorting Algorithms
          </button>
          <button
            onClick={() => setActiveTab('pathfinding')}
            className={`px-2 sm:px-4 py-2 rounded transition-colors ${
              activeTab === 'pathfinding'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Pathfinding Algorithms
          </button>
          <button
            onClick={() => setActiveTab('datastructures')}
            className={`px-2 sm:px-4 py-2 rounded transition-colors ${
              activeTab === 'datastructures'
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Data Structures
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        {activeTab === 'sorting' && <SortingVisualizer />}
        {activeTab === 'pathfinding' && <PathfindingVisualizer />}
        {activeTab === 'datastructures' && <DataStructureVisualizer />}
      </div>
    </div>
  );
};

export default DSAVisualizer;
