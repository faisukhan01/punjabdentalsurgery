import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

/**
 * Edits the doctor's photo: face preserved 1:1, outfit changed to a crisp
 * white dentist coat, professional pose, premium ivory/crimson clinic bg.
 */
async function main() {
  const input = "/home/z/my-project/upload/pasted_image_1790074448622.png";
  const output = process.argv[2] ?? "/home/z/my-project/download/doctor-edit-1.png";
  const prompt = process.argv[3] ?? DEFAULT_PROMPT;

  const zai = await ZAI.create();
  const base64 = fs.readFileSync(input).toString("base64");
  const dataUrl = `data:image/png;base64,${base64}`;

  const response = await zai.images.generations.edit({
    prompt,
    images: [{ url: dataUrl }],
    size: "864x1152",
  });

  const out = response.data?.[0]?.base64;
  if (!out) throw new Error("No image returned");
  fs.writeFileSync(output, Buffer.from(out, "base64"));
  console.log(`saved: ${output} (${Math.round(fs.statSync(output).size / 1024)} KB)`);
}

const DEFAULT_PROMPT = `Keep the man's face, hairstyle, mustache, skin tone, age and facial expression EXACTLY identical to the original photo - do not modify or regenerate his face at all, it must remain the very same person with the very same face. Only change his clothing and the background: replace the black blazer and dark shirt with an elegant, crisp, well-fitted white dentist medical coat worn over a light shirt, and refine his pose into a confident, professional standing portrait with arms gently crossed. Replace the background with a bright, clean, modern dental clinic interior in soft ivory-white and warm neutral tones with a subtle deep-crimson red accent, softly blurred with shallow depth of field. Premium editorial portrait photography, soft diffused studio lighting, high-end healthcare brand aesthetic.`;

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
