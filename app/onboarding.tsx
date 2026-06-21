import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, FONTS } from "../src/theme";

export const ONBOARDING_KEY = "onboarding_v1";
export const PROFILE_KEY = "coach_profile_v1";

const G = {
  gold: "#c8a050",
  goldDim: "rgba(200,160,80,0.10)",
  goldBorder: "rgba(200,160,80,0.22)",
  goldBorderStrong: "rgba(200,160,80,0.5)",
  surface: "rgba(255,255,255,0.04)",
  surfaceBorder: "rgba(255,255,255,0.07)",
  detail: "rgba(255,255,255,0.05)",
  text: "#e8e4dc",
  muted: "#7a7060",
  bg: COLORS.background,
};

type Lang = "de" | "en";
type Screen = "lang" | "landing" | "slides" | "wizard";
type Profile = Record<string, string | string[]>;
type Question =
  | { key: string; type: "text"; q: string | ((p: Profile) => string); sub: string; placeholder: string }
  | { key: string; type: "single" | "multi"; q: string; sub: string; options: string[] };

type Slide = {
  icon: string;
  tag: string;
  title: string;
  body: string;
  detail: string;
  example: string;
};

// ─── SLIDE CONTENT ────────────────────────────────────────────────────────────

const SLIDES_DE: Slide[] = [
  {
    icon: "📈",
    tag: "Das Gesetz der marginalen Gewinne",
    title: "Der Zinseszins-Effekt",
    body: "1% besser pro Tag klingt nach nichts. Nach einem Jahr bist du 37-mal besser. 1% schlechter: du bist auf fast null. Gewohnheiten sind die unsichtbaren Zinsen deines Lebens.",
    detail: "Das Paradoxe: Im Alltag merkst du kaum einen Unterschied. Ein Workout macht dich nicht fitter. Ein Tag Lesen macht dich nicht klüger. Aber nach drei Jahren ist der Abstand enorm.\n\nErgebnisse sind immer ein Nachhall vergangener Entscheidungen — sie kommen mit Verzögerung. Du erntest heute, was du vor Monaten gesät hast. Das macht Gewohnheiten so mächtig: und so unsichtbar.",
    example: "Täglich 20 Minuten lesen = 24 Bücher im Jahr. Das entspricht dem Inhalt von 3–4 Universitätskursen — ohne Auswendiglernen.",
  },
  {
    icon: "🧊",
    tag: "Das Tal der Enttäuschung",
    title: "Plateau der latenten Potenziale",
    body: "Du erhitzt Eis von −10°C auf −1°C — nichts passiert sichtbar. Dann 0°C: alles schmilzt. Hat die Wärme vorher nichts bewirkt? Doch — sie hat sich angesammelt. Genau so funktionieren Gewohnheiten.",
    detail: "Die meisten Menschen geben auf, bevor der Durchbruch kommt — im Tal der Enttäuschung. Du trainierst wochenlang ohne sichtbare Veränderung. Du lernst Spanisch und fühlst keine Verbesserung. Du sparst Geld und siehst keinen Fortschritt.\n\nAber die Arbeit wird nicht verschwendet — sie wird gespeichert. Der Durchbruch kommt nicht mit der Arbeit. Er kommt nach dem Plateau. Das Einzige, was du tun musst: lange genug durchhalten.",
    example: "Bambus wächst 5 Jahre lang unsichtbar unter der Erde. Dann schießt er in 6 Wochen 25 Meter in die Höhe. Die Wurzeln waren die ganze Zeit da.",
  },
  {
    icon: "⚙️",
    tag: "Prozess-basiertes Denken",
    title: "Systeme schlagen Ziele",
    body: "Gewinner und Verlierer haben oft dieselben Ziele. Was sie unterscheidet: das System dahinter. Ziele zeigen die Richtung — Systeme bringen dich ans Ziel, dauerhaft.",
    detail: "Das Problem mit reinen Zielen:\n\n1. Ziele sind momentan: Hast du dein Ziel erreicht, was dann? Viele fallen danach zurück.\n\n2. Ziele verschieben Glück: 'Ich bin glücklich, wenn ich X erreiche' — das macht unglücklich bis dahin. Systeme machen den Prozess zur Belohnung.\n\n3. Ziele geben keine Handlungen vor: 'Ich will abnehmen' ist kein Plan. 'Jeden Abend um 19 Uhr koche ich selbst' ist ein System.\n\nFall in love with the process — not the destination.",
    example: "Statt 'Ich will abnehmen' → System: Sonntags meal prep. Mo+Do nach der Arbeit trainieren. Mittags kein Zucker. Wasser auf dem Schreibtisch. Keine Willenskraft nötig.",
  },
  {
    icon: "🪞",
    tag: "Identity-Based Habits",
    title: "Identität kommt zuerst",
    body: "3 Ebenen der Veränderung: Ergebnisse (was du erreichst), Prozesse (was du tust), Identität (wer du bist). Die meisten starten bei Ebene 1. Die Dauerhaften starten bei Ebene 3.",
    detail: "Jede Gewohnheit ist ein Stimmzettel für die Person, die du werden willst. Kleine Handlungen sammeln Beweise:\n\n'Ich habe heute trainiert' → 'Ich bin jemand, der trainiert' → 'Ich bin ein Sportler.'\n\nDer Glaube folgt dem Verhalten — nicht umgekehrt. Du musst nicht warten, bis du 'jemand bist'. Du wirst jemand, indem du so handelst.\n\nZwei Personen lehnen Zigaretten ab: Person A sagt 'Nein danke, ich versuche aufzuhören' (Ergebnis-Denken). Person B sagt 'Nein danke, ich bin kein Raucher' (Identität). Wer schafft es langfristig?",
    example: "Nicht: 'Ich will ein Buch schreiben.' Sondern: 'Ich bin ein Autor — Autoren schreiben täglich.' → 200 Wörter täglich = 73.000 Wörter = ein vollständiges Buch pro Jahr.",
  },
  {
    icon: "🔄",
    tag: "The Habit Loop",
    title: "Die 4 Gesetze — Übersicht",
    body: "Jede Gewohnheit folgt einem Loop: Auslöser → Verlangen → Handlung → Belohnung. Atomic Habits gibt dir 4 Hebel, diesen Loop zu gestalten — und 4 Gegenhebel für schlechte Habits.",
    detail: "Gute Habits aufbauen:\n→ Mach es offensichtlich (Cue sichtbar machen)\n→ Mach es attraktiv (Verlangen koppeln)\n→ Mach es einfach (Reibung senken)\n→ Mach es befriedigend (sofortige Belohnung)\n\nSchlechte Habits brechen — alle 4 umkehren:\n← Mach es unsichtbar (Cue verstecken)\n← Mach es unattraktiv (Nachteile bewusst machen)\n← Mach es schwierig (Reibung erhöhen)\n← Mach es unbefriedigend (Konsequenzen sichtbar)",
    example: "Handy-Sucht reduzieren: Handy in Schublade (unsichtbar), Schwarz-Weiß-Modus (unattraktiv), lange PIN (schwierig), Screen-Time-Tracker täglich ansehen (unbefriedigend).",
  },
  {
    icon: "🏠",
    tag: "Choice Architecture",
    title: "Umgebungsdesign",
    body: "Du bist nicht willenschwach — du lebst in einer Umgebung, die gegen dich arbeitet. Werde der Architekt deines Alltags: Reibung für gute Habits senken, für schlechte erhöhen.",
    detail: "Reibung reduzieren (gute Habits):\n🎸 Gitarre vor dem Sofa → spielst automatisch\n💧 Wasserflasche auf den Schreibtisch → trinkst mehr\n🏋️ Sportkleidung abends hinlegen → trainierst morgens\n📚 Buch aufs Kopfkissen → liest vor dem Schlafen\n\nReibung erhöhen (schlechte Habits):\n📱 TV-Fernbedienung in anderen Raum\n🍪 Snacks im obersten Schrank\n📵 Apps löschen statt nur ausloggen\n\nEin Raum, eine Nutzung: Dein Gehirn assoziiert Räume mit Verhalten. Schlafzimmer = Schlafen. Schreibtisch = Arbeiten.",
    example: "Harvard-Studie in einer Cafeteria: Wasser wurde sichtbarer aufgestellt — kein Gespräch, kein Poster. Ergebnis: +25% Wasserverkauf, −11% Cola. Nur durch Umgebungsdesign.",
  },
  {
    icon: "⏱",
    tag: "Gateway Habits",
    title: "Die 2-Minuten-Regel",
    body: "Neue Gewohnheiten sollen weniger als 2 Minuten dauern — nicht als Ziel, sondern als Einstieg. 'Täglich joggen' wird zu 'Schuhe anziehen und die Haustür öffnen'. Das klingt lächerlich einfach. Das ist der Punkt.",
    detail: "Das eigentliche Ziel ist nicht die 2-Minuten-Version. Das Ziel ist das Erscheinen.\n\nWer täglich ins Gym geht, lernt Training. Wer täglich schreibt, lernt Schreiben. Standardisieren vor Optimieren.\n\nDie 2-Minuten-Regel baut Identität auf: 'Ich bin jemand, der/die ___' — bevor das Volumen skaliert. Und: Selbst am schlechtesten Tag schaffst du 2 Minuten. Einmal gestartet hört man selten nach 2 Minuten auf.\n\nSkala jede neue Gewohnheit auf ihre 2-Minuten-Version, bis sie automatisch läuft. Dann steigern.",
    example: "'Täglich meditieren' → '2 Atemzüge bewusst nehmen'\n'Gesünder essen' → 'Einen Apfel auf den Tisch legen'\n'Mehr lesen' → 'Buch aufschlagen, eine Seite lesen'\n'Gym' → 'Sportkleidung anziehen'",
  },
  {
    icon: "📍",
    tag: "If-Then Planning",
    title: "Implementierungsintentionen",
    body: "Die häufigste Ausrede: 'Ich habe es vergessen.' Die Lösung: Lege im Voraus fest, wann und wo. Formel: Ich werde [VERHALTEN] um [ZEIT] in [ORT] ausführen.",
    detail: "Peter Gollwitzers NYU-Studie: Personen, die Ort und Zeit festlegten, hatten 2–3× höhere Wahrscheinlichkeit, ihr Ziel zu erreichen.\n\nBritische Sport-Studie:\n• Gruppe 1 (nur Motivation): 35% trainierten\n• Gruppe 2 (Implementierungsintention): 91% trainierten\n\nDer einzige Unterschied: Gruppe 2 schrieb auf 'Ich trainiere am Dienstag um 18 Uhr in der Sporthalle Mitte.'\n\nKombination mit Habit Stacking: 'Nach [BESTEHENDEM HABIT] werde ich [NEUEN HABIT] ausführen.' Doppelte Wirkung.",
    example: "'Ich werde jeden Montag und Donnerstag nach der Arbeit um 18:00 Uhr im Fitnessstudio trainieren.' → Diese Personen trainieren 2,4× häufiger als jene mit dem Ziel 'mehr Sport machen'.",
  },
  {
    icon: "⛓️",
    tag: "Neuronal Chaining",
    title: "Habit Stacking",
    body: "Das Gehirn liebt Muster. Koppele neue Gewohnheiten an bestehende Automatismen. Formel: 'Nach [AKTUELLER HABIT] werde ich [NEUER HABIT] ausführen.' Jedes Glied stärkt das nächste.",
    detail: "Einfache Stacks:\n☕ Morgenkaffee → 2 Min. Tagebuch schreiben\n🦷 Zähneputzen → Affirmation sprechen\n💻 Laptop öffnen → To-do-Liste schreiben\n📱 Handy laden → Buch aufs Nachttisch\n\nFortgeschrittene Ketten:\nAufwachen → Glas Wasser → 5 Min. dehnen → Tagebuch → Dusche → Podcast beim Frühstück\n\nJedes Glied löst automatisch das nächste aus. Beim Übergang bricht die Kette? 2-Minuten-Version als Fallback — dann kehre zurück zum Stack.",
    example: "BJ Fogg (Stanford Behavior Lab): 8 Liegestütze nach jedem Toilettengang. Nach einem Monat: 40–80 Liegestütze täglich — ohne dediziertes Training, ohne Motivation-Aufwand.",
  },
  {
    icon: "🤝",
    tag: "Temptation Bundling + Social Proof",
    title: "Attraktivität & soziales Umfeld",
    body: "Koppele Pflicht mit Genuss. Und: Umgib dich mit Menschen, für die dein gewünschtes Verhalten normal ist. Das Umfeld formt Identität schneller als jede Motivation.",
    detail: "Versuchungs-Bündelung:\nDu darfst [BELOHNUNG] NUR während [HABIT].\n🎧 Lieblingspodcast nur beim Laufen\n📺 Netflix nur beim Bügeln\n☕ Lieblingskaffee nur beim Lernen\n\nSoziales Umfeld:\nWir imitieren Verhalten von 3 Gruppen:\n1. Nahestehende (Familie, Freunde)\n2. Die Vielen (gesellschaftliche Normen)\n3. Bewunderte (Vorbilder, Idole)\n\nWenn alle in deiner Gruppe täglich trainieren, ist es normal — keine Willenskraft nötig. Join a tribe where your desired behavior is the expected behavior.",
    example: "Christchurch-Studie: Gym-Freunde hatten → 5× häufigeres Training. Ronan Byrne (Dublin): Koppelte Fahrrad an Netflix-Streaming — trainierte mehr Sport als je zuvor in seinem Leben.",
  },
  {
    icon: "📊",
    tag: "Never Miss Twice",
    title: "Habit Tracking & Kontinuität",
    body: "Jeden Habit visuell zu tracken macht Fortschritt greifbar und erzeugt Motivation durch Kettenwirkung. Perfektion ist nicht das Ziel — Wiederaufnahme ist die Kunst.",
    detail: "Warum Tracking funktioniert:\n1. Offensichtlich: Du siehst Fortschritt täglich\n2. Attraktiv: Die Kette verlängern motiviert mehr als das abstrakte Ziel\n3. Befriedigend: Ein Häkchen setzen = sofortige Belohnung (Gesetz 4)\n\nTrackingmethoden:\n📅 Kalender-X: Jeden Tag markieren\n📎 Büroklammer-Trick: Klammer von Schachtel A nach B\n🪣 Murmeln-Methode: Für messbare Mengen\n\nNever Miss Twice: Ein verpasster Tag = Unfall. Zwei hintereinander = Start eines neuen (schlechten) Habits. Komme zurück, bevor der zweite Tag vergeht. Kleiner Habit an schlechtem Tag > Kein Habit.",
    example: "Jerry Seinfeld markierte jeden Tag mit einem X, an dem er Witze schrieb. Sein Rat an junge Komiker: 'Don't break the chain.' Kein Erfolgsgeheimnis — nur Kontinuität.",
  },
];

const SLIDES_EN: Slide[] = [
  {
    icon: "📈",
    tag: "The Law of Marginal Gains",
    title: "The Compounding Effect",
    body: "Getting 1% better every day sounds like nothing. After one year, you're 37 times better. Getting 1% worse: you're near zero. Habits are the compound interest of your life.",
    detail: "The paradox: In daily life, you barely notice the difference a habit makes. One workout doesn't make you fitter. One day of reading doesn't make you smarter. But after three years, the gap is enormous.\n\nResults are always a lagging measure of habits — you reap today what you planted months ago. That's what makes habits so powerful: and so invisible.",
    example: "Reading 20 minutes daily = 24 books per year. That's the content of 3–4 university courses — without memorization.",
  },
  {
    icon: "🧊",
    tag: "The Valley of Disappointment",
    title: "Plateau of Latent Potential",
    body: "You heat ice from −10°C to −1°C — nothing visibly happens. Then 0°C: everything melts. Did the heat do nothing before? No — it was accumulating. Habits work exactly the same way.",
    detail: "Most people quit before the breakthrough comes — in the valley of disappointment. You train for weeks with no visible change. You learn Spanish without feeling improvement. You save money without seeing progress.\n\nBut the work isn't wasted — it's stored. The breakthrough doesn't come with the work. It comes after the plateau. The only thing you need to do: persist long enough.",
    example: "Bamboo grows invisibly underground for 5 years. Then it shoots 25 meters in 6 weeks. The roots were there the whole time.",
  },
  {
    icon: "⚙️",
    tag: "Process-Based Thinking",
    title: "Systems Beat Goals",
    body: "Winners and losers often share the same goals. What separates them: the system behind it. Goals set the direction — systems get you there, sustainably.",
    detail: "The problem with pure goals:\n\n1. Goals are momentary: Once achieved, then what? Many people revert afterward.\n\n2. Goals delay happiness: 'I'll be happy when I achieve X' — making you unhappy until then. Systems make the process the reward.\n\n3. Goals don't prescribe actions: 'I want to lose weight' is not a plan. 'Every evening at 7pm I cook at home' is a system.\n\nFall in love with the process — not the destination.",
    example: "Instead of 'I want to lose weight' → System: Sunday meal prep. Mon+Thu training after work. No sugar at lunch. Water on the desk. No willpower needed.",
  },
  {
    icon: "🪞",
    tag: "Identity-Based Habits",
    title: "Identity Comes First",
    body: "3 layers of change: Outcomes (what you achieve), Processes (what you do), Identity (who you are). Most start at layer 1. The lasting ones start at layer 3.",
    detail: "Every habit is a vote for the person you want to become. Small actions accumulate evidence:\n\n'I worked out today' → 'I'm someone who works out' → 'I'm an athlete.'\n\nBelief follows behavior — not the other way around. You don't have to wait until you 'are someone'. You become someone by acting like them.\n\nTwo people refuse cigarettes: Person A says 'No thanks, I'm trying to quit' (outcome-thinking). Person B says 'No thanks, I'm not a smoker' (identity). Who succeeds long-term?",
    example: "Not: 'I want to write a book.' But: 'I'm a writer — writers write daily.' → 200 words daily = 73,000 words = one complete book per year.",
  },
  {
    icon: "🔄",
    tag: "The Habit Loop",
    title: "The 4 Laws — Overview",
    body: "Every habit follows a loop: Cue → Craving → Response → Reward. Atomic Habits gives you 4 levers to shape this loop — and 4 counter-levers for breaking bad habits.",
    detail: "Building good habits:\n→ Make it obvious (make the cue visible)\n→ Make it attractive (link it to desire)\n→ Make it easy (reduce friction)\n→ Make it satisfying (immediate reward)\n\nBreaking bad habits — invert all 4:\n← Make it invisible (hide the cue)\n← Make it unattractive (highlight downsides)\n← Make it difficult (increase friction)\n← Make it unsatisfying (make consequences visible)",
    example: "Reduce phone addiction: Phone in drawer (invisible), black-and-white mode (unattractive), long PIN (difficult), view screen-time stats daily (unsatisfying).",
  },
  {
    icon: "🏠",
    tag: "Choice Architecture",
    title: "Environment Design",
    body: "You're not weak-willed — you live in an environment working against you. Become the architect of your surroundings: reduce friction for good habits, increase it for bad ones.",
    detail: "Reduce friction (good habits):\n🎸 Guitar in front of the sofa → play automatically\n💧 Water bottle on desk → drink more\n🏋️ Workout clothes laid out the night before → train in the morning\n📚 Book on pillow → read before sleep\n\nIncrease friction (bad habits):\n📱 TV remote in another room\n🍪 Snacks in the top shelf\n📵 Delete apps instead of just logging out\n\nOne space, one use: Your brain associates rooms with behaviors. Bedroom = sleep. Desk = work.",
    example: "Harvard study in a cafeteria: Water was placed more visibly — no conversation, no poster. Result: +25% water sales, −11% soda. Only through environment design.",
  },
  {
    icon: "⏱",
    tag: "Gateway Habits",
    title: "The 2-Minute Rule",
    body: "New habits should take less than 2 minutes — not as a goal, but as an entry point. 'Jog daily' becomes 'put on shoes and open the front door'. This sounds ridiculously easy. That's the point.",
    detail: "The real goal isn't the 2-minute version. The goal is showing up.\n\nWhoever goes to the gym daily learns training. Whoever writes daily learns writing. Standardize before optimizing.\n\nThe 2-minute rule builds identity: 'I'm someone who ___' — before scaling the volume. And: Even on your worst day, you can manage 2 minutes. Once started, you rarely stop after 2 minutes.\n\nScale every new habit to its 2-minute version until it runs automatically. Then increase.",
    example: "'Meditate daily' → 'Take 2 conscious breaths'\n'Eat healthier' → 'Put an apple on the table'\n'Read more' → 'Open the book, read one page'\n'Go to gym' → 'Put on workout clothes'",
  },
  {
    icon: "📍",
    tag: "If-Then Planning",
    title: "Implementation Intentions",
    body: "The most common excuse: 'I forgot.' The solution: decide in advance when and where. Formula: I will [BEHAVIOR] at [TIME] in [LOCATION].",
    detail: "Peter Gollwitzer's NYU study: People who set location and time had 2–3× higher probability of achieving their goal.\n\nBritish exercise study:\n• Group 1 (motivation only): 35% exercised\n• Group 2 (implementation intention): 91% exercised\n\nThe only difference: Group 2 wrote 'I will exercise on Tuesday at 6pm at the Sports Center.'\n\nCombined with Habit Stacking: 'After [CURRENT HABIT] I will [NEW HABIT].' Double the impact.",
    example: "'I will exercise every Monday and Thursday after work at 6:00pm at the gym.' → These people exercise 2.4× more often than those with the goal 'exercise more'.",
  },
  {
    icon: "⛓️",
    tag: "Neuronal Chaining",
    title: "Habit Stacking",
    body: "The brain loves patterns. Link new habits to existing automatisms. Formula: 'After [CURRENT HABIT], I will [NEW HABIT].' Each link strengthens the next.",
    detail: "Simple stacks:\n☕ Morning coffee → 2 min. journaling\n🦷 Brushing teeth → say an affirmation\n💻 Open laptop → write to-do list\n📱 Charge phone → book on nightstand\n\nAdvanced chains:\nWake up → glass of water → 5 min. stretching → journal → shower → podcast at breakfast\n\nEach link automatically triggers the next. If a link breaks: use the 2-minute version as fallback — then return to the stack.",
    example: "BJ Fogg (Stanford Behavior Lab): 8 pushups after every bathroom visit. After one month: 40–80 pushups daily — without dedicated training sessions or motivation effort.",
  },
  {
    icon: "🤝",
    tag: "Temptation Bundling + Social Proof",
    title: "Attractiveness & Social Environment",
    body: "Link obligation with pleasure. And: surround yourself with people for whom your desired behavior is normal. The environment shapes identity faster than any motivation.",
    detail: "Temptation Bundling:\nYou may [REWARD] ONLY during [HABIT].\n🎧 Favorite podcast only while running\n📺 Netflix only while ironing\n☕ Favorite coffee only while studying\n\nSocial Environment:\nWe unconsciously imitate behavior from 3 groups:\n1. Close ones (family, friends)\n2. The many (social norms)\n3. The admired (role models, idols)\n\nWhen everyone in your group trains daily, it's normal — no willpower needed. Join a tribe where your desired behavior is the expected behavior.",
    example: "Christchurch study: Gym friends led to 5× more frequent training. Ronan Byrne (Dublin): Linked stationary bike to Netflix streaming — exercised more than ever before in his life.",
  },
  {
    icon: "📊",
    tag: "Never Miss Twice",
    title: "Habit Tracking & Continuity",
    body: "Visually tracking every habit makes progress tangible and creates motivation through chain reaction. Perfection isn't the goal — resumption is the art.",
    detail: "Why tracking works:\n1. Obvious: You see progress daily\n2. Attractive: Extending the chain motivates more than the abstract goal\n3. Satisfying: Setting a checkmark = immediate reward (Law 4)\n\nTracking methods:\n📅 Calendar X: Mark every day\n📎 Paperclip trick: Move a clip from box A to B\n🪣 Marble method: For measurable quantities\n\nNever Miss Twice: One missed day = accident. Two in a row = start of a new (bad) habit. Return before the second day passes. Small habit on a bad day > no habit.",
    example: "Jerry Seinfeld marked every day he wrote jokes with an X. His advice to young comedians: 'Don't break the chain.' No success secret — just continuity.",
  },
];

// ─── WIZARD QUESTIONS ─────────────────────────────────────────────────────────

const WIZARD_DE: { title: string; questions: Question[] } = {
  title: "Dein persönliches Profil",
  questions: [
    { key: "name", type: "text", q: "Wie heißt du?", sub: "Ich möchte dich kennenlernen, bevor wir starten.", placeholder: "Dein Vorname..." },
    { key: "identity", type: "text", q: (p) => `${p.name}, wer willst du in 6 Monaten sein?`, sub: "Nicht was du tun willst — wer du sein willst.", placeholder: "Ich bin jemand, der/die ..." },
    { key: "goal_areas", type: "multi", q: "Wo willst du wachsen?", sub: "Wähle alle Bereiche, die dir wichtig sind.", options: ["💪 Gesundheit & Fitness", "🧠 Lernen & Wissen", "⚡ Produktivität", "🌿 Schlaf & Erholung", "🤝 Beziehungen", "💰 Finanzen", "🎨 Kreativität", "🧘 Mentale Gesundheit"] },
    { key: "struggles", type: "multi", q: "Woran bist du bisher gescheitert?", sub: "Ehrlichkeit hilft mehr als alles andere.", options: ["😩 Motivation bricht ein", "📉 Vergesse es nach Tagen", "😵 Starte zu groß", "🌍 Umfeld macht es schwer", "🔄 Fange ständig neu an", "⏰ Keine Zeit", "🎯 Zu viele Ziele gleichzeitig", "👥 Fehlende Unterstützung"] },
    { key: "anchor", type: "text", q: "Was machst du JEDEN Tag ohne Ausnahme?", sub: "Das wird dein Anker für Habit Stacking.", placeholder: "z.B. Morgenkaffee, Zähneputzen, Mittagspause..." },
  ],
};

const WIZARD_EN: { title: string; questions: Question[] } = {
  title: "Your personal profile",
  questions: [
    { key: "name", type: "text", q: "What's your name?", sub: "I'd like to get to know you before we start.", placeholder: "Your first name..." },
    { key: "identity", type: "text", q: (p) => `${p.name}, who do you want to be in 6 months?`, sub: "Not what you want to do — who you want to be.", placeholder: "I am someone who ..." },
    { key: "goal_areas", type: "multi", q: "Where do you want to grow?", sub: "Select all areas that matter to you.", options: ["💪 Health & Fitness", "🧠 Learning & Knowledge", "⚡ Productivity", "🌿 Sleep & Recovery", "🤝 Relationships", "💰 Finances", "🎨 Creativity", "🧘 Mental Health"] },
    { key: "struggles", type: "multi", q: "Where have you struggled in the past?", sub: "Honesty helps more than anything else.", options: ["😩 Motivation collapses", "📉 Forget after a few days", "😵 Start too big", "🌍 Environment makes it hard", "🔄 Keep starting over", "⏰ No time", "🎯 Too many goals at once", "👥 No support"] },
    { key: "anchor", type: "text", q: "What do you do EVERY day without exception?", sub: "This will be your anchor for Habit Stacking.", placeholder: "e.g. morning coffee, brushing teeth, lunch break..." },
  ],
};

const LANDING_DE = {
  badge: "Basierend auf dem Bestseller von James Clear",
  headline: ["1% besser", "jeden Tag.", "37× besser", "in einem Jahr."],
  sub: "Atomic Habits gibt dir das System, das Willenskraft ersetzt. Keine Motivationstricks — echte Verhaltensänderung durch kleine, konsequente Handlungen. Bevor du deinen ersten Habit anlegst, zeigen wir dir das System dahinter.",
  cta: "Das System verstehen →",
  skip: "Überspringen",
};

const LANDING_EN = {
  badge: "Based on the #1 New York Times bestseller",
  headline: ["1% better", "every day.", "37× better", "in one year."],
  sub: "Atomic Habits gives you the system that replaces willpower. No motivation tricks — real behavior change through small, consistent actions. Before you create your first habit, we'll show you the system behind it.",
  cta: "Understand the system →",
  skip: "Skip",
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 4, paddingHorizontal: 24, paddingTop: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            backgroundColor: i <= current ? G.gold : G.surfaceBorder,
            opacity: i <= current ? 1 : 0.4,
          }}
        />
      ))}
    </View>
  );
}

function DetailBox({ text }: { text: string }) {
  return (
    <View style={{
      backgroundColor: G.detail,
      borderLeftWidth: 2,
      borderLeftColor: G.goldBorder,
      borderRadius: 8,
      padding: 14,
      marginTop: 16,
    }}>
      <Text style={{ fontFamily: FONTS.body, fontSize: 13.5, color: G.muted, lineHeight: 21 }}>
        {text}
      </Text>
    </View>
  );
}

function ExampleBox({ text }: { text: string }) {
  return (
    <View style={{
      backgroundColor: G.goldDim,
      borderWidth: 1,
      borderColor: G.goldBorder,
      borderRadius: 8,
      padding: 14,
      marginTop: 12,
    }}>
      <Text style={{ fontFamily: FONTS.medium, fontSize: 11, color: G.gold, letterSpacing: 1, marginBottom: 6 }}>
        BEISPIEL
      </Text>
      <Text style={{ fontFamily: FONTS.body, fontSize: 13.5, color: G.text, lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lang, setLang] = useState<Lang>("de");
  const [screen, setScreen] = useState<Screen>("lang");
  const [slideIdx, setSlideIdx] = useState(0);
  const [wizardStep, setWizardStep] = useState(0);
  const [profile, setProfile] = useState<Profile>({});
  const [textVal, setTextVal] = useState("");

  const slides = lang === "de" ? SLIDES_DE : SLIDES_EN;
  const wizard = lang === "de" ? WIZARD_DE : WIZARD_EN;
  const landing = lang === "de" ? LANDING_DE : LANDING_EN;

  const complete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, lang }));
    router.replace("/");
  };

  const currentQuestion = wizard.questions[wizardStep];
  const questionText = typeof currentQuestion?.q === "function"
    ? currentQuestion.q(profile)
    : currentQuestion?.q ?? "";

  const advanceWizard = (val: string | string[]) => {
    const updated = { ...profile, [currentQuestion.key]: val };
    setProfile(updated);
    setTextVal("");
    if (wizardStep < wizard.questions.length - 1) {
      setWizardStep((s) => s + 1);
    } else {
      // save profile and enter app
      AsyncStorage.setItem(ONBOARDING_KEY, "true");
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ ...updated, lang }));
      router.replace("/");
    }
  };

  const toggleMulti = (opt: string) => {
    const current = (profile[currentQuestion.key] as string[]) ?? [];
    const next = current.includes(opt) ? current.filter((x) => x !== opt) : [...current, opt];
    setProfile((p) => ({ ...p, [currentQuestion.key]: next }));
  };

  // ── LANGUAGE SCREEN ──────────────────────────────────────────────────────────
  if (screen === "lang") {
    return (
      <View style={{ flex: 1, backgroundColor: G.bg, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Text style={{ fontFamily: FONTS.display, fontSize: 28, color: G.text, textAlign: "center", marginBottom: 8 }}>
          Atomic Habits
        </Text>
        <Text style={{ fontFamily: FONTS.body, fontSize: 15, color: G.muted, textAlign: "center", marginBottom: 48 }}>
          Choose your language / Sprache wählen
        </Text>
        <Pressable
          onPress={() => { setLang("de"); setScreen("landing"); }}
          style={{ width: "100%", backgroundColor: G.goldDim, borderWidth: 1, borderColor: G.goldBorderStrong, borderRadius: 14, padding: 20, alignItems: "center", marginBottom: 14 }}
        >
          <Text style={{ fontSize: 28, marginBottom: 4 }}>🇩🇪</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 18, color: G.text }}>Deutsch</Text>
        </Pressable>
        <Pressable
          onPress={() => { setLang("en"); setScreen("landing"); }}
          style={{ width: "100%", backgroundColor: G.surface, borderWidth: 1, borderColor: G.surfaceBorder, borderRadius: 14, padding: 20, alignItems: "center" }}
        >
          <Text style={{ fontSize: 28, marginBottom: 4 }}>🇬🇧</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 18, color: G.text }}>English</Text>
        </Pressable>
      </View>
    );
  }

  // ── LANDING SCREEN ───────────────────────────────────────────────────────────
  if (screen === "landing") {
    return (
      <View style={{ flex: 1, backgroundColor: G.bg, paddingTop: insets.top + 16 }}>
        <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 120 }}>
          <View style={{
            alignSelf: "flex-start",
            backgroundColor: G.goldDim,
            borderWidth: 1,
            borderColor: G.goldBorder,
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
            marginBottom: 28,
          }}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: 11, color: G.gold, letterSpacing: 0.5 }}>
              {landing.badge}
            </Text>
          </View>

          <Text style={{ fontFamily: FONTS.display, fontSize: 44, color: G.gold, lineHeight: 52, marginBottom: 2 }}>
            {landing.headline[0]}
          </Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 44, color: G.text, lineHeight: 52, marginBottom: 2 }}>
            {landing.headline[1]}
          </Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 44, color: G.gold, lineHeight: 52, marginBottom: 2 }}>
            {landing.headline[2]}
          </Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 44, color: G.text, lineHeight: 52, marginBottom: 28 }}>
            {landing.headline[3]}
          </Text>

          <Text style={{ fontFamily: FONTS.body, fontSize: 16, color: G.muted, lineHeight: 26, marginBottom: 40 }}>
            {landing.sub}
          </Text>

          {/* Visual: compounding bars */}
          <View style={{ backgroundColor: G.surface, borderWidth: 1, borderColor: G.surfaceBorder, borderRadius: 12, padding: 20, marginBottom: 40 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 70, marginBottom: 10 }}>
              {[0.1, 0.15, 0.22, 0.32, 0.45, 0.60, 0.78, 1.0].map((h, i) => (
                <View key={i} style={{ flex: 1, height: `${h * 100}%` as any, backgroundColor: i === 7 ? G.gold : G.goldBorder, borderRadius: 3 }} />
              ))}
            </View>
            <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: G.muted, textAlign: "center" }}>
              +1% täglich → 37× in 365 Tagen
            </Text>
          </View>
        </ScrollView>

        <View style={{ position: "absolute", bottom: insets.bottom + 20, left: 28, right: 28, gap: 10 }}>
          <Pressable
            onPress={() => setScreen("slides")}
            style={{ backgroundColor: G.gold, borderRadius: 14, padding: 18, alignItems: "center" }}
          >
            <Text style={{ fontFamily: FONTS.display, fontSize: 16, color: "#1a1200" }}>{landing.cta}</Text>
          </Pressable>
          <Pressable onPress={complete} style={{ alignItems: "center", padding: 10 }}>
            <Text style={{ fontFamily: FONTS.body, fontSize: 14, color: G.muted }}>{landing.skip}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── SLIDES SCREEN ─────────────────────────────────────────────────────────────
  if (screen === "slides") {
    const slide = slides[slideIdx];
    const isLast = slideIdx === slides.length - 1;

    return (
      <View style={{ flex: 1, backgroundColor: G.bg, paddingTop: insets.top + 8 }}>
        <ProgressBar current={slideIdx} total={slides.length} />

        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
          {/* Tag */}
          <View style={{ alignSelf: "flex-start", backgroundColor: G.goldDim, borderWidth: 1, borderColor: G.goldBorder, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 20, marginTop: 12 }}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: 11, color: G.gold, letterSpacing: 0.8 }}>
              {slide.tag.toUpperCase()}
            </Text>
          </View>

          {/* Icon + Title */}
          <Text style={{ fontSize: 42, marginBottom: 10 }}>{slide.icon}</Text>
          <Text style={{ fontFamily: FONTS.display, fontSize: 26, color: G.text, lineHeight: 34, marginBottom: 14 }}>
            {slide.title}
          </Text>

          {/* Body */}
          <Text style={{ fontFamily: FONTS.body, fontSize: 16, color: G.text, lineHeight: 26, marginBottom: 4 }}>
            {slide.body}
          </Text>

          {/* Detail */}
          <DetailBox text={slide.detail} />

          {/* Example */}
          <ExampleBox text={slide.example} />

          {/* Slide counter */}
          <Text style={{ fontFamily: FONTS.mono, fontSize: 12, color: G.muted, textAlign: "center", marginTop: 28 }}>
            {slideIdx + 1} / {slides.length}
          </Text>
        </ScrollView>

        {/* Navigation */}
        <View style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 24,
          right: 24,
          flexDirection: "row",
          gap: 12,
        }}>
          {slideIdx > 0 && (
            <Pressable
              onPress={() => setSlideIdx((i) => i - 1)}
              style={{ flex: 1, backgroundColor: G.surface, borderWidth: 1, borderColor: G.surfaceBorder, borderRadius: 14, padding: 16, alignItems: "center" }}
            >
              <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: G.muted }}>←</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              if (isLast) setScreen("wizard");
              else setSlideIdx((i) => i + 1);
            }}
            style={{ flex: 3, backgroundColor: isLast ? G.gold : G.goldDim, borderWidth: 1, borderColor: isLast ? G.gold : G.goldBorderStrong, borderRadius: 14, padding: 16, alignItems: "center" }}
          >
            <Text style={{ fontFamily: FONTS.display, fontSize: 15, color: isLast ? "#1a1200" : G.gold }}>
              {isLast ? (lang === "de" ? "Mein Profil aufbauen →" : "Build my profile →") : (lang === "de" ? "Weiter →" : "Next →")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ── WIZARD SCREEN ─────────────────────────────────────────────────────────────
  if (screen === "wizard") {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: G.bg, paddingTop: insets.top + 8 }}>
          <ProgressBar current={wizardStep} total={wizard.questions.length} />

          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 160 }}>
            {/* Step label */}
            <Text style={{ fontFamily: FONTS.mono, fontSize: 11, color: G.muted, letterSpacing: 1, marginTop: 16, marginBottom: 20 }}>
              {lang === "de" ? `SCHRITT ${wizardStep + 1} VON ${wizard.questions.length}` : `STEP ${wizardStep + 1} OF ${wizard.questions.length}`}
            </Text>

            <Text style={{ fontFamily: FONTS.display, fontSize: 24, color: G.text, lineHeight: 32, marginBottom: 10 }}>
              {questionText}
            </Text>
            <Text style={{ fontFamily: FONTS.body, fontSize: 14, color: G.muted, marginBottom: 28, lineHeight: 21 }}>
              {currentQuestion.sub}
            </Text>

            {/* Text input */}
            {currentQuestion.type === "text" && (
              <TextInput
                value={textVal}
                onChangeText={setTextVal}
                placeholder={currentQuestion.placeholder}
                placeholderTextColor={G.muted}
                style={{
                  backgroundColor: G.surface,
                  borderWidth: 1,
                  borderColor: textVal ? G.goldBorderStrong : G.surfaceBorder,
                  borderRadius: 12,
                  padding: 16,
                  fontFamily: FONTS.body,
                  fontSize: 16,
                  color: G.text,
                }}
                returnKeyType="done"
                onSubmitEditing={() => textVal.trim() && advanceWizard(textVal.trim())}
              />
            )}

            {/* Single select */}
            {currentQuestion.type === "single" && currentQuestion.options.map((opt) => (
              <Pressable
                key={opt}
                onPress={() => advanceWizard(opt)}
                style={{
                  backgroundColor: profile[currentQuestion.key] === opt ? G.goldDim : G.surface,
                  borderWidth: 1,
                  borderColor: profile[currentQuestion.key] === opt ? G.goldBorderStrong : G.surfaceBorder,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <Text style={{ fontFamily: FONTS.medium, fontSize: 15, color: G.text }}>{opt}</Text>
              </Pressable>
            ))}

            {/* Multi select */}
            {currentQuestion.type === "multi" && (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  {currentQuestion.options.map((opt) => {
                    const selected = ((profile[currentQuestion.key] as string[]) ?? []).includes(opt);
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => toggleMulti(opt)}
                        style={{
                          backgroundColor: selected ? G.goldDim : G.surface,
                          borderWidth: 1,
                          borderColor: selected ? G.goldBorderStrong : G.surfaceBorder,
                          borderRadius: 20,
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                        }}
                      >
                        <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: selected ? G.gold : G.text }}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          {/* Bottom CTA */}
          <View style={{ position: "absolute", bottom: insets.bottom + 16, left: 24, right: 24 }}>
            {currentQuestion.type === "text" ? (
              <Pressable
                onPress={() => textVal.trim() && advanceWizard(textVal.trim())}
                style={{
                  backgroundColor: textVal.trim() ? G.gold : G.surface,
                  borderRadius: 14,
                  padding: 18,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: textVal.trim() ? G.gold : G.surfaceBorder,
                }}
              >
                <Text style={{ fontFamily: FONTS.display, fontSize: 16, color: textVal.trim() ? "#1a1200" : G.muted }}>
                  {lang === "de" ? "Weiter →" : "Next →"}
                </Text>
              </Pressable>
            ) : currentQuestion.type === "multi" ? (
              <Pressable
                onPress={() => advanceWizard((profile[currentQuestion.key] as string[]) ?? [])}
                style={{ backgroundColor: G.gold, borderRadius: 14, padding: 18, alignItems: "center" }}
              >
                <Text style={{ fontFamily: FONTS.display, fontSize: 16, color: "#1a1200" }}>
                  {lang === "de" ? "Weiter →" : "Next →"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return null;
}
