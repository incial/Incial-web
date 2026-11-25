"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { ClientLocation, ClientsData, Stat, TrustData } from "@/lib/dataLoader";
import ClientLocations from "./ClientLocations";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";
import { EmptyState, LoadingState, PageHeader, Panel, SaveButton, TextInput } from "@/components/admin/ui";

export default function AdminTrustPage() {
  const [data, setData] = useState<TrustData | null>(null);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<ClientsData | null>(null);
  const [pickedId, setPickedId] = useState("");
  const [savingMap, setSavingMap] = useState(false);

  useEffect(() => {
    apiGetSection<TrustData>("trust")
      .then(setData)
      .catch(() => setData({ title: "", stats: [] }));
    apiGetSection<ClientsData>("clients")
      .then((value) => {
        setClients(value);
        setPickedId(value.clients[0]?.id ?? "");
      })
      .catch(() => setClients({ headerText: "", clients: [], testimonials: [] }));
  }, []);

  if (!data) return <LoadingState />;

  function updateStat(index: number, patch: Partial<Stat>) {
    setData((current) => {
      if (!current) return current;
      const stats = [...current.stats];
      stats[index] = { ...stats[index], ...patch };
      return { ...current, stats };
    });
  }

  function setClientLocation(id: string, location: ClientLocation | undefined) {
    setClients((current) => {
      if (!current) return current;
      return {
        ...current,
        clients: current.clients.map((client) => {
          if (client.id !== id) return client;
          const next = { ...client, location };
          if (!location) delete next.location;
          return next;
        }),
      };
    });
  }

  async function saveMap() {
    if (!clients) return;
    setSavingMap(true);
    try {
      await apiSaveSection("clients", clients);
      toast.success("Client locations saved.");
    } catch {
      toast.error("Failed to save the locations.");
    } finally {
      setSavingMap(false);
    }
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await apiSaveSection("trust", data);
      toast.success("Training stats saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Training & trust stats"
        description={'The numbers in the "Why Trust Incial?" section.'}
        visibility={<SectionVisibilityToggle sectionId="trust" label="Show section" />}
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      <div className="grid items-start gap-6 @3xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <Panel title="Heading" description="The title above the numbers.">
          <TextInput label="Title" value={data.title} onChange={(value) => setData({ ...data, title: value })} placeholder="Why Trust Incial?" />
          <SectionVisibilityToggle sectionId="trust-title" label="Show heading" />
        </Panel>

        <Panel
          title={`Stats (${data.stats.length})`}
          description={'Big numbers, for example "50+ Happy Clients".'}
          actions={
            <Button size="sm" variant="secondary" onPress={() => setData({ ...data, stats: [...data.stats, { id: String(Date.now()), value: "", label: "" }] })}>
              <Plus size={14} />
              Add stat
            </Button>
          }
        >
          <SectionVisibilityToggle sectionId="trust-stats" label="Show stats" />
          {data.stats.length === 0 ? (
            <EmptyState>No stats yet. Use &ldquo;Add stat&rdquo; to create one.</EmptyState>
          ) : (
            <div className="grid gap-3 @2xl:grid-cols-2">
              {data.stats.map((stat, index) => (
                <div key={stat.id} className="flex flex-col gap-3 rounded-2xl border border-separator p-4">
                  <TextInput label="Value" value={stat.value} onChange={(value) => updateStat(index, { value })} placeholder="50+" />
                  <TextInput label="Label" value={stat.label} onChange={(value) => updateStat(index, { label: value })} placeholder="Happy Clients" />
                  <Button size="sm" variant="danger-soft" className="w-fit" onPress={() => setData({ ...data, stats: data.stats.filter((_, i) => i !== index) })}>
                    <Trash2 size={13} />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-6">
        <ClientLocations clients={clients} pickedId={pickedId} onPickClient={setPickedId} onChange={setClientLocation} onSave={saveMap} saving={savingMap} />
      </div>
    </div>
  );
}