"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Chip, Label, ListBox, Select } from "@heroui/react";
import { ArrowLeft, ArrowRight, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { Client, ClientLocation, ClientsData, Testimonial } from "@/lib/dataLoader";
import { LOCATION_PRESETS } from "@/lib/clientLocations";
import ImageUpload from "@/components/admin/ImageUpload";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";
import { EditDrawer, EmptyState, LoadingState, PageHeader, Panel, SaveButton, TextAreaInput, TextInput } from "@/components/admin/ui";

const NO_LOCATION = "__none__";
const CUSTOM_LOCATION = "__custom__";

/** Where a client is based: a city from the list, or custom coordinates. Drives the world map on the home page. */
function LocationField({ location, onChange }: { location: ClientLocation | undefined; onChange: (location: ClientLocation | undefined) => void }) {
  const preset = LOCATION_PRESETS.find((candidate) => candidate.label === location?.label);
  const [isCustom, setIsCustom] = useState(Boolean(location && !preset));
  const selected = isCustom ? CUSTOM_LOCATION : (preset?.label ?? NO_LOCATION);

  function choose(key: string) {
    if (key === CUSTOM_LOCATION) {
      setIsCustom(true);
      return;
    }
    setIsCustom(false);
    onChange(key === NO_LOCATION ? undefined : LOCATION_PRESETS.find((candidate) => candidate.label === key));
  }

  function setField(field: keyof ClientLocation, raw: string) {
    const base: ClientLocation = location ?? { label: "", lat: 0, lng: 0 };
    onChange({ ...base, [field]: field === "label" ? raw : Number(raw) });
  }

  return (
    <div className="flex flex-col gap-3">
      <Select selectedKey={selected} onSelectionChange={(key) => choose(String(key))} className="w-full">
        <Label>Location on the world map</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id={NO_LOCATION} textValue="No location">
              No location
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {LOCATION_PRESETS.map((candidate) => (
              <ListBox.Item key={candidate.label} id={candidate.label} textValue={candidate.label}>
                {candidate.label}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
            <ListBox.Item id={CUSTOM_LOCATION} textValue="Custom coordinates">
              Custom coordinates…
              <ListBox.ItemIndicator />
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>
      {isCustom && (
        <div className="grid grid-cols-3 gap-3">
          <TextInput label="City" value={location?.label ?? ""} onChange={(value) => setField("label", value)} />
          <TextInput label="Latitude" type="number" value={String(location?.lat ?? "")} onChange={(value) => setField("lat", value)} />
          <TextInput label="Longitude" type="number" value={String(location?.lng ?? "")} onChange={(value) => setField("lng", value)} />
        </div>
      )}
    </div>
  );
}

export default function AdminClientsPage() {
  const [data, setData] = useState<ClientsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);

  useEffect(() => {
    apiGetSection<ClientsData>("clients")
      .then(setData)
      .catch(() => setData({ headerText: "", clients: [], testimonials: [] }));
  }, []);

  if (!data) return <LoadingState label="Loading clients…" />;

  function change(patch: Partial<ClientsData>) {
    setData((current) => (current ? { ...current, ...patch } : current));
  }

  function updateClient(index: number, patch: Partial<Client>) {
    setData((current) => {
      if (!current) return current;
      const clients = [...current.clients];
      const next = { ...clients[index], ...patch };
      if (!next.location) delete next.location;
      clients[index] = next;
      return { ...current, clients };
    });
  }

  function moveClient(index: number, by: number) {
    setData((current) => {
      if (!current) return current;
      const target = index + by;
      if (target < 0 || target >= current.clients.length) return current;
      const clients = [...current.clients];
      [clients[index], clients[target]] = [clients[target], clients[index]];
      return { ...current, clients };
    });
    setEditing((current) => (current === null ? current : current + by));
  }

  function addClient() {
    const next = [...data!.clients, { id: String(Date.now()), name: "", src: "" }];
    change({ clients: next });
    setEditing(next.length - 1);
  }

  function removeClient(index: number) {
    change({ clients: data!.clients.filter((_, i) => i !== index) });
    setEditing(null);
  }

  function updateTestimonial(index: number, patch: Partial<Testimonial>) {
    setData((current) => {
      if (!current) return current;
      const testimonials = [...current.testimonials];
      testimonials[index] = { ...testimonials[index], ...patch };
      return { ...current, testimonials };
    });
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await apiSaveSection("clients", data);
      toast.success("Clients saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const placed = data.clients.filter((client) => client.location).length;
  const active = editing !== null ? data.clients[editing] : undefined;

  return (
    <div>
      <PageHeader
        title="Clients"
        description="The logos on the home page, where each sits on the world map, and the testimonials."
        visibility={<SectionVisibilityToggle sectionId="client" label="Show section" />}
        secondary={
          <Button variant="secondary" onPress={addClient}>
            <Plus size={15} />
            Add client
          </Button>
        }
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      <div className="grid items-start gap-6 @5xl:grid-cols-[minmax(0,1fr)_21rem]">
        {/* the logos fill the main column */}
        <Panel
          title={`Client logos (${data.clients.length})`}
          description={`${placed} of ${data.clients.length} placed on the world map. Click a logo to edit it.`}
          actions={<SectionVisibilityToggle sectionId="client-logos" label="Show logos" />}
        >
          {data.clients.length === 0 ? (
            <EmptyState>No clients yet. Use &ldquo;Add client&rdquo; to create the first one.</EmptyState>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
              {data.clients.map((client, index) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => setEditing(index)}
                  className="group flex flex-col gap-2 rounded-2xl border border-separator bg-surface-secondary p-2 text-left transition-all hover:-translate-y-0.5 hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span className="relative block aspect-[5/3] w-full overflow-hidden rounded-xl bg-white">
                    {client.src ? (
                      <Image src={client.src} alt={client.name} fill sizes="200px" className="object-contain p-3" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-xs text-black/40">No logo</span>
                    )}
                  </span>
                  <span className="px-1 pb-1">
                    <span className="block truncate text-sm font-medium text-foreground">{client.name || "Untitled"}</span>
                    {client.location ? (
                      <Chip size="sm" variant="soft" color="accent" className="mt-1">
                        <MapPin size={11} />
                        {client.location.label.split(",")[0]}
                      </Chip>
                    ) : (
                      <span className="mt-1 block text-xs text-muted">Not on the map</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {/* heading and testimonials sit beside them */}
        <div className="flex flex-col gap-6 @5xl:sticky @5xl:top-24">
          <Panel title="Heading">
            <TextInput label="Section heading" value={data.headerText} onChange={(value) => change({ headerText: value })} placeholder="Some of Our Awesome Clients:" />
          </Panel>

          <Panel
            title="Testimonials"
            actions={
              <Button size="sm" variant="secondary" onPress={() => change({ testimonials: [...data.testimonials, { id: String(Date.now()), quote: "", author: "" }] })}>
                <Plus size={14} />
                Add
              </Button>
            }
          >
            <SectionVisibilityToggle sectionId="client-testimonials" label="Show testimonials" />
            {data.testimonials.length === 0 ? (
              <p className="text-sm italic text-muted">No testimonials yet.</p>
            ) : (
              data.testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="flex flex-col gap-3 rounded-2xl border border-separator p-3">
                  <TextAreaInput label="Quote" value={testimonial.quote} onChange={(value) => updateTestimonial(index, { quote: value })} rows={3} />
                  <TextInput label="Author" value={testimonial.author} onChange={(value) => updateTestimonial(index, { author: value })} placeholder="~ Client name" />
                  <TextInput label="Role / Project (optional)" value={testimonial.role ?? ""} onChange={(value) => updateTestimonial(index, { role: value })} placeholder="E-commerce & Brand Identity" />
                  <Button size="sm" variant="danger-soft" className="w-fit" onPress={() => change({ testimonials: data.testimonials.filter((_, i) => i !== index) })}>
                    <Trash2 size={13} />
                    Remove
                  </Button>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>

      <EditDrawer
        isOpen={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
        title={active?.name || "Client"}
        description="Name, logo and where it appears on the world map."
        footer={
          editing !== null ? (
            <Button variant="danger-soft" onPress={() => removeClient(editing)}>
              <Trash2 size={14} />
              Remove
            </Button>
          ) : undefined
        }
      >
        {active && editing !== null && (
          <>
            <TextInput label="Name" value={active.name} onChange={(value) => updateClient(editing, { name: value })} placeholder="Client name" />
            <ImageUpload label="Logo" value={active.src} onChange={(value) => updateClient(editing, { src: value })} folder="clients" />
            <LocationField key={active.id} location={active.location} onChange={(location) => updateClient(editing, { location })} />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" isDisabled={editing === 0} onPress={() => moveClient(editing, -1)}>
                <ArrowLeft size={14} />
                Move earlier
              </Button>
              <Button size="sm" variant="secondary" isDisabled={editing === data.clients.length - 1} onPress={() => moveClient(editing, 1)}>
                Move later
                <ArrowRight size={14} />
              </Button>
            </div>
          </>
        )}
      </EditDrawer>
    </div>
  );
}
