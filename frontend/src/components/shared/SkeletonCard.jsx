import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-100 shadow-sm rounded-sm overflow-hidden flex flex-col h-full pb-4">
      {/* Image Skeleton */}
      <div className="w-full aspect-4/5 bg-gray-200 animate-pulse mb-4"></div>
      
      {/* Title Skeleton */}
      <div className="px-4 mt-auto">
        <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mx-auto mb-3"></div>
        {/* Price Skeleton */}
        <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4 mx-auto"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
