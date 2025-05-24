"use client"; // For form state and event handlers

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [status, setStatus] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
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
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg mb-10 border border-gray-200 dark:border-gray-700">
      <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Filter Grants
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-3">
          <Label
            htmlFor="status-filter"
            className="text-gray-700 dark:text-gray-300 font-medium">
            Opportunity Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              id="status-filter"
              className="border-gray-300 dark:border-gray-600 focus:ring-pink-400">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="forecasted">Forecasted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
