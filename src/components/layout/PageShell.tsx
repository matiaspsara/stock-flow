import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PageShell({ title, description }: { title: string; description?: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {description ?? "Sección en construcción."}
        </p>
      </CardContent>
    </Card>
  );
}
