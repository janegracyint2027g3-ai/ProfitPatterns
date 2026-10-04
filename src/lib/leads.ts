import { z } from "zod";

export const LEAD_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "IN_PROGRESS",
  "CONVERTED",
  "CLOSED",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_CTA_TYPES = ["WHATSAPP", "QUICK_FORM", "LONG_FORM", "CHATBOT"] as const;
export type LeadCtaType = (typeof LEAD_CTA_TYPES)[number];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  jobTitle?: string | null;
  industry?: string | null;
  companySize?: string | null;
  requirement?: string | null;
  challenge?: string | null;
  desiredOutcome?: string | null;
  source?: string | null;
  ctaType: LeadCtaType;
  page?: string | null;
  status: LeadStatus;
  createdAt: string;
}

const trimmed = (max: number) => z.string().trim().max(max);

export const PRIMARY_CHALLENGES = [
  "AI Strategy",
  "Business Automation",
  "Process Optimization",
  "Revenue Growth",
  "Cost Reduction",
  "Data & Analytics",
  "Digital Transformation",
  "Other",
] as const;

export const COMPANY_SIZES = [
  "1–10",
  "11–50",
  "51–200",
  "201–1000",
  "1000+",
] as const;

export const PROJECT_SCOPES = [
  "Exploratory conversation",
  "Assessment or diagnostic",
  "Defined project",
  "Ongoing advisory",
  "Not sure yet",
] as const;

export const BUDGET_RANGES = [
  "Not defined yet",
  "Under $10k",
  "$10k – $25k",
  "$25k – $50k",
  "$50k – $100k",
  "$100k+",
] as const;

export const CONTACT_TIMES = ["Morning", "Afternoon", "Evening", "Any time"] as const;

export const AI_USAGE_LEVELS = [
  "None yet",
  "Experimenting informally",
  "A few tools in production",
  "Widely adopted",
] as const;

/** Honeypot field shared by both forms — real users never fill it. */
export const honeypotSchema = z.object({
  companyWebsiteHp: z.string().max(0, { message: "Submission rejected." }).optional(),
});

/** Optional browser-resolved intelligence metadata forwarded from client */
export const intelligenceMetaSchema = z.object({
  session_id: z.string().optional(),
  visitor_id: z.string().optional(),
  geo_country: z.string().optional(),
  geo_city: z.string().optional(),
  geo_region: z.string().optional(),
  geo_continent: z.string().optional(),
  geo_currency: z.string().optional(),
  geo_market_tier: z.string().optional(),
  timezone_iana: z.string().optional(),
  timezone_utc_offset: z.string().optional(),
  timezone_day_phase: z.string().optional(),
  timezone_local_time: z.string().optional(),
  traffic_source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  referrer_url: z.string().optional(),
  channel_roi_score: z.string().optional(),
  first_touch_attribution: z.string().optional(),
  funnel_stage: z.string().optional(),
  user_intent: z.string().optional(),
  bounce_risk: z.string().optional(),
  session_dwell_seconds: z.number().optional(),
  page_dwell_seconds: z.number().optional(),
  interaction_count: z.number().optional(),
  scroll_depth: z.number().optional(),
  is_returning_visitor: z.boolean().optional(),
  ip_network_type: z.string().optional(),
  ip_fraud_risk_score: z.string().optional(),
  ip_fraud_status: z.string().optional(),
  ip_visit_velocity: z.number().optional(),
  ip_corporate_intent: z.string().optional(),
  security_tier: z.string().optional(),
  predictive_synergy_score: z.string().optional(),
  urgency_score: z.string().optional(),
  enterprise_priority_level: z.string().optional(),
  tailored_strategy: z.string().optional(),
}).optional();
export type IntelligenceMeta = z.infer<typeof intelligenceMetaSchema>;

export const quickLeadSchema = honeypotSchema.extend({
  name: trimmed(100).min(2, { message: "Please enter your name." }),
  email: trimmed(255).email({ message: "Please enter a valid email address." }),
  phone: trimmed(30).min(4, { message: "Please enter a valid phone number." }).optional().or(z.literal("")),
  company: trimmed(120).min(2, { message: "Please enter your company." }),
  requirement: trimmed(120).min(1, { message: "Please choose what you need help with." }),
  message: trimmed(1500).min(3, { message: "Please add a brief message (at least 3 characters)." }),
  page: trimmed(200).optional(),
  source: trimmed(120).optional(),
  intelligenceMeta: intelligenceMetaSchema,
});
export type QuickLeadInput = z.infer<typeof quickLeadSchema>;

export const consultationLeadSchema = honeypotSchema.extend({
  fullName: trimmed(100).min(2, { message: "Please enter your full name." }),
  workEmail: trimmed(255).email({ message: "Please enter a valid work email." }),
  phone: trimmed(30).min(4, { message: "Please enter a valid phone number." }).optional().or(z.literal("")),
  company: trimmed(120).min(2, { message: "Please enter your company." }),
  jobTitle: trimmed(120).min(2, { message: "Please enter your job title." }),
  industry: trimmed(120).min(2, { message: "Please enter your industry." }),
  companySize: trimmed(40).min(1, { message: "Please select a company size." }),
  website: trimmed(200).optional().or(z.literal("")),
  primaryChallenge: trimmed(80).min(1, { message: "Please select a primary challenge." }),
  currentChallenge: trimmed(2000).min(5, {
    message: "Please describe the challenge in a little more detail (5+ characters).",
  }),
  desiredOutcome: trimmed(2000).optional().or(z.literal("")),
  currentTools: trimmed(500).optional().or(z.literal("")),
  existingAIUsage: trimmed(80).optional().or(z.literal("")),
  projectScope: trimmed(80).min(1, { message: "Please select a scope." }),
  budgetRange: trimmed(80).optional().or(z.literal("")),
  preferredContactTime: trimmed(40).optional().or(z.literal("")),
  page: trimmed(200).optional(),
  source: trimmed(120).optional(),
  intelligenceMeta: intelligenceMetaSchema,
});
export type ConsultationLeadInput = z.infer<typeof consultationLeadSchema>;

export const chatLeadSchema = honeypotSchema.extend({
  name: trimmed(100).min(2, { message: "Please enter your name." }),
  email: trimmed(255).email({ message: "Please enter a valid email address." }),
  phone: trimmed(30).min(4, { message: "Please enter a valid phone number." }).optional().or(z.literal("")),
  company: trimmed(120).min(2, { message: "Please enter your company." }),
  businessProblem: trimmed(2000).min(3, { message: "Please describe the problem briefly." }),
  intent: trimmed(120).optional(),
  page: trimmed(200).optional(),
  intelligenceMeta: intelligenceMetaSchema,
});
export type ChatLeadInput = z.infer<typeof chatLeadSchema>;

export const AUDIT_DOC_TYPES = [
  "Standard Operating Procedure (SOP)",
  "Process Workflow Diagram / Map",
  "Operational Data / Metrics Spreadsheet",
  "Technical Spec / Architecture Document",
  "Project Scope / RFP Document",
  "Other Process Documentation",
] as const;

export const ESTIMATED_WEEKLY_HOURS = [
  "1 – 5 hours / week",
  "5 – 15 hours / week",
  "15 – 40 hours / week",
  "40+ hours / week (team-wide)",
] as const;

export const AUDIT_PRIMARY_GOALS = [
  "Identify High-ROI Automation Opportunities",
  "Eliminate Manual Data Entry & Human Bottlenecks",
  "Evaluate Custom AI / LLM Feasibility",
  "Accelerate Turnaround Time for Customers",
  "Formulate Clear 12-Month Automation Roadmap",
] as const;

export const uploadedFileSchema = z.object({
  name: z.string().max(255),
  size: z.number().max(30 * 1024 * 1024),
  type: z.string().max(100),
  category: z.string().optional(),
});
export type UploadedFileInfo = z.infer<typeof uploadedFileSchema>;

export const auditLeadSchema = honeypotSchema.extend({
  fullName: trimmed(100).min(2, { message: "Please enter your full name." }),
  workEmail: trimmed(255).email({ message: "Please enter a valid work email." }),
  phone: trimmed(30).optional().or(z.literal("")),
  company: trimmed(120).optional().or(z.literal("")),
  jobTitle: trimmed(120).optional().or(z.literal("")),
  industry: trimmed(120).optional().or(z.literal("")),
  docType: trimmed(120).default("Process Workflow Diagram / Map"),
  weeklyHoursSpent: trimmed(60).default("15 – 40 hours / week"),
  primaryGoal: trimmed(120).default("Identify High-ROI Automation Opportunities"),
  processSummary: trimmed(3000).optional().or(z.literal("")),
  files: z.array(uploadedFileSchema).min(1, {
    message: "Please attach at least one document for audit.",
  }),
  ndaRequested: z.boolean().default(true),
  page: trimmed(200).optional(),
  source: trimmed(120).optional(),
  intelligenceMeta: intelligenceMetaSchema,
});
export type AuditLeadInput = z.infer<typeof auditLeadSchema>;

export type LeadSubmitResult = { ok: true; id: string } | { ok: false; error: string };

