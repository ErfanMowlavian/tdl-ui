import { ConstructionIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ComingSoon({
  phase,
  children,
}: {
  phase: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <ConstructionIcon className="size-6" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">This feature is on the way</p>
          <p className="text-muted-foreground max-w-md text-sm">
            {children ??
              "The interface and wiring for this section land in an upcoming pull request."}
          </p>
        </div>
        <Badge variant="secondary">{phase}</Badge>
      </CardContent>
    </Card>
  );
}
