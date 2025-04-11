
import React from 'react';

const LoadingState = () => {
  return (
    <div className="flex justify-center p-6">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
};

export default LoadingState;
