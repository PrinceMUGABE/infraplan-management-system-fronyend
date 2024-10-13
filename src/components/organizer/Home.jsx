// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import axios from 'axios'


function OrganizerHome() {

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalInstitutions, setTotalInstitutions] = useState(0);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch total number of users
        const totalUsersRes = await axios.get('http://127.0.0.1:8000/account/total_users/');
        if (totalUsersRes.data.total_users) {
          setTotalUsers(totalUsersRes.data.total_users);
        }

        // Fetch total number of institutions
        const totalInstitutionRes = await axios.get('http://127.0.0.1:8000/institution/total_institutions/');
        if (totalInstitutionRes.data.total_institutions) {
          setTotalInstitutions(totalInstitutionRes.data.total_institutions);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
   <div className=' mt-20'>
       <h2 className='text-lg font-semibold mb-4 text-center text-black'>Reports</h2>

<div className='flex flex-wrap justify-center'>
  {/* Total Users Card */}
  <div className='bg-white rounded-lg shadow-md p-4 m-4 max-w-sm'>
    <h3 className='text-md font-semibold text-black mb-2'>Total Users</h3>
    <p className='text-xl text-red-700 font-bold'>{totalUsers}</p>
  </div>

  {/* Total Institutions Card */}
  <div className='bg-white rounded-lg shadow-md p-4 m-4 max-w-sm'>
    <h3 className='text-md font-semibold text-black mb-2'>Average of comments</h3>
    <p className='text-xl text-red-600 font-bold'>{totalInstitutions*totalUsers/100}</p>
  </div>
</div>
    </div> 
  )
}

export default OrganizerHome
