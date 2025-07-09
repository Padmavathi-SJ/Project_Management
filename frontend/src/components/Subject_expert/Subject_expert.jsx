import React, { useState } from 'react';
import Header from '../../Header';
import { Outlet } from 'react-router-dom';
import Subject_expert_navbar from './Subject_expert_navbar';

function Subject_expert() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Subject_expert_navbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`transition-all duration-500 flex-1 overflow-y-auto h-screen ${isSidebarOpen ? 'ml-64' : 'ml-24'}`}>
          <Header />
            <div className="p-4">
              <Outlet />
            </div>
        </div>
    </div>
    
  );
}

export default Subject_expert;