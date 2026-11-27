/**
 * Route fallback: a plain black screen (the home page's greetings and intro, and the other pages'
 * heroes, all open on black). The greetings are played once by the home page itself
 * (app/page.tsx); this fallback used to run its own greeting loop too, so the greetings restarted
 * when the page took over and, on a slow load, repeated several times.
 */
export default function Loading() {
  return <div className="fixed inset-0 z-50 bg-black" />;
}
