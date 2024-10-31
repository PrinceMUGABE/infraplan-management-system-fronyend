/* eslint-disable no-unused-vars */
// Planner_Layout.js
import React from 'react';
import Header from './Header';
import { Outlet } from 'react-router-dom';

function Stakeholder_Layout() {
  return (
    <div className='bg-gray-100 min-h-screen overflow-auto'> {/* Added px-4 for slight horizontal padding */}
      <Header />
      <div className='flex justify-center'> {/* Added flex and justify-center */}
        <div className='md:ml-56 overflow-auto w-full max-w-7xl'> {/* Ensure this takes full width and centers */}
          <main className='py-4'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}



export default Stakeholder_Layout;
