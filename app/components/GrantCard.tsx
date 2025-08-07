import Link from "next/link";
import { Calendar, Building2, Hash, ExternalLink } from "lucide-react";
import type { Grant } from "../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatGrantCardDate } from "../lib/date-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GrantCardProps {
  grant: Grant;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant }) => {
  const isUndesirableTitle = (title: string): boolean => {
    const undesirablePatterns = [
      /^THUD-ExportCSVFILE-TEST\d{6}$/i,
      /^TEST\d{6}$/i,
      /^ExportCSVFILE/i,
      /test/i,
    ];
    return undesirablePatterns.some((pattern) => pattern.test(title));
  };

  const getMeaningfulTitle = (grant: Grant): string => {
    if (grant.title && !isUndesirableTitle(grant.title)) {
      return grant.title;
    }
    if (grant.agency && grant.opportunityNumber) {
      return `${grant.agency} Grant - Opportunity ${grant.opportunityNumber}`;
    }
    if (grant.agency) {
      return `${grant.agency} Grant Opportunity`;
    }
    return "Government Grant Details";
  };

  const displayTitle = getMeaningfulTitle(grant);

  const descriptionSnippet =
    grant.description && grant.description.length > 180
      ? `${grant.description.substring(0, 180)}...`
      : grant.description || "No description available.";

  const getStatusVariant = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "posted":
        return "default"; // green
      case "closed":
        return "destructive"; // red
      case "forecasted":
        return "secondary"; // blue/gray
      default:
        return "outline"; // gray outline
    }
  };

  const formatAmount = (amount: number) => {
    if (amount === 0) return "Amount varies";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="group h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-3">
            <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
              {displayTitle}
            </CardTitle>
            <Badge
              variant={getStatusVariant(grant.opportunityStatus || "Unknown")}
              className="shrink-0 text-xs"
            >
              {grant.opportunityStatus || "Unknown"}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{grant.agency}</span>
            {grant.agencyCode && (
              <Badge variant="outline" className="text-xs">
                {grant.agencyCode}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-4 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {descriptionSnippet}
        </p>

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Deadline:</span>
            <span className="font-medium">
              {formatGrantCardDate(grant.deadline)}
            </span>
          </div>

          {grant.amount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Award:</span>
              <span className="font-medium text-emerald-700">
                {formatAmount(grant.amount)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {grant.opportunityNumber || "N/A"}
            </code>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/grants/${grant.id}`}>
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
export default GrantCard;
