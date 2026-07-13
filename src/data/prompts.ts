export const prompts = [
  { id: 1, title: "Prompt 1", text: "Make a Diwali poster for my supermarket in Telugu and english." },
  { id: 2, title: "Prompt 2", text: "Create a festival ad for my beauty salon in Telugu." },
  { id: 3, title: "Prompt 3", text: "Design a Pongal poster for my small restaurant in Tamil." },
  { id: 4, title: "Prompt 4", text: "Make an Eid offer poster for my clothing shop in Hindi and english." },
  { id: 5, title: "Prompt 5", text: "Create a Ganesh Chaturthi poster for my sweets shop in Marathi." },
  { id: 6, title: "Prompt 6", text: "Design an Onam ad for my grocery store in Malayalam." },
];

export const METRICS = [
  { key: "prompt_adherence", label: "Prompt Adherence", description: "Does the poster follow the requested business, festival, offer, and overall requirements?" },
  { key: "cultural_accuracy", label: "Cultural Accuracy", description: "Are the festival symbols, colors, traditions, and overall context appropriate?" },
  { key: "language_correctness", label: "Language Correctness", description: "Is the English and regional language mostly correct?" },
  { key: "text_readability", label: "Text Readability", description: "Is the text easy to read and naturally placed?" },
  { key: "visual_appeal", label: "Visual Appeal", description: "Does the poster look attractive, balanced, and professional?" },
  { key: "business_usability", label: "Business Usability", description: "Could a small business post this directly on WhatsApp or Instagram without major edits?" },
  { key: "overall_preference", label: "Overall Preference", description: "Which poster would you choose if you owned the business?" },
];

export const MODELS = ["Model_A", "Model_B", "Model_C"];

export const getPrompt = (id: number) => prompts.find((p) => p.id === id);
