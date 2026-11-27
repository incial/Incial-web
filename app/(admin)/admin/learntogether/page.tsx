"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminApiError, apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type {
  LearnTogetherData,
  LearnTogetherEvent,
  LearnTogetherPhoto,
  LearnTogetherTestimonial,
  Stat,
} from "@/lib/dataLoader";
import ImageUpload from "@/components/admin/ImageUpload";
import { EmptyState, LoadingState, PageHeader, Panel, SaveButton, TextAreaInput, TextInput } from "@/components/admin/ui";

const EMPTY: LearnTogetherData = {
  stats: [],
  gallery: [],
  events: [],
  testimonials: [],
  community: { title: "", text: "", buttonLabel: "", url: "" },
  testimonialLayout: "chat",
};

const TESTIMONIAL_LAYOUTS: Array<{ value: LearnTogetherData["testimonialLayout"]; label: string }> = [
  { value: "chat", label: "Group chat" },
  { value: "marquee", label: "Sliding rows" },
  { value: "spotlight", label: "One at a time" },
];

const FOLDER = "images/learntogether";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function move<T>(items: T[], index: number, by: number): T[] {
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(index + by, 0, item);
  return next;
}

/** Move up / move down / remove, under each entry. */
function EntryActions({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (by: number) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2">
        <Button isIconOnly size="sm" variant="secondary" aria-label="Move up" isDisabled={index === 0} onPress={() => onMove(-1)}>
          <ArrowUp size={14} />
        </Button>
        <Button isIconOnly size="sm" variant="secondary" aria-label="Move down" isDisabled={index === count - 1} onPress={() => onMove(1)}>
          <ArrowDown size={14} />
        </Button>
      </div>
      <Button size="sm" variant="danger-soft" onPress={onRemove}>
        <Trash2 size={13} />
        Remove
      </Button>
    </div>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Button size="sm" variant="secondary" onPress={onPress}>
      <Plus size={14} />
      {label}
    </Button>
  );
}

function Entry({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-3 rounded-2xl border border-separator p-4">{children}</div>;
}

export default function AdminLearnTogetherPage() {
  const [data, setData] = useState<LearnTogetherData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGetSection<LearnTogetherData>("learntogether")
      .then((value) => setData({ ...EMPTY, ...value, community: { ...EMPTY.community, ...value.community } }))
      .catch(() => setData(EMPTY));
  }, []);

  if (!data) return <LoadingState />;
  const current = data;

  function change(patch: Partial<LearnTogetherData>) {
    setData((value) => (value ? { ...value, ...patch } : value));
  }

  function updateAt<K extends "stats" | "gallery" | "events" | "testimonials">(key: K, index: number, patch: Partial<LearnTogetherData[K][number]>) {
    setData((value) => {
      if (!value) return value;
      const items = [...value[key]] as Array<LearnTogetherData[K][number]>;
      items[index] = { ...items[index], ...patch };
      return { ...value, [key]: items };
    });
  }

  async function save() {
    setSaving(true);
    try {
      await apiSaveSection("learntogether", current);
      toast.success("LearnTogether saved.");
    } catch (error) {
      const detail = error instanceof AdminApiError ? error.details?.[0] : undefined;
      toast.error(detail ? `${detail.path}: ${detail.message}` : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="LearnTogether"
        description="Gallery photos, past events, testimonials, numbers and the Join Community link on /learn-together. Empty sections stay hidden."
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      <div className="flex flex-col gap-6">
        <Panel
          title={`Numbers (${current.stats.length})`}
          description={'Shown above the past events, for example "12+ Events completed" or "300+ Learners".'}
          actions={<AddButton label="Add number" onPress={() => change({ stats: [...current.stats, { id: newId(), value: "", label: "" }] })} />}
        >
          {current.stats.length === 0 ? (
            <EmptyState>No numbers yet.</EmptyState>
          ) : (
            <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-4">
              {current.stats.map((stat: Stat, index) => (
                <Entry key={stat.id}>
                  <TextInput label="Value" value={stat.value} onChange={(value) => updateAt("stats", index, { value })} placeholder="12+" />
                  <TextInput label="Label" value={stat.label} onChange={(value) => updateAt("stats", index, { label: value })} placeholder="Events completed" />
                  <EntryActions index={index} count={current.stats.length} onMove={(by) => change({ stats: move(current.stats, index, by) })} onRemove={() => change({ stats: current.stats.filter((_, i) => i !== index) })} />
                </Entry>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={`Gallery (${current.gallery.length})`}
          description="Photos from workshops and events, shown as Polaroids. A short caption is written under each one."
          actions={<AddButton label="Add photo" onPress={() => change({ gallery: [...current.gallery, { id: newId(), img: "", caption: "" }] })} />}
        >
          {current.gallery.length === 0 ? (
            <EmptyState>No photos yet.</EmptyState>
          ) : (
            <div className="grid gap-3 @2xl:grid-cols-2 @5xl:grid-cols-3">
              {current.gallery.map((photo: LearnTogetherPhoto, index) => (
                <Entry key={photo.id}>
                  <ImageUpload label="Photo" value={photo.img} onChange={(value) => updateAt("gallery", index, { img: value })} folder={`${FOLDER}/gallery`} />
                  <TextInput label="Caption" value={photo.caption} onChange={(value) => updateAt("gallery", index, { caption: value })} placeholder="Design sprint, Kochi" />
                  <EntryActions index={index} count={current.gallery.length} onMove={(by) => change({ gallery: move(current.gallery, index, by) })} onRemove={() => change({ gallery: current.gallery.filter((_, i) => i !== index) })} />
                </Entry>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={`Past events (${current.events.length})`}
          description="Workshops, meetups and sessions that already happened, newest first."
          actions={
            <AddButton
              label="Add event"
              onPress={() => change({ events: [{ id: newId(), title: "", date: "", location: "", summary: "", img: "" }, ...current.events] })}
            />
          }
        >
          {current.events.length === 0 ? (
            <EmptyState>No events yet.</EmptyState>
          ) : (
            <div className="grid gap-3 @3xl:grid-cols-2">
              {current.events.map((event: LearnTogetherEvent, index) => (
                <Entry key={event.id}>
                  <TextInput label="Title" value={event.title} onChange={(value) => updateAt("events", index, { title: value })} placeholder="Brand Identity Workshop" />
                  <div className="grid gap-3 @md:grid-cols-2">
                    <TextInput label="Date" value={event.date} onChange={(value) => updateAt("events", index, { date: value })} placeholder="March 2026" />
                    <TextInput label="Place" value={event.location} onChange={(value) => updateAt("events", index, { location: value })} placeholder="Incial Studio, Kochi" />
                  </div>
                  <TextAreaInput label="Summary" rows={3} value={event.summary} onChange={(value) => updateAt("events", index, { summary: value })} placeholder="What happened and what people made." />
                  <ImageUpload label="Photo" value={event.img} onChange={(value) => updateAt("events", index, { img: value })} folder={`${FOLDER}/events`} />
                  <EntryActions index={index} count={current.events.length} onMove={(by) => change({ events: move(current.events, index, by) })} onRemove={() => change({ events: current.events.filter((_, i) => i !== index) })} />
                </Entry>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          title={`Testimonials (${current.testimonials.length})`}
          description="What learners and mentors said, in their own words. Choose how they are shown on the page."
          actions={
            <AddButton label="Add testimonial" onPress={() => change({ testimonials: [...current.testimonials, { id: newId(), quote: "", name: "", role: "", img: "" }] })} />
          }
        >
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Testimonial layout">
            <span className="mr-1 text-sm text-muted">Layout</span>
            {TESTIMONIAL_LAYOUTS.map((layout) => (
              <Button
                key={layout.value}
                size="sm"
                variant={current.testimonialLayout === layout.value ? "primary" : "secondary"}
                aria-pressed={current.testimonialLayout === layout.value}
                onPress={() => change({ testimonialLayout: layout.value })}
              >
                {layout.label}
              </Button>
            ))}
          </div>
          {current.testimonials.length === 0 ? (
            <EmptyState>No testimonials yet.</EmptyState>
          ) : (
            <div className="grid gap-3 @3xl:grid-cols-2">
              {current.testimonials.map((item: LearnTogetherTestimonial, index) => (
                <Entry key={item.id}>
                  <TextAreaInput label="Quote" rows={4} value={item.quote} onChange={(value) => updateAt("testimonials", index, { quote: value })} />
                  <div className="grid gap-3 @md:grid-cols-2">
                    <TextInput label="Name" value={item.name} onChange={(value) => updateAt("testimonials", index, { name: value })} />
                    <TextInput label="Role" value={item.role} onChange={(value) => updateAt("testimonials", index, { role: value })} placeholder="Design learner, 2026" />
                  </div>
                  <ImageUpload label="Photo (optional)" value={item.img} onChange={(value) => updateAt("testimonials", index, { img: value })} folder={`${FOLDER}/people`} />
                  <EntryActions index={index} count={current.testimonials.length} onMove={(by) => change({ testimonials: move(current.testimonials, index, by) })} onRemove={() => change({ testimonials: current.testimonials.filter((_, i) => i !== index) })} />
                </Entry>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Join Community" description="The invitation band near the end of the page. Without a link the button is hidden.">
          <div className="grid gap-3 @2xl:grid-cols-2">
            <TextInput label="Title" value={current.community.title} onChange={(value) => change({ community: { ...current.community, title: value } })} />
            <TextInput label="Button label" value={current.community.buttonLabel} onChange={(value) => change({ community: { ...current.community, buttonLabel: value } })} placeholder="Join the community" />
          </div>
          <TextAreaInput label="Text" rows={2} value={current.community.text} onChange={(value) => change({ community: { ...current.community, text: value } })} />
          <TextInput
            label="Link"
            value={current.community.url}
            onChange={(value) => change({ community: { ...current.community, url: value } })}
            placeholder="https://chat.whatsapp.com/... or /#contact"
            description="A page on this site (/...) or an https:// link, such as a WhatsApp or Discord invite."
          />
        </Panel>
      </div>
    </div>
  );
}
