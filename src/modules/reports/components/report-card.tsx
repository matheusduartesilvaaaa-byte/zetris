import { FileText, FileSpreadsheet, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReportCardProps {
  type: string;
  title: string;
  description: string;
}

export function ReportCard({ type, title, description }: ReportCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <a href={`/api/reports/${type}?format=pdf`}>
          <Button variant="outline" size="sm">
            <File className="mr-2 h-4 w-4" /> PDF
          </Button>
        </a>
        <a href={`/api/reports/${type}?format=xlsx`}>
          <Button variant="outline" size="sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
          </Button>
        </a>
        <a href={`/api/reports/${type}?format=csv`}>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" /> CSV
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
