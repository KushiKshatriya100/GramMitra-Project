import { Skill } from "./skills";

type LocalizedText = {
  en: string;
  hi: string;
};

type CategoryItem = {
  en: Skill;   // 🔥 strongly typed (prevents mismatch bugs)
  hi: string;
};

type Section = {
  title: LocalizedText;
  items: CategoryItem[];
};

export const sections: Section[] = [
  {
    title: {
      en: "Home Appliance Repair",
      hi: "घरेलू उपकरण मरम्मत",
    },
    items: [
      { en: "ac repair", hi: "एसी मरम्मत" },
      { en: "refrigerator repair", hi: "फ्रिज मरम्मत" },
      { en: "washing machine repair", hi: "वॉशिंग मशीन मरम्मत" },
      { en: "microwave repair", hi: "माइक्रोवेव मरम्मत" },
      { en: "geyser repair", hi: "गीजर मरम्मत" },
      { en: "water purifier repair", hi: "वॉटर प्यूरीफायर मरम्मत" },
      { en: "chimney repair", hi: "चिमनी मरम्मत" },
    ],
  },
  {
    title: {
      en: "Electronics & Electrical",
      hi: "इलेक्ट्रॉनिक्स और इलेक्ट्रिकल",
    },
    items: [
      { en: "tv repair", hi: "टीवी मरम्मत" },
      { en: "mobile repair", hi: "मोबाइल मरम्मत" },
      { en: "laptop repair", hi: "लैपटॉप मरम्मत" },
      { en: "electrical wiring", hi: "इलेक्ट्रिकल वायरिंग" },
      { en: "inverter repair", hi: "इन्वर्टर मरम्मत" },
    ],
  },
  {
    title: {
      en: "Plumbing & Water",
      hi: "प्लंबिंग और पानी सेवाएं",
    },
    items: [
      { en: "plumbing", hi: "प्लंबिंग" },
      { en: "water tank cleaning", hi: "पानी की टंकी सफाई" },
      { en: "leakage fixing", hi: "लीकेज ठीक करना" },
      { en: "motor pump repair", hi: "मोटर पंप मरम्मत" },
    ],
  },
  {
    title: {
      en: "Cleaning Services",
      hi: "सफाई सेवाएं",
    },
    items: [
      { en: "house cleaning", hi: "घर की सफाई" },
      { en: "deep cleaning", hi: "डीप क्लीनिंग" },
      { en: "kitchen cleaning", hi: "किचन सफाई" },
      { en: "bathroom cleaning", hi: "बाथरूम सफाई" },
      { en: "sofa cleaning", hi: "सोफा सफाई" },
    ],
  },
  {
    title: {
      en: "Personal Services",
      hi: "व्यक्तिगत सेवाएं",
    },
    items: [
      { en: "maid", hi: "मेड" },
      { en: "cook", hi: "रसोइया" },
      { en: "babysitter", hi: "बेबीसिटर" },
      { en: "elder care", hi: "बुजुर्ग देखभाल" },
      { en: "beautician", hi: "ब्यूटीशियन" },
      { en: "haircut", hi: "हेयरकट" },
    ],
  },
  {
    title: {
      en: "Education & Skills",
      hi: "शिक्षा और कौशल",
    },
    items: [
      { en: "tuition", hi: "ट्यूशन" },
      { en: "math tutor", hi: "गणित शिक्षक" },
      { en: "english tutor", hi: "अंग्रेज़ी शिक्षक" },
      { en: "computer training", hi: "कंप्यूटर प्रशिक्षण" },
    ],
  },
  {
    title: {
      en: "Construction & Repair",
      hi: "निर्माण और मरम्मत",
    },
    items: [
      { en: "carpenter", hi: "बढ़ई" },
      { en: "painter", hi: "पेंटर" },
      { en: "mason", hi: "राजमिस्त्री" },
      { en: "interior repair", hi: "इंटीरियर मरम्मत" },
    ],
  },
  {
    title: {
      en: "Rural Services",
      hi: "ग्रामीण सेवाएं",
    },
    items: [
      { en: "tractor repair", hi: "ट्रैक्टर मरम्मत" },
      { en: "solar panel", hi: "सोलर पैनल" },
      { en: "agriculture pump", hi: "कृषि पंप" },
      { en: "fencing", hi: "फेंसिंग" },
    ],
  },
];