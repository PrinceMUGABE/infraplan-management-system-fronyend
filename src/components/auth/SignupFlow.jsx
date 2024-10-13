/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import Signup from './Signup';
import VerifyPassword from './VerifyPassword';

const SignupFlow = () => {
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleSignupSuccess = (email) => {
    setUserEmail(email);
    setIsSignupComplete(true);
  };

  return (
    <div>
      {!isSignupComplete ? (
        <Signup onSignupSuccess={() => handleSignupSuccess()} />
      ) : (
        <VerifyPassword email={userEmail} />
      )}
    </div>
  );
};

export default SignupFlow;