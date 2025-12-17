import { Link, useParams } from "react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import type { DocNode } from "~/lib/docs-utils";
import { cn } from "~/lib/utils";

export function DocsSidebar({ tree }: { tree: DocNode[] }) {
  const { lang = "zh", "*": rest } = useParams();
  const currentPath = rest ? rest.replace(/\/$/, "") : "";

  function renderTree(nodes: DocNode[], parentPath = "") {
    return (
      <ul className="pl-2 space-y-1">
        {nodes.map((node) => {
          const fullPath = parentPath
            ? `${parentPath}/${node.slug}`
            : node.slug;
          const isActive = currentPath === fullPath;
          if (node.children && node.children.length > 0) {
            return (
              <li key={fullPath}>
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={isActive ? fullPath : undefined}
                >
                  <AccordionItem value={fullPath} className="border-none">
                    <AccordionTrigger className="px-2 py-1.5 text-sm font-medium hover:bg-accent/40 rounded-md">
                      {node.title}
                    </AccordionTrigger>
                    <AccordionContent className="pl-2">
                      {renderTree(node.children, fullPath)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            );
          }
          return (
            <li key={fullPath}>
              <Link
                to={`/${lang}/docs/${fullPath}`}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "hover:bg-accent/40 text-muted-foreground"
                )}
              >
                {node.title}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <aside className="w-64 min-h-screen border-r bg-card/80 p-4">
      <nav>{renderTree(tree)}</nav>
    </aside>
  );
}
