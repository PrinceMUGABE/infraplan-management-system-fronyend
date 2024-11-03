/* eslint-disable no-unused-vars */
// Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className='bg-blue-600 text-white p-4 w-full'>
      <nav className='flex justify-col px-20'>
        {/* <Link to="/project_owner" className='hover:text-gray-300'>Dashboard</Link> */}
        <Link to="/project_owner/projects" className='hover:text-gray-300 px-10'>My Projects</Link>
        {/* <Link to="/profile" className='hover:text-gray-300'>Profile</Link> */}
        <Link to="/" className='hover:text-gray-300 px-10'>Logout</Link>
      </nav>
    </header>
  );
};

export default Header;
