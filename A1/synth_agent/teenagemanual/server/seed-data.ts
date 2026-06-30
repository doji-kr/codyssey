/**
 * Sample seed data for Teenage Manual Clone
 * This file contains sample data for 9 Teenage Engineering devices
 * and their associated guides, FAQs, and controls.
 * 
 * Run with: node seed-data.mjs
 */

export const DEVICES_DATA = [
  {
    slug: "ep-133",
    name: "K.O. II",
    displayName: "EP–133",
    category: "sampler",
    description: "64 MB sampler and beat composer. Learn how to sample, chop, sequence patterns, and build complete tracks.",
    shortDescription: "64 mb sampler composer.",
    sortOrder: 1,
  },
  {
    slug: "ep-40",
    name: "RIDDIM",
    displayName: "EP–40",
    category: "sampler",
    description: "Original layering machine with intuitive workflow for creating rhythmic patterns.",
    shortDescription: "original layering machine.",
    sortOrder: 2,
  },
  {
    slug: "ep-1320",
    name: "MEDIEVAL",
    displayName: "EP–1320",
    category: "synthesizer",
    description: "Instrumentalis electronicum. A unique synthesizer for experimental sound design.",
    shortDescription: "instrumentalis electronicum.",
    sortOrder: 3,
  },
  {
    slug: "op-1f",
    name: "OP-1 Field",
    displayName: "OP–1F",
    category: "synthesizer",
    description: "Portable synthesizer workstation. A complete music production studio in your hands.",
    shortDescription: "portable synthesizer workstation.",
    sortOrder: 4,
  },
  {
    slug: "op-xy",
    name: "OP-XY",
    displayName: "OP–XY",
    category: "controller",
    description: "The next chapter of OP. A revolutionary controller for modern music production.",
    shortDescription: "the next chapter of op.",
    sortOrder: 5,
  },
  {
    slug: "op-1",
    name: "OP-1",
    displayName: "OP–1",
    category: "synthesizer",
    description: "The original portable studio. The device that started it all.",
    shortDescription: "the original portable studio.",
    sortOrder: 6,
  },
  {
    slug: "tx-6",
    name: "TX-6",
    displayName: "TX–6",
    category: "mixer",
    description: "Six channel field mixer. Professional audio mixing in a compact form.",
    shortDescription: "six channel field mixer.",
    sortOrder: 7,
  },
  {
    slug: "tp-7",
    name: "TP-7",
    displayName: "TP–7",
    category: "recorder",
    description: "Field recorder and transcriber. Capture and transcribe audio anywhere.",
    shortDescription: "field recorder & transcriber.",
    sortOrder: 8,
  },
  {
    slug: "cm-15",
    name: "CM-15",
    displayName: "CM–15",
    category: "microphone",
    description: "Wired condenser microphone. Professional audio capture for any setup.",
    shortDescription: "wired condenser microphone.",
    sortOrder: 9,
  },
];

export const GUIDES_DATA = [
  // K.O. II Guides
  {
    deviceSlug: "ep-133",
    slug: "first-beat",
    title: "Make Your First Beat",
    description: "Step-by-step guide to creating your first beat on the K.O. II",
    category: "mastery",
    isFree: true,
    sortOrder: 1,
  },
  {
    deviceSlug: "ep-133",
    slug: "sampling",
    title: "Sample a Sound",
    description: "Learn how to record and manipulate samples",
    category: "guide",
    isFree: true,
    sortOrder: 2,
  },
  {
    deviceSlug: "ep-133",
    slug: "sequencing",
    title: "Step Sequencing",
    description: "Master the sequencer for creating patterns",
    category: "guide",
    isFree: true,
    sortOrder: 3,
  },
  {
    deviceSlug: "ep-133",
    slug: "effects",
    title: "Master Effects",
    description: "Explore the effects engine and sound design",
    category: "guide",
    isFree: false,
    sortOrder: 4,
  },
  // OP-1 Field Guides
  {
    deviceSlug: "op-1f",
    slug: "getting-started",
    title: "Getting Started",
    description: "Introduction to the OP-1 Field",
    category: "mastery",
    isFree: true,
    sortOrder: 1,
  },
  {
    deviceSlug: "op-1f",
    slug: "synthesis",
    title: "Synthesis Basics",
    description: "Learn the fundamentals of sound synthesis",
    category: "guide",
    isFree: true,
    sortOrder: 2,
  },
];

export const GUIDE_STEPS_DATA = [
  // First Beat Guide Steps
  {
    guideSlug: "first-beat",
    deviceSlug: "ep-133",
    stepNumber: 1,
    title: "Power On and Initialize",
    content: "Turn on your K.O. II using the power switch on the top-right. Wait for the display to initialize.",
    relatedControls: ["power-switch"],
    tips: null, // Added tips property
    sortOrder: 1,
  },
  {
    guideSlug: "first-beat",
    deviceSlug: "ep-133",
    stepNumber: 2,
    title: "Set Your Tempo",
    content: "Press the tempo button to set your desired BPM. Use the +/- buttons to adjust.",
    relatedControls: ["tempo-button"],
    tips: null, // Added tips property
    sortOrder: 2,
  },
  {
    guideSlug: "first-beat",
    deviceSlug: "ep-133",
    stepNumber: 3,
    title: "Load a Sample",
    content: "Hold the sample button and select a sample from the library using the pads.",
    relatedControls: ["sample-button"],
    tips: null, // Added tips property
    sortOrder: 3,
  },
  {
    guideSlug: "first-beat",
    deviceSlug: "ep-133",
    stepNumber: 4,
    title: "Create a Pattern",
    content: "Use the pads to tap out a rhythm. Each pad represents a different drum sound.",
    relatedControls: ["pad-1", "pad-2", "pad-3"],
    tips: null, // Added tips property
    sortOrder: 4,
  },
  {
    guideSlug: "first-beat",
    deviceSlug: "ep-133",
    stepNumber: 5,
    title: "Add Effects",
    content: "Press the FX button to add effects to your pattern. Experiment with reverb and delay.",
    relatedControls: ["fx-button"],
    tips: null, // Added tips property
    sortOrder: 5,
  },
  {
    guideSlug: "first-beat",
    deviceSlug: "ep-133",
    stepNumber: 6,
    title: "Record and Play",
    content: "Press record to capture your performance. Press play to hear your beat.",
    relatedControls: ["record-button", "play-button"],
    tips: null, // Added tips property
    sortOrder: 6,
  },
];

export const FAQS_DATA = [
  // K.O. II FAQs
  {
    deviceSlug: "ep-133",
    question: "How do I sample a sound?",
    answer: "Hold **sample**, then tap a pad to record straight from the line-in. The K.O. II will record up to 64 MB of audio.",
    category: "sampling",
    relatedControls: null, // Added relatedControls property
    sortOrder: 1,
  },
  {
    deviceSlug: "ep-133",
    question: "How do I make my first beat?",
    answer: "Follow the 'Make Your First Beat' mastery track for a step-by-step guide. You'll learn sampling, sequencing, and effects.",
    category: "workflow",
    relatedControls: null, // Added relatedControls property
    sortOrder: 2,
  },
  {
    deviceSlug: "ep-133",
    question: "How do patterns and scenes work?",
    answer: "Patterns are 1-bar sequences. Scenes let you organize multiple patterns. Use the group buttons to switch between them.",
    category: "sequencing",
    relatedControls: null, // Added relatedControls property
    sortOrder: 3,
  },
  {
    deviceSlug: "ep-133",
    question: "How do I chop a sample?",
    answer: "In sound edit mode, use the chop function to automatically slice your sample into pieces. Adjust the number of slices with the +/- buttons.",
    category: "sampling",
    relatedControls: null, // Added relatedControls property
    sortOrder: 4,
  },
  {
    deviceSlug: "ep-133",
    question: "How do I use the effects?",
    answer: "Press the FX button to enter effects mode. Use the orange and black knobs to adjust effect parameters.",
    category: "effects",
    relatedControls: null, // Added relatedControls property
    sortOrder: 5,
  },
  {
    deviceSlug: "ep-133",
    question: "How do I change the tempo/BPM?",
    answer: "Press the tempo button, then use the +/- buttons to adjust. The display shows the current BPM.",
    category: "workflow",
    relatedControls: null, // Added relatedControls property
    sortOrder: 6,
  },
  // OP-1 Field FAQs
  {
    deviceSlug: "op-1f",
    question: "How do I get started with the OP-1 Field?",
    answer: "Start with the 'Getting Started' guide. It covers power-on, basic navigation, and your first synthesis patch.",
    category: "workflow",
    relatedControls: null, // Added relatedControls property
    sortOrder: 1,
  },
  {
    deviceSlug: "op-1f",
    question: "What are the different synthesis engines?",
    answer: "The OP-1 Field includes FM, wavetable, and sampler engines. Each offers unique sound design possibilities.",
    category: "synthesis",
    relatedControls: null, // Added relatedControls property
    sortOrder: 2,
  },
];

export const DEVICE_CONTROLS_DATA = [
  // K.O. II Controls
  {
    deviceSlug: "ep-133",
    controlId: "power-switch",
    name: "Power Switch",
    description: "Turn the device on and off",
    positionX: 85,
    positionY: 5,
    width: 5,
    height: 5,
    sortOrder: 1,
  },
  {
    deviceSlug: "ep-133",
    controlId: "master-volume",
    name: "Master Volume",
    description: "Control overall output level",
    positionX: 5,
    positionY: 5,
    width: 8,
    height: 8,
    sortOrder: 2,
  },
  {
    deviceSlug: "ep-133",
    controlId: "tempo-button",
    name: "Tempo Button",
    description: "Set and adjust BPM",
    positionX: 45,
    positionY: 15,
    width: 8,
    height: 8,
    sortOrder: 3,
  },
  {
    deviceSlug: "ep-133",
    controlId: "sample-button",
    name: "Sample Button",
    description: "Record samples from input",
    positionX: 30,
    positionY: 40,
    width: 8,
    height: 8,
    sortOrder: 4,
  },
  {
    deviceSlug: "ep-133",
    controlId: "fx-button",
    name: "FX Button",
    description: "Access effects and output settings",
    positionX: 50,
    positionY: 40,
    width: 8,
    height: 8,
    sortOrder: 5,
  },
  {
    deviceSlug: "ep-133",
    controlId: "record-button",
    name: "Record Button",
    description: "Start recording your performance",
    positionX: 75,
    positionY: 85,
    width: 8,
    height: 8,
    sortOrder: 6,
  },
  {
    deviceSlug: "ep-133",
    controlId: "play-button",
    name: "Play Button",
    description: "Play or stop playback",
    positionX: 60,
    positionY: 85,
    width: 8,
    height: 8,
    sortOrder: 7,
  },
  {
    deviceSlug: "ep-133",
    controlId: "pad-1",
    name: "Pad 1",
    description: "Trigger first drum sound",
    positionX: 20,
    positionY: 60,
    width: 8,
    height: 8,
    sortOrder: 8,
  },
  {
    deviceSlug: "ep-133",
    controlId: "pad-2",
    name: "Pad 2",
    description: "Trigger second drum sound",
    positionX: 35,
    positionY: 60,
    width: 8,
    height: 8,
    sortOrder: 9,
  },
  {
    deviceSlug: "ep-133",
    controlId: "pad-3",
    name: "Pad 3",
    description: "Trigger third drum sound",
    positionX: 50,
    positionY: 60,
    width: 8,
    height: 8,
    sortOrder: 10,
  },
];
