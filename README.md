# C40 · Lifecycle Interceptors and Execution Audit

Projects local canonical event fixtures into an audit table. It cannot veto a tool after execution. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Events are observations, not veto hooks
- Canonical event auditing
- Checkpoint only after durable append

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3040`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3040
```

## How the app was build

### 1. Stop checkpoint advancement after a failed append

The authored persistence failure returns incomplete with a null checkpoint. Treating it as success would risk losing an observation on the next recovery.

Source: [src/lesson.ts](src/lesson.ts#L13)

```typescript
if (flag(input, "appendFails"))
  return report(
    "incomplete",
    "Audit persistence failed; checkpoint did not advance",
    { rows: 0, checkpoint: null },
    ["Attempt append", "Surface failure before marking handled"],
  );
```

### 2. Project redacted canonical observations

The projection deduplicates event labels and stores redacted input values. canVetoCompletedTool is false: an audit observation after execution is not a retroactive permission gate.

Source: [src/lesson.ts](src/lesson.ts#L14) · selected statements

```typescript
const rows = unique(list(input, "events").map(String)).map((kind, index) => ({
  eventId: `audit-${kind}`,
  sequence: index,
  type: kind,
  inputValues: "redacted",
}));

return report(
  "passed",
  "Recorded canonical observations without inventing a post-execution veto",
  { rows: rows.length, audit: rows, canVetoCompletedTool: false },
  [
    "Project canonical event fields",
    "Deduplicate by session and event",
    "Append before checkpoint advancement",
  ],
);
```

### Check your understanding

Run **Audit repeated result delivery** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "events": [
      "call",
      "confirmation",
      "result",
      "result"
    ],
    "appendFails": false
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "rows": 3
  }
}
```

Then try **Do not advance on storage failure**. Its expected outcome is `incomplete`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
