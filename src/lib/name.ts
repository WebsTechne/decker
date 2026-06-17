const adjectives = [
  "swift",
  "dark",
  "cool",
  "bright",
  "sharp",
  "wild",
  "calm",
  "bold",
  "silent",
  "cosmic",
  "shadow",
  "silver",
  "golden",
  "frost",
  "blaze",
  "iron",
  "hyper",
  "lunar",
  "neon",
  "quantum",
  "hidden",
  "mystic",
  "ancient",
  "stellar",
  "phantom",
  "crimson",
  "emerald",
  "cobalt",
  "vivid",
  "alpha",
]

const nouns = [
  "falcon",
  "tiger",
  "coder",
  "hawk",
  "wolf",
  "fox",
  "bear",
  "eagle",
  "knight",
  "ranger",
  "hacker",
  "vortex",
  "matrix",
  "phoenix",
  "titan",
  "cyborg",
  "specter",
  "wizard",
  "ninja",
  "seeker",
  "scout",
  "rogue",
  "hunter",
  "samurai",
  "warrior",
  "beacon",
  "pulsar",
  "comet",
  "nebula",
  "apex",
]

function generateUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 999)
  return `${adj}_${noun}${num}`
}

function safeFileName(name: string) {
  return name.replace(/[<>:"/\\|?*]/g, "-").trim()
}

export { safeFileName, generateUsername }
