/**
 * Shared font loader for OG image routes.
 *
 * Why custom fonts: The default Satori font only includes regular (400)
 * and bold (700) weights. When we set fontWeight: 900, it just fakes
 * thickness from the 700 weight — which looks thin. By loading the
 * actual Inter Black (900) font file, we get genuinely thick strokes
 * that make hero numbers pop on the card.
 *
 * We also load Inter Regular (400) so labels render cleanly at their
 * intended weight instead of being approximated.
 */

/**
 * Top-level fetch: runs once when the edge function cold-starts,
 * then the result is cached in memory for subsequent requests.
 * This avoids re-reading the font file on every single image request.
 */
const interExtraBold = fetch(
  new URL("./fonts/Inter-ExtraBold.woff", import.meta.url)
).then((res) => res.arrayBuffer());

const interRegular = fetch(
  new URL("./fonts/Inter-Regular.woff", import.meta.url)
).then((res) => res.arrayBuffer());

const spaceGroteskBold = fetch(
  new URL("./fonts/SpaceGrotesk-Bold.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

/**
 * Returns the fonts config array to pass to ImageResponse options.
 *
 * Usage in an OG route:
 *   import { getOgFonts } from "../og-fonts";
 *   return new ImageResponse(jsx, { width: 1080, height: 1080, fonts: await getOgFonts() });
 */
export async function getOgFonts() {
  const [extraBoldData, regularData, spaceGroteskData] = await Promise.all([
    interExtraBold,
    interRegular,
    spaceGroteskBold,
  ]);
  return [
    {
      name: "Inter",
      data: regularData,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "Inter",
      data: extraBoldData,
      weight: 900 as const,
      style: "normal" as const,
    },
    {
      name: "SpaceGrotesk",
      data: spaceGroteskData,
      weight: 700 as const,
      style: "normal" as const,
    },
  ];
}
