"use client";

import React, { useState } from "react";
import { Filter, X, DollarSign, Calendar } from "lucide-react";
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
  onClearFilters?: () => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  onApplyFilters,
  onClearFilters,
}) => {
  const [status, setStatus] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [postedDateFrom, setPostedDateFrom] = useState<string>("");
  const [postedDateTo, setPostedDateTo] = useState<string>("");

  const handleApply = () => {
    const filters: GrantFilters = {};
    if (status) filters.status = status;
    if (minAmount) filters.minAmount = parseInt(minAmount, 10);
    if (maxAmount) filters.maxAmount = parseInt(maxAmount, 10);
    if (postedDateFrom) filters.postedDateFrom = postedDateFrom;
    if (postedDateTo) filters.postedDateTo = postedDateTo;
    onApplyFilters(filters);
  };

  const handleClear = () => {
    setStatus("");
    setMinAmount("");
    setMaxAmount("");
    setPostedDateFrom("");
    setPostedDateTo("");
    onClearFilters?.();
  };

  const hasActiveFilters =
    status || minAmount || maxAmount || postedDateFrom || postedDateTo;

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm mb-8 max-w-7xl mx-auto overflow-hidden">
      <div className="bg-muted/30 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Filter Grants
          </h3>
          {hasActiveFilters && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {
                [
                  status,
                  minAmount,
                  maxAmount,
                  postedDateFrom,
                  postedDateTo,
                ].filter(Boolean).length
              }{" "}
              active
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label
              htmlFor="status-filter"
              className="text-sm font-medium flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Opportunity Status
            </Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="forecasted">Forecasted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-green-600" />
              Min. Award Amount
            </Label>
            <Input
              type="number"
              placeholder="e.g., 10,000"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-3 h-3 text-green-600" />
              Max. Award Amount
            </Label>
            <Input
              type="number"
              placeholder="e.g., 500,000"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
            />
          </div>

          {/* Posted Date From */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-3 h-3 text-blue-600" />
              Posted From
            </Label>
            <Input
              type="date"
              value={postedDateFrom}
              onChange={(e) => setPostedDateFrom(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-border">
          <Button
            onClick={handleApply}
            className="sm:ml-auto"
            disabled={!hasActiveFilters}
          >
            <Filter className="w-4 h-4 mr-2" />
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClear}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
