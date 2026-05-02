# SORCE — Current Plan
_Updated by Claude Chat before each task._

## Status
**Active task:** Round-2 vocabulary expansion. Add hyperlocal Ukrainian region names, weather vocabulary, UK/Ukrainian crime + courts vocabulary, NHS/health vocabulary, more sport (marathon/golf/snooker/chess/WNBA), more culture (named musicians/actors/fashion houses), strikes/layoffs vocabulary, and more world entities (Pope Leo, Central Asia, African nations). Re-run retag, target untagged < 9%.

## Context
- After round 1 expansion: untagged 14.9% (1,232 of 8,311).
- Tech Lead read the inspector output (100 untagged titles) and identified 4 large clusters and 5 small clusters.
- Target: < 9% untagged after this round (≈ 750 articles).
- All additions are **strictly additive** — do not remove or rename existing entries.
- Per chat.md §13: backfill is mandatory. Re-run the retag script in this same task.

## Current Task

### Part A — Append to `src/lib/tag-keywords.json`

For each tag below, MERGE the new keywords into the existing `strong` / `normal` arrays (do NOT replace the whole tag block). Order doesn't matter; deduplicate if any term already exists.

**`ukraine`** — Add to `normal` (regional Ukrainian names + administrative terms):
```
"луцьк", "lutsk", "рівне", "rivne", "рівненщин", "рівненськ",
"чернівці", "chernivtsi", "чернівецьк", "буковин",
"тернопіл", "ternopil", "тернопільщин",
"хмельницьк", "khmelnytskyi", "хмельниччин", "поділл",
"кіровоградськ", "кіровоград", "kropyvnytskyi", "кропивницьк",
"житомир", "zhytomyr", "житомирщин",
"волин", "volyn", "волинськ",
"закарпатт", "закарпатськ", "transcarpathia", "ужгородськ",
"прикарпатт", "івано-франківщин", "прикарпатськ",
"черкащин", "cherkasy region", "черкаськ",
"чернігівщин", "chernihiv region",
"харківщин", "kharkiv region", "kharkivshchyna",
"львівщин", "lviv region", "галичин", "galicia",
"одещин", "odesa region",
"донеччин", "donetsk region",
"луганщин", "luhansk region",
"запоріжськ", "zaporizhzhia region",
"полтавщин", "poltava region",
"вінниччин", "vinnytsia region",
"сумщин", "sumy region",
"миколаївщин", "mykolaiv region",
"херсонщин", "kherson region",
"кам'янц", "kamianets",
"новоград-волинськ", "новоград",
"слов'янськ", "sloviansk", "краматорськ", "kramatorsk",
"ічн", "ichnia", "прилуч", "pryluky",
"малин", "malyn", "коростень", "korosten",
"ковельськ", "kovel", "новий світ",
"район", "області", "обласн", "обласної", "обласна",
"селищ", "село", "village in ukraine",
"переселенц", "internally displaced", "внутрішньо переміщ",
"днр", "dnr", "lpr", "лнр", "донецька народна", "луганська народна",
"бойовик", "колаборант", "collaborator",
"волонтер", "volunteer in ukraine",
"укрзалізниц", "ukrzaliznytsia", "ukravtodor", "укравтодор",
"приватбанк", "privatbank", "ощадбанк", "oschadbank", "монобанк", "monobank"
```

**`society`** — Add to `normal` (weather, crime/courts, NHS/health, social, strikes):
```
"погода", "weather forecast", "прогноз погоди",
"дощ", "rainfall", "сильний дощ",
"вітер", "wind gust", "пориви вітру",
"заморозк", "frost", "ground frost",
"шквал", "squall", "штормове попередженн", "storm warning",
"синоптик", "weather service", "meteorologist",
"снігопад", "snowfall", "ожеледиц", "ice on roads",
"спека", "heatwave warning", "cold snap",
"туман", "fog warning",

"затримал", "detained suspect", "затримано",
"обшук", "search warrant", "raid", "police raid",
"підозр", "suspect in custody", "suspected of",
"засудил", "засудж", "sentenced to", "given prison",
"кримінальн", "criminal case opened", "criminal proceedings",
"вирок", "verdict", "guilty verdict",
"в'язниц", "prison sentence", "behind bars",
"ув'язненн", "imprisonment",
"тюрм", "jail term", "jailed for",
"покаранн", "punishment",
"поліці", "police arrested", "police investigation", "правоохоронц", "law enforcement",
"слідств", "investigators say",
"викраденн", "abduction", "kidnapping", "kidnap",
"крадіжк", "theft", "stolen",
"шахрайств", "scam", "scammer",

"rape", "raped", "rapist", "sexual assault", "sexual abuse",
"jailed", "found guilty", "pleaded guilty", "convicted of",
"sentenced", "manslaughter", "homicide", "murder", "murdered",
"gang", "gangs", "shooter", "mass shooting", "school shooting",
"gun violence", "knife attack", "knife crime", "stabbing",
"assault", "domestic abuse", "harassment", "stalking",
"missing person", "missing girl", "missing boy",
"died at", "died in", "found dead", "killed in crash",
"car crash", "crash death", "fatal accident",
"house fire", "killed in fire", "fire crews", "rescued from",

"nhs", "nhs waiting list", "waiting list", "waiting times",
"gene therapy", "stem cell", "clinical trial",
"hiv", "aids", "diabetes", "cancer", "tumour", "tumor",
"alzheimer", "dementia", "stroke", "heart attack",
"surgery", "transplant", "dialysis",
"allergi", "asthma", "autism",
"opioid", "fentanyl", "addiction", "overdose", "drug overdose",
"mental health", "anxiety", "suicide", "self-harm",
"obesity", "bmi", "diet", "nutrition",
"baby", "newborn", "infant", "toddler", "teenager", "teen",
"mother", "father", "parent", "single mother", "single parent",
"family of", "father of", "mother of", "couple from",

"strike", "on strike", "go on strike", "walkout", "picket",
"trade union", "профспілк", "trade unions",
"labour dispute", "labor dispute", "industrial action",
"страйк", "забастовк",
"lufthansa", "vereinigung cockpit", "ver.di",
"rmt union", "asef", "unison",

"social media ban", "online safety", "screen time",
"food allergy", "food poisoning", "food recall",
"contaminated", "contamination",
"evacuation", "evacuated",
"animal rescue", "rescued animal", "stray dog", "stray cat"
```

**`investigation`** — Add to `normal`:
```
"поліц затримал", "обшук на",
"undercover", "secretly filmed", "hidden camera",
"sting operation",
"corruption probe", "корупційне розслідуван",
"shell company", "підставна компані"
```

**`sport`** — Add to `strong` (marquee names/leagues):
```
"london marathon", "boston marathon", "marathon runner",
"snooker", "ronnie o'sullivan", "o'sullivan",
"crucible", "world snooker championship",
"golf", "golfer", "pga tour", "pga championship",
"masters tournament", "the masters", "augusta national",
"tiger woods", "rory mcilroy", "scottie scheffler",
"wnba", "ncaa", "ncaa final four",
"chess", "world chess championship", "fide",
"magnus carlsen", "gukesh", "ding liren",
"fencing", "world fencing", "miles chamley-watson",
"cricket", "test cricket", "ipl", "indian premier league",
"rugby", "six nations", "world rugby",
"swimming championship", "athletics championship",
"track and field",
"hamilton f1", "verstappen", "leclerc", "norris", "russell f1",
"burnley", "wolverhampton wanderers", "wolves fc", "leeds united",
"newcastle united", "tottenham", "spurs",
"relegated", "relegation", "promoted to premier league",
"fa cup", "carabao cup", "copa america", "concacaf"
```

Add to `normal`:
```
"championship", "championship next season",
"squad announcement", "starting xi",
"mid-race", "marathon debut",
"olympic medal", "медал", "gold medal", "silver medal", "bronze medal",
"caps for", "international debut",
"penalty shootout", "extra time",
"racing", "race winner",
"kickoff", "kick off", "halftime"
```

**`culture`** — Add to `strong`:
```
"drake", "iceman album", "drake's iceman",
"foo fighters", "dave grohl",
"daft punk", "thomas bangalter",
"taylor swift", "beyonce", "beyoncé", "kendrick lamar",
"billie eilish", "olivia rodrigo", "the weeknd", "dua lipa",
"timothée chalamet", "chalamet",
"charlize theron", "antonio banderas", "puss in boots",
"meryl streep", "tom hanks", "scarlett johansson",
"leonardo dicaprio", "ryan gosling",
"martin scorsese", "christopher nolan", "greta gerwig",
"ballet", "balerino", "балет",
"opera", "опер",
"jazz", "джаз", "hip hop", "хіп-хоп",
"rapper", "репер", "pop star", "поп-зірк",
"singer", "співак", "співачк", "songwriter",
"fashion week", "тиждень моди",
"bulgari", "ritz-carlton", "louis vuitton", "lv ", "gucci", "prada", "chanel",
"hermès", "dior", "yves saint laurent", "ysl",
"streaming series", "netflix series", "hbo series", "disney+ series"
```

Add to `normal`:
```
"album review", "single dropped", "music video",
"tour dates announced", "concert review",
"box office", "premiered at",
"fashion show", "runway show",
"art installation", "art exhibition", "виставка картин",
"poet", "поетес",
"memoir", "autobiography",
"sculptor", "скульптор",
"choreographer", "хореограф",
"composer", "композитор"
```

**`tech`** — Add to `strong`:
```
"layoff", "layoffs", "lays off", "laid off",
"mass layoffs", "job cuts at",
"musk", "елон маск", "elon musk",
"sam altman", "mark zuckerberg", "jeff bezos",
"sundar pichai", "satya nadella", "tim cook",
"deepmind", "google deepmind",
"mistral ai", "perplexity ai", "perplexity",
"agi", "artificial general intelligence",
"oracle corporation", "oracle cloud",
"salesforce", "snowflake inc",
"android update", "ios 18", "ios 19", "ios 20",
"vision pro", "apple vision",
"openai gpt", "gpt-4", "gpt-5", "gpt-6", "claude opus", "claude sonnet",
"data center", "ai data center",
"robotaxi", "self-driving"
```

Add to `normal`:
```
"engineer", "developer", "designer",
"product launch", "product release",
"venture round", "series a", "series b", "series c",
"unicorn startup",
"tech earnings", "ai chip", "gpu", "tpu"
```

**`economy`** — Add to `strong`:
```
"antitrust", "monopoly ruling", "antitrust case",
"ticketmaster", "live nation", "antitrust verdict",
"layoff announced", "thousands of layoffs",
"cost of living", "вартість життя",
"jobs report", "non-farm payrolls", "nfp report",
"retail sales", "consumer confidence",
"profit warning", "earnings call",
"stock split", "share buyback",
"treasury yield", "10-year treasury", "bond yield",
"economic forecast", "economic outlook",
"trade war", "торгова війна"
```

Add to `normal`:
```
"household income", "median income", "median wage",
"hike in prices", "price hike", "price cut",
"job market", "ринок праці",
"shareholder meeting", "annual general meeting",
"profitability", "operating margin", "gross margin",
"earnings beat", "earnings miss",
"refinanc", "рефінансуванн",
"liquidity", "ліквідніст",
"insolvency", "банкрутств", "bankruptcy",
"funding round", "раунд фінансуван"
```

**`climate`** — Add to `strong` (severe weather events):
```
"weather warning", "severe weather", "extreme weather",
"polar vortex", "arctic blast",
"tornado", "торнадо",
"flash flood", "повінь", "blizzard", "сніжна буря",
"avalanche", "лавин",
"drought", "посух", "wildfire season",
"melting glaciers", "льодовик тане",
"sea level rise", "підвищення рівня моря"
```

Add to `normal`:
```
"snowfall", "снігопад",
"frost warning", "заморозк", "ground frost",
"heatwave", "спека", "heat record",
"cold snap", "cold front",
"meteorologist", "weather service", "national weather service",
"storm warning", "штормове попередженн",
"forecast", "прогноз погоди"
```

(Yes — basic weather words are in BOTH `society` and `climate`. That is intentional: hyperlocal weather news gets `society`+`ukraine`, while extreme/global climate events get `climate`. Top-3 cap handles overlap.)

**`world`** — Add to `strong`:
```
"pope leo", "pope leo xiv", "pontiff", "папа леон", "папа леон xiv",
"holy see", "святий престол", "vatican city",
"equatorial guinea", "senegal", "dakar", "ethiopia", "kenya", "nigeria",
"democratic republic of congo", "drc", "ivory coast", "côte d'ivoire",
"morocco", "algeria", "tunisia", "libya", "lybia",
"singapore", "сінгапур",
"uzbekistan", "узбекистан", "tashkent", "ташкент", "bukhara", "бухар",
"kazakhstan", "казахстан", "astana", "астан", "almaty", "алмати",
"turkmenistan", "туркменистан", "tajikistan", "таджикистан", "kyrgyzstan", "киргизстан",
"central asia", "центральна азія",
"mongolia", "монголі", "armenia", "вірмені", "azerbaijan", "азербайджан",
"georgia (country)", "тбілісі", "tbilisi",
"indonesia", "індонезі", "jakarta", "джакарта",
"philippines", "філіппін", "manila", "маніл",
"vietnam", "в'єтнам", "thailand", "таїланд", "bangkok", "бангкок",
"malaysia", "малайзі", "myanmar", "м'янм", "burma",
"pakistan", "пакистан", "islamabad", "ісламабад",
"bangladesh", "бангладеш",
"paraguay", "парагвай", "uruguay", "уругвай",
"venezuela", "венесуел", "colombia", "колумбі",
"chile", "чилі", "peru", "перу",
"turkey", "туреччин", "ankara", "анкар", "istanbul", "стамбул",
"erdogan", "ердоган",
"antalya diplomacy forum",
"cold war", "холодна війн", "post-soviet", "пострадянськ"
```

Add to `normal`:
```
"africa", "африк", "north africa", "sub-saharan",
"latin america", "латинська америка", "south america", "південна америка",
"asia pacific", "азіатсько-тихоокеанськ",
"middle east", "близький схід",
"caribbean", "карибськ",
"global south", "глобальний південь",
"un security council", "радбез оон",
"international court", "міжнародний суд",
"world bank report", "imf report"
```

**`europe`** — Add to `strong`:
```
"channel migrant", "channel crossing", "channel crossings",
"english channel", "ла-манш",
"riot police", "riot-trained police",
"dover", "дувр", "calais", "кале",
"eurozone", "єврозон"
```

Add to `normal`:
```
"slovenia", "словені", "croatia", "хорваті", "bosnia", "боснія",
"serbia", "сербі", "belgrade", "белград",
"montenegro", "чорногорі", "podgorica", "подгориц",
"north macedonia", "північна македонія",
"albania", "албані", "kosovo", "косово",
"moldova", "молдов", "chisinau", "кишинів",
"iceland", "ісланді", "luxembourg", "люксембург",
"swiss", "switzerland", "швейцарі", "bern", "берн",
"european court of human rights", "echr",
"european investment bank", "eib"
```

**`politics`** — Add to `strong`:
```
"mandelson", "mandelson vetting", "lord mandelson",
"chief of staff", "глава апарату",
"vetting row", "vetting process",
"reshuffle", "cabinet reshuffle", "перестановки в уряді",
"snap election", "позачергові вибори",
"no-confidence vote", "вотум недовіри",
"shadow cabinet", "тіньовий кабінет",
"keir starmer", "rishi sunak", "kemi badenoch",
"angela rayner", "yvette cooper",
"jd vance", "marco rubio", "rfk jr", "kennedy jr"
```

Add to `normal`:
```
"front pages", "front page",
"the papers", "newspaper review",
"opinion poll", "ipsos poll", "yougov poll",
"approval rating", "рейтинг довіри",
"focus group", "фокус-група"
```

### Part B — Re-run

1. `npm run lint`.
2. `cd scripts && source venv/bin/activate && python retag_all.py --dry-run` — paste the dry-run summary.
3. `python retag_all.py` — paste the real-run summary.
4. `python retag_all.py --inspect` — paste the **count + first 30 untagged titles** (sample, not all 50). This is so the Tech Lead can quickly judge whether another round is worth it.
5. `python fetcher.py` — paste the last 30 lines.

### Part C — Ship

1. `python scripts/update_session.py --completed "round 2 tag vocabulary expansion" --note "Added Ukrainian regional names, weather, crime/courts, NHS/health, strikes, marathon/golf/snooker/chess/WNBA, named musicians/actors/fashion houses, layoffs, Pope Leo, Central Asia + African nations. Untagged dropped from 14.9% to <target>%."`
2. Append a `2026-05-02` entry to `docs/changelog.md` with: untagged before (1232 / 14.9%) → after (X / Y%), per-tag totals delta vs previous run, and one-line note on which clusters moved.
3. Commit message: `feat(tags): round 2 vocabulary expansion (regional UA, weather, crime, sport, culture)`

## Output
Reply with:
1. Confirmation `src/lib/tag-keywords.json` was extended (NOT replaced) — show new size in lines and a few sample new entries from each tag block to prove they were merged.
2. Confirmation `npm run lint` passed.
3. Dry-run summary.
4. Real-run summary.
5. Inspector sample: count + first 30 untagged titles.
6. Last 30 lines of `python fetcher.py`.
7. Confirmation `update_session.py` ran AND `docs/changelog.md` was appended.
8. The commit hash.

## Read First
- `src/lib/tag-keywords.json` (existing, to extend in place — do NOT overwrite wholesale)
- `scripts/retag_all.py`

## Do NOT
- Do NOT replace existing keyword arrays — APPEND only. Existing entries must remain.
- Do NOT change the matcher algorithm, scoring weights, threshold (3), top-3 cap, or weighting.
- Do NOT add new tags. Stay at 12.
- Do NOT reintroduce a `general` fallback.
- Do NOT touch `tag-keywords.ts` matcher logic — only the JSON it reads.
- Do NOT touch any UI components.
- Do NOT skip the post-run inspector sample.
