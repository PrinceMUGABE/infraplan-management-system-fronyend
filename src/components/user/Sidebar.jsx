// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { BiSolidInstitution } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import Logo from '../../assets/pictures/logo_lil.jpeg';
import { MdOutlinePolicy } from "react-icons/md";
import { FcDepartment } from "react-icons/fc";
import { FaCommentDots } from "react-icons/fa";

function Sidebar() {
  const [activeLink, setActiveLink] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setUserEmail(userData.email);
    }
  }, []);

  const handleLinkClick = (index) => {
    setActiveLink(index);
  };

  const Sidebar_Links = [
    { id: 3, name: 'Institution', path: "/user/instutitions", icon: <BiSolidInstitution /> },
    { id: 4, name: 'Departments', path: '/user/departiments', icon: <FcDepartment /> },
    { id: 5, name: 'Policies', path: '/user/userpolicy', icon: <MdOutlinePolicy /> },
    { id: 6, name: 'Comments', path: '/user/usercomments', icon: <FaCommentDots /> },
    { id: 7, name: 'My comment replies', path: `/user/usercommentReplies/${userEmail}`, icon: <FaCommentDots /> },
  ];

  return (
    <div className='w-16 md:w-56 fixed left-0 top-0 z-10 border-r h-screen pt-8 px-4 bg-white shadow-md'>
      <div className='mb-8 flex justify-center md:block'>
        <img src={Logo} alt='Logo' className='w-10 md:w-20' />
      </div>
      <ul className='mt-6 space-y-6'>
        {Sidebar_Links.map((link, index) => (
          <li key={index} className='relative'>
            <div
              className={`font-medium rounded-md py-2 px-5 hover:bg-gray-100 hover:text-indigo-500 ${activeLink === index ? 'bg-indigo-100 text-indigo-500' : ''}`}
              onClick={() => handleLinkClick(index)}
            >
              <div className='flex items-center justify-between'>
                <Link to={link.path || '#'} className='flex items-center justify-center md:justify-start md:space-x-5'>
                  <span className='text-indigo-500'>{link.icon}</span>
                  <span className='text-sm text-gray-500 md:flex hidden'>{link.name}</span>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
