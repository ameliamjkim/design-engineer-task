import { Check, X } from "lucide-react";
import type { StepStatus } from "@/types/build";
import { cn } from "@/lib/utils";

interface JobPillProps {
  name: string;
  status: StepStatus;
  exitCode?: number | null;
  onClick?: () => void;
}

const statusIcon: Record<StepStatus, React.ReactNode> = {
  complete: <Check size={9} strokeWidth={3} aria-hidden="true" />,
  failed: <X size={9} strokeWidth={3} aria-hidden="true" />,
  pending: (
    <div
      className="w-1.5 h-1.5 rounded-full border border-zinc-300"
      aria-hidden="true"
    />
  ),
  "in-progress": null,
};

const statusStyles: Record<StepStatus, string> = {
  complete:
    "bg-green-50 border-green-200 text-green-700 hover:bg-green-100 focus-visible:bg-green-100",
  failed:
    "bg-red-50 border-red-200 text-red-700 hover:bg-red-100 focus-visible:bg-red-100",
  pending: "bg-zinc-50 border-zinc-200 text-zinc-400 cursor-default",
  "in-progress":
    "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 focus-visible:bg-amber-100",
};

const JobPill: React.FC<JobPillProps> = ({
  name,
  status,
  exitCode,
  onClick,
}) => {
  return (
    <button
      type="button"
      className={cn(
        "job-pills flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border transition-colors",
        statusStyles[status],
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      aria-label={
        status === "pending"
          ? `${name} (pending)`
          : exitCode != null
            ? `View logs for ${name}, exit code ${exitCode}`
            : `View logs for ${name}`
      }
      aria-disabled={status === "pending"}
      disabled={status === "pending"}
    >
      {statusIcon[status]}
      <span>{name}</span>
      {status === "failed" && exitCode != null && (
        <span className="font-mono opacity-60">exit {exitCode}</span>
      )}
    </button>
  );
};

export default JobPill;
