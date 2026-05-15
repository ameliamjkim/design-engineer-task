/**
 * BuildHeader component
 *
 * This component displays the header of a build, including the pipeline name, build number, branch, pull request, status, and actions.
 *
 *  -- NOTE: Scroll down to line 308 for the design engineer task. --
 *
 * @param {BuildHeaderProps} props - The props for the BuildHeader component.
 * @returns {React.ReactNode} The BuildHeader component.
 */

import React, { useState } from "react";
import {
  Clock,
  X,
  ChevronsUpDown,
  ChevronsDownUp,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import BuildActionsComboButton from "./BuildActionsComboButton";
import { HeaderBreadcrumbStubs } from "./HeaderBreadcrumbStubs";
import JobPill from "./JobPill";
import { BuildStep } from "@/types/build";
import { cn } from "@/lib/utils";
import {
  getStatusLabel,
  getStatusColors,
  computeBuildStats,
} from "@/lib/buildStatus";

interface BuildHeaderProps {
  /** Pipeline / project name shown in the breadcrumb. */
  pipelineName: string;
  /** Build number (e.g. "#17532"). */
  buildNumber: string;
  branch: string;
  pullRequest?: {
    number: number;
    title: string;
    author: { name: string; avatar?: string };
    triggeredAt: string;
  };
  buildSteps?: BuildStep[];
  status: "pending" | "running" | "passed" | "failed" | "canceled" | "complete";
  onCancelBuild?: () => void;
  onRestartBuild?: () => void;
  onRetryFailedJobs?: () => void;
  className?: string;
}

const EXPAND_INDICATOR_BG: Record<string, string> = {
  failed: "bg-red-600",
  running: "bg-amber-500",
  "in-progress": "bg-amber-500",
  passed: "bg-green-600",
  complete: "bg-green-600",
  canceled: "bg-zinc-500",
  pending: "bg-zinc-400",
};

const STATUS_PREFIX: Record<string, string> = {
  running: "Running for",
  "in-progress": "Running for",
  failed: "Failed in",
  passed: "Passed in",
  complete: "Passed in",
  canceled: "Canceled after",
  pending: "Pending for",
};

const BuildHeader: React.FC<BuildHeaderProps> = ({
  pipelineName,
  buildNumber,
  branch,
  pullRequest,
  status,
  onCancelBuild,
  onRestartBuild,
  onRetryFailedJobs,
  className = "",
  buildSteps = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRowFocused, setIsRowFocused] = useState(false);

  const statusColors = getStatusColors(status);
  const buildNumberLabel = `#${buildNumber.replace(/^#/, "")}`;
  const buildStats = computeBuildStats(buildSteps);
  const detailsId = `build-details-${buildNumber.replace(/^#/, "")}`;
  const totalProgressWeight = buildSteps.reduce(
    (sum, s) => sum + (s.jobs && s.jobs.length > 0 ? s.jobs.length : 1),
    0,
  );

  const failedJobs = buildSteps.flatMap((step) => {
    if (step.jobs?.length) {
      return step.jobs
        .filter((j) => j.status === "failed")
        .map((j) => ({
          id: j.id,
          name: j.name,
          exitCode: j.exitCode,
          duration: j.duration,
          command: j.command,
        }));
    }
    return step.status === "failed"
      ? [
          {
            id: step.id,
            name: step.name,
            exitCode: step.exitCode ?? null,
            duration: step.duration ?? "--",
            command: step.command,
          },
        ]
      : [];
  });

  const firstFailedStep = buildSteps.find((s) => s.status === "failed");

  const prefix = STATUS_PREFIX[status] ?? "Pending for";

  return (
    <div className={cn("bg-white", className)}>
      <div
        className={cn(
          `build-row group relative flex flex-col mx-2 lg:mx-3 mt-2
            rounded-md border bg-white
            transition-all duration-200
            shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.08)]`,
          isRowFocused && "outline outline-2 outline-blue-500 outline-offset-2",
          pullRequest && "cursor-pointer",
          className,
        )}
        style={{ borderColor: statusColors.topBorderColorHex }}
        onClick={pullRequest ? () => setIsExpanded(!isExpanded) : undefined}
      >
        {/* Breadcrumb row */}
        <div className="m-1 rounded-md border border-zinc-200/60 bg-white/50 px-2 py-0.5 shadow-sm">
          <HeaderBreadcrumbStubs
            pipelineName={pipelineName}
            branch={branch}
            buildNumberLabel={buildNumberLabel}
          />
        </div>

        {/* PR row + expand/collapse + progress bar */}
        {pullRequest && (
          <div className="group/pr px-1.5 pb-2 rounded-b-md transition-all duration-50 ease-in-out relative">
            <div className="pl-1 pt-1 pb-0.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <button
                  type="button"
                  className="flex items-center gap-3 min-w-0 flex-1 text-left focus-visible:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  onFocus={(e) =>
                    setIsRowFocused(e.currentTarget.matches(":focus-visible"))
                  }
                  onBlur={() => setIsRowFocused(false)}
                  aria-expanded={isExpanded}
                  aria-controls={detailsId}
                  aria-label={`${isExpanded ? "Collapse" : "Expand"} build details — build ${getStatusLabel(status)}`}
                >
                  <div className="flex items-center gap-2 flex-0">
                    <div
                      aria-hidden="true"
                      className={cn(
                        "hidden group-hover/pr:flex py-1.5 px-[7px] rounded-md flex-shrink-0 mt-0.5 pointer-events-none",
                        EXPAND_INDICATOR_BG[status],
                      )}
                    >
                      {isExpanded ? (
                        <ChevronsDownUp
                          size={14}
                          strokeWidth={2.5}
                          className="text-white"
                        />
                      ) : (
                        <ChevronsUpDown
                          size={14}
                          strokeWidth={2.5}
                          className="text-white"
                        />
                      )}
                    </div>
                    {status === "failed" && (
                      <div className="group-hover/pr:hidden" aria-hidden="true">
                        <svg
                          width="28px"
                          height="28px"
                          viewBox="0 0 44 44"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            fill: "none",
                            verticalAlign: "middle",
                            height: "28px",
                            width: "28px",
                          }}
                          className="fill-none text-red-500"
                        >
                          <path
                            d="M0.655539 25.5327C1.30093 23.4822 1.62362 22.4569 1.62362 22C1.62362 21.543 1.30093 20.5178 0.655551 18.4672C-0.882007 13.5819 0.285241 8.02932 4.15729 4.15727C8.02935 0.285207 13.582 -0.882039 18.4672 0.655531C20.5178 1.30091 21.5431 1.6236 22 1.62361C22.4569 1.62361 23.4822 1.30092 25.5328 0.655538C30.418 -0.882021 35.9706 0.28523 39.8427 4.15728C43.7147 8.02933 44.882 13.5819 43.3444 18.4672C42.6991 20.5178 42.3764 21.543 42.3764 22C42.3764 22.4569 42.6991 23.4822 43.3445 25.5327C44.882 30.418 43.7148 35.9706 39.8427 39.8427C35.9707 43.7148 30.4181 44.882 25.5328 43.3445C23.4822 42.6991 22.4569 42.3764 22 42.3764C21.5431 42.3764 20.5178 42.6991 18.4672 43.3445C13.582 44.882 8.02933 43.7148 4.15727 39.8427C0.2852 35.9707 -0.882043 30.418 0.655539 25.5327Z"
                            fill="currentColor"
                          />
                          <path
                            d="M24.2638 21.983L27.6681 18.5787C28.1106 18.1702 28.1106 17.4894 27.6681 17.0809L26.9191 16.3319C26.5106 15.8894 25.8298 15.8894 25.4213 16.3319L22.017 19.7362L18.5787 16.3319C18.1702 15.8894 17.4894 15.8894 17.0809 16.3319L16.3319 17.0809C15.8894 17.4894 15.8894 18.1702 16.3319 18.5787L19.7362 21.983L16.3319 25.4213C15.8894 25.8298 15.8894 26.5106 16.3319 26.9191L17.0809 27.6681C17.4894 28.1106 18.1702 28.1106 18.5787 27.6681L22.017 24.2638L25.4213 27.6681C25.8298 28.1106 26.5106 28.1106 26.9191 27.6681L27.6681 26.9191C28.1106 26.5106 28.1106 25.8298 27.6681 25.4213L24.2638 21.983Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    )}
                    {status === "running" && (
                      <div
                        className="rounded-full bg-amber-500 p-1 group-hover/pr:hidden"
                        aria-hidden="true"
                      >
                        <Loader2
                          size={16}
                          className="text-white animate-spin"
                        />
                      </div>
                    )}
                    {(status === "passed" || status === "complete") && (
                      <div
                        className="rounded-full bg-green-500 p-1 group-hover/pr:hidden"
                        aria-hidden="true"
                      >
                        <Check
                          size={16}
                          className="text-white"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                    {status === "canceled" && (
                      <div
                        className="rounded-full bg-gray-400 p-1 group-hover/pr:hidden"
                        aria-hidden="true"
                      >
                        <X size={16} className="text-white" />
                      </div>
                    )}
                    {status === "pending" && (
                      <div
                        className="rounded-full bg-gray-300 p-1 group-hover/pr:hidden"
                        aria-hidden="true"
                      >
                        <Clock size={16} className="text-gray-600" />
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-sm/4 text-zinc-900 font-semibold">
                        <span className="hidden sm:inline">{prefix}</span>
                        <span>{buildStats.duration}</span>
                      </div>
                      <div className="text-xs/4 text-zinc-600">
                        {buildStats.summaryText}
                      </div>
                    </div>
                  </div>

                  <div
                    className="h-8 w-px bg-zinc-300 flex-shrink-0"
                    aria-hidden="true"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm/4 font-medium text-zinc-800 truncate mb-0">
                      <span className="hidden sm:inline">
                        Pull Request #{pullRequest.number}:{" "}
                      </span>
                      <span className="sm:hidden">
                        PR #{pullRequest.number}:{" "}
                      </span>
                      {pullRequest.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs/4 text-zinc-600">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">
                          {pullRequest.author.name}
                        </span>
                        <span className="hidden sm:inline">triggered on</span>
                        <span className="sm:hidden">•</span>
                        <span className="truncate">
                          {pullRequest.triggeredAt}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <div
                  className="build-actions flex items-center gap-1 text-sm text-gray-600 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BuildActionsComboButton
                    status={status}
                    onCancelBuild={onCancelBuild}
                    onRestartBuild={onRestartBuild}
                    onRetryFailedJobs={onRetryFailedJobs}
                  />
                </div>
              </div>
            </div>

            {/* Segmented progress bar — hidden while expanded. */}
            {!isExpanded && buildSteps.length > 0 && (
              <div
                className="mt-1.5 cursor-pointer group"
                aria-hidden="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
              >
                <div className="flex gap-[1px] h-1.5 rounded-sm overflow-hidden bg-zinc-100 transition-all">
                  {buildSteps.map((step, index) => {
                    const weight =
                      step.jobs && step.jobs.length > 0 ? step.jobs.length : 1;
                    const widthPercent = (weight / totalProgressWeight) * 100;

                    const bgColor =
                      step.status === "complete"
                        ? "bg-green-500 hover:opacity-100 hover:bg-green-600"
                        : step.status === "in-progress"
                          ? "bg-amber-400/40 hover:opacity-100 hover:bg-amber-600"
                          : step.status === "failed"
                            ? "bg-red-500 hover:bg-red-600 hover:ring-3 ring-blue-500"
                            : "bg-zinc-300 hover:opacity-100 hover:bg-zinc-400";

                    return (
                      <div
                        key={`progress-${step.id}-${index}`}
                        className={`h-full relative overflow-hidden ${bgColor}`}
                        style={{ width: `${widthPercent}%` }}
                        title={`${step.name} - ${getStatusLabel(step.status)}`}
                      >
                        {step.status === "in-progress" && (
                          <div
                            className="absolute inset-0 animate-barber"
                            style={{
                              backgroundImage: `repeating-linear-gradient(
                                  -45deg,
                                  #fbbf24 0px,
                                  #fbbf24 6px,
                                  transparent 6px,
                                  transparent 12px
                                )`,
                              backgroundSize: "200% 200%",
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              id={detailsId}
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {/*
                ──────────────────────────────────────────────────────────────────
                DESIGN ENGINEER TASK
  
                Replace the placeholder div below with an expanded view that helps a
                developer understand what happened in the build, where problems
                occurred, and what they should inspect next.
                
                Notes:
                - The progress bar above is hidden while this region is open.
                - `buildSteps` (in src/data/mockBuildSteps.ts) is the data source.
                - Each BuildStep can contain nested `jobs` (in types/build.ts).
                - Everything inside is yours to structure however you want.
                ──────────────────────────────────────────────────────────────────
                */}

              <div className="border-t border-zinc-200 mt-2 px-3 py-3 space-y-3">
                {/* Failure spotlight — role="alert" announces failures when the section expands. */}
                {failedJobs.length > 0 && (
                  <div
                    className="failure-spotlight cursor-auto rounded-md bg-red-50 border border-red-200 px-3 py-2.5"
                    role="alert"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1.5">
                      {failedJobs.length === 1
                        ? "1 failure"
                        : `${failedJobs.length} failures`}
                    </p>
                    <ul className="space-y-0.5" >
                      {failedJobs.map((job) => (
                        <li key={job.id}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: navigate to job logs for job.id
                            }}
                            aria-label={
                              job.exitCode !== null
                                ? `View logs for ${job.name}, exit code ${job.exitCode}`
                                : `View logs for ${job.name}`
                            }
                            className="failure-spotlight group w-full flex items-center gap-2 text-sm text-left cursor-pointer rounded hover:bg-red-100 focus-visible:bg-red-100 focus-visible:outline-none -mx-1 px-1 py-0.5 transition-colors"
                          >
                            <X
                              size={13}
                              strokeWidth={2.5}
                              className="text-red-500 flex-shrink-0"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-red-900">
                              {job.name}
                            </span>
                            {job.command && (
                              <code className="text-xs text-red-400 font-mono">
                                {job.command}
                              </code>
                            )}
                            {job.exitCode !== null && (
                              <code className="text-xs text-red-600 bg-red-100 group-hover:bg-red-200 px-1.5 py-0.5 rounded font-mono">
                                exit {job.exitCode}
                              </code>
                            )}
                            <span className="text-xs text-red-600 ml-auto">
                              {job.duration}
                            </span>
                            <ExternalLink
                              size={12}
                              aria-hidden="true"
                              className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 text-red-400 group-hover:text-red-700 transition flex-shrink-0"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pipeline steps — role="list" + aria-label for screen readers;
                      status icons are aria-hidden with sr-only text alternatives. */}
                <ul
                  className="space-y-0.5"
                  role="list"
                  aria-label="Pipeline steps"
                >
                  {buildSteps.map((step) => {
                    const isPending = step.status === "pending";
                    const isFailed = step.status === "failed";
                    const isComplete = step.status === "complete";
                    const isRunning = step.status === "in-progress";

                    return (
                      <li key={step.id}>
                        <div
                          className={`flex items-center gap-2 px-1.5 py-1 rounded-sm ${isPending ? "opacity-40" : ""}`}
                        >
                          <span
                            className="flex-shrink-0 w-4 flex items-center justify-center"
                            aria-hidden="true"
                          >
                            {isComplete && (
                              <Check
                                size={13}
                                strokeWidth={3}
                                className="text-green-500"
                              />
                            )}
                            {isFailed && (
                              <X
                                size={13}
                                strokeWidth={2.5}
                                className="text-red-500"
                              />
                            )}
                            {isPending && (
                              <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-300" />
                            )}
                            {isRunning && (
                              <Loader2
                                size={13}
                                className="text-amber-500 animate-spin"
                              />
                            )}
                          </span>
                          <span className="sr-only">
                            {getStatusLabel(step.status)}
                          </span>

                          <span
                            className={`text-sm font-medium ${
                              isFailed
                                ? "text-red-700"
                                : isPending
                                  ? "text-zinc-400"
                                  : "text-zinc-700"
                            }`}
                          >
                            {step.name}
                          </span>

                          {step.duration && step.duration !== "--" && (
                            <span className="text-xs text-zinc-400">
                              {step.duration}
                            </span>
                          )}

                          {isPending && firstFailedStep && (
                            <span
                              className="text-xs text-zinc-400 italic"
                              title={`Blocked by ${firstFailedStep.name}`}
                            >
                              blocked by {firstFailedStep.name}
                            </span>
                          )}
                        </div>

                        {/* Inline job pills for matrix / parallel steps */}
                        {step.jobs && step.jobs.length > 0 && (
                          <ul
                            className="ml-6 mt-0.5 mb-1 flex flex-wrap gap-1.5"
                            role="list"
                            aria-label={`${step.name} jobs`}
                          >
                            {step.jobs.map((job) => (
                              <li key={job.id}>
                                <JobPill
                                  name={job.name}
                                  status={job.status}
                                  exitCode={job.exitCode}
                                  onClick={() => {
                                    // TODO: navigate to job logs for job.id
                                  }}
                                />
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildHeader;
