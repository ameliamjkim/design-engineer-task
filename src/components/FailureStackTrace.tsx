import { Terminal } from "lucide-react";

interface FailureStackTraceProps {
  /** Name of the failed job/step the log belongs to. */
  jobName: string;
  /** Command that produced the failure (e.g. "npm test"). */
  command?: string;
  exitCode?: number | null;
  /** Raw CI log tail. */
  trace: string;
}

/**
 * Maps a single log line to a Tailwind class so the trace reads like a
 * terminal: failures in red, the diff in jest's green/red, the offending
 * source line highlighted, and stack frames dimmed.
 */
const lineClass = (line: string): string => {
  const t = line.trimStart();
  if (line.startsWith("FAIL")) return "text-red-400 font-semibold";
  if (t.startsWith("●")) return "text-zinc-100 font-semibold";
  if (line.startsWith("Expected")) return "text-emerald-300";
  if (line.startsWith("Received")) return "text-red-300";
  if (t.startsWith(">")) return "text-red-200 bg-red-500/10";
  if (t.startsWith("|") && t.includes("^")) return "text-red-400";
  if (t.startsWith("at ")) return "text-zinc-500";
  if (
    line.startsWith("Test Suites:") ||
    line.startsWith("Tests:") ||
    line.startsWith("Time:")
  )
    return "text-zinc-300";
  return "text-zinc-400";
};

const FailureStackTrace: React.FC<FailureStackTraceProps> = ({
  jobName,
  command,
  exitCode,
  trace,
}) => {
  const lines = trace.replace(/\n+$/, "").split("\n");

  return (
    <section
      aria-label={`Failure log for ${jobName}`}
      className="failure-trace rounded-md overflow-hidden border border-zinc-700 bg-zinc-900"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border-b border-zinc-700">
        <Terminal
          size={13}
          className="text-zinc-400 flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-xs font-medium text-zinc-200 truncate">
          {jobName}
        </span>
        {command && (
          <code className="text-xs text-zinc-500 font-mono truncate hidden sm:inline">
            {command}
          </code>
        )}
        {exitCode != null && (
          <code className="ml-auto text-xs text-red-300 bg-red-500/15 px-1.5 py-0.5 rounded font-mono flex-shrink-0">
            exit {exitCode}
          </code>
        )}
      </div>

      <pre
        tabIndex={0}
        aria-label={`${jobName} log output`}
        className="m-0 max-h-64 overflow-auto px-3 py-2.5 text-xs leading-relaxed font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      >
        {lines.map((line, i) => (
          <div key={i} className={lineClass(line)}>
            {line || " "}
          </div>
        ))}
      </pre>
    </section>
  );
};

export default FailureStackTrace;
