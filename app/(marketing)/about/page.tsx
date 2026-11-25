import { loadAboutData } from "@/lib/dataLoader";
import { AboutSection } from "@/components/sections";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const aboutData = await loadAboutData();

  return <AboutSection initialData={aboutData} />;
}
