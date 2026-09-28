"use client";

import { FormEvent, useState, type ReactNode } from "react";
import {
  NEED_LABELS,
  NEED_TYPES,
  type FieldErrors,
  type Inquiry,
  type NeedType,
} from "@/lib/inquiry";

const emptyForm: Inquiry & { company_fax: string } = {
  name: "",
  email: "",
  businessName: "",
  website: "",
  phone: "",
  city: "",
  needType: "presence",
  description: "",
  company_fax: "",
};

export function IntakeForm() {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof emptyForm>(
    key: K,
    value: (typeof emptyForm)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        errors?: FieldErrors;
      };

      if (!response.ok) {
        setErrors(data.errors || {});
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
        return;
      }

      setStatus("done");
    } catch {
      setStatus("error");
      setMessage("I couldn't send that. Check your connection and try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-8 shadow-[0_12px_40px_rgba(31,26,20,0.06)]">
        <p className="text-sm font-medium tracking-wide text-terracotta uppercase">
          Got it
        </p>
        <h3 className="font-display mt-3 text-3xl tracking-tight text-ink">
          {"Thanks — I'll read this and get back to you."}
        </h3>
        <p className="mt-4 max-w-lg text-muted leading-relaxed">
          I just opened a folder for {form.businessName || "your shop"} and
          emailed myself the details. Watch {form.email || "your inbox"} for a
          note from me.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative rounded-2xl border border-line bg-paper-raised p-6 shadow-[0_12px_40px_rgba(31,26,20,0.06)] sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          error={errors.name}
          htmlFor="name"
        >
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Business name"
          error={errors.businessName}
          htmlFor="businessName"
        >
          <input
            id="businessName"
            name="businessName"
            autoComplete="organization"
            required
            value={form.businessName}
            onChange={(event) => update("businessName", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="City (optional)" error={errors.city} htmlFor="city">
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            value={form.city}
            onChange={(event) => update("city", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Phone (optional)"
          error={errors.phone}
          htmlFor="phone"
        >
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field
          label="Website (optional)"
          error={errors.website}
          htmlFor="website"
        >
          <input
            id="website"
            name="website"
            type="url"
            inputMode="url"
            placeholder="https://"
            value={form.website}
            onChange={(event) => update("website", event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-ink">
          What do you need help with?
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {NEED_TYPES.map((type) => (
            <NeedOption
              key={type}
              type={type}
              checked={form.needType === type}
              onChange={() => update("needType", type)}
            />
          ))}
        </div>
        {errors.needType ? (
          <p className="mt-2 text-sm text-terracotta">{errors.needType}</p>
        ) : null}
      </fieldset>

      <Field
        label="Tell me what's stuck"
        error={errors.description}
        htmlFor="description"
        className="mt-6"
      >
        <textarea
          id="description"
          name="description"
          required
          minLength={20}
          rows={6}
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="People still find us by walking by, our inventory lives in a notebook, we're too busy to answer the phone…"
          className={`${inputClass} min-h-36 resize-y`}
        />
      </Field>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company_fax">Fax</label>
        <input
          id="company_fax"
          name="company_fax"
          tabIndex={-1}
          autoComplete="off"
          value={form.company_fax}
          onChange={(event) => update("company_fax", event.target.value)}
        />
      </div>

      {status === "error" && message ? (
        <p className="mt-4 text-sm text-terracotta" role="alert">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-terracotta px-7 text-sm font-semibold text-white transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "submitting" ? "Sending…" : "Send this to me"}
      </button>
    </form>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2.5 text-ink outline-none transition-shadow placeholder:text-muted/70 focus:border-forest focus:ring-3 focus:ring-forest/15";

function Field({
  label,
  htmlFor,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-sm text-terracotta">{error}</p> : null}
    </div>
  );
}

function NeedOption({
  type,
  checked,
  onChange,
}: {
  type: NeedType;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm transition-colors ${
        checked
          ? "border-forest bg-forest-soft text-forest"
          : "border-line bg-paper text-ink hover:border-forest/40"
      }`}
    >
      <input
        type="radio"
        name="needType"
        value={type}
        checked={checked}
        onChange={onChange}
        className="accent-forest"
      />
      {NEED_LABELS[type]}
    </label>
  );
}
