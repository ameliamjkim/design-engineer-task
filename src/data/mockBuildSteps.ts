import type { BuildStep } from "@/types/build";

/**
 * Primary dataset for the expanded-region task.
 *
 * Six pipeline steps (checkout → deploy). Steps 2–4 contain nested `jobs`.
 * The build fails at "Test (Node 18)" — downstream steps stay pending.
 */
export const mockBuildSteps: BuildStep[] = [
  {
    id: "checkout",
    name: "Checkout",
    type: "command",
    status: "complete",
    command: "git checkout",
    agent: "ubuntu-latest",
    queue: "default",
    duration: "4s",
    startTime: "10:45:30",
    state: "normal",
    exitCode: 0,
  },
  {
    id: "deps",
    name: "Dependencies",
    type: "parallel",
    status: "complete",
    duration: "45s",
    startTime: "10:45:34",
    jobs: [
      {
        id: "deps-npm",
        name: "NPM",
        status: "complete",
        command: "npm ci",
        agent: "ubuntu-latest",
        queue: "default",
        duration: "45s",
        startTime: "10:45:34",
        state: "normal",
        exitCode: 0,
      },
      {
        id: "deps-pip",
        name: "pip",
        status: "complete",
        command: "pip install",
        agent: "ubuntu-latest",
        queue: "default",
        duration: "30s",
        startTime: "10:45:34",
        state: "normal",
        exitCode: 0,
      },
    ],
  },
  {
    id: "lint",
    name: "Lint",
    type: "parallel",
    status: "complete",
    duration: "13s",
    startTime: "10:46:04",
    jobs: [
      {
        id: "lint-js",
        name: "Lint JS",
        status: "complete",
        command: "npm run lint",
        agent: "ubuntu-latest",
        queue: "default",
        duration: "8s",
        startTime: "10:46:04",
        state: "normal",
        exitCode: 0,
      },
      {
        id: "lint-py",
        name: "Lint Python",
        status: "complete",
        command: "flake8",
        agent: "ubuntu-latest",
        queue: "default",
        duration: "5s",
        startTime: "10:46:04",
        state: "normal",
        exitCode: 0,
      },
    ],
  },
  {
    id: "test-matrix",
    name: "Test matrix",
    type: "matrix",
    status: "failed",
    duration: "1m 20s",
    startTime: "10:46:19",
    jobs: [
      {
        id: "test-node16",
        name: "Test (Node 16)",
        status: "complete",
        command: "npm test",
        agent: "ubuntu-latest",
        queue: "default",
        duration: "1m 20s",
        startTime: "10:46:19",
        state: "normal",
        exitCode: 0,
      },
      {
        id: "test-node18",
        name: "Test (Node 18)",
        status: "failed",
        command: "npm test",
        agent: "ubuntu-latest",
        queue: "default",
        duration: "1m 12s",
        startTime: "10:46:19",
        state: "normal",
        exitCode: 1,
        logExcerpt: `FAIL src/example.test.ts
  ● Example suite › example test case

    expect(received).toEqual(expected) // deep equality

    Expected: "expected value"
    Received: "actual value"

      10 |   it("example test case", () => {
      11 |     const result = doSomething();
    > 12 |     expect(result).toEqual("expected value");
         |                    ^
      13 |   });

      at Object.<anonymous> (src/example.test.ts:12:20)
      at processTicksAndRejections (node:internal/process/task_queues:95:5)

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 27 passed, 28 total
Time:        6.214 s`,
      },
      {
        id: "test-node20",
        name: "Test (Node 20)",
        status: "pending",
        command: "npm test",
        agent: "ubuntu-latest",
        queue: "default",
        duration: "--",
        startTime: "--",
        state: "pending",
        exitCode: null,
      },
    ],
  },
  {
    id: "bundle",
    name: "Bundle",
    type: "command",
    status: "pending",
    command: "npm run build",
    agent: "ubuntu-latest",
    queue: "default",
    duration: "--",
    startTime: "--",
    state: "pending",
    exitCode: null,
  },
  {
    id: "deploy",
    name: "Deploy",
    type: "command",
    status: "pending",
    command: "deploy.sh",
    agent: "ubuntu-latest",
    queue: "default",
    duration: "--",
    startTime: "--",
    state: "pending",
    exitCode: null,
  },
];
