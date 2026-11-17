export const NVS_OFFICIAL_LINKS = {
  home: "https://navodaya.gov.in",
  portal: "https://cbseitms.rcil.gov.in/nvs",
  prospectus: "https://navodaya.gov.in",
  apply: "https://cbseitms.rcil.gov.in/nvs",
  results: "https://cbseitms.rcil.gov.in/nvs",
};

export const NVS_GUIDES = [
  {
    id: "class-6",
    title: "Class 6 JNVST",
    badge: "Admissions",
    description: "Eligibility, age-limit, entrance pattern, syllabus and prep tips for Class 6 admissions.",
    bullets: [
      "Eligibility: candidates studying in Class 5 in a recognized school within the district",
      "Age limit: generally 9 to 13 years as per current NVS notification",
      "Exam pattern: Mental Ability, Arithmetic, Language",
      "Preparation tips: practice reasoning, reading comprehension, and quick arithmetic drills",
    ],
    actionLabel: "Apply Online",
    href: NVS_OFFICIAL_LINKS.apply,
  },
  {
    id: "class-9",
    title: "Class 9 Lateral Entry",
    badge: "Lateral",
    description: "Vacant seat criteria, selection rules and focused preparation for English, Hindi, Maths and Science.",
    bullets: [
      "Vacant seat preference applies for specific districts and categories",
      "Syllabus emphasis: English, Hindi, Mathematics and Science fundamentals",
      "Selection depends on performance and seat availability after the official process",
      "Students should verify the latest district-wise notification before applying",
    ],
    actionLabel: "Download Prospectus",
    href: NVS_OFFICIAL_LINKS.prospectus,
  },
  {
    id: "class-11",
    title: "Class 11 Lateral Entry",
    badge: "Streams",
    description: "Track stream selection across Science, Commerce and Humanities with official eligibility and process rules.",
    bullets: [
      "Stream selection is based on the student’s academic record and available seats",
      "Science stream usually requires strong fundamentals in Mathematics and Science",
      "Commerce/Humanities need focus on language, social sciences and analytical writing",
      "Check the latest NVS board announcement for category-wise cutoffs and timelines",
    ],
    actionLabel: "Check Official Result",
    href: NVS_OFFICIAL_LINKS.results,
  },
  {
    id: "results",
    title: "Results, Admit Cards & Merit Lists",
    badge: "Official",
    description: "Track admit cards, results and merit list updates from the official NVS and CBSE portals.",
    bullets: [
      "Admit cards are released in the official notification window before the exam",
      "Results are published on the official NVS or CBSE portal once declared",
      "Merit lists and counselling documents should be verified with official PDF notices",
      "Always cross-check the announcement date with the latest circular and district notice",
    ],
    actionLabel: "Check Official Result",
    href: NVS_OFFICIAL_LINKS.results,
  },
];
