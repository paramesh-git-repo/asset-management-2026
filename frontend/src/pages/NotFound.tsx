import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">Page not found</p>
        <p className="mt-2 text-sm text-gray-500">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

