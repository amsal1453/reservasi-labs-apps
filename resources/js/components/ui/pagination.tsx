import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <nav
        ref={ref}
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
    />
));
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
    HTMLUListElement,
    React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("flex flex-row items-center gap-1", className)}
        {...props}
    />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
    HTMLLIElement,
    React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
    isActive?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    size?: 'default' | 'sm' | 'lg';
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const PaginationLink = ({
    className,
    isActive,
    disabled,
    onClick,
    children,
    ...props
}: PaginationLinkProps) => (
    <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "h-9 min-w-9 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            {
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground": isActive,
            },
            className
        )}
        {...props}
    >
        {children}
    </Button>
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
    className,
    onClick,
    disabled,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        aria-label="Go to previous page"
        className={cn("gap-1", className)}
        onClick={onClick}
        disabled={disabled}
        {...props}
    >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
    </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
    className,
    onClick,
    disabled,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        aria-label="Go to next page"
        className={cn("gap-1", className)}
        onClick={onClick}
        disabled={disabled}
        {...props}
    >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
    <span
        aria-hidden
        className={cn("flex h-9 w-9 items-center justify-center", className)}
        {...props}
    >
        <span className="text-sm">...</span>
    </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

// Create a simpler interface for the Pagination component
type CompoundPagination = React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
> & {
    Content: typeof PaginationContent;
    Item: typeof PaginationItem;
    Link: typeof PaginationLink;
    Previous: typeof PaginationPrevious;
    Next: typeof PaginationNext;
    Ellipsis: typeof PaginationEllipsis;
    Prev: typeof PaginationPrevious;
};

// Extend the Pagination component with its subcomponents
(Pagination as CompoundPagination).Content = PaginationContent;
(Pagination as CompoundPagination).Item = PaginationItem;
(Pagination as CompoundPagination).Link = PaginationLink;
(Pagination as CompoundPagination).Previous = PaginationPrevious;
(Pagination as CompoundPagination).Next = PaginationNext;
(Pagination as CompoundPagination).Ellipsis = PaginationEllipsis;
(Pagination as CompoundPagination).Prev = PaginationPrevious;

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis };
