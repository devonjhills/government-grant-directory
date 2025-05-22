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
    <div className="grant-card"> {/* Replaced inline styles with className */}
      <h3>{grant.title}</h3> {/* Removed inline style for h3, will be covered by globals.css or specific .grant-card h3 rules */}
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
