"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { CaseStudiesData, CaseStudy } from "@/lib/dataLoader";
import ImageUpload from "@/components/admin/ImageUpload";
import ItemList from "@/components/admin/ItemList";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";
import {
  ConfirmModal,
  EmptyState,
  LoadingState,
  PageHeader,
  Panel,
  SaveButton,
  TextAreaInput,
  TextInput,
  ToggleSwitch,
} from "@/components/admin/ui";

function newCase(): CaseStudy {
  return {
    id: String(Date.now()),
    slug: "",
    title: "",
    category: "",
    heroQuote: "",
    heroImage: "",
    coverImage: "",
    introduction: "",
    sections: [],
    location: "",
    featured: false,
  };
}

export default function AdminCaseStudiesPage() {
  const [data, setData] = useState<CaseStudiesData | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    apiGetSection<CaseStudiesData>("casestudies")
      .then(setData)
      .catch(() => setData({ cases: [] }));
  }, []);

  if (!data) return <LoadingState label="Loading case studies…" />;

  const active: CaseStudy | undefined = data.cases[selected];

  function update<K extends keyof CaseStudy>(field: K, value: CaseStudy[K]) {
    setData((current) => {
      if (!current) return current;
      const cases = [...current.cases];
      cases[selected] = { ...cases[selected], [field]: value };
      return { ...current, cases };
    });
  }

  function setSection(index: number, patch: { title?: string; content?: string }) {
    if (!active) return;
    const sections = [...(active.sections || [])];
    sections[index] = { ...sections[index], ...patch };
    update("sections", sections);
  }

  function setGallery(index: number, value: string) {
    if (!active) return;
    const images = [...(active.images || [])];
    images[index] = value;
    update("images", images);
  }

  function addCase() {
    const next = [...data!.cases, newCase()];
    setData({ ...data!, cases: next });
    setSelected(next.length - 1);
  }

  function removeCase() {
    const next = data!.cases.filter((_, index) => index !== selected);
    setData({ ...data!, cases: next });
    setSelected(Math.min(selected, Math.max(0, next.length - 1)));
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await apiSaveSection("casestudies", data);
      toast.success("Case studies saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Case studies"
        description={`${data.cases.length} ${data.cases.length === 1 ? "case study" : "case studies"} · ${data.cases.filter((c) => c.featured).length} featured`}
        visibility={<SectionVisibilityToggle sectionId="casestudies" label="Show section" />}
        secondary={<><Button variant="secondary" onPress={addCase}>
              <Plus size={15} />
              Add case study
            </Button></>}
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      <Panel title="Page banner" description="The header picture of the Case Studies page." className="mb-6">
        <ImageUpload label="Banner" value={data.heroBanner || ""} onChange={(value) => setData({ ...data, heroBanner: value })} folder="images/case-studies" />
      </Panel>

      {!active ? (
        <EmptyState>No case studies yet. Use &ldquo;Add case study&rdquo; to create one.</EmptyState>
      ) : (
        <div className="grid gap-6 @5xl:grid-cols-[16rem_minmax(0,1fr)]">
          <ItemList
            selected={selected}
            onSelect={setSelected}
            items={data.cases.map((item, index) => ({
              id: item.id ?? String(index),
              title: item.title || `Case study ${index + 1}`,
              subtitle: item.category || "General",
              badge: item.featured ? <Star size={13} className="text-warning" /> : undefined,
            }))}
          />

          <div className="flex flex-col gap-4">
            <Panel title="Details">
              <div className="grid gap-4 @2xl:grid-cols-2">
                <TextInput label="Title" value={active.title} onChange={(value) => update("title", value)} placeholder="Project title" />
                <TextInput label="Slug (address)" value={active.slug} onChange={(value) => update("slug", value)} placeholder="my-project" />
                <TextInput label="Category" value={active.category} onChange={(value) => update("category", value)} placeholder="Branding / Technology" />
                <TextInput label="Location" value={active.location || ""} onChange={(value) => update("location", value)} placeholder="Kerala, India" />
              </div>
              <ToggleSwitch label="Featured" description="Highlighted on the case studies page" isSelected={Boolean(active.featured)} onChange={(value) => update("featured", value)} />
            </Panel>

            <Panel title="Pictures" description="If one of the two main pictures is missing, the other is used.">
              <div className="grid gap-4 @2xl:grid-cols-2">
                <ImageUpload label="Cover image (thumbnail)" value={active.coverImage || ""} onChange={(value) => update("coverImage", value)} folder="images/case-studies" />
                <ImageUpload label="Hero image (banner)" value={active.heroImage || ""} onChange={(value) => update("heroImage", value)} folder="images/case-studies" />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Gallery</p>
                <Button size="sm" variant="secondary" onPress={() => update("images", [...(active.images || []), ""])}>
                  <Plus size={14} />
                  Add picture
                </Button>
              </div>
              <div className="grid gap-4 @2xl:grid-cols-2">
                {(active.images || []).map((url, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <ImageUpload label={`Gallery ${index + 1}`} value={url} onChange={(value) => setGallery(index, value)} folder="images/case-studies" />
                    <Button size="sm" variant="danger-soft" className="w-fit" onPress={() => update("images", (active.images || []).filter((_, i) => i !== index))}>
                      <Trash2 size={13} />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Text">
              <TextAreaInput label="Hero quote (summary)" value={active.heroQuote} onChange={(value) => update("heroQuote", value)} rows={3} placeholder="How do you take a traditional…" />
              <TextAreaInput label="Introduction" value={active.introduction} onChange={(value) => update("introduction", value)} rows={4} placeholder="The client was a home décor brand…" />
            </Panel>

            <Panel
              title="Content sections"
              actions={
                <Button size="sm" variant="secondary" onPress={() => update("sections", [...(active.sections || []), { title: "", content: "" }])}>
                  <Plus size={14} />
                  Add section
                </Button>
              }
            >
              {(active.sections || []).length === 0 && <p className="text-sm italic text-muted">No sections yet.</p>}
              {(active.sections || []).map((section, index) => (
                <div key={index} className="flex flex-col gap-3 rounded-2xl border border-separator p-4">
                  <TextInput label="Section title (optional)" value={section.title} onChange={(value) => setSection(index, { title: value })} />
                  <TextAreaInput label="Content" value={section.content} onChange={(value) => setSection(index, { content: value })} rows={4} />
                  <Button size="sm" variant="danger-soft" className="w-fit" onPress={() => update("sections", active.sections.filter((_, i) => i !== index))}>
                    <Trash2 size={13} />
                    Remove section
                  </Button>
                </div>
              ))}
            </Panel>

            <div>
              <Button variant="danger-soft" onPress={() => setConfirmDelete(true)}>
                <Trash2 size={15} />
                Delete this case study
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this case study?"
        message={`“${active?.title || "Untitled"}” will be removed once you save.`}
        onConfirm={removeCase}
      />
    </div>
  );
}
