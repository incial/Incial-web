"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Accordion, Button, Tabs } from "@heroui/react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { AboutData, Award, TeamMember } from "@/lib/dataLoader";
import ImageUpload from "@/components/admin/ImageUpload";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";
import { EmptyState, LoadingState, PageHeader, Panel, SaveButton, TextAreaInput, TextInput } from "@/components/admin/ui";

const EMPTY: AboutData = {
  storyTitle: "",
  storyText: "",
  purposeTitle: "",
  purposeText: "",
  teamTitle: "",
  teamSubtitle: "",
  teamMembers: [],
  awardsTitle: "",
  awardsSubtitle: "",
  awards: [],
  brandTitle: "",
  brandText: "",
  impactTitle: "",
  impactText: "",
  heroBanner: "",
  brandImage: "",
  impactImage: "",
};

function move<T>(list: T[], index: number, by: number): T[] {
  const target = index + by;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export default function AdminAboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGetSection<AboutData>("about")
      .then(setData)
      .catch(() => setData(EMPTY));
  }, []);

  if (!data) return <LoadingState label="Loading About…" />;

  function change(patch: Partial<AboutData>) {
    setData((current) => (current ? { ...current, ...patch } : current));
  }

  function updateMember(index: number, patch: Partial<TeamMember>) {
    setData((current) => {
      if (!current) return current;
      const teamMembers = [...current.teamMembers];
      teamMembers[index] = { ...teamMembers[index], ...patch };
      return { ...current, teamMembers };
    });
  }

  function updateAward(index: number, patch: Partial<Award>) {
    setData((current) => {
      if (!current) return current;
      const awards = [...current.awards];
      awards[index] = { ...awards[index], ...patch };
      return { ...current, awards };
    });
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await apiSaveSection("about", data);
      toast.success("About section saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="About"
        description="The story, purpose, team, awards and brand pictures of the About page."
        visibility={<SectionVisibilityToggle sectionId="about" label="Show page" />}
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      <Tabs>
        <Tabs.ListContainer>
          <Tabs.List aria-label="About sections">
            {[
              ["story", "Story & purpose"],
              ["team", `Team (${data.teamMembers.length})`],
              ["awards", `Awards (${data.awards.length})`],
              ["brand", "Brand & impact"],
            ].map(([id, label]) => (
              <Tabs.Tab key={id} id={id}>
                {label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel id="story" className="grid items-start gap-4 pt-4 @3xl:grid-cols-2">
          <Panel title="Banner" description="The large picture at the top of the About page." className="@3xl:col-span-2">
            <ImageUpload label="Banner" value={data.heroBanner} onChange={(value) => change({ heroBanner: value })} folder="images/about" />
          </Panel>
          <Panel title="Our story" actions={<SectionVisibilityToggle sectionId="about-story" label="Show" />}>
            <TextInput label="Title" value={data.storyTitle} onChange={(value) => change({ storyTitle: value })} />
            <TextAreaInput label="Text" value={data.storyText} onChange={(value) => change({ storyText: value })} rows={6} />
          </Panel>
          <Panel title="Our purpose" actions={<SectionVisibilityToggle sectionId="about-purpose" label="Show" />}>
            <TextInput label="Title" value={data.purposeTitle} onChange={(value) => change({ purposeTitle: value })} />
            <TextAreaInput label="Text" value={data.purposeText} onChange={(value) => change({ purposeText: value })} rows={5} />
          </Panel>
        </Tabs.Panel>

        <Tabs.Panel id="team" className="grid items-start gap-4 pt-4 @3xl:grid-cols-[22rem_minmax(0,1fr)]">
          <Panel title="Team heading" actions={<SectionVisibilityToggle sectionId="about-team" label="Show" />}>
            <TextInput label="Title" value={data.teamTitle} onChange={(value) => change({ teamTitle: value })} />
            <TextAreaInput label="Subtitle" value={data.teamSubtitle} onChange={(value) => change({ teamSubtitle: value })} rows={3} />
          </Panel>
          <Panel
            title="Team members"
            description="Photos are uploaded and stored with the site, so they never expire."
            actions={
              <Button
                size="sm"
                variant="secondary"
                onPress={() => change({ teamMembers: [...data.teamMembers, { id: String(Date.now()), name: "", role: "", img: "", objectPos: "center top" }] })}
              >
                <Plus size={14} />
                Add member
              </Button>
            }
          >
            {data.teamMembers.length === 0 ? (
              <EmptyState>No team members yet.</EmptyState>
            ) : (
              <Accordion allowsMultipleExpanded variant="surface" className="w-full">
                {data.teamMembers.map((member, index) => (
                  <Accordion.Item key={member.id} id={member.id}>
                    <Accordion.Heading>
                      <Accordion.Trigger>
                        <span className="relative me-3 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-default text-xs font-semibold text-muted">
                          {member.img ? (
                            <Image src={member.img} alt="" fill sizes="36px" className="object-cover" />
                          ) : (
                            // no photo stored yet: the initials, as on the website
                            (member.name || "?")
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((word) => word[0]?.toUpperCase() ?? "")
                              .join("")
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm font-medium">{member.name || "New member"}</span>
                          <span className="block truncate text-xs text-muted">{member.role || "Role"}</span>
                        </span>
                        <Accordion.Indicator>
                          <ChevronDown />
                        </Accordion.Indicator>
                      </Accordion.Trigger>
                    </Accordion.Heading>
                    <Accordion.Panel>
                      <Accordion.Body>
                        <div className="flex flex-col gap-4 pb-2">
                          <div className="grid gap-4 @2xl:grid-cols-2">
                            <TextInput label="Name" value={member.name} onChange={(value) => updateMember(index, { name: value })} />
                            <TextInput label="Role" value={member.role} onChange={(value) => updateMember(index, { role: value })} />
                          </div>
                          <ImageUpload label="Photo" value={member.img} onChange={(value) => updateMember(index, { img: value })} folder="images/about/team" />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <Button isIconOnly size="sm" variant="secondary" aria-label="Move up" isDisabled={index === 0} onPress={() => change({ teamMembers: move(data.teamMembers, index, -1) })}>
                                <ArrowUp size={14} />
                              </Button>
                              <Button isIconOnly size="sm" variant="secondary" aria-label="Move down" isDisabled={index === data.teamMembers.length - 1} onPress={() => change({ teamMembers: move(data.teamMembers, index, 1) })}>
                                <ArrowDown size={14} />
                              </Button>
                            </div>
                            <Button size="sm" variant="danger-soft" onPress={() => change({ teamMembers: data.teamMembers.filter((_, i) => i !== index) })}>
                              <Trash2 size={14} />
                              Remove member
                            </Button>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </Panel>
        </Tabs.Panel>

        <Tabs.Panel id="awards" className="grid items-start gap-4 pt-4 @3xl:grid-cols-[22rem_minmax(0,1fr)]">
          <Panel title="Awards heading" actions={<SectionVisibilityToggle sectionId="about-awards" label="Show awards" />}>
            <TextInput label="Title" value={data.awardsTitle} onChange={(value) => change({ awardsTitle: value })} />
            <TextAreaInput label="Subtitle" value={data.awardsSubtitle} onChange={(value) => change({ awardsSubtitle: value })} rows={3} />
          </Panel>
          <Panel
            title="Awards"
            actions={
              <Button size="sm" variant="secondary" onPress={() => change({ awards: [...data.awards, { id: String(Date.now()), name: "", description: "", year: "", icon: "" }] })}>
                <Plus size={14} />
                Add award
              </Button>
            }
          >
            {data.awards.length === 0 ? (
              <EmptyState>No awards yet.</EmptyState>
            ) : (
              data.awards.map((award, index) => (
                <div key={award.id} className="flex flex-col gap-4 rounded-2xl border border-separator p-4">
                  <div className="grid gap-4 @2xl:grid-cols-[1fr_8rem]">
                    <TextInput label="Name" value={award.name} onChange={(value) => updateAward(index, { name: value })} />
                    <TextInput label="Year" value={award.year} onChange={(value) => updateAward(index, { year: value })} placeholder="2024" />
                  </div>
                  <TextInput label="Description" value={award.description} onChange={(value) => updateAward(index, { description: value })} />
                  <ImageUpload label="Icon" value={award.icon} onChange={(value) => updateAward(index, { icon: value })} folder="images/about" />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button isIconOnly size="sm" variant="secondary" aria-label="Move up" isDisabled={index === 0} onPress={() => change({ awards: move(data.awards, index, -1) })}>
                        <ArrowUp size={14} />
                      </Button>
                      <Button isIconOnly size="sm" variant="secondary" aria-label="Move down" isDisabled={index === data.awards.length - 1} onPress={() => change({ awards: move(data.awards, index, 1) })}>
                        <ArrowDown size={14} />
                      </Button>
                    </div>
                    <Button size="sm" variant="danger-soft" onPress={() => change({ awards: data.awards.filter((_, i) => i !== index) })}>
                      <Trash2 size={14} />
                      Remove award
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Panel>
        </Tabs.Panel>

        <Tabs.Panel id="brand" className="grid items-start gap-4 pt-4 @3xl:grid-cols-2">
          <Panel title="Brand" actions={<SectionVisibilityToggle sectionId="about-brand-impact" label="Show" />}>
            <TextInput label="Title" value={data.brandTitle} onChange={(value) => change({ brandTitle: value })} />
            <TextAreaInput label="Text" value={data.brandText} onChange={(value) => change({ brandText: value })} rows={4} />
            <ImageUpload label="Picture" value={data.brandImage} onChange={(value) => change({ brandImage: value })} folder="images/about" />
          </Panel>
          <Panel title="Impact">
            <TextInput label="Title" value={data.impactTitle} onChange={(value) => change({ impactTitle: value })} />
            <TextAreaInput label="Text" value={data.impactText} onChange={(value) => change({ impactText: value })} rows={4} />
            <ImageUpload label="Picture" value={data.impactImage} onChange={(value) => change({ impactImage: value })} folder="images/about" />
          </Panel>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
