import { CheckCircle2, Lock, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { track } from "@/lib/analytics";
import { quickLeadSchema } from "@/lib/leads";
import { submitQuickLead } from "@/lib/leads.functions";
import { trackLead } from "@/utils/analytics";
import { useVisitorContext } from "@/components/intelligence/VisitorIntelligenceLayer";

const REQUIREMENTS = [
  "AI Opportunity Diagnostic",
  "Process & Workflow Automation",
  "Data Architecture & Analytics",
  "Enterprise LLM & Agent Pipelines",
  "Strategic Margin & EBITDA Advisory",
  "General Inquiry / Not Sure Yet",
] as const;

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  company: "",
  requirement: "",
  message: "",
};

type Errors = Partial<Record<keyof typeof EMPTY | "form", string>>;

export function QuickForm({ source = "quick_form" }: { source?: string }) {
  const [values, setValues] = useState(EMPTY);
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const submitting = useRef(false);
  const { setFormTouched, setFormProgress } = useVisitorContext();

  useEffect(() => {
    track("quick_form_open", { source });
  }, [source]);

  function set(field: keyof typeof EMPTY, value: string) {
    setFormTouched(true);
    const updated = { ...values, [field]: value };
    setValues(updated);
    setErrors((e) => {
      const next = { ...e };
      delete next[field];
      delete next.form;
      return next;
    });

    // Compute progress across fields
    const trackFields = ["name", "email", "phone", "company", "requirement", "message"] as const;
    const filledCount = trackFields.filter((k) => updated[k].trim().length > 0).length;
    setFormProgress(Math.round((filledCount / trackFields.length) * 100));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting.current) return;

    const page = typeof window !== "undefined" ? window.location.pathname : "/";
    const parsed = quickLeadSchema.safeParse({
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
        } else if (key && !next[key as keyof typeof EMPTY]) {
          next[key as keyof typeof EMPTY] = issue.message;
        }
      }
      setErrors(next);
      const firstKey = parsed.error.issues[0]?.path[0];
      if (typeof firstKey === "string" && firstKey !== "companyWebsiteHp") {
        document.getElementById(`qf-${firstKey}`)?.focus();
      }
      return;
    }

    submitting.current = true;
    setStatus("loading");
    track("quick_form_submit", { source });

    // Explicitly record lead into Lead_Management & Conversion_Events
    trackLead({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || "",
      company: parsed.data.company || "",
      requirement: parsed.data.requirement,
      form_name: "Quick Contact Form",
      source: source || "quick_form",
    });

    try {
      const serverResult = await submitQuickLead({ data: parsed.data });
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
            leadType: "Quick Form",
            name: parsed.data.name,
            email: parsed.data.email,
            phone: parsed.data.phone || "",
            company: parsed.data.company || "",
            requirement: parsed.data.requirement,
            message: parsed.data.message,
            source: source || "quick_form",
            pageUrl: page,
          }),
        });
      } catch (fallbackError) {
        console.error("Fallback submission failed", fallbackError);
      }
    }

    setStatus("success");
    setValues(EMPTY);
    track("quick_form_success", { source });
    submitting.current = false;
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-xl border border-border bg-card p-7 text-center shadow-xs">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </div>
        <h3 className="mt-3 font-display text-xl font-bold text-foreground">
          Inquiry Received
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
          Thank you. Our practice leaders will review your request and connect within 1 business day.
        </p>
        <Button variant="outline" size="sm" className="mt-4 text-xs" onClick={() => setStatus("idle")}>
          Send Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="relative space-y-4 rounded-xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs"
    >
      <Honeypot value={hp} onChange={setHp} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div>
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Quick Inquiry
          </span>
          <p className="text-sm font-semibold text-foreground">Start the Conversation</p>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground">Response in 24h</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="qf-name"
          label="Your name"
          autoComplete="name"
          placeholder="Jane Doe"
          value={values.name}
          error={errors.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <TextField
          id="qf-email"
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="jane@company.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => set("email", e.target.value)}
        />
        <TextField
          id="qf-phone"
          label="Phone number"
          type="tel"
          autoComplete="tel"
          placeholder="+1 555 000 0000"
          value={values.phone}
          error={errors.phone}
          onChange={(e) => set("phone", e.target.value)}
        />
        <TextField
          id="qf-company"
          label="Company name"
          autoComplete="organization"
          placeholder="Acme Corp"
          value={values.company}
          error={errors.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>

      <SelectField
        id="qf-requirement"
        label="Strategic focus area"
        options={REQUIREMENTS}
        placeholder="Select practice focus"
        value={values.requirement}
        error={errors.requirement}
        onChange={(e) => set("requirement", e.target.value)}
      />

      <TextAreaField
        id="qf-message"
        label="Brief objective or challenge"
        rows={3}
        placeholder="What business process or AI initiative would you like to discuss?"
        value={values.message}
        error={errors.message}
        onChange={(e) => set("message", e.target.value)}
      />

      {errors.form ? (
        <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
          {errors.form}
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === "loading"}
        className="w-full"
      >
        {status === "loading" ? "Submitting Inquiry…" : "Submit Diagnostic Inquiry →"}
      </Button>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <Lock className="size-3 text-primary" />
        <span>Confidential advisory • No spam guaranteed</span>
      </div>
    </form>
  );
}
