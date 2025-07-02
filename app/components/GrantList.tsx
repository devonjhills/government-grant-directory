import React from "react";
import { Search } from "lucide-react";
import type { Grant } from "../../types";
import GrantCard from "./GrantCard";

interface GrantListProps {
  grants: Grant[];
}

const GrantList: React.FC<GrantListProps> = ({ grants }) => {
  if (!grants || grants.length === 0) {
    return (
      <div className="text-center py-16">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No grants found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Try adjusting your search criteria or browse our featured categories to find relevant opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {grants.length} grant{grants.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {grants.map((grant) => (
          <GrantCard key={grant.id} grant={grant} />
        ))}
      </div>
    </div>
  );
};
export default GrantList;
