"use client";

import { useEffect, useState } from "react";
import { Button, Tabs } from "@heroui/react";
import { Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminApiError, apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { BlogPost, BlogsData } from "@/lib/dataLoader";
import ImageUpload from "@/components/admin/ImageUpload";
import ItemList from "@/components/admin/ItemList";
import SectionVisibilityToggle from "@/components/admin/SectionVisibilityToggle";
import { ConfirmModal, EmptyState, LoadingState, PageHeader, Panel, SaveButton, TextAreaInput, TextInput } from "@/components/admin/ui";

type Category = "popular" | "newest";

/** Older posts can lack a stored gallery; this keeps what the website shows editable. */
function normalizePost(post: BlogPost): BlogPost {
  const images = Array.isArray(post.images) ? post.images.filter((image) => typeof image === "string" && image.trim().length > 0) : [];
  return { ...post, images: images.length === 0 && post.slug === "popular-2" ? [""] : images };
}

function sanitizePost(post: BlogPost): BlogPost {
  return {
    ...post,
    image: typeof post.image === "string" ? post.image.trim() : "",
    images: Array.isArray(post.images) ? post.images.map((image) => (typeof image === "string" ? image.trim() : "")).filter(Boolean) : [],
  };
}

export default function AdminBlogsPage() {
  const [data, setData] = useState<BlogsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<Category>("popular");
  const [selected, setSelected] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    apiGetSection<BlogsData>("blogs")
      .then((incoming) =>
        setData({
          heroBanner: incoming.heroBanner || "",
          popularPosts: incoming.popularPosts.map(normalizePost),
          newestPosts: incoming.newestPosts.map(normalizePost),
        }),
      )
      .catch(() => setData({ heroBanner: "", popularPosts: [], newestPosts: [] }));
  }, []);

  if (!data) return <LoadingState label="Loading posts…" />;

  const listKey = category === "popular" ? "popularPosts" : "newestPosts";
  const posts = data[listKey];
  const post: BlogPost | undefined = posts[selected];
  const pathPrefix = `${category}Posts[${selected}]`;

  /** The problems the server reported for one field of the selected post. */
  const problems = (field: string): string[] => errors[`${pathPrefix}.${field}`] || [];

  function updatePost(patch: Partial<BlogPost>) {
    setErrors({});
    setData((current) => {
      if (!current) return current;
      const list = [...current[listKey]];
      list[selected] = { ...list[selected], ...patch };
      return { ...current, [listKey]: list };
    });
  }

  function setGallery(next: string[]) {
    updatePost({ images: next });
  }

  function addPost() {
    setErrors({});
    const created: BlogPost = {
      id: Date.now(),
      slug: `${category}-${Date.now()}`,
      title: "",
      author: "",
      mins: 5,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" }),
      image: "",
      images: [],
      category,
      content: "",
    };
    setData({ ...data!, [listKey]: [...posts, created] });
    setSelected(posts.length);
  }

  function removePost() {
    setErrors({});
    const next = posts.filter((_, index) => index !== selected);
    setData({ ...data!, [listKey]: next });
    setSelected(Math.min(selected, Math.max(0, next.length - 1)));
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await apiSaveSection("blogs", {
        heroBanner: data.heroBanner,
        popularPosts: data.popularPosts.map(sanitizePost),
        newestPosts: data.newestPosts.map(sanitizePost),
      });
      setErrors({});
      toast.success("Blog posts saved.");
    } catch (error) {
      if (error instanceof AdminApiError && error.status === 400) {
        const grouped: Record<string, string[]> = {};
        for (const detail of error.details ?? []) {
          (grouped[detail.path] ??= []).push(detail.message);
        }
        setErrors(grouped);
        toast.error("Please fix the highlighted fields before saving.");
      } else {
        toast.error("Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  }

  const globalErrors = [...(errors.popularPosts || []), ...(errors.newestPosts || []), ...(errors.slug || []), ...(errors.id || []), ...(errors[pathPrefix] || [])];

  return (
    <div>
      <PageHeader
        title="Blog posts"
        description={`${data.popularPosts.length} popular · ${data.newestPosts.length} newest`}
        visibility={<SectionVisibilityToggle sectionId="blogs" label="Show section" />}
        secondary={<><Button variant="secondary" onPress={addPost}>
              <Plus size={15} />
              Add post
            </Button></>}
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      {globalErrors.length > 0 && (
        <div role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {globalErrors.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      )}

      <Panel title="Page banner" description="The header picture of the Blogs page." className="mb-6">
        <ImageUpload label="Banner" value={data.heroBanner || ""} onChange={(value) => setData({ ...data, heroBanner: value })} folder="images/blogs" />
      </Panel>

      <Tabs
        selectedKey={category}
        onSelectionChange={(key) => {
          setCategory(key === "newest" ? "newest" : "popular");
          setSelected(0);
        }}
        className="mb-4"
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Post groups">
            <Tabs.Tab id="popular">
              Popular ({data.popularPosts.length})
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="newest">
              Newest ({data.newestPosts.length})
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {!post ? (
        <EmptyState>No {category} posts yet. Use &ldquo;Add post&rdquo; to create one.</EmptyState>
      ) : (
        <div className="grid gap-6 @5xl:grid-cols-[16rem_minmax(0,1fr)]">
          <ItemList
            selected={selected}
            onSelect={setSelected}
            items={posts.map((item, index) => ({
              id: String(item.id ?? index),
              title: item.title || `Post ${index + 1}`,
              subtitle: `${item.author || "Author"} · ${item.date}`,
              badge: category === "popular" ? <Star size={13} className="text-warning" /> : undefined,
            }))}
          />

          <div className="flex flex-col gap-4">
            <Panel title="Details">
              <TextInput label="Title" value={post.title} onChange={(value) => updatePost({ title: value })} placeholder="Blog post title…" errors={problems("title")} />
              <div className="grid gap-4 @2xl:grid-cols-3">
                <TextInput label="Author" value={post.author} onChange={(value) => updatePost({ author: value })} errors={problems("author")} />
                <TextInput label="Minutes to read" type="number" value={String(post.mins)} onChange={(value) => updatePost({ mins: Number(value) })} errors={problems("mins")} />
                <TextInput label="Date" value={post.date} onChange={(value) => updatePost({ date: value })} placeholder="Dec 01, 2025" errors={problems("date")} />
              </div>
              <TextInput label="Slug (address)" value={post.slug} onChange={(value) => updatePost({ slug: value })} placeholder="my-post" errors={problems("slug")} />
            </Panel>

            <Panel title="Cover image">
              <ImageUpload label="Image" value={post.image} onChange={(value) => updatePost({ image: value })} folder="images/blogs" />
              {problems("image").map((message, index) => (
                <p key={index} className="text-xs text-danger">
                  {message}
                </p>
              ))}
            </Panel>

            <Panel title="Content">
              <TextAreaInput
                label="Text"
                description="Paragraphs are separated by an empty line."
                value={post.content || ""}
                onChange={(value) => updatePost({ content: value })}
                rows={8}
                placeholder="The main text of the post…"
                errors={problems("content")}
              />
            </Panel>

            <Panel
              title="Gallery"
              description={post.slug === "popular-2" ? "The cover image is the hero picture; gallery image 1 is the second picture." : "Extra pictures that vary the layout of the post page."}
              actions={
                <Button size="sm" variant="secondary" onPress={() => setGallery([...(post.images || []), ""])}>
                  <Plus size={14} />
                  Add image
                </Button>
              }
            >
              {(post.images || []).length === 0 && <p className="text-sm italic text-muted">No extra gallery images.</p>}
              <div className="grid gap-4 @2xl:grid-cols-2">
                {(post.images || []).map((url, index) => (
                  <div key={`${post.id}-${index}`} className="flex flex-col gap-2">
                    <ImageUpload
                      label={`Gallery ${index + 1}`}
                      value={url}
                      onChange={(value) => setGallery((post.images || []).map((image, i) => (i === index ? value : image)))}
                      folder="images/blogs"
                    />
                    {(errors[`${pathPrefix}.images[${index}]`] || []).map((message, i) => (
                      <p key={i} className="text-xs text-danger">
                        {message}
                      </p>
                    ))}
                    <Button size="sm" variant="danger-soft" className="w-fit" onPress={() => setGallery((post.images || []).filter((_, i) => i !== index))}>
                      <Trash2 size={13} />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              {(errors[`${pathPrefix}.images`] || []).map((message, index) => (
                <p key={index} className="text-xs text-danger">
                  {message}
                </p>
              ))}
            </Panel>

            <div>
              <Button variant="danger-soft" onPress={() => setConfirmDelete(true)}>
                <Trash2 size={15} />
                Delete this post
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this post?"
        message={`“${post?.title || "Untitled"}” will be removed once you save.`}
        onConfirm={removePost}
      />
    </div>
  );
}
