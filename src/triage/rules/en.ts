import type { RuleSet } from './types'

/**
 * English triage rules.
 *
 * Design choices:
 * - Crisis patterns are tuned for RECALL: a false alarm costs the user one tap
 *   ("take me back"); a miss could cost much more.
 * - No negation handling: "he never hit me" still matches. Handling negation
 *   risks missing phrasing like "she won't let me eat".
 * - Patterns run on normalized text (lowercase, plain apostrophes, common typos fixed).
 * Any change here must keep `npm run eval` at 100% crisis recall.
 */

// Common misspellings / informal spellings seen in chat messages.
const TYPOS: [RegExp, string][] = [
  [/\bpas+port\b|\bpasprt\b|\bpassprot\b/g, 'passport'],
  [/\bsal(a|e)r(y|i)\b|\bsallary\b|\bsalari\b/g, 'salary'],
  [/\bemploy(ee)?r\b|\bemployeer\b/g, 'employer'],
  [/\bmaam\b|\bma'am\b|\bmadame\b|\bmdm\b/g, 'madam'],
  [/\bdont\b|\bdo not\b/g, "don't"],
  [/\bdoesnt\b|\bdoes not\b/g, "doesn't"],
  [/\bdidnt\b|\bdid not\b/g, "didn't"],
  [/\bhavent\b|\bhave not\b/g, "haven't"],
  [/\bhasnt\b|\bhas not\b/g, "hasn't"],
  [/\bisnt\b|\bis not\b/g, "isn't"],
  [/\bcannot\b|\bcan not\b/g, "can't"],
  [/\bcant\b/g, "can't"],
  [/\bwont\b|\bwill not\b/g, "won't"],
  [/\bim\b/g, "i'm"],
  [/\bu\b/g, 'you'],
  [/\bplz\b|\bpls\b/g, 'please'],
  [/\bwanna\b/g, 'want to'],
  [/\bgonna\b/g, 'going to'],
]

function normalize(text: string): string {
  let t = text
    .toLowerCase()
    .replace(/[’‘`´]/g, "'") // curly apostrophes from phone keyboards
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  for (const [re, fix] of TYPOS) t = t.replace(re, fix)
  return t
}

export const rulesEn: RuleSet = {
  normalize,
  signals: [
    // ───────────── CRISIS: immediate danger, violence, confinement, self-harm ─────────────
    {
      id: 'physical-violence',
      level: 'crisis',
      patterns: [
        /\b(hit|hits|hitting|beat|beats|beating|beaten|slap|slapped|slaps|slapping|punch|punched|punches|kick|kicked|kicks|kicking|choke|choked|chokes|choking|strangle|strangled|bit me|pinch(ed|es)? me|pull(ed|s)? my hair)\b/,
        // "hurt/burn ME" only: "I hurt my back cleaning" is a work injury, not violence.
        /\b(hurt|hurts|hurting|hurted|injure[sd]?|burn(ed|t|s)?) me\b/,
        /\b(burn(ed|t|s)?|scald(ed|s)?) (me|my \w+) (with|on purpose)\b/,
        /\b(step(ped|s)?|stamp(ed|s)?) on (me|my (hand|foot|feet|fingers|body))\b/,
        /\bsmack(ed|s|ing)?\b/,
        /\b(push(ed|es)?|shov(ed|es)|grab(bed|s)?|attack(ed|s)?|throw|threw|thrown) (me|my)\b/,
        /\b(bruise[sd]?|bleeding|blood|black eye|swollen|broken (arm|bone|nose|rib))\b/,
        /\b(throw|throws|threw|thrown) .{0,25}\bat me\b/,
        /\b(physical(ly)? abuse[sd]?|abuse[sd]? me|abusing me|violen(t|ce))\b/,
      ],
    },
    {
      id: 'sexual-abuse',
      level: 'crisis',
      patterns: [
        /\b(rape[sd]?|raping|molest(ed|s|ing)?|grope[sd]?|groping|sexual(ly)?|sex with|harass(ed|es|ing|ment)? me)\b/,
        /\btouch(es|ed|ing)? (me|my (body|breast|chest|private|butt|bottom|leg|thigh))\b/,
        /\b(force[sd]?|make[s]?|made) me (to )?(undress|sleep with|kiss|touch)\b/,
        /\bforc(e|es|ed|ing) (himself|herself|themselves) on me\b/,
        /\b(watch(es|ed|ing)?|peep(s|ed|ing)?|spy(ing)? on) me (shower|bath|bathing|showering|chang(e|ing)|undress\w*)\b/,
        // Fear of being alone with someone in the house often signals sexual abuse.
        /\b(scared|afraid|frightened)\b.{0,30}\bwhen (madam|she|his wife|the wife|everyone|nobody|no one)('s| is)? (not|isn't|out|away|asleep|sleeping)\b/,
        /\b(come|comes|came|enter[s]?|entered) (in|into|to) my (room|bed)( at night)?\b/,
        /\b(kiss(ed|es)? me|show(ed|s)? me (his|her) (body|private)|naked|takes? photos of me (changing|showering|bathing))\b/,
      ],
    },
    {
      id: 'confinement',
      level: 'crisis',
      patterns: [
        /\block(s|ed|ing)? (me )?(in|inside|up|out)\b/,
        /\b(locks?|locked) the (door|gate|main door|house)\b/,
        /\block(s|ed)? me\b/,
        /\b(trapped|imprisoned|like a prisoner|not allowed to leave the (house|flat|home))\b/,
        /\bcan't (leave|get out of|escape) (the )?(house|flat|home|room)\b/,
        /\b(never|not) (allowed|let) (to )?(go )?out(side)? (at all|ever)\b/,
        /\b(keep|keeps|kept) me (inside|locked|in the house)\b/,
        /\b(door|doors|gate|gates)( is| are)?( always| kept)? locked\b/,
        /\bnot allowed out\b/,
        /\b(hide|hides|hid|took|take|takes) the keys?\b/,
        /\b(tie|ties|tied) me( up)?\b/,
        /\b(don't|won't|never) (let|allow) me (to )?(go )?out(side)?\b.{0,25}\b(ever|at all)\b/,
        /\bnever (let|allow) me (to )?(go )?out\b/,
      ],
    },
    {
      id: 'self-harm',
      level: 'crisis',
      patterns: [
        /\b(kill|killing|hurt|hurting|cut|cutting) myself\b/,
        /\b(suicide|suicidal|take my (own )?life|overdose)\b/,
        /\b(end|ending) (it all|my life|everything)\b/,
        /\b(took|take|taking|swallowed) (a lot of|lots of|many|too many|all (my|the)) (pills|tablets|medicine)\b/,
        /\b(nobody|no one) (would|will) (miss|care about) me\b/,
        /\btired of everything\b/,
        /\b(don't|can't) see (the|any) point\b/,
        /\bno point (anymore|any more)\b/,
        /\bwant to give up\b(?! (this|my|the) (job|work|contract))/,
        /\b(want|wish|going|ready) to die\b/,
        /\bbetter off dead\b/,
        /\bdon't want to (live|be alive|wake up|exist)( anymore)?\b/,
        /\b(no|no more) (reason|point) (to|in) (live|living|go on|going on)\b/,
        /\bcan't (go on|take (it|this|any) ?(any ?more|anymore)|do this anymore|continue living)\b/,
        /\b(tired of|done with) (living|life|being alive)\b/,
        /\bjump(ing)? (from|off|out of) (the )?(window|building|balcony|block|roof)\b/,
        /\b(disappear|sleep) (forever|and never wake up)\b/,
        /\b(give|giving) up on (life|everything)\b/,
      ],
    },
    {
      id: 'threat-to-life',
      level: 'crisis',
      patterns: [
        /\b(kill|murder) (me|you)\b/,
        /\b(will|going to|gonna|threaten(ed|s)? to|said (he|she|they)('d| would)) (kill|murder|hurt|beat|stab)\b/,
        /\b(knife|weapon|stab(bed)?|gun)\b/,
        /\b(scared|afraid|fear) for my life\b/,
        /\bsomething (bad|terrible) (will|would|is going to) happen to me\b/,
        /\b(do|does|did) something to me\b/,
        /\b(in danger|not safe|unsafe) (here|now|right now)\b/,
        /\bi am in danger\b|\bi'm in danger\b/,
      ],
    },
    {
      id: 'denied-food-or-care',
      level: 'crisis',
      patterns: [
        /\b(no|not given|without|haven't had) (any )?food (for|in) (\d+|two|three|four|five|several|many) days\b/,
        /\bhaven't eaten (for|in) (\d+|two|three|four|five|several|many|a few) days\b/,
        /\bstarv(e|ed|es|ing)\b/,
        /\b(haven't|hasn't|didn't|not) (given|gave|give) me (any )?food (since|for)\b/,
        /\b(won't|don't|refuse[sd]? to|not) (let|allow) me (to )?(see|go to) (a |the )?(doctor|hospital|clinic)\b/,
        /\b(refuse[sd]?|won't|will not) (to )?(take|bring) me to (a |the )?(doctor|hospital|clinic)\b/,
        /\b(can't breathe|fainted|faint|unconscious|collapsed|passed out)\b/,
      ],
    },
    {
      id: 'urgent-help',
      level: 'crisis',
      patterns: [/\b(help me (now|please|quickly)|emergency|call (the )?police|sos)\b/],
    },

    // ───────────── SERIOUS: clear violations, serious or repeated mistreatment ─────────────
    {
      id: 'passport-held',
      level: 'serious',
      patterns: [
        /\b(took|take|takes|taken|keep|keeps|keeping|kept|hold|holds|holding|held|hide|hides|hid) (away )?(my )?passport\b/,
        /\bpassport\b.{0,40}\b(keep|keeps|kept|has|holding|won't give|refuse)\b/,
        /\b(work permit|wp) card\b.{0,30}\b(keep|keeps|kept|took|holding)\b/,
      ],
    },
    {
      id: 'months-unpaid',
      level: 'serious',
      patterns: [
        /\b(not|never|haven't been|no|didn't|don't|did not) (get )?(paid|pay|receive[d]? (my )?salary|given (my )?salary)\b.{0,25}\b(\d+|two|three|four|five|six|several|many|few) months\b/,
        /\b(\d+|two|three|four|five|six|several|many|few) months\b.{0,25}\b(no|without|not|haven't|unpaid|never)\b.{0,15}\b(pay|paid|salary)\b/,
        /\b(no|without|unpaid|zero) (salary|pay|wages|money)\b.{0,15}\b(\d+|two|three|four|five|six|several|many|few) months\b/,
        /\b(no salary|not paid|unpaid) (since|for) (january|february|march|april|may|june|july|august|september|october|november|december|last year|months)\b/,
        /\bnever (been )?paid (me|my salary)?\b/,
      ],
    },
    {
      id: 'verbal-abuse',
      level: 'serious',
      patterns: [
        /\b(shout|shouts|shouted|shouting|scold|scolds|scolded|scolding|yell|yells|yelled|yelling|scream|screams|screamed|curse|curses|cursed|insult|insults|insulted|humiliat\w*|swear(s|ing)? at me)\b/,
        /\bcall(s|ed|ing)? me (stupid|useless|dog|pig|idiot|lazy|names|dirty|animal|bitch)\b/,
        /\b(verbal(ly)?|emotional(ly)?|mental(ly)?) abus\w*\b/,
      ],
    },
    {
      id: 'threats',
      level: 'serious',
      patterns: [
        /\bthreaten\w*\b/,
        /\b(will|going to) (send me (back|home)|cancel my (permit|work permit)|report me|deport me|call (the )?agent)\b/,
      ],
    },
    {
      id: 'not-enough-food',
      level: 'serious',
      patterns: [
        /\b(not enough|no|little|very little) food\b/,
        /\b(leftover|leftovers|hungry|skip(ping)? meals|one meal a day|only (eat|given|get) (bread|rice|instant noodles|noodles))\b/,
        /\bnot (allowed|given|let) (to )?(eat|food)\b/,
      ],
    },
    {
      id: 'isolated',
      level: 'serious',
      patterns: [
        /\b(took|take|takes|taken|keep|keeps|kept|confiscat\w*|hide|hid) (away )?my (phone|handphone|mobile)\b/,
        /\b(not allowed|can't|cannot|won't let me) (to )?(contact|call|talk to|message) (my )?(family|friends|anyone|husband|children|kids|mother)\b/,
        /\bnot allowed (to )?(go out|leave|talk to anyone)\b/,
      ],
    },
    {
      id: 'unsafe-living',
      level: 'serious',
      patterns: [
        /\bsleep(s|ing)? (in|on) (the )?(kitchen|floor|storeroom|store room|bathroom|toilet|corridor|balcony|living room floor)\b/,
        /\b(same room|share (a )?room|sleep) (with|as) (a |the |their |her |his )?(man|men|boy|son|grandfather|grandpa|sir|male)\b/,
        /\bcamera\b.{0,30}\b(room|bathroom|toilet|where i (sleep|change))\b/,
      ],
    },
    {
      id: 'overwork',
      level: 'serious',
      patterns: [
        /\b(1[6-9]|2[0-4]|sixteen|eighteen|twenty) hours\b/,
        /\b(no|not enough|never|only \d|only (two|three|four|five)( hours)?) sleep\b/,
        /\bsleep only (\d|two|three|four|five)\b/,
        /\bwork (from )?\d{1,2} ?(am)? (to|until|till) (\d{1,2} ?(pm|am)|midnight)\b/,
      ],
    },
    {
      id: 'wants-to-leave',
      level: 'serious',
      patterns: [/\b(run away|ran away|running away|escape|want to (leave|go home|quit)|can't stay here)\b/],
    },

    // ───────────── MODERATE: likely rights violation, not in danger ─────────────
    {
      id: 'late-salary',
      level: 'moderate',
      patterns: [
        /\bsalary\b.{0,20}\b(late|delay\w*|not (yet|paid|given|on time))\b/,
        /\b(pay|pays|paid) (me )?(late|after|only on)\b/,
        /\blate (salary|pay|payment)\b/,
        /\b(haven't|have not|not) (been )?(paid|received (my )?salary) (yet|this month|last month)\b/,
      ],
    },
    {
      id: 'rest-day-denied',
      level: 'moderate',
      patterns: [
        /\b(no|never|without|not (given|allowed|getting|get)( a| my| any)?) (rest|off) ?day\b/,
        /\b(no|never|without|not (given|allowed|getting|get)( a| my| any)?) day ?off\b/,
        /\b(rest|off) ?day\b.{0,30}\b(cancel\w*|taken away|work|not allowed|no)\b/,
        /\bday ?off\b.{0,30}\b(cancel\w*|taken away|work|not allowed|no)\b/,
        /\bwork (on )?(every|all) (day|days|sunday|sundays)\b/,
        /\bwork(ed|ing)? on (my )?(sunday|rest day|day off|off day)\b/,
      ],
    },
    {
      id: 'pay-deducted',
      level: 'moderate',
      patterns: [
        /\b(deduct\w*|cut (my )?(salary|pay)|less (salary|money|pay) than|underpaid|pay me less)\b/,
        /\b(keep|keeps|kept|hold|holds|save|saves) my (money|salary|savings|bank card|atm card|bank book)\b/,
      ],
    },
    {
      id: 'pays-own-medical',
      level: 'moderate',
      patterns: [/\b(i|me) (must|have to|need to|had to) pay (for )?(the )?(doctor|medicine|clinic|hospital|medical)\b/],
    },
    {
      id: 'wrong-work',
      level: 'moderate',
      patterns: [
        /\bwork (in|at) (his|her|their|the) (shop|restaurant|office|business|factory|stall|company)\b/,
        /\bclean (another|other|her (mother|sister|daughter|friend)'?s?|his (mother|sister|brother)'?s?) (house|home|flat)\b/,
        /\b(another|second|other) (house|household|family|home)\b/,
      ],
    },
  ],
}
