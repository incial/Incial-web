"use client";

import { useEffect, useState } from "react";
import { Card, Chip, Label, Switch } from "@heroui/react";
import { toast } from "sonner";
import { apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { SectionConfig, SectionsConfig } from "@/lib/dataLoader";
import { LoadingState, PageHeader, SaveButton } from "@/components/admin/ui";

const GROUP_ORDER = ["Home page", "About page", "Blogs page", "Clients page", "Trust page", "Products page", "Case studies page", "Other pages"];

function groupOf(section: SectionConfig): string {
  const id = section.id.toLowerCase();
  if (id === "scrolling") return "Home page";
  if (id.startsWith("about")) return "About page";
  if (id.startsWith("blog")) return "Blogs page";
  if (id.startsWith("client")) return "Clients page";
  if (id.startsWith("trust")) return "Trust page";
  if (id.startsWith("product")) return "Products page";
  if (id.startsWith("casestud")) return "Case studies page";
  return "Other pages";
}

export default function AdminSettingsPage() {
  const [data, setData] = useState<SectionsConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGetSection<SectionsConfig>("sections")
      .then(setData)
      .catch(() => setData({ sections: [] }));
  }, []);

  if (!data) return <LoadingState />;

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await apiSaveSection("sections", data);
      toast.success("Section settings saved.");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function setEnabled(id: string, enabled: boolean) {
    // the home hero is what holds the whole home page together
    if (id === "scrolling" && !enabled) {
      toast.error("The home hero section cannot be disabled.");
      return;
    }
    setData((current) =>
      current ? { ...current, sections: current.sections.map((section) => (section.id === id ? { ...section, enabled } : section)) } : current,
    );
  }

  const groups = GROUP_ORDER.map((name) => ({
    name,
    sections: data.sections.filter((section) => groupOf(section) === name).sort((a, b) => a.id.length - b.id.length),
  })).filter((group) => group.sections.length > 0);

  return (
    <div>
      <PageHeader
        title="Section settings"
        description="Show or hide the main sections of the live website."
        secondary={
          <Chip color="success" variant="soft">
            {data.sections.filter((section) => section.enabled).length} active
          </Chip>
        }
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      <div className="grid items-start gap-4 @3xl:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.name} className="gap-0 p-0">
            <Card.Header className="border-b border-separator px-5 py-3">
              <Card.Title className="text-xs font-semibold uppercase tracking-wider text-muted">{group.name}</Card.Title>
            </Card.Header>
            <Card.Content className="divide-y divide-separator">
              {group.sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className={`text-sm font-medium ${section.enabled ? "text-foreground" : "text-muted"}`}>{section.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{section.id}</p>
                  </div>
                  <Switch isSelected={section.enabled} onChange={(value) => setEnabled(section.id, value)}>
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                    <Label className="sr-only">{section.label}</Label>
                  </Switch>
                </div>
              ))}
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}
