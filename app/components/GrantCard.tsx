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
    <Card className="w-full flex flex-col h-full">
      {" "}
      {/* Ensure card takes full height of grid cell and content is flexible */}
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
        <CardDescription>Agency: {grant.agency}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {" "}
        {/* Allow content to grow and push footer down */}
        <p className="text-sm text-muted-foreground mb-2">
          Deadline: {grant.deadline}
        </p>
        <p className="text-sm">{descriptionSnippet}</p>{" "}
        {/* Ensure description text size is appropriate */}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/grants/${grant.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
export default GrantCard;
