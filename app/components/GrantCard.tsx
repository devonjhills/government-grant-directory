import React from 'react';
import Link from 'next/link';
import type { Grant } from '../../types';

interface GrantCardProps {
  grant: Grant;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant }) => {
  const descriptionSnippet = grant.description.length > 150 
    ? `${grant.description.substring(0, 150)}...` 
    : grant.description;

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px', borderRadius: '8px' }}>
      <h3 style={{ marginTop: 0 }}>{grant.title}</h3>
      <p><strong>Agency:</strong> {grant.agency}</p>
      <p><strong>Deadline:</strong> {grant.deadline}</p>
      <p>{descriptionSnippet}</p>
      <Link href={`/grants/${grant.id}`}>
        View Details
      </Link>
    </div>
  );
};

export default GrantCard;
