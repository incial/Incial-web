import { Poppins } from "next/font/google";

/**
 * Poppins, the site's own font, with every weight loaded so the products headings can step through
 * them letter by letter as the cursor moves over the text.
 */
export const flexFont = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
