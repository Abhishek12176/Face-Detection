export interface EmotionTheme {
  name: string;
  emoji: string;
  bgGradient: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  memeQuote: string;
  roasts: string[];
}

export const EMOTION_CONFIG: Record<string, EmotionTheme> = {
  happy: {
    name: "Happy",
    emoji: "😂",
    bgGradient: "from-amber-950 via-yellow-950/80 to-slate-950",
    accentColor: "text-yellow-400",
    badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    borderColor: "border-yellow-400",
    memeQuote: "Bhai has kyun raha hai? 😂",
    roasts: [
      "Itna kyun battisi dikha raha hai? Lottery lagi hai ya crush ne reply diya? 🤡",
      "Has mat bhai, daant me palak phasa hua hai! 🥬",
      "Aisi smile toh bas free ka khana dekh ke aati hai! 🍕",
      "Zyada khush mat ho, Monday kal hi hai! 💀",
    ],
  },
  angry: {
    name: "Angry",
    emoji: "🤬",
    bgGradient: "from-red-950 via-rose-950/80 to-slate-950",
    accentColor: "text-red-500",
    badgeBg: "bg-red-500/20 text-red-300 border-red-500/40",
    borderColor: "border-red-500",
    memeQuote: "Gussa thuk do, mood kharab ho jayega 🤬",
    roasts: [
      "Calm down Singham! Tere gusse se machhar bhi nahi darega! 🦟",
      "Aankhein laal karke kya faayda? Kaam toh phir bhi karna padega! 📚",
      "Itna gussa BP badha dega, chal ek cup cutting chai pi le! ☕",
      "Tamatar jaisa laal ho gaya hai, salad me cut hona hai kya? 🍅",
    ],
  },
  sad: {
    name: "Sad",
    emoji: "😭",
    bgGradient: "from-blue-950 via-sky-950/80 to-slate-950",
    accentColor: "text-blue-400",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    borderColor: "border-blue-400",
    memeQuote: "Rula mat yaar, memes dekh 😭",
    roasts: [
      "Arijit Singh ki playlist pehle band kar, phir aana! 💔",
      "Devdas ki audition chal rahi hai kya yahan? 🎻",
      "Itna dukh toh math paper dekh ke bhi nahi hua tha! 📉",
      "Aankhon se dariya bahaoge toh room me flood aa jayega bhai! 🌊",
    ],
  },
  surprise: {
    name: "Surprise / Confused",
    emoji: "🤔",
    bgGradient: "from-purple-950 via-fuchsia-950/80 to-slate-950",
    accentColor: "text-purple-400",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    borderColor: "border-purple-400",
    memeQuote: "Kya soch raha hai? CAT hai kya? 🤔",
    roasts: [
      "Aisa muh banaya jaise account balance me negative balance dekh liya ho! 💸",
      "CAT ya UPSC ka cutoff yaad aa gaya kya achanak? 🧠",
      "Shocked aise hai jaise mummy ne phone ka browser history dekh liya ho! 📱",
      "Mouth band karle bhai, makhi ghus jayegi! 🪰",
    ],
  },
  neutral: {
    name: "Neutral",
    emoji: "😐",
    bgGradient: "from-slate-900 via-gray-900 to-black",
    accentColor: "text-gray-300",
    badgeBg: "bg-gray-700/30 text-gray-300 border-gray-600/40",
    borderColor: "border-gray-400",
    memeQuote: "Kuch toh bol, dead kyun hai? 😐",
    roasts: [
      "Bhai statue ban gaya kya? Aadhaar card ki photo lag raha hai! 🪪",
      "Thoda emotion daal shakal me, NPC bhi tujhse zyada react karta hai! 🤖",
      "Living organism hai ya Wi-Fi router ka signal? Hil toh sahi! 🗿",
      "Monday morning attendance lag rahi hai kya? Chehra thoda brighten kar! ☀️",
    ],
  },
  disgust: {
    name: "Disgust",
    emoji: "🤢",
    bgGradient: "from-emerald-950 via-green-950/80 to-slate-950",
    accentColor: "text-green-400",
    badgeBg: "bg-green-500/20 text-green-300 border-green-500/40",
    borderColor: "border-green-400",
    memeQuote: "Eww bhai! Kya dekh liya aisa? 🤢",
    roasts: [
      "Aisa expression jaise kisi ne Maggi me ketchup aur mayonnaise daal di ho! 🤮",
      "Karela juice pi liya kya bina bataye? 🥒",
      "Sheesha dekh liya kya galti se? 🪞",
    ],
  },
  fear: {
    name: "Fear",
    emoji: "😱",
    bgGradient: "from-violet-950 via-indigo-950/80 to-slate-950",
    accentColor: "text-violet-400",
    badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    borderColor: "border-violet-400",
    memeQuote: "Darr ke aage jeet hai, par yaha bhoot hai kya? 😱",
    roasts: [
      "Peeche dekh peeche... assignment deadline khadi hai! 👻",
      "Itna darr lag raha hai toh mummy ko bula le! 🤱",
      "Kaunsi horror movie ka trauma yaad aa gaya bhai? 🍿",
    ],
  },
};

export const DEFAULT_THEME = EMOTION_CONFIG.neutral;
