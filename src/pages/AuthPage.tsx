
import React from 'react';
import AuthForm from '@/components/auth/AuthForm';

const AuthPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-love-700 mb-6 hidden md:block">HeartNest</h1>
        <AuthForm />
        <p className="text-center text-gray-500 text-sm mt-6">
          Nurture your relationships with our thoughtfully designed tools
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
