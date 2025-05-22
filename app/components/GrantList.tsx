import React from 'react';
import type { Grant } from '../../types';
import GrantCard from './GrantCard';

interface GrantListProps {
  grants: Grant[];
}

const GrantList: React.FC<GrantListProps> = ({ grants }) => {
  if (!grants || grants.length === 0) {
    return <p>No grants found.</p>;
  }

  return (
    <div>
      {grants.map((grant) => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
};

export default GrantList;
