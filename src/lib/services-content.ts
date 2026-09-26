import { CLINIC } from "@/lib/clinic";

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceDetail {
  /** URL slug: /services/<slug> */
  slug: string;
  /** Exact bookable service name (matches SERVICE_NAMES in clinic.ts). */
  name: string;
  /** Short label for links and cards. */
  navTitle: string;
  metaTitle: string;
  metaDescription: string;
  /** Page H1 — carries the local search signal naturally. */
  h1: string;
  intro: string[];
  included: { title: string; desc: string }[];
  comfort: string[];
  goodToKnow: string[];
  faqs: ServiceFaq[];
}

const BOOK_LINE = `Book online in under a minute, or call ${CLINIC.phone} — you will get a confirmation with your own token number for the day.`;

export const SERVICES: ServiceDetail[] = [
  {
    slug: "dental-checkup",
    name: "General Dental Checkup",
    navTitle: "Dental Checkup",
    metaTitle: "Dental Checkup in Johar Town, Lahore | Punjab Dental Surgery",
    metaDescription:
      "Thorough dental checkup in Johar Town, Lahore by Dr. Muhammad Siddique (BDS, RDS). Honest diagnosis, a clear treatment plan and upfront pricing. Open every day 5 PM – 12 AM.",
    h1: "Dental Checkup in Johar Town, Lahore",
    intro: [
      `Regular checkups are the easiest way to avoid big dental problems — small cavities and early gum trouble are simple to treat when they are caught in time. At Punjab Dental Surgery in ${CLINIC.address}, ${CLINIC.doctor} examines your whole mouth carefully and tells you plainly what he finds.`,
      `You will always leave your first visit with three things: an honest diagnosis, a clear plan (if anything needs doing), and the full cost of that plan written down before anything starts. If your teeth are healthy, we will happily tell you so — no treatment is ever suggested that you do not need.`,
    ],
    included: [
      {
        title: "Full mouth examination",
        desc: "Teeth, gums, tongue and existing dental work checked one by one.",
      },
      {
        title: "Cavity & gum screening",
        desc: "Early decay and gum inflammation spotted before they become painful.",
      },
      {
        title: "Honest diagnosis",
        desc: "What matters now, what can wait, and what needs no treatment at all.",
      },
      {
        title: "Written treatment plan",
        desc: "A clear plan with the cost of each step — quoted before anything starts.",
      },
    ],
    comfort: [
      "The checkup itself is completely comfortable — nothing sharp touches a healthy tooth, and we explain what we are doing as we go.",
      "Nervous about dentists? Tell us at the start. We slow down, explain first, and only continue when you are ready.",
      "Bring old X-rays or previous dental records if you have them — they help, but they are not required.",
    ],
    goodToKnow: [
      "A first checkup usually takes 15–30 minutes.",
      "The consultation is free — if treatment is advised, you get the price upfront and decide in your own time.",
      `Evening hours: open every day 5:00 PM – 12:00 AM, so you can come after work or school. ${BOOK_LINE}`,
    ],
    faqs: [
      {
        q: "How often should I get a dental checkup?",
        a: "Once every 6–12 months is right for most people. If you have gum problems, braces, or a history of frequent cavities, the doctor may suggest coming in a little more often — you will be told plainly at your visit.",
      },
      {
        q: "Does a checkup hurt?",
        a: "No. A checkup is looking, not treating — a small mirror and a gentle probe are all that touch your teeth. If anything sensitive shows up, we discuss it before any treatment is planned.",
      },
      {
        q: "What if I need treatment after the checkup?",
        a: "You get a clear plan with the cost of each step written down. Nothing is started the same day unless you ask for it — you decide in your own time.",
      },
    ],
  },
  {
    slug: "teeth-scaling",
    name: "Teeth Cleaning & Scaling",
    navTitle: "Teeth Scaling",
    metaTitle: "Teeth Scaling & Cleaning in Johar Town, Lahore | Punjab Dental Surgery",
    metaDescription:
      "Gentle teeth scaling and polishing in Johar Town, Lahore. Remove plaque, tartar and stains, and keep your gums healthy. Open every day 5 PM – 12 AM — book online.",
    h1: "Teeth Scaling & Cleaning in Johar Town, Lahore",
    intro: [
      `Even with good brushing, plaque hardens into tartar in places your brush cannot reach — and that tartar is what makes gums bleed and breath smell. Scaling removes it gently with ultrasonic cleaning, and polishing lifts the everyday stains that tea, chai and paan leave behind.`,
      `At Punjab Dental Surgery in ${CLINIC.address}, scaling is done thoroughly but gently — most patients are surprised at how comfortable a proper cleaning feels, and how clean their teeth look afterwards.`,
    ],
    included: [
      {
        title: "Ultrasonic scaling",
        desc: "Tartar removed from above and below the gumline, tooth by tooth.",
      },
      {
        title: "Polishing",
        desc: "Surface stains lifted so teeth feel smooth and look brighter.",
      },
      {
        title: "Gum check",
        desc: "Gums examined for inflammation and bleeding — early gum disease is quiet.",
      },
      {
        title: "Home-care guidance",
        desc: "Brushing and flossing technique shown for your actual teeth, not a leaflet.",
      },
    ],
    comfort: [
      "Ultrasonic cleaning is a fine vibration and cool water mist — uncomfortable at most, painful rarely. Tell us if a spot feels sharp and we adjust straight away.",
      "Sensitive teeth? Mention it before we start — we work around sensitivity instead of through it.",
      "Gums that bleed during scaling are gums that needed it — they usually stop bleeding within days as they heal.",
    ],
    goodToKnow: [
      "A full scaling and polishing session usually takes 30–45 minutes.",
      "Most people do well with scaling once or twice a year; the doctor will tell you what your gums actually need.",
      `The fee is quoted before we begin. ${BOOK_LINE}`,
    ],
    faqs: [
      {
        q: "Does teeth scaling weaken or loosen teeth?",
        a: "No — this is a common myth. Scaling removes tartar that is harming your gums and the bone around your teeth. Teeth feel loose after scaling only when they were already being held loosely by unhealthy gums; removing the tartar lets the gums tighten and heal.",
      },
      {
        q: "Will there be gaps or sensitivity after scaling?",
        a: "The space you feel between teeth was already filled with tartar. Mild sensitivity to cold for a few days is normal and settles on its own. We will tell you honestly at your checkup what to expect for your teeth.",
      },
      {
        q: "How often should scaling be done?",
        a: "For most patients once or twice a year keeps gums healthy. Smokers, diabetics and people with heavy tartar build-up benefit from more frequent cleaning — your plan is based on your mouth, not a fixed package.",
      },
    ],
  },
  {
    slug: "root-canal-treatment",
    name: "Root Canal Treatment",
    navTitle: "Root Canal",
    metaTitle: "Root Canal Treatment in Johar Town, Lahore | Punjab Dental Surgery",
    metaDescription:
      "Root canal treatment in Johar Town, Lahore by Dr. Muhammad Siddique (BDS, RDS). Save your natural tooth with careful, thoroughly numbed treatment. Open every day 5 PM – 12 AM.",
    h1: "Root Canal Treatment in Johar Town, Lahore",
    intro: [
      `When the soft tissue inside a tooth becomes infected or inflamed — usually from deep decay or a crack — the tooth does not have to be pulled. Root canal treatment cleans out the infection inside the tooth, seals it, and lets you keep your natural tooth for years to come.`,
      `${CLINIC.doctor} does root canals carefully and step by step at Punjab Dental Surgery, ${CLINIC.address}. You will know what is happening at every stage, and the tooth is thoroughly numbed before any work begins.`,
    ],
    included: [
      {
        title: "Diagnosis & X-ray",
        desc: "Confirming the tooth is truly the culprit before anything starts.",
      },
      {
        title: "Thorough numbing",
        desc: "Local anaesthesia given properly and given time to work.",
      },
      {
        title: "Cleaning & shaping",
        desc: "Infected tissue removed, canals cleaned and shaped to the tip.",
      },
      {
        title: "Sealing & restoration",
        desc: "Canals sealed and the tooth rebuilt — with a crown advised when the tooth needs one.",
      },
    ],
    comfort: [
      "A root canal should feel like a long filling — the tooth is numbed first and stays numbed. If you feel anything sharp at any point, raise your hand and we stop and add anaesthetic.",
      "The procedure has an old, scary reputation. With proper anaesthesia it is routine; the sleepless nights of toothache usually end the same evening.",
      "Mild tenderness when biting for a few days afterwards is normal and settles — we tell you exactly what to expect for your tooth.",
    ],
    goodToKnow: [
      "Most root canals are completed in 1–3 visits depending on the tooth and the infection.",
      "A tooth after root canal is weaker than a live tooth — if a crown is advised, it is advised for a reason, and the reason is explained.",
      `Saving a natural tooth is almost always better than removing it. The full cost is quoted before treatment starts. ${BOOK_LINE}`,
    ],
    faqs: [
      {
        q: "Is a root canal painful?",
        a: "The tooth is fully numbed before work begins, so you should not feel pain during the procedure — pressure and movement, but not pain. The infection itself is what causes severe pain, and root canal treatment is what relieves it. After the visit, mild soreness for a few days is normal.",
      },
      {
        q: "Why not just remove the tooth?",
        a: "Nothing works as well as your own tooth. Extraction leads to shifting teeth, chewing problems on that side, and the cost of replacing the tooth later. A root canal keeps your natural tooth — and it is explained honestly if an extraction truly is the better option in your case.",
      },
      {
        q: "How many visits will it take?",
        a: "Many root canals finish in one to two visits; badly infected teeth may need a third to settle fully. You are told the expected number of visits for your tooth before treatment begins.",
      },
    ],
  },
  {
    slug: "braces-orthodontics",
    name: "Braces & Orthodontics",
    navTitle: "Braces",
    metaTitle: "Braces & Orthodontics in Johar Town, Lahore | Punjab Dental Surgery",
    metaDescription:
      "Braces and orthodontic treatment in Johar Town, Lahore for children, teens and adults. Straighten crowded or spaced teeth with a clear plan and honest pricing.",
    h1: "Braces & Orthodontics in Johar Town, Lahore",
    intro: [
      `Crooked, crowded or spaced teeth affect far more than a smile — they are harder to clean and easier for decay to hide in. Orthodontic treatment moves teeth into a healthy, even position gradually, for children, teenagers and adults alike.`,
      `At Punjab Dental Surgery in ${CLINIC.address}, orthodontic treatment starts with a proper assessment: what is moving, why, how long it will take, and what it will cost — all discussed clearly before anything is fitted.`,
    ],
    included: [
      {
        title: "Full orthodontic assessment",
        desc: "Bite, jaw relation and tooth position studied before any plan is made.",
      },
      {
        title: "Clear treatment plan",
        desc: "What will move, how long it should take, and the total cost — written down.",
      },
      {
        title: "Fitting & adjustments",
        desc: "Braces fitted comfortably, then checked and adjusted on a regular schedule.",
      },
      {
        title: "Retention advice",
        desc: "Retainers and follow-up so the result stays long after the braces come off.",
      },
    ],
    comfort: [
      "Fitting braces does not hurt — it is glue and positioning, not drilling. Teeth feel tender for a few days after each adjustment; soft food and patience get you through.",
      "Wax is provided for the first week while your cheeks learn where the brackets are.",
      "Adults get braces too — age is not a barrier, healthy gums are the real requirement, and your gums are checked first.",
    ],
    goodToKnow: [
      "Treatment time is usually 18–24 months, but your mouth decides — the estimate for your case is given at the assessment.",
      "Visits for adjustments are every 4–6 weeks, in the evening if that suits you — open every day 5:00 PM – 12:00 AM.",
      `The full cost is explained at the start, including retainers — no surprise charges halfway through. ${BOOK_LINE}`,
    ],
    faqs: [
      {
        q: "What is the right age for braces?",
        a: "Children are best assessed around 7–10 years old so any jaw-growth issues are caught early, but braces themselves are commonly fitted from 11–12 onwards. Adults can be treated at any age as long as gums and bone are healthy.",
      },
      {
        q: "Braces or aligners — which should I choose?",
        a: "It depends on the case. Fixed braces handle complex movements very reliably; removable aligners suit milder problems and are barely visible. You will be told honestly which one fits your teeth — and which one does not.",
      },
      {
        q: "Will braces affect eating or speaking?",
        a: "Speech is barely affected after a few days. Hard, sticky foods are off the list for a while — the foods to avoid are explained when braces are fitted, so nothing is a surprise.",
      },
    ],
  },
  {
    slug: "teeth-whitening",
    name: "Teeth Whitening",
    navTitle: "Teeth Whitening",
    metaTitle: "Teeth Whitening in Johar Town, Lahore | Punjab Dental Surgery",
    metaDescription:
      "Safe, dentist-supervised teeth whitening in Johar Town, Lahore. Lift everyday stains and brighten your smile in a single visit — honest advice about what whitening can and cannot do.",
    h1: "Teeth Whitening in Johar Town, Lahore",
    intro: [
      `Teeth naturally darken with age, tea, chai and tobacco. Whitening lightens the shade of your teeth safely, under a dentist's supervision — no harsh home experiments on your enamel.`,
      `At Punjab Dental Surgery in ${CLINIC.address}, whitening starts with honesty: your teeth are examined first, and you are told candidly what shade change is realistic for you — and whether whitening will help at all.`,
    ],
    included: [
      {
        title: "Shade assessment",
        desc: "Your current shade recorded so the change is real and visible, not guessed.",
      },
      {
        title: "Gum protection",
        desc: "Gums carefully isolated and protected before any gel is applied.",
      },
      {
        title: "In-clinic whitening",
        desc: "Professional whitening gel applied and activated — most of the change in one visit.",
      },
      {
        title: "Aftercare guidance",
        desc: "What to eat and avoid in the first days, and how to keep the shade longer.",
      },
    ],
    comfort: [
      "Whitening is not drilling — most patients relax completely through it. Some feel brief tingling on a few teeth; it passes quickly after the session.",
      "Existing sensitivity is checked first — if your teeth are already sensitive, we tell you how to prepare rather than pushing ahead.",
      "Fillings, crowns and bridges do not whiten — if that applies to you, you are told before you pay, not after.",
    ],
    goodToKnow: [
      "A whitening session usually takes about an hour.",
      "Results vary from person to person — you will be shown what is realistic for your teeth, and results are not promised beyond that.",
      `The fee is quoted before the session starts. ${BOOK_LINE}`,
    ],
    faqs: [
      {
        q: "Is teeth whitening safe for my enamel?",
        a: "Professional whitening under a dentist's supervision is safe — the gums are protected and the gel strength is controlled. Problems come from unsupervised home remedies and overused products, which is exactly what this avoids.",
      },
      {
        q: "How long do the results last?",
        a: "Usually from several months up to a couple of years, depending on tea, coffee and tobacco habits. Occasional top-up sessions keep the shade. You will get honest aftercare advice to make it last as long as possible.",
      },
      {
        q: "Will it work on all my teeth?",
        a: "It whitens natural teeth only. Fillings, crowns and caps keep their original colour — if you have visible dental work on front teeth, the options are explained before treatment rather than after.",
      },
    ],
  },
  {
    slug: "kids-dentistry",
    name: "Kids Dentistry",
    navTitle: "Kids Dentistry",
    metaTitle: "Kids Dentistry in Johar Town, Lahore | Punjab Dental Surgery",
    metaDescription:
      "Friendly, patient dental care for children in Johar Town, Lahore. First checkups, fillings and fluoride — gentle visits that build brave, happy dental patients.",
    h1: "Kids Dentistry in Johar Town, Lahore",
    intro: [
      `A child's first dental visits decide how they feel about dentists for life. That is why children at Punjab Dental Surgery are never rushed and never frightened — the first visit is kept short, friendly and mostly about trust.`,
      `${CLINIC.doctor} treats children in ${CLINIC.address} for checkups, cavities, fluoride and everyday dental problems — and tells parents plainly what needs doing now and what can safely wait for the next tooth.`,
    ],
    included: [
      {
        title: "Gentle first visit",
        desc: "A ride on the chair, a look inside, and a good experience — that is the whole goal on visit one.",
      },
      {
        title: "Checkups & small fillings",
        desc: "Cavities caught early and treated calmly, before they turn into sleepless nights.",
      },
      {
        title: "Fluoride & prevention advice",
        desc: "Practical guidance on brushing, sugar and bottles for your child's actual habits.",
      },
      {
        title: "Parent partnership",
        desc: "Everything explained to the parent in the room — no treatment decisions made over the child's head.",
      },
    ],
    comfort: [
      "Children are shown the tools and allowed to ask anything — nothing happens before the child is settled.",
      "There is no shame in a first visit ending with just a look and a sticker. Brave visits are built, not forced.",
      "Evening hours mean no school is missed — open every day 5:00 PM – 12:00 AM.",
    ],
    goodToKnow: [
      `The first checkup is recommended by around the first birthday, or whenever the first teeth show — late is okay too, just come. ${BOOK_LINE}`,
      "Milk teeth matter: they hold space for adult teeth and infections in them are not something to wait out.",
      "Bring your child's favourite small toy if it helps — whatever makes the visit easier is welcome.",
    ],
    faqs: [
      {
        q: "When should my child first see a dentist?",
        a: "By the first birthday, or within a few months of the first tooth appearing — whichever comes first. Early visits are mostly about getting comfortable, and they make every later visit easier.",
      },
      {
        q: "It's only a milk tooth — does it need treating?",
        a: "Yes, often. Milk teeth hold the space for adult teeth, and an untreated cavity can infect the permanent tooth developing underneath. The doctor will tell you honestly when a milk tooth can be left alone and when it truly needs treatment.",
      },
      {
        q: "My child is terrified of dentists. What then?",
        a: "That is common and completely okay. The first visit becomes an introduction: sit in the chair, see the mirror, meet the doctor — no treatment. Fearful children who are allowed to settle become easy patients; frightened children who are forced do not.",
      },
    ],
  },
];

export function findService(slug: string): ServiceDetail | undefined {
  return SERVICES.find((s) => s.slug === slug);
}
