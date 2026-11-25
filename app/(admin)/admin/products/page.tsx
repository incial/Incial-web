"use client";

import { useEffect, useState } from "react";
import { Button, Chip, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { apiGetSection, apiSaveSection } from "@/lib/adminApi";
import type { Product, ProductsData } from "@/lib/dataLoader";
import ImageUpload from "@/components/admin/ImageUpload";
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

function newProduct(): Product {
  return {
    id: String(Date.now()),
    name: "",
    tagline: "by Incial",
    image: "",
    description: [""],
    tryUrl: "",
    category: "",
    tags: [],
    mediaType: "image",
    featured: false,
    available: true,
  };
}

function paragraphsOf(product: Product): string[] {
  const description = product.description;
  return Array.isArray(description) ? description : (description || "").split("\n\n").filter(Boolean);
}

export default function AdminProductsPage() {
  const [data, setData] = useState<ProductsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  // the tags box is edited as text and turned into a list when it is left
  const [tagsText, setTagsText] = useState<string | null>(null);

  useEffect(() => {
    apiGetSection<ProductsData>("products")
      .then((response) => {
        if (response?.products) {
          setData({ ...response, products: response.products.map((product) => ({ ...product, description: paragraphsOf(product) })) });
        } else {
          setData({ products: [] });
        }
      })
      .catch(() => setData({ products: [] }));
  }, []);

  if (!data) return <LoadingState label="Loading products…" />;

  const active: Product | undefined = data.products[selected];

  function update<K extends keyof Product>(field: K, value: Product[K]) {
    setData((current) => {
      if (!current) return current;
      const products = [...current.products];
      products[selected] = { ...products[selected], [field]: value };
      return { ...current, products };
    });
  }

  function updateFields(patch: Partial<Product>) {
    setData((current) => {
      if (!current) return current;
      const products = [...current.products];
      products[selected] = { ...products[selected], ...patch };
      return { ...current, products };
    });
  }

  function setParagraph(index: number, value: string) {
    if (!active) return;
    const description = [...paragraphsOf(active)];
    description[index] = value;
    update("description", description);
  }

  function addProduct() {
    setData((current) => (current ? { ...current, products: [...current.products, newProduct()] } : current));
    setSelected(data!.products.length);
    setTagsText(null);
  }

  function deleteProduct() {
    setData((current) => (current ? { ...current, products: current.products.filter((_, index) => index !== selected) } : current));
    setSelected((index) => Math.max(0, index - 1));
    setTagsText(null);
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      await apiSaveSection("products", data);
      toast.success("Products saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="The products on the Products page. Each one gets a picture or video, a short text and an Explore button."
        visibility={<SectionVisibilityToggle sectionId="products-list" label="Show products" />}
        secondary={<><Button variant="secondary" onPress={addProduct}>
              <Plus size={15} />
              Add product
            </Button></>}
        primary={<SaveButton saving={saving} onPress={save} />}
      />

      {data.products.length === 0 || !active ? (
        <EmptyState>No products yet. Use &ldquo;Add product&rdquo; to create the first one.</EmptyState>
      ) : (
        <div className="grid gap-6 @5xl:grid-cols-[16rem_minmax(0,1fr)]">
          {/* the list of products */}
          <div className="flex flex-col gap-2">
            {data.products.map((product, index) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  setSelected(index);
                  setTagsText(null);
                }}
                className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left transition-colors ${
                  selected === index ? "border-accent bg-accent/10" : "border-separator bg-surface hover:bg-surface-secondary"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{product.name || "Untitled product"}</span>
                  <span className="block truncate text-xs text-muted">{product.category || product.tagline}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {product.featured && <Star size={13} className="text-warning" />}
                  <Chip size="sm" variant="soft" color={product.available === false ? "default" : "success"}>
                    {product.available === false ? "Hidden" : "Live"}
                  </Chip>
                </span>
              </button>
            ))}
          </div>

          {/* the editor for the selected one */}
          <div className="grid items-start gap-4 @6xl:grid-cols-2">
            <Panel title="Details" description="Name and the small lines under it.">
              <div className="grid gap-4 @2xl:grid-cols-2">
                <TextInput label="Name" value={active.name} onChange={(value) => update("name", value)} placeholder="Product name" />
                <TextInput label="Tagline" value={active.tagline} onChange={(value) => update("tagline", value)} placeholder="by Incial" />
                <TextInput label="Category" value={active.category ?? ""} onChange={(value) => update("category", value)} placeholder="Enterprise Software" />
                <TextInput
                  label="Tags"
                  description="Separate with commas."
                  value={tagsText ?? (active.tags ?? []).join(", ")}
                  onChange={(value) => {
                    setTagsText(value);
                    update("tags", value.split(",").map((tag) => tag.trim()).filter(Boolean));
                  }}
                  placeholder="Task Management, CRM, Reporting"
                />
              </div>
              <div className="flex flex-wrap gap-6">
                <ToggleSwitch label="Available" description="Shown on the Products page" isSelected={active.available !== false} onChange={(value) => update("available", value)} />
                <ToggleSwitch label="Featured" isSelected={Boolean(active.featured)} onChange={(value) => update("featured", value)} />
              </div>
            </Panel>

            <Panel title="Explore button" description="Where the Explore button goes.">
              <TextInput
                label="Product address"
                description="Leave empty to send visitors to the contact section instead."
                value={active.tryUrl}
                onChange={(value) => update("tryUrl", value)}
                placeholder="https://…"
              />
            </Panel>
            <Panel
              title="Banner"
              description="Upload an image, a video, or both. Uploading a video automatically switches the banner to Video; use the toggle to switch anytime."
              className="@6xl:col-span-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <ToggleButtonGroup
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([active.mediaType ?? (active.video ? "video" : "image")])}
                  onSelectionChange={(keys) => {
                    const next = Array.from(keys)[0];
                    if (next === "image" || next === "video") update("mediaType", next);
                  }}
                >
                  <ToggleButton id="image">Show Image</ToggleButton>
                  <ToggleButton id="video">
                    <ToggleButtonGroup.Separator />
                    Show Video
                  </ToggleButton>
                </ToggleButtonGroup>
                <span className="text-xs text-muted">
                  {(active.mediaType ?? (active.video ? "video" : "image")) === "video"
                    ? active.video
                      ? "Video will display on the product page"
                      : "Upload or choose a video below"
                    : "Image will display on the product page"}
                </span>
              </div>

              <div className="grid gap-4 @2xl:grid-cols-2">
                <ImageUpload
                  label={active.mediaType === "video" || active.video ? "Poster / fallback image" : "Product image"}
                  value={active.image}
                  onChange={(value) => update("image", value)}
                  folder="images/products"
                />
                <ImageUpload
                  kind="video"
                  label="Product video (auto-activates Video mode)"
                  value={active.video ?? ""}
                  onChange={(value) =>
                    updateFields({
                      video: value,
                      mediaType: value ? "video" : "image",
                    })
                  }
                  folder="videos/products"
                />
              </div>
            </Panel>


            <Panel
              title="Description"
              className="@6xl:col-span-2"
              description="The first sentence is shown beside the picture."
              actions={
                <Button size="sm" variant="secondary" onPress={() => update("description", [...paragraphsOf(active), ""])}>
                  <Plus size={14} />
                  Add paragraph
                </Button>
              }
            >
              {paragraphsOf(active).map((paragraph, index) => (
                <div key={index} className="flex items-start gap-2">
                  <TextAreaInput label={`Paragraph ${index + 1}`} value={paragraph} onChange={(value) => setParagraph(index, value)} rows={3} />
                  <Button
                    isIconOnly
                    size="sm"
                    variant="danger-soft"
                    aria-label={`Remove paragraph ${index + 1}`}
                    className="mt-6"
                    onPress={() => update("description", paragraphsOf(active).filter((_, i) => i !== index))}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </Panel>

            <div>
              <Button variant="danger-soft" onPress={() => setConfirmDelete(true)}>
                <Trash2 size={15} />
                Delete this product
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this product?"
        message={`“${active?.name || "Untitled product"}” will be removed once you save. This cannot be undone after saving.`}
        onConfirm={deleteProduct}
      />
    </div>
  );
}
