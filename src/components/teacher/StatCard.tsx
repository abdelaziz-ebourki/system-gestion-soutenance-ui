import { Card, CardContent } from "@/components/ui/card";
import type { StatMetric } from "@/pages/teacher/types";

export const StatCard = ({ metric }: { metric: StatMetric }) => (
	<Card className="border border-border shadow-sm overflow-hidden group hover:shadow-md transition-all rounded-3xl bg-card">
		<CardContent className="p-8">
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-1">
					<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
						{metric.title}
					</p>
					<p className="text-4xl font-bold font-heading text-foreground">
						{metric.value}
					</p>
				</div>
				<div
					className={`p-4 rounded-3xl ${metric.bg} group-hover:scale-110 transition-transform shadow-inner border border-primary/5`}
				>
					<metric.icon className="h-8 w-8 text-primary" />
				</div>
			</div>
		</CardContent>
	</Card>
);
