import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  label: string;
  value: string | number | null | undefined;
  icon: LucideIcon;
  loading?: boolean;
  valueClassName?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  loading,
  valueClassName = "text-2xl font-bold",
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={valueClassName}>
          {loading || value == null ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  );
}
