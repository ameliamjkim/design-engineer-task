import BuildHeader from "@/components/BuildHeader";
import PageSkeleton from "@/components/PageSkeleton";
import { mockBuildSteps } from "@/data/mockBuildSteps";

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <BuildHeader
        pipelineName="api-backend"
        buildNumber="17532"
        branch="main"
        pullRequest={{
          number: 4821,
          title: "Harden auth token validation for Node 20",
          triggeredAt: "Today at 1:49 PM",
          author: { name: "Alex Rivera" },
        }}
        buildSteps={mockBuildSteps}
        status="failed"
        onRetryFailedJobs={() => console.log("Retrying failed jobs…")}
        onRestartBuild={() => console.log("Rebuilding…")}
        onCancelBuild={() => console.log("Canceling build…")}
      />
      <PageSkeleton />
    </div>
  );
}

export default App;
