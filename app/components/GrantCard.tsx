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
  const descriptionSnippet =
    grant.description && grant.description.length > 150
      ? `${grant.description.substring(0, 150)}...`
      : grant.description || "No description available."; // Handle null/undefined description

  return (
    <Card className="w-full flex flex-col h-full">
      {" "}
      {/* Ensure card takes full height of grid cell and content is flexible */}
      <CardHeader>
        <CardTitle>{grant.title}</CardTitle>
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
