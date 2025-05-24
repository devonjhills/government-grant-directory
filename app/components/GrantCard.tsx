import Link from "next/link";
import type { Grant } from "../../types"; // Verify path
import { Button } from "@/components/ui/button"; // Verify path
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Verify path

interface GrantCardProps {
  grant: Grant;
}

const GrantCard: React.FC<GrantCardProps> = ({ grant }) => {
  // Helper function to check if title is undesirable
  const isUndesirableTitle = (title: string): boolean => {
    // Example pattern to detect test or export CSV titles
    const undesirablePatterns = [
      /^THUD-ExportCSVFILE-TEST\d{6}$/i,
      /^TEST\d{6}$/i,
      /^ExportCSVFILE/i,
      /test/i,
    ];
    return undesirablePatterns.some((pattern) => pattern.test(title));
  };

  // Replace undesirable title with fallback
  const displayTitle =
    grant.title && !isUndesirableTitle(grant.title)
      ? grant.title
      : "Untitled Grant";

  const descriptionSnippet =
    grant.description && grant.description.length > 150
      ? `${grant.description.substring(0, 150)}...`
      : grant.description || "No description available."; // Handle null/undefined description

  return (
    <Card className="w-full flex flex-col h-full shadow-md hover:shadow-lg transition-shadow rounded-lg border border-border bg-card">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-lg font-semibold leading-tight">
          {displayTitle}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1 mb-3">
          Agency:{" "}
          <span className="font-medium text-foreground">{grant.agency}</span>
        </CardDescription>
        <div className="flex flex-col gap-2 text-sm font-medium text-foreground">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">
              Opportunity Number
            </span>
            <span className="text-base">
              {grant.opportunityNumber || "N/A"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">
              Status
            </span>
            <span
              className={`text-base font-semibold ${
                grant.opportunityStatus?.toLowerCase() === "discretionary"
                  ? "text-purple-600"
                  : grant.opportunityStatus?.toLowerCase() === "posted"
                  ? "text-green-600"
                  : grant.opportunityStatus?.toLowerCase() === "closed"
                  ? "text-red-600"
                  : "text-gray-600"
              }`}>
              {grant.opportunityStatus || "Unknown"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow px-6 pt-2">
        <p className="text-sm text-muted-foreground mb-2 font-light">
          Deadline: {grant.deadline}
        </p>
        <p className="text-sm text-card-foreground leading-relaxed">
          {descriptionSnippet}
        </p>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-4">
        <Button
          asChild
          variant="outline"
          className="w-full transition-colors hover:bg-primary/10">
          <Link href={`/grants/${grant.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
export default GrantCard;
