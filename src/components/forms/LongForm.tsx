import { CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { track } from "@/lib/analytics";
import {
  BUDGET_RANGES,
  COMPANY_SIZES,
  PRIMARY_CHALLENGES,
  PROJECT_SCOPES,
  consultationLeadSchema,
} from "@/lib/leads";
import { submitConsultationLead } from "@/lib/leads.functions";
import { trackLead } from "@/utils/analytics";

const EMPTY = {
  fullName: "",
  workEmail: "",
  phone: "",
  company: "",
  jobTitle: "",
  industry: "",
  companySize: "",
  website: "",
  primaryChallenge: "",
  currentChallenge: "",
  desiredOutcome: "",
  currentTools: "",
  existingAIUsage: "",
  projectScope: "",
  budgetRange: "",
  preferredContactTime: "Any time",
};

type Field = keyof typeof EMPTY;
type Errors = Partial<Record<Field | "form", string>>;

export function LongForm({ source = "long_form" }: { source?: string }) {
  const [values, setValues] = useState(EMPTY);
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const submitting = useRef(false);

  useEffect(() => {
    track("long_form_open", { source });
  }, [source]);

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      delete next.form;
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    const page = typeof window !== "undefined" ? window.location.pathname : "/";
    const parsed = consultationLeadSchema.safeParse({
      ...values,
      companyWebsiteHp: hp,
      page,
      source,
    });

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (key === "companyWebsiteHp") {
          next.form = "Anti-spam triggered. Please try submitting again.";
        } else if (key && !next[key as Field]) {
          next[key as Field] = issue.message;
        }
      }
      setErrors(next);
      const firstKey = parsed.error.issues[0]?.path[0];
      if (typeof firstKey === "string" && firstKey !== "companyWebsiteHp") {
        document.getElementById(`lf-${firstKey}`)?.focus();
      }
      return;
    }

    submitting.current = true;
    setStatus("loading");
    track("long_form_submit", { source });

    // Explicitly record consultation lead
    trackLead({
      fullName: parsed.data.fullName,
      workEmail: parsed.data.workEmail,
      phone: parsed.data.phone || "",
      company: parsed.data.company || "",
      jobTitle: parsed.data.jobTitle || "",
      industry: parsed.data.industry || "",
      requirement: parsed.data.primaryChallenge || "",
      challenge: parsed.data.currentChallenge || "",
      desired_outcome: parsed.data.desiredOutcome || "",
      form_name: "Consultation Request Form",
      source: source || "long_form",
    });

    try {
      const serverResult = await submitConsultationLead({ data: parsed.data });
      if (!serverResult?.ok) {
        throw new Error("Server action returned not ok");
      }
    } catch (e) {
      console.warn("Direct lead fallback notice:", e);
      try {
        await fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadType: "Consultation",
            name: parsed.data.fullName,
            email: parsed.data.workEmail,
            phone: parsed.data.phone || "",
            company: parsed.data.company || "",
            jobTitle: parsed.data.jobTitle || "",
            industry: parsed.data.industry || "",
            companySize: parsed.data.companySize || "",
            requirement: parsed.data.primaryChallenge || "",
            challenge: parsed.data.currentChallenge || "",
            desiredOutcome: parsed.data.desiredOutcome || "",
            projectScope: parsed.data.projectScope || "",
            budgetRange: parsed.data.budgetRange || "",
            source: source || "long_form",
            pageUrl: page,
          }),
        });
      } catch (fallbackError) {
        console.error("Fallback submission failed", fallbackError);
      }
    }

    setStatus("success");
    setValues(EMPTY);
    track("long_form_success", { source });
    submitting.current = false;
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-xl border border-border bg-card p-8 sm:p-10 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold text-foreground">
          Consultation Request Confirmed
        </h3>
        <p className="mx-auto mt-2.5 max-w-md text-sm text-muted-foreground leading-relaxed">
          Thank you. Our Senior Practice Director will review your strategic brief and reply within one business day.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative space-y-6 rounded-xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs"
    >
      <Honeypot value={hp} onChange={setHp} />

      {/* Top Header Card Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div>
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            Executive Briefing
          </span>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">
            Schedule Strategic Diagnostic
          </h2>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[#F5F2EB] px-3 py-1 text-xs font-medium text-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          <span>Confidential Intake</span>
        </div>
      </div>

      {/* SECTION 1: Leadership & Organization */}
      <div>
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-primary">
          1. Leadership & Organization
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="lf-fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={values.fullName}
            error={errors.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
          <TextField
            id="lf-workEmail"
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="jane@company.com"
            value={values.workEmail}
            error={errors.workEmail}
            onChange={(e) => set("workEmail", e.target.value)}
          />
          <TextField
            id="lf-phone"
            label="Direct phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 555 000 0000"
            value={values.phone}
            error={errors.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <TextField
            id="lf-company"
            label="Company name"
            autoComplete="organization"
            placeholder="Acme Corp"
            value={values.company}
            error={errors.company}
            onChange={(e) => set("company", e.target.value)}
          />
          <TextField
            id="lf-jobTitle"
            label="Executive role / Title"
            autoComplete="organization-title"
            placeholder="Managing Director / VP Operations"
            value={values.jobTitle}
            error={errors.jobTitle}
            onChange={(e) => set("jobTitle", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              id="lf-industry"
              label="Industry"
              placeholder="e.g. Healthcare, B2B SaaS"
              value={values.industry}
              error={errors.industry}
              onChange={(e) => set("industry", e.target.value)}
            />
            <SelectField
              id="lf-companySize"
              label="Company size"
              options={COMPANY_SIZES}
              placeholder="Headcount"
              value={values.companySize}
              error={errors.companySize}
              onChange={(e) => set("companySize", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Strategic Priority */}
      <div className="border-t border-border/70 pt-5">
        <p className="mb-3 font-display text-xs font-bold uppercase tracking-wider text-primary">
          2. Strategic Priority & Challenge
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="lf-primaryChallenge"
            label="Primary initiative"
            options={PRIMARY_CHALLENGES}
            placeholder="Select primary challenge"
            value={values.primaryChallenge}
            error={errors.primaryChallenge}
            onChange={(e) => set("primaryChallenge", e.target.value)}
          />
          <SelectField
            id="lf-projectScope"
            label="Target engagement scope"
            options={PROJECT_SCOPES}
            placeholder="Select scope"
            value={values.projectScope}
            error={errors.projectScope}
            onChange={(e) => set("projectScope", e.target.value)}
          />
          <SelectField
            id="lf-budgetRange"
            label="Target investment range (Optional)"
            options={BUDGET_RANGES}
            placeholder="Select budget range"
            value={values.budgetRange}
            error={errors.budgetRange}
            onChange={(e) => set("budgetRange", e.target.value)}
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-4">
          <TextAreaField
            id="lf-currentChallenge"
            label="Operational bottleneck or objective"
            rows={3}
            placeholder="Briefly describe the business workflow, manual bottleneck, or growth objective you want to solve."
            value={values.currentChallenge}
            error={errors.currentChallenge}
            onChange={(e) => set("currentChallenge", e.target.value)}
          />
        </div>
      </div>

      {errors.form ? (
        <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
          {errors.form}
        </p>
      ) : null}

      {/* Submission CTA & Trust Footer */}
      <div className="border-t border-border/70 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="size-3.5 text-primary shrink-0" />
          <span>Strict client confidentiality • Mutual NDA on request</span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "loading"}
          className="w-full sm:w-auto px-8"
        >
          {status === "loading" ? "Submitting Briefing…" : "Request Strategic Consultation →"}
        </Button>
      </div>
    </form>
  );
}
