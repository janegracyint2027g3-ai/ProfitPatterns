// api/_jira.js
// Self-contained Jira Integration Helper for Vercel Serverless Functions

const DEFAULT_BASE_URL = "https://trustworkz.atlassian.net";
const DEFAULT_EMAIL = "janegracy.int2027g3@gmail.com";
const DEFAULT_API_TOKEN =
  "ATATT3xFfGF0kSxqsxW2VQB1HDoEK2a7Imd9ORnLk648J2sekIcpmqhL38amLPZHtYngemmMU3tCpbe3IykSL5dsvoNCDZot9vAtITRX7UBDJ_isvP2f0z_gZCu48PPy9tK_2YvwVomoY9h9REsDQVO0r97T_geEW6fH2sJji1r7djRFmlCPTjg=E5CC331B";
const DEFAULT_PROJECT_KEY = "DI";
const JANE_GRACY_ACCOUNT_ID = "712020:4a35214c-ba12-4524-a70a-699fdcfafb65";
const ACTIVE_SPRINT_ID = "35";

// In-memory deduplication cache: key -> { key: string, timestamp: number }
const recentLeads = new Map();

export function getJiraConfig() {
  const baseUrl = (
    process.env.JIRA_BASE_URL ||
    process.env.VITE_JIRA_BASE_URL ||
    DEFAULT_BASE_URL
  ).replace(/\/+$/, "");
  const email =
    process.env.JIRA_EMAIL ||
    process.env.VITE_JIRA_EMAIL ||
    DEFAULT_EMAIL;
  const apiToken =
    process.env.JIRA_API_TOKEN ||
    process.env.VITE_JIRA_API_TOKEN ||
    DEFAULT_API_TOKEN;
  const projectKey =
    process.env.JIRA_PROJECT_KEY ||
    process.env.VITE_JIRA_PROJECT_KEY ||
    DEFAULT_PROJECT_KEY;

  return { baseUrl, email, apiToken, projectKey };
}

function getAuthHeader() {
  const cfg = getJiraConfig();
  const creds = `${cfg.email}:${cfg.apiToken}`;
  return `Basic ${Buffer.from(creds).toString("base64")}`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function textDoc(text) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: String(text || "—") }],
      },
    ],
  };
}

async function jiraPost(endpoint, body) {
  const cfg = getJiraConfig();
  try {
    const res = await fetch(`${cfg.baseUrl}/rest/api/3/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!res.ok) {
      console.error(`Jira API error [${res.status}]:`, text.slice(0, 500));
      return { ok: false, error: `Jira API returned ${res.status}: ${text.slice(0, 200)}`, status: res.status };
    }

    return { ok: true, data };
  } catch (err) {
    console.error("Jira network error:", err);
    return { ok: false, error: String(err) };
  }
}

async function addToActiveSprint(issueKey) {
  try {
    const cfg = getJiraConfig();
    const auth = getAuthHeader();
    const sprintId = process.env.JIRA_SPRINT_ID || ACTIVE_SPRINT_ID;
    const res = await fetch(`${cfg.baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue`, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ issues: [issueKey] }),
    });
    if (res.ok) {
      console.log(`📌 Moved ${issueKey} from Backlog to Active Sprint ${sprintId} (DI Board)`);
    } else {
      const errText = await res.text();
      console.warn(`Sprint assignment notice for ${issueKey}:`, errText.slice(0, 200));
    }
  } catch (err) {
    console.warn("Could not add to active sprint:", err);
  }
}

async function createIssue(summary, description, issueType, parentKey) {
  const cfg = getJiraConfig();
  const fields = {
    project: { key: cfg.projectKey },
    summary: summary.slice(0, 250),
    description,
    issuetype: { name: issueType === "Subtask" ? "Subtask" : "Task" },
    assignee: { accountId: JANE_GRACY_ACCOUNT_ID },
  };

  if (issueType === "Subtask" && parentKey) {
    fields["parent"] = { key: parentKey };
  }

  // Attempt creation with Jane Gracy assigned
  let result = await jiraPost("issue", { fields });

  // If assignee fails due to permissions, fallback to unassigned
  if (!result.ok && result.error && result.error.includes("assignee")) {
    console.warn("Assignee field rejected, retrying without assignee...");
    delete fields.assignee;
    result = await jiraPost("issue", { fields });
  }

  if (!result.ok || !result.data) {
    return { ok: false, error: result.error || "Failed to create issue" };
  }

  const data = result.data;

  // Move parent lead task from backlog into active sprint board
  if (issueType === "Task") {
    await addToActiveSprint(data.key);
  }

  return {
    ok: true,
    key: data.key,
    url: `${cfg.baseUrl}/browse/${data.key}`,
  };
}

export async function createJiraLeadTask(p) {
  const leadName = p.name || p.fullName || "Inbound Lead";
  const leadEmail = (p.email || p.workEmail || "").toLowerCase();
  const leadType = p.leadType || (p.docType ? "Process Audit" : p.workEmail ? "Consultation" : "Quick Form");

  // Deduplication check: 15 second window
  const dedupKey = `${leadEmail}_${leadType}`;
  const now = Date.now();
  const cached = recentLeads.get(dedupKey);
  if (cached && now - cached.timestamp < 15000) {
    console.log(`⚡ Deduplication hit: returning existing Jira key ${cached.key} for ${dedupKey}`);
    return { ok: true, parentIssueKey: cached.key, deduplicated: true };
  }

  const dateStr = formatDate();
  const emoji =
    leadType === "Quick Form"
      ? "⚡"
      : leadType === "Consultation"
      ? "🤝"
      : leadType === "Process Audit"
      ? "🔍"
      : "🤖";

  const parentSummary = `${emoji} [${leadType}] ${leadName} — ${dateStr}`;

  // 1. Parent Task Description
  const parentDesc = textDoc(
    `📊 LEAD OVERVIEW\n` +
      `Lead Type: ${leadType}\n` +
      `Contact Name: ${leadName}\n` +
      `Email: ${leadEmail || "—"}\n` +
      `Phone: ${p.phone || "—"}\n` +
      `Company: ${p.company || "—"}\n` +
      `Job Title: ${p.jobTitle || "—"}\n` +
      `Source Page: ${p.pageUrl || p.page_url || "—"}\n` +
      `Submitted: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\n\n` +
      `Sub-tasks below contain Contact Information, Detailed Requirements, and Follow-up Actions.`
  );

  // 2. Create Parent Task
  const parent = await createIssue(parentSummary, parentDesc, "Task");
  if (!parent.ok || !parent.key) {
    console.error("❌ Failed to create Jira parent task:", parent.error);
    return { ok: false, error: parent.error };
  }

  // Cache for deduplication
  recentLeads.set(dedupKey, { key: parent.key, timestamp: now });

  // 3. Sub-task 1: Contact Information
  const contactDesc = textDoc(
    `📋 CONTACT INFORMATION\n\n` +
      `Full Name: ${leadName}\n` +
      `Email: ${leadEmail || "—"}\n` +
      `Phone: ${p.phone || "—"}\n` +
      `Company: ${p.company || "—"}\n` +
      `Job Title: ${p.jobTitle || "—"}\n` +
      `Industry: ${p.industry || "—"}\n` +
      `Company Size: ${p.companySize || "—"}\n` +
      `Website: ${p.website || "—"}\n` +
      `Preferred Contact Time: ${p.preferredContactTime || "—"}`
  );

  // 4. Sub-task 2: Requirement & Context
  const reqDesc = textDoc(
    `📝 REQUIREMENT & BUSINESS CONTEXT\n\n` +
      `Requirement: ${p.requirement || p.primaryChallenge || p.primaryGoal || "—"}\n` +
      `Challenge / Message: ${p.challenge || p.currentChallenge || p.message || p.processSummary || "—"}\n` +
      `Desired Outcome: ${p.desiredOutcome || p.desired_outcome || "—"}\n` +
      `Current Tools: ${p.currentTools || "—"}\n` +
      `Existing AI Usage: ${p.existingAIUsage || "—"}\n` +
      `Project Scope: ${p.projectScope || "—"}\n` +
      `Budget Range: ${p.budgetRange || "—"}\n` +
      `Audit Doc Type: ${p.docType || p.auditDocType || "—"}\n` +
      `Weekly Hours Spent: ${p.weeklyHoursSpent || "—"}`
  );

  // 5. Sub-task 3: Follow-up Actions
  const actionList =
    leadType === "Process Audit"
      ? "1. Review uploaded documents\n2. Prepare Process Feasibility Audit Dossier\n3. Schedule discovery consultation\n4. Dispatch mutual NDA"
      : leadType === "Consultation"
      ? "1. Review consultation brief & requirements\n2. Qualify budget, timeline & scope\n3. Schedule executive strategy session\n4. Prepare engagement proposal"
      : leadType === "Chatbot"
      ? "1. Review assistant conversation history\n2. Contact lead within 24 hours\n3. Route to relevant domain specialist"
      : "1. Respond within 2 business hours\n2. Confirm requirement details\n3. Schedule introductory discussion";

  const followUpDesc = textDoc(
    `✅ FOLLOW-UP ACTION CHECKLIST\n\n` +
      `Lead: ${leadName} (${leadEmail})\n` +
      `Form Type: ${leadType}\n\n` +
      `Action Steps:\n${actionList}`
  );

  const subTasks = [
  {
    summary: `01 — Contact Information — ${leadName}`,
    desc: textDoc(
      `CONTACT INFORMATION\n\n` +
      `Full Name: ${leadName}\n` +
      `Email: ${leadEmail || "—"}\n` +
      `Phone: ${p.phone || "—"}`
    ),
  },

  {
    summary: `02 — Company & Business Profile — ${leadName}`,
    desc: textDoc(
      `COMPANY & BUSINESS PROFILE\n\n` +
      `Company: ${p.company || "—"}\n` +
      `Job Title: ${p.jobTitle || "—"}\n` +
      `Industry: ${p.industry || "—"}\n` +
      `Company Size: ${p.companySize || "—"}\n` +
      `Website: ${p.website || "—"}`
    ),
  },

  {
    summary: `03 — Requirement — ${leadName}`,
    desc: textDoc(
      `REQUIREMENT\n\n` +
      `Requirement: ${
        p.requirement ||
        p.primaryChallenge ||
        p.primaryGoal ||
        "—"
      }`
    ),
  },

  {
    summary: `04 — Business Challenge — ${leadName}`,
    desc: textDoc(
      `BUSINESS CHALLENGE\n\n` +
      `Challenge:\n${
        p.challenge ||
        p.currentChallenge ||
        p.message ||
        p.processSummary ||
        "—"
      }`
    ),
  },

  {
    summary: `05 — Desired Outcome — ${leadName}`,
    desc: textDoc(
      `DESIRED OUTCOME\n\n` +
      `${p.desiredOutcome || p.desired_outcome || "Not provided"}`
    ),
  },

  {
    summary: `06 — Current Tools & Technology — ${leadName}`,
    desc: textDoc(
      `CURRENT TOOLS & TECHNOLOGY\n\n` +
      `Current Tools:\n${p.currentTools || "Not provided"}`
    ),
  },

  {
    summary: `07 — AI Usage & Maturity — ${leadName}`,
    desc: textDoc(
      `AI USAGE & MATURITY\n\n` +
      `Existing AI Usage: ${p.existingAIUsage || "Not provided"}`
    ),
  },

  {
    summary: `08 — Project Scope — ${leadName}`,
    desc: textDoc(
      `PROJECT SCOPE\n\n` +
      `Project Scope: ${p.projectScope || "Not provided"}`
    ),
  },

  {
    summary: `09 — Budget & Commercial Qualification — ${leadName}`,
    desc: textDoc(
      `BUDGET & COMMERCIAL QUALIFICATION\n\n` +
      `Budget Range: ${p.budgetRange || "Not provided"}\n` +
      `Preferred Contact Time: ${p.preferredContactTime || "Not provided"}`
    ),
  },

  {
    summary: `10 — Source & Website Context — ${leadName}`,
    desc: textDoc(
      `SOURCE & WEBSITE CONTEXT\n\n` +
      `Lead Type: ${leadType}\n` +
      `Source Page: ${p.pageUrl || p.page_url || "—"}\n` +
      `Lead Source: ${p.lead_source || p.source || "Website"}`
    ),
  },

  {
    summary: `11 — Lead Qualification — ${leadName}`,
    desc: textDoc(
      `LEAD QUALIFICATION\n\n` +
      `Status: New\n` +
      `Lead Type: ${leadType}\n` +
      `Requirement: ${
        p.requirement ||
        p.primaryChallenge ||
        p.primaryGoal ||
        "—"
      }\n` +
      `Company: ${p.company || "—"}`
    ),
  },

  {
    summary: `12 — Follow-up Actions — ${leadName}`,
    desc: textDoc(
      `FOLLOW-UP ACTIONS\n\n` +
      `1. Review lead information\n` +
      `2. Contact lead within 24 hours\n` +
      `3. Confirm requirements\n` +
      `4. Schedule discovery / consultation`
    ),
  },

  {
    summary: `13 — Opportunity & Conversion — ${leadName}`,
    desc: textDoc(
      `OPPORTUNITY & CONVERSION\n\n` +
      `Evaluate:\n` +
      `• Business opportunity\n` +
      `• Potential engagement\n` +
      `• Commercial fit\n` +
      `• Next-step proposal\n\n` +
      `Conversion: Pending`
    ),
  },
];

  if (leadType === "Process Audit" || p.filesCount || p.fileName) {
    const docDesc = textDoc(
      `📁 NDA & ATTACHED DOCUMENTS\n\n` +
        `NDA Requested: ${p.ndaRequested ? "✅ Yes (Mutual NDA required)" : "❌ No"}\n` +
        `Files Count: ${p.filesCount || (p.fileName ? 1 : 0)}\n` +
        `File Name: ${p.fileName || p.filesList || "—"}\n` +
        `Reference ID: ${p.referenceId || "—"}\n` +
        `Document Type: ${p.docType || "—"}`
    );
    subTasks.push({ summary: `📁 NDA & Documents — ${leadName}`, desc: docDesc });
  }

  // Create sub-tasks in parallel
  const subTaskResults = await Promise.all(
    subTasks.map((st) => createIssue(st.summary, st.desc, "Subtask", parent.key))
  );

  const subTaskKeys = subTaskResults.filter((r) => r.ok && r.key).map((r) => r.key);

  console.log(`✅ Jira Lead Created: ${parent.key} with sub-tasks: [${subTaskKeys.join(", ")}]`);

  return {
    ok: true,
    parentIssueKey: parent.key,
    parentIssueUrl: parent.url,
    subTaskKeys,
  };
}
