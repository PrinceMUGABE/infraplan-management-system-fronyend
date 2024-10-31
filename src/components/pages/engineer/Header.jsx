/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage the menu open/close

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Toggle the menu open/close state
  };

  return (
    <header className='bg-blue-600 text-white p-4 w-full'>
      <nav className='flex justify-between items-center px-20'>
        {/* <div className='text-2xl'>My App</div> */}
        <div className='md:hidden' onClick={toggleMenu}> {/* Hamburger icon for small screens */}
          <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
        </div>
        <ul className={`flex-col md:flex-row md:flex ${isOpen ? 'block' : 'hidden'} md:items-center transition-all duration-300`}>
          <li className='md:mr-10'>
            <Link to="/engineer" className='hover:text-gray-300'>Dashboard</Link>
          </li>
          <li className='md:mr-10'>
            <Link to="/engineer/projects" className='hover:text-gray-300'>My Projects</Link>
          </li>
          <li className='md:mr-10'>
            <Link to="/profile" className='hover:text-gray-300'>Profile</Link>
          </li>
          <li>
            <Link to="/" className='hover:text-gray-300'>Logout</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
