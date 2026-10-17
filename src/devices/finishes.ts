/**
 * Colour palettes for the metal band of each phone. A finish is three tones
 * of the band (lit, mid, shaded) plus the rim light, the chamfer highlight
 * where the band meets the glass, and the two button tones. Front glass is
 * near-black for every finish, so it lives on the model, not here.
 */
export type Finish = {
  bandHi: string;
  bandMid: string;
  bandLo: string;
  /** Specular line along the top edge of the band. */
  rim: string;
  /** Thin light ring on the inner edge of the band. */
  chamfer: string;
  buttonHi: string;
  buttonLo: string;
};

const finish = (
  hi: string,
  mid: string,
  lo: string,
  options: { rim?: number; chamfer?: number } = {},
): Finish => ({
  bandHi: hi,
  bandMid: mid,
  bandLo: lo,
  rim: `rgba(255, 255, 255, ${options.rim ?? 0.6})`,
  chamfer: `rgba(255, 255, 255, ${options.chamfer ?? 0.22})`,
  buttonHi: hi,
  buttonLo: lo,
});

export const FINISHES = {
  // Titanium (iPhone 16 Pro, Galaxy S25 Ultra)
  "titanium-natural": finish("#D6D2CB", "#A9A59E", "#7E7A73"),
  "titanium-black": finish("#5A5A5E", "#2C2C30", "#141416", { rim: 0.35 }),
  "titanium-white": finish("#F0EEEA", "#CFCCC6", "#A3A09A", { rim: 0.85 }),
  "titanium-desert": finish("#D9C3A3", "#B39B79", "#86704F"),
  "titanium-blue": finish("#4A5566", "#2C3542", "#171D26", { rim: 0.4 }),
  "titanium-silverblue": finish("#B9C3CF", "#8E99A7", "#5F6977"),
  "titanium-gray": finish("#8E8E92", "#626266", "#3E3E42", { rim: 0.45 }),
  "titanium-whitesilver": finish("#E6E6E6", "#C2C2C4", "#96969A", { rim: 0.8 }),
  // Aluminium (iPhone 17 Pro, iPhone 17, iPhone 16)
  "aluminium-silver": finish("#E4E4E6", "#BEBEC2", "#8E8E93", { rim: 0.8 }),
  "aluminium-cosmic-orange": finish("#F0772E", "#C85A1A", "#8F3E10"),
  "aluminium-deep-blue": finish("#2F4A72", "#1E3356", "#101D33", { rim: 0.4 }),
  "aluminium-black": finish("#3A3A3E", "#1E1E22", "#0E0E11", { rim: 0.3 }),
  "aluminium-white": finish("#F2F1EE", "#D2D1CD", "#A6A5A1", { rim: 0.85 }),
  "aluminium-sage": finish("#C3CCBB", "#98A48D", "#6B7762"),
  "aluminium-lavender": finish("#D9D2EA", "#B2A8CB", "#857A9E"),
  "aluminium-mist-blue": finish("#C9D9E6", "#9FB5C7", "#70879A"),
  "aluminium-pink": finish("#F2C9D6", "#D49DB1", "#A66F84"),
  "aluminium-teal": finish("#9FD1CB", "#6AA6A0", "#437771"),
  "aluminium-ultramarine": finish("#8E9CE0", "#5E6DBF", "#3B4788", {
    rim: 0.5,
  }),
  // Pixel (polished aluminium)
  "pixel-obsidian": finish("#4A4B50", "#202125", "#0E0F12", { rim: 0.4 }),
  "pixel-porcelain": finish("#ECE9E2", "#CBC7BF", "#9E9A92", { rim: 0.85 }),
  "pixel-moonstone": finish("#9EA3AD", "#6E737D", "#474B54", { rim: 0.5 }),
  "pixel-jade": finish("#B9CFC3", "#8CA89A", "#5F7A6C"),
  "pixel-hazel": finish("#C4B08E", "#9E8A68", "#70604A"),
  "pixel-rose-quartz": finish("#E9C9C6", "#C9A4A1", "#9A7673"),
  // Galaxy S25 (Armor aluminium)
  "galaxy-navy": finish("#2B3550", "#1B2338", "#0E1322", { rim: 0.35 }),
  "galaxy-icy-blue": finish("#C9DCEB", "#9FB7CC", "#6F8AA3", { rim: 0.8 }),
  "galaxy-mint": finish("#CFE3D3", "#A3C2AA", "#73957C"),
  "galaxy-silver-shadow": finish("#D4D4D6", "#A9A9AD", "#7C7C81", {
    rim: 0.75,
  }),
} as const satisfies Record<string, Finish>;

export type FinishId = keyof typeof FINISHES;
