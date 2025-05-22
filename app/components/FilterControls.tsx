"use client"; // For form state and event handlers

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define a type for filter values for clarity, can be expanded
export interface GrantFilters {
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  postedDateFrom?: string;
  postedDateTo?: string;
  closeDateFrom?: string;
  closeDateTo?: string;
}

interface FilterControlsProps {
  onApplyFilters: (filters: GrantFilters) => void;
  // Add onClearFilters or similar if needed later
}

const FilterControls: React.FC<FilterControlsProps> = ({ onApplyFilters }) => {
  const [status, setStatus] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  // Add states for other filters as needed (e.g., dates)

  const handleApply = () => {
    const filters: GrantFilters = {};
    if (status) filters.status = status;
    if (minAmount) filters.minAmount = parseInt(minAmount, 10);
    if (maxAmount) filters.maxAmount = parseInt(maxAmount, 10);
    // Populate other filters
    onApplyFilters(filters);
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg mb-8 border">
      <h3 className="text-xl font-semibold mb-6 text-card-foreground">Filter Grants</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status-filter">Opportunity Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="forecasted">Forecasted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              {/* Add other statuses as needed */}
            </SelectContent>
          </Select>
        </div>

        {/* Min Amount Filter */}
        <div className="space-y-2">
          <Label htmlFor="min-amount-filter">Min. Amount</Label>
          <Input
            id="min-amount-filter"
            type="number"
            placeholder="e.g., 10000"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
        </div>

        {/* Max Amount Filter */}
        <div className="space-y-2">
          <Label htmlFor="max-amount-filter">Max. Amount</Label>
          <Input
            id="max-amount-filter"
            type="number"
            placeholder="e.g., 500000"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>

        {/* TODO: Add Date Filters (Posted Date From/To, Close Date From/To) here */}
        {/* Example for one date filter:
        <div className="space-y-2">
          <Label htmlFor="posted-date-from">Posted Date From</Label>
          <Input id="posted-date-from" type="date" />
        </div>
        */}
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={handleApply}>Apply Filters</Button>
      </div>
    </div>
  );
};

export default FilterControls;
