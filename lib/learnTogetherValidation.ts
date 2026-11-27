import type {
  LearnTogetherCommunity,
  LearnTogetherData,
  LearnTogetherEvent,
  LearnTogetherPhoto,
  LearnTogetherTestimonial,
  Stat,
} from "@/lib/dataLoader";

export interface LearnTogetherValidationError {
  path: string;
  message: string;
}

/** How many of each the page shows at most (keeps the document and the page a sensible size). */
const LIMITS = { stats: 8, gallery: 40, events: 30, testimonials: 30 } as const;
const SHORT = 120;
const MEDIUM = 300;
const LONG = 900;
const URL_MAX = 1000;

type Errors = LearnTogetherValidationError[];
type Fields = Record<string, unknown>;

function asObject(value: unknown): Fields | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Fields) : null;
}

function text(fields: Fields, key: string, path: string, max: number, errors: Errors, required: boolean): string {
  const raw = fields[key];
  const value = typeof raw === "string" ? raw.trim() : "";
  if (raw !== undefined && typeof raw !== "string") errors.push({ path: `${path}.${key}`, message: `${key} must be text.` });
  else if (required && !value) errors.push({ path: `${path}.${key}`, message: `${key} is required.` });
  else if (value.length > max) errors.push({ path: `${path}.${key}`, message: `${key} must be at most ${max} characters.` });
  return value;
}

/** A picture on this site ("/...") or an https:// address; never another scheme. */
function isImageUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function image(fields: Fields, key: string, path: string, errors: Errors, required: boolean): string {
  const value = text(fields, key, path, URL_MAX, errors, required);
  if (value && !isImageUrl(value)) errors.push({ path: `${path}.${key}`, message: "Upload the image, or use an https:// address." });
  return value;
}

function id(fields: Fields, path: string, errors: Errors): string {
  const raw = fields.id;
  const value = typeof raw === "string" || typeof raw === "number" ? String(raw).trim() : "";
  if (!value || value.length > 64) errors.push({ path: `${path}.id`, message: "id is required." });
  return value;
}

function list<T>(body: Fields, key: keyof typeof LIMITS, errors: Errors, read: (fields: Fields, path: string) => T): T[] {
  const raw = body[key];
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    errors.push({ path: key, message: `${key} must be a list.` });
    return [];
  }
  if (raw.length > LIMITS[key]) errors.push({ path: key, message: `At most ${LIMITS[key]} ${key} can be shown.` });
  return raw.slice(0, LIMITS[key]).flatMap((item, index) => {
    const fields = asObject(item);
    const path = `${key}[${index}]`;
    if (!fields) {
      errors.push({ path, message: "Each entry must be an object." });
      return [];
    }
    return [read(fields, path)];
  });
}

/** A page on this site ("/...", "#...") or an https:// link. */
function isLinkUrl(value: string): boolean {
  if ((value.startsWith("/") && !value.startsWith("//")) || value.startsWith("#")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function community(body: Fields, errors: Errors): LearnTogetherCommunity {
  const fields = asObject(body.community) ?? {};
  const url = text(fields, "url", "community", URL_MAX, errors, false);
  if (url && !isLinkUrl(url)) errors.push({ path: "community.url", message: "Use a page on this site (/...) or an https:// link." });
  return {
    title: text(fields, "title", "community", SHORT, errors, false),
    text: text(fields, "text", "community", MEDIUM, errors, false),
    buttonLabel: text(fields, "buttonLabel", "community", 40, errors, false),
    url,
  };
}

/** Checks and tidies the LearnTogether content before it is saved. */
export function validateLearnTogetherData(input: unknown): { data: LearnTogetherData | null; errors: Errors } {
  const errors: Errors = [];
  const body = asObject(input);
  if (!body) return { data: null, errors: [{ path: "", message: "Body must be an object." }] };

  const stats = list<Stat>(body, "stats", errors, (fields, path) => ({
    id: id(fields, path, errors),
    value: text(fields, "value", path, 16, errors, true),
    label: text(fields, "label", path, 60, errors, true),
  }));
  const gallery = list<LearnTogetherPhoto>(body, "gallery", errors, (fields, path) => ({
    id: id(fields, path, errors),
    img: image(fields, "img", path, errors, true),
    caption: text(fields, "caption", path, 80, errors, false),
  }));
  const events = list<LearnTogetherEvent>(body, "events", errors, (fields, path) => ({
    id: id(fields, path, errors),
    title: text(fields, "title", path, SHORT, errors, true),
    date: text(fields, "date", path, 40, errors, false),
    location: text(fields, "location", path, 80, errors, false),
    summary: text(fields, "summary", path, MEDIUM, errors, false),
    img: image(fields, "img", path, errors, false),
  }));
  const testimonials = list<LearnTogetherTestimonial>(body, "testimonials", errors, (fields, path) => ({
    id: id(fields, path, errors),
    quote: text(fields, "quote", path, LONG, errors, true),
    name: text(fields, "name", path, 80, errors, true),
    role: text(fields, "role", path, 80, errors, false),
    img: image(fields, "img", path, errors, false),
  }));

  const layout = body.testimonialLayout;
  if (layout !== undefined && layout !== "chat" && layout !== "marquee" && layout !== "spotlight") {
    errors.push({ path: "testimonialLayout", message: 'testimonialLayout must be "chat", "marquee" or "spotlight".' });
  }
  const testimonialLayout = layout === "marquee" || layout === "spotlight" ? layout : "chat";

  const result: LearnTogetherData = { stats, gallery, events, testimonials, community: community(body, errors), testimonialLayout };
  return errors.length > 0 ? { data: null, errors } : { data: result, errors };
}
