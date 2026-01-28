import { useEffect, useMemo, useState } from "react";

function resolveMermaidTheme() {
  if (typeof document === "undefined") return "default";
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit === "dark") return "dark";
  if (explicit === "light") return "default";
  if (document.documentElement.classList.contains("dark")) return "dark";
  return "default";
}

export function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalized = useMemo(() => chart.trim(), [chart]);
  const id = useMemo(
    () => `mermaid-${Math.random().toString(36).slice(2)}`,
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setError(null);
      setSvg(null);

      const mermaidModule = await import("mermaid");
      const mermaid = mermaidModule.default;

      mermaid.initialize({
        startOnLoad: false,
        // Allows HTML labels like `<br/>` in node text; safe for trusted MDX content.
        securityLevel: "loose",
        theme: resolveMermaidTheme(),
        flowchart: {
          htmlLabels: true,
        },
      });

      const { svg } = await mermaid.render(id, normalized);
      if (!cancelled) setSvg(svg);
    }

    render().catch((e) => {
      if (cancelled) return;
      setError(e instanceof Error ? e.message : String(e));
    });

    return () => {
      cancelled = true;
    };
  }, [id, normalized]);

  if (svg) {
    return (
      <div
        className="my-6 overflow-x-auto rounded-lg border bg-card p-4"
        // Mermaid renders SVG; ensure the chart content is trusted.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  return (
    <div className="my-6 overflow-x-auto rounded-lg border bg-card p-4">
      {error ? (
        <div className="mb-3 text-sm text-destructive">
          Mermaid render failed: {error}
        </div>
      ) : null}
      <pre className="text-sm">
        <code>{normalized}</code>
      </pre>
    </div>
  );
}
