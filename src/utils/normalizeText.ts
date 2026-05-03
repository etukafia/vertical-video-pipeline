// Dictionary for American to British English normalization
const dict: Record<string, string> = {
  color: "colour",
  colors: "colours",
  colorful: "colourful",
  optimize: "optimise",
  optimized: "optimised",
  optimizes: "optimises",
  optimization: "optimisation",
  program: "programme",
  programs: "programmes",
  flavor: "flavour",
  flavors: "flavours",
  flavorful: "flavourful",
  behavior: "behaviour",
  behaviors: "behaviours",
  analyze: "analyse",
  analyzed: "analysed",
  analyzes: "analyses",
  realize: "realise",
  realized: "realised",
  realizes: "realises",
  organize: "organise",
  organized: "organised",
  organizes: "organises",
  center: "centre",
  centers: "centres",
  centered: "centred"
};

export function normalizeText(text: string): string {
  let normalized = text;
  
  // Use regex to replace whole words case-insensitively while preserving original case
  for (const [american, british] of Object.entries(dict)) {
    const regex = new RegExp(`\\b${american}\\b`, 'gi');
    normalized = normalized.replace(regex, (match) => {
      // Preserve capitalization
      if (match === match.toUpperCase()) {
        return british.toUpperCase();
      }
      if (match[0] === match[0].toUpperCase()) {
        return british.charAt(0).toUpperCase() + british.slice(1);
      }
      return british;
    });
  }

  return normalized;
}
