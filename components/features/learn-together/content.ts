/** The words of the LearnTogether page, kept apart from the layout so they are easy to edit. */

export const LT_COLORS = {
  paper: "#f4f0e6",
  ink: "#151716",
  lime: "#b8ef5a",
  blue: "#56a6ff",
  coral: "#ff6b57",
  lilac: "#c9a7ff",
  sun: "#ffd24d",
} as const;

export const INTRO =
  "LearnTogether is Incial's learning initiative designed to help students move beyond theory and start building real-world skills.";

export const INTRO_TAGLINE = "We don't just teach concepts. We help you create with them.";

export const CURIOSITY_LINES = ["No large classrooms.", "No rigid systems.", "Just people learning by doing."] as const;

export interface ExploreTrack {
  title: string;
  text: string;
  color: string;
  ink: string;
  /** The illustrated character for this track (see Characters.tsx). */
  character: "designer" | "coder" | "marketer" | "maker";
}

export const EXPLORE: ReadonlyArray<ExploreTrack> = [
  { title: "Design", text: "Branding, UI/UX, visual systems, creative thinking.", color: LT_COLORS.lilac, ink: LT_COLORS.ink, character: "designer" },
  { title: "Technology", text: "Digital tools, product building, automation, systems.", color: LT_COLORS.blue, ink: LT_COLORS.ink, character: "coder" },
  { title: "Marketing", text: "Strategy, social growth, campaign execution, storytelling.", color: LT_COLORS.coral, ink: LT_COLORS.ink, character: "marketer" },
  { title: "Creative Skills", text: "Ideation, presentation, communication, execution.", color: LT_COLORS.sun, ink: LT_COLORS.ink, character: "maker" },
];

export const BUILDING_ROLES = ["A Learning Hub", "A Maker Space", "A Collaborative Community"] as const;

export interface JourneyStep {
  title: string;
  text: string;
  color: string;
}

export const JOURNEY: ReadonlyArray<JourneyStep> = [
  { title: "Discover", text: "Understand what the skill truly means, why it matters and where it's applied.", color: LT_COLORS.lime },
  { title: "Learn", text: "Break down the fundamentals, tools, systems, frameworks.", color: LT_COLORS.blue },
  { title: "Build", text: "Create something real, a brand identity, campaign plan, prototype, workflow system.", color: LT_COLORS.coral },
  { title: "Apply", text: "Use it in real scenarios. Build portfolio-ready outputs. Execute practically.", color: LT_COLORS.lilac },
];

export const APPROACH_TEXT = [
  "Incial was built because we learned together. LearnTogether exists so the next generation can do the same, but faster, better, and with guidance.",
  "We believe practical learning should be accessible, structured, and community-driven.",
] as const;

export const APPROACH_TRAITS: ReadonlyArray<{
  label: string;
  note: string;
  color: string;
  rotate: number;
  character: "designer" | "coder" | "marketer" | "maker";
}> = [
  { label: "Playful", note: "Curiosity first. We learn by trying things, not by memorising them.", color: LT_COLORS.sun, rotate: -8, character: "maker" },
  { label: "Deeply collaborative", note: "Designers, coders and marketers build side by side, like a real team.", color: LT_COLORS.lime, rotate: 5, character: "marketer" },
  { label: "Skill-driven", note: "Every session leaves you able to do something you could not do before.", color: LT_COLORS.lilac, rotate: -4, character: "designer" },
  { label: "Outcome-focused", note: "You leave with real work to show, not just notes.", color: LT_COLORS.coral, rotate: 7, character: "coder" },
];

export const JOIN_POINTS = ["Join a workshop.", "Collaborate with like-minded peers.", "Turn skills into real-world output."] as const;
