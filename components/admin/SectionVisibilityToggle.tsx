"use client";

import { useEffect, useState } from "react";
import { Label, Spinner, Switch } from "@heroui/react";
import { apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { SectionsConfig } from "@/lib/dataLoader";
import { toast } from "sonner";

interface SectionVisibilityToggleProps {
  sectionId: string;
  label?: string;
}

/** A switch that shows or hides one section of the public website. */
export default function SectionVisibilityToggle({ sectionId, label = "Visible on website" }: SectionVisibilityToggleProps) {
  const [data, setData] = useState<SectionsConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGetSection<SectionsConfig>("sections")
      .then(setData)
      .catch(() => {});
  }, []);

  const isEnabled = data?.sections.find((section) => section.id === sectionId)?.enabled ?? true;

  async function handleChange(next: boolean) {
    if (!data) return;
    setSaving(true);
    try {
      const exists = data.sections.some((section) => section.id === sectionId);
      const sections = exists
        ? data.sections.map((section) => (section.id === sectionId ? { ...section, enabled: next } : section))
        : [...data.sections, { id: sectionId, label, enabled: next }];

      await apiSaveSection("sections", { sections });
      setData({ ...data, sections });
      toast.success(next ? `${label}: shown.` : `${label}: hidden.`);
    } catch {
      toast.error("Failed to update visibility.");
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <Spinner size="sm" />;

  return (
    <Switch className="flex-row items-center gap-3" isSelected={isEnabled} isDisabled={saving} onChange={handleChange}>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Content>
        <Label>{label}</Label>
      </Switch.Content>
    </Switch>
  );
}
