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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="group h-full flex flex-col shadow-sm hover:shadow-xl transition-all duration-300 border-border bg-card hover:border-primary/20 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-xl font-bold leading-tight line-clamp-3 group-hover:text-primary transition-colors">
            {displayTitle}
          </CardTitle>
          <Badge variant={getStatusVariant(grant.opportunityStatus || "Unknown")} className="shrink-0">
            {grant.opportunityStatus || "Unknown"}
          </Badge>
        </div>
        
        <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="font-medium">{grant.agency}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow space-y-4 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
          {descriptionSnippet}
        </p>
        
        <div className="grid grid-cols-1 gap-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Opportunity:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {grant.opportunityNumber || "N/A"}
            </Badge>
          </div>
          
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
              <span className="font-semibold text-green-700">
                {formatAmount(grant.amount)}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 space-y-2">
        <Button
          asChild
          className="w-full group-hover:bg-primary/90 transition-colors">
          <Link href={`/grants/${grant.id}`}>
            View Full Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
export default GrantCard;
