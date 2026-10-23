import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 40,
  title: "Lifecycle Interceptors and Execution Audit",
  description: "A production host needs to explain what happened during an agent session: which tools were requested, what permissions were evaluated, what usage was observed, and why execution stopped. The supplied lesson calls this a lifecycle interceptor.",
  concepts: ["Events are observations, not veto hooks", "Canonical event auditing", "Checkpoint only after durable append"],
  scope: "Projects local canonical event fixtures into an audit table. It cannot veto a tool after execution. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Audit repeated result delivery", "input": {"events": ["call", "confirmation", "result", "result"], "appendFails": false}, "expected": "passed", "checks": {"rows": 3}}, {"id": "1", "label": "Do not advance on storage failure", "input": {"events": ["call", "confirmation", "result"], "appendFails": true}, "expected": "incomplete", "checks": {"rows": 0}}],
  async run(input) {

if(flag(input,"appendFails"))return report("incomplete","Audit persistence failed; checkpoint did not advance",{rows:0,checkpoint:null},["Attempt append","Surface failure before marking handled"]);
const rows=unique(list(input,"events").map(String)).map((kind,index)=>({eventId:`audit-${kind}`,sequence:index,type:kind,inputValues:"redacted"}));
return report("passed","Recorded canonical observations without inventing a post-execution veto",{rows:rows.length,audit:rows,canVetoCompletedTool:false},["Project canonical event fields","Deduplicate by session and event","Append before checkpoint advancement"]);

  }
};
