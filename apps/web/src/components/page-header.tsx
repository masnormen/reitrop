import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  backLinkProps,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  backLinkProps?: LinkProps;
}) {
  return (
    <div className="mb-8 flex flex-row items-center">
      <Link {...backLinkProps}>
        <ArrowLeft className="mr-4 size-8" />
      </Link>
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
