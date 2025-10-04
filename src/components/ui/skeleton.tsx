import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-[linear-gradient(90deg,hsl(var(--muted))_0%,hsl(var(--muted-foreground)/0.2)_50%,hsl(var(--muted))_100%)]", className)}
      {...props}
    />
  )
}

export { Skeleton }
