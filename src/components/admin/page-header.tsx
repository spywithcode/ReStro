import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between p-6 md:p-8", className)}>
            <div className="grid gap-1">
                <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            {children}
        </div>
    );
}
