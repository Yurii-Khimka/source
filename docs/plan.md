# SORCE — Current Plan
_Updated by Claude Chat before each task._

## Status
**Active task:** Massively expand the tag-keyword dictionary so far fewer articles end up untagged. Add an untagged-inspector mode to the retag script. Re-run and report the new untagged share. Target: untagged < 8% (currently 25%).

## Context
- Previous task shipped the scored word-boundary matcher (`src/lib/tag-keywords.json` + matcher in `tag-keywords.ts` + `scripts/fetcher.py`). The matcher logic is correct.
- Re-run results: 8211 total, 4671 re-tagged, 1465 unchanged, **2075 lost all tags**.
- Concrete failure example: the Guardian article "Steve Hilton: could this British former Fox News host be California's next governor?" with description "The race to succeed Gavin Newsom has teetered wildly, and with Democrats in disarray, the Republican ex-Downing Street adviser is leading in the polls. Can he really pull it off? Few political aspirations have proved more futile over the past two decades than running as a Republican for statewide of…"
- Words in that article that SHOULD have triggered `politics`: `governor`, `republican`, `republicans`, `democrats`, `downing street`, `polls`, `political aspirations`, `statewide`. Current dict catches only `political` (normal, in description, weight 1) → score 1, threshold 3 → fails.
- Root cause: the dictionary is thin and Ukraine-centric. It's missing US/UK/EU political vocab, world leaders, country names, sports leagues, big tech companies, etc. This task is a vocabulary expansion, NOT a matcher change.
- Per chat.md §13: backfill is mandatory. Re-run the retag script in this same task.

## Current Task

### Part A — Expand `src/lib/tag-keywords.json`

REPLACE the existing JSON file with the version below. This adds hundreds of new keywords across all tags — primarily Anglo-American political vocabulary, sports leagues/clubs/figures, tech company names, cultural events, named world leaders, and country names. Preserve the schema exactly: `strong` / `normal` / `negative` per tag.

Rules while expanding:
- Each keyword must be ≥ 3 characters AND not a common English word that appears in unrelated contexts. Word-boundary matching protects us from `bank`-in-`bankrupt`, but does NOT protect us from `pope` matching a real word. Use judgment.
- Proper nouns (people, parties, leagues, companies, countries) almost always go in `strong`.
- Generic-but-domain-specific terms (`election`, `match`, `album`) go in `normal`.
- A keyword may appear in multiple tags (e.g. `putin` in both `world` and `conflict`). That is intentional.
- Keep the existing 12 tags. Do not add new tags.

```json
{
  "economy": {
    "strong": ["fed", "federal reserve", "нбу", "мвф", "imf", "ecb", "єцб", "world bank", "світовий банк",
               "інфляц", "inflation", "deflation", "deflate",
               "tariff", "тариф", "бюджет", "budget", "gdp", "ввп", "gnp", "внп",
               "interest rate", "rate hike", "rate cut", "ставка нбу", "облікова ставка",
               "stagflation", "рецесі", "recession", "depression",
               "s&p 500", "nasdaq", "dow jones", "ftse", "dax", "nikkei", "ux index", "пфтс",
               "wall street", "уолл стріт", "bitcoin", "біткоїн", "crypto", "крипто", "ethereum"],
    "normal": ["bank", "банк", "банків", "central bank", "центробанк",
               "finance", "фінанс", "фінансуван", "loan", "кредит", "mortgage", "іпотек",
               "market", "ринок", "stock", "акці", "shareholder", "акціонер",
               "bond", "облігац", "yield", "дохідність",
               "trade", "торгівл", "export", "експорт", "import", "імпорт", "trade deficit", "торговий дефіцит",
               "property", "real estate", "нерухомість", "оренд", "housing", "житл",
               "tax", "податк", "fiscal", "фіскальн", "subsidy", "субсиді", "deficit", "дефіцит",
               "currency", "валют", "гривн", "євро", "долар", "dollar", "euro", "yen", "єна", "pound", "фунт",
               "investment", "інвестиц", "ipo", "merger", "acquisition", "злитт", "поглинан",
               "salary", "зарплат", "pension", "пенсі", "wage", "заробітн",
               "economy", "economic", "економік", "економіч",
               "unemployment", "безробітт", "jobs report", "звіт зайнятост",
               "consumer price", "споживчі ціни", "cpi", "ppi",
               "supply chain", "ланцюг поставок", "commodity", "товарн",
               "oil price", "ціна нафт", "gas price", "ціна газ",
               "fund", "фонд", "etf", "hedge fund", "хедж-фонд",
               "ceo", "chief executive", "генеральний директор", "директор компані",
               "earnings", "прибуток", "revenue", "виторг", "quarterly results", "квартальні результати"],
    "negative": ["central park"]
  },
  "politics": {
    "strong": ["верховна рада", "парламент", "parliament", "congress", "конгрес", "senate", "сенат",
               "house of representatives", "палата представників",
               "кабмін", "cabinet of ministers", "cabinet meeting",
               "election", "вибор", "primary election", "праймериз",
               "законопроект", "законопроєкт", "bill passed", "veto", "вето",
               "санкц", "sanction", "імпічмент", "impeachment", "coalition", "коаліці",
               "republican", "republicans", "gop", "republican party", "республіканц",
               "democrat", "democrats", "democratic party", "демократичн парті",
               "tory", "tories", "conservative party", "консервативн парті",
               "labour party", "лейборист", "labor party",
               "liberal democrats", "lib dems", "ліберал-демократ",
               "downing street", "даунінг-стріт", "10 downing", "no 10",
               "white house", "білий дім", "оval office", "овальний кабінет",
               "elysee", "єлисейський палац", "bundestag", "бундестаг",
               "duma", "дума", "kremlin", "кремль",
               "supreme court", "верховний суд",
               "trump", "трамп", "biden", "байден", "harris", "гарріс", "vance", "венс",
               "starmer", "стармер", "sunak", "сунак", "macron", "макрон",
               "scholz", "шольц", "merz", "мерц", "meloni", "мелоні",
               "zelensky", "zelenskyy", "зеленськ", "yermak", "єрмак",
               "speaker of the house", "спікер палати"],
    "normal": ["політик", "політич", "politics", "political",
               "уряд", "government", "влад", "міністр", "minister", "secretary of state",
               "президент", "president", "prime minister", "прем'єр",
               "governor", "губернатор", "mayor", "мер ", "senator", "сенатор", "congressman", "congresswoman",
               "deputy", "депутат", "mp ", " mp.", " mps ", "member of parliament",
               "посол", "ambassador", "дипломат", "diplomat", "envoy",
               "vote", "voter", "voting", "голосуван", "ballot", "бюлетень", "polls", "polling",
               "policy", "політика", "campaign", "кампані", "rally", "мітинг",
               "speaker", "спікер", "chairman", "голова комітету",
               "treaty", "договір", "agreement signed", "угоду підписан",
               "bipartisan", "двопартійн", "partisan", "партійн",
               "candidate", "кандидат", "incumbent", "чинний",
               "caucus", "кокус", "constituency", "виборчий округ",
               "statewide", "general election", "загальні вибори"],
    "negative": []
  },
  "conflict": {
    "strong": ["війна", "war in", "war on", "missile", "ракет", "drone strike", "удар дрон",
               "frontline", "фронт", "occupation", "окупац", "окупант",
               "генштаб", "general staff", "зсу", "afu", "armed forces of ukraine",
               "shelling", "обстріл", "ceasefire", "перемир", "armistice", "ceasefire deal",
               "casualti", "загибл", "killed in", "wounded in", "поранен", "killed by russian", "loss of life",
               "patriot system", "patriot missile", "himars", "хаймарс",
               "kalibr", "калібр", "iskander", "іскандер", "atacms",
               "kursk offensive", "курська область", "donbas", "донбас",
               "wagner group", "вагнер", "kadyrov", "кадиров",
               "putin", "путін", "shoigu", "шойгу", "gerasimov", "герасимов",
               "f-16", "leopard tank", "abrams", "challenger 2",
               "war crime", "військовий злочин", "geneva convention", "женевська конвенці",
               "nato membership", "членство в нато", "nato summit", "саміт нато"],
    "normal": ["military", "військов", "армія", "army", "navy", "військово-морські",
               "battalion", "батальйон", "brigade", "бригад", "regiment", "полк",
               "оборон", "defense", "defence", "attack", "атак", "strike on", "удар по",
               "наступ", "offensive", "counteroffensive", "контрнаступ", "withdraw", "відступ",
               "дрон", "drone", "uav", "бпла",
               "tank", "танк", "shahed", "шахед", "kamikaze drone", "дрон-камікадзе",
               "тцк", "мобілізац", "mobilization", "conscript", "призов",
               "ворог", "enemy", "polon", "полон", "pow", "prisoner of war", "військовополонен",
               "artillery", "артилері", "shell", "снаряд",
               "trench", "окоп", "minefield", "мінне поле",
               "command post", "командний пункт", "headquarters", "штаб",
               "soldier", "солдат", "marine", "морпіх", "veteran", "ветеран"],
    "negative": []
  },
  "investigation": {
    "strong": ["розслідуван", "investigation", "investigative report",
               "anti-corruption", "антикорупц", "набу", "nabu", "назк", "nazk", "сап", "sapo",
               "leaked documents", "злив документ", "exposé", "expose", "exposed", "whistleblower", "викривач",
               "panama papers", "pandora papers", "fbi probe", "розслідування фбр",
               "indictment", "обвинувальн висновок", "grand jury", "велике журі",
               "money laundering", "відмиван грошей", "tax evasion", "ухилення від податків",
               "оffshore account", "офшорний рахунок"],
    "normal": ["bribe", "хабар", "embezzle", "розкрадан", "fraud", "шахрайств",
               "scheme", "схем", "kickback", "відкат",
               "inquiry", "розслідуванн", "audit", "аудит",
               "criminal case", "кримінальна справ", "charges filed", "пред'явлено обвинувачен",
               "subpoena", "повістк до суду", "deposition", "свідчення під присягою"],
    "negative": []
  },
  "europe": {
    "strong": ["євросоюз", "european union", "european commission", "єврокомісі",
               "брюссель", "brussels", "europarliament", "європарламент",
               "schengen", "шенген", "council of europe", "рада європи",
               "von der leyen", "фон дер ляєн", "borrell", "боррель", "kallas", "каллас",
               "european parliament", "європейський парламент",
               "ec president", "президент єврокомісії",
               "eu council", "рада єс", "european council",
               "eu accession", "вступ до єс",
               "europol", "європол", "frontex", "фронтекс"],
    "normal": ["eu ", " eu.", "(eu)", "європейськ", "european", "europe",
               "germany", "німеччин", "berlin", "берлін",
               "france", "франці", "paris", "париж",
               "poland", "польщ", "warsaw", "варшав",
               "italy", "італі", "rome", "рим",
               "spain", "іспані", "madrid", "мадрид",
               "netherlands", "нідерланд", "amsterdam", "амстердам",
               "belgium", "бельгі", "sweden", "швеці", "finland", "фінлянді",
               "denmark", "дані", "norway", "норвегі", "ireland", "ірланді",
               "austria", "австрі", "vienna", "відень", "greece", "греці",
               "portugal", "португалі", "lisbon", "лісабон",
               "hungary", "угорщин", "orban", "орбан",
               "czech republic", "чехі", "slovakia", "словаччин",
               "romania", "румуні", "bulgaria", "болгарі",
               "lithuania", "литв", "latvia", "латві", "estonia", "естоні",
               "uk ", " uk.", "(uk)", "britain", "британі", "british", "британськ", "london", "лондон"],
    "negative": []
  },
  "ukraine": {
    "strong": ["україна", "україн", "ukrainian", "ukraine",
               "зеленськ", "zelensky", "zelenskyy",
               "київ", "києв", "kyiv", "kiev",
               "verkhovna rada", "ермак", "yermak",
               "shmyhal", "шмигаль", "kuleba", "кулеба",
               "umerov", "умеров", "syrskyi", "сирський",
               "naftogaz", "нафтогаз", "ukrenergo", "укренерго"],
    "normal": ["харків", "kharkiv", "львів", "lviv", "одес", "odesa", "odessa",
               "маріупол", "mariupol", "донецьк", "donetsk", "запоріжж", "zaporizhzhia",
               "херсон", "kherson", "сум", "sumy", "дніпр", "dnipro", "миколаїв", "mykolaiv",
               "крим", "crimea", "донбас", "donbas", "луганськ", "luhansk",
               "вінниц", "vinnytsia", "чернігів", "chernihiv", "полтав", "poltava",
               "житомир", "zhytomyr", "івано-франківськ", "ivano-frankivsk",
               "тернопіль", "ternopil", "черкас", "cherkasy", "ужгород", "uzhhorod",
               "hryvnia", "гривня"],
    "negative": []
  },
  "world": {
    "strong": ["united nations", " un ", " un.", "(un)", "оон", "g7", "g20", "g-7", "g-20",
               "summit", "саміт", "treaty", "договір", "bilateral talks", "двосторонні переговори",
               "white house", "білий дім", "kremlin", "кремль",
               "putin", "путін", "trump", "трамп", "xi jinping", "сі цзіньпін",
               "modi", "моді", "lula", "лула",
               "netanyahu", "нетаньягу", "erdogan", "ердоган",
               "israel", "ізраїль", "palestine", "палестин", "gaza", "газ",
               "hamas", "хамас", "hezbollah", "хезболл",
               "iran", "іран", "north korea", "північна коре", "kim jong", "кім чен",
               "russia", "росі", "moscow", "москв",
               "china", "китай", "beijing", "пекін", "taiwan", "тайвань",
               "saudi arabia", "саудівська арабі", "uae", "оае",
               "syria", "сирі", "yemen", "ємен", "lebanon", "ліван"],
    "normal": ["міжнародн", "international", "global", "world",
               "foreign", "іноземн", "foreign minister", "міністр закордонних",
               "сша", "usa", "u.s.", "united states", "america",
               "india", "індія", "japan", "японі", "tokyo", "токіо",
               "canada", "канад", "ottawa", "оттав", "trudeau", "трюдо", "carney", "карні",
               "mexico", "мексик", "brazil", "бразилі", "argentina", "аргентин",
               "south korea", "південна коре", "seoul", "сеул",
               "australia", "австралі", "new zealand", "нова зеландія",
               "africa", "африк", "egypt", "єгипет", "south africa", "пар",
               "embassy", "посольств", "consulate", "консульств",
               "diplomatic relations", "дипломатичні відносин",
               "geopolitics", "геополітик"],
    "negative": []
  },
  "tech": {
    "strong": ["artificial intelligence", "штучний інтелект", "machine learning", "машинне навчання",
               "openai", "anthropic", "chatgpt", "claude ai", "gemini ai",
               "llm", "large language model", "велика мовна модель",
               "startup", "стартап", "venture capital", "венчурний капітал",
               "cybersecurity", "кібербезпек", "cyberattack", "кібератак", "ransomware", "вірус-вимагач",
               "semiconductor", "напівпровідник", "chipmaker", "виробник чипів",
               "quantum computing", "квантові обчислення",
               "tesla inc", "spacex", "starlink", "старлінк",
               "nvidia", "amd ", "intel corp", "tsmc",
               "iphone", "macbook", "android", "ios update", "windows 11", "windows 12",
               "google", "apple", "microsoft", "meta platforms", "facebook", "instagram",
               "x.com", "twitter", "tiktok", "youtube"],
    "normal": ["technology", "технолог", "software", "програмне забезпечення",
               "hardware", "обладнанн", "app ", "застосунок", "platform", "платформ",
               "hack", "хак", "data breach", "витік даних", "phishing", "фішинг",
               "наука", "science", "research", "досліджен", "scientist", "вчений",
               "robot", "робот", "automation", "автоматизаці",
               "blockchain", "блокчейн", "smart contract", "смарт-контракт",
               "cloud computing", "хмарні обчислення", "saas",
               "developer", "розробник", "engineer", "інженер",
               "patent", "патент", "innovation", "інноваці",
               "5g", "broadband", "широкосмуговий", "internet", "інтернет"],
    "negative": ["said", "again", "pair", "main", "fail", "rain"]
  },
  "climate": {
    "strong": ["клімат", "climate change", "climate crisis", "global warming", "глобальне потепління",
               "carbon emission", "викиди вуглецю", "co2 emission", "net zero", "нульові викиди",
               "renewable energy", "відновлювальна енергі",
               "paris agreement", "паризька угода", "cop28", "cop29", "cop30",
               "ipcc", "міжурядова група з питань зміни клімату",
               "fossil fuel", "викопне паливо", "coal phase-out", "відмова від вугілля",
               "greenhouse gas", "парниковий газ"],
    "normal": ["екологі", "ecology", "environment", "довкілля", "ecosystem", "екосистем",
               "energy", "енергетик", "wind farm", "вітрова електростанці",
               "solar", "сонячн", "solar panel", "сонячна панель",
               "electric vehicle", "електромобіль", "ev ",
               "flood", "повінь", "wildfire", "пожеж", "drought", "посух",
               "heatwave", "спек", "hurricane", "ураган", "typhoon", "тайфун",
               "temperature record", "температурний рекорд",
               "biodiversity", "біорізноманітт", "deforestation", "вирубка лісів",
               "pollution", "забрудненн", "plastic waste", "пластикові відходи",
               "recycling", "переробка"],
    "negative": []
  },
  "sport": {
    "strong": ["football", "футбол", "uefa", "уєфа", "fifa", "фіфа",
               "olympic games", "олімпійські ігри", "olympics", "олімпіад",
               "world cup", "чемпіонат світу", "euro 2024", "євро 2024", "euro 2028",
               "champions league", "ліга чемпіонів", "europa league", "ліга європи",
               "premier league", "прем'єр-ліга", "la liga", "ла ліга",
               "serie a", "серія а", "bundesliga", "бундесліга", "ligue 1", "ліга 1",
               "усик", "usyk", "shevchenko", "шевченко", "ломаченко", "lomachenko",
               "messi", "мессі", "ronaldo", "роналду", "mbappe", "мбаппе", "haaland", "холанд",
               "djokovic", "джокович", "alcaraz", "алькарас", "sinner", "сіннер",
               "tennis", "теніс", "wimbledon", "вімблдон", "us open", "roland garros", "ролан гаррос",
               "boxing", "бокс", "heavyweight title", "титул важковаговик",
               "mma", "ufc", "юфс",
               "f1", "formula 1", "формула 1", "grand prix", "гран-прі",
               "nba", "нба", "nfl", "нфл", "mlb ", "nhl", "нхл"],
    "normal": ["match", "матч", "goal scored", "гол", "tournament", "турнір",
               "champion", "чемпіон", "title", "титул", "trophy", "трофей",
               "coach", "тренер", "player", "гравець", "manager", "менеджер",
               "real madrid", "barcelona", "барселон", "manchester united", "manchester city",
               "liverpool", "ліверпул", "chelsea", "челсі", "arsenal", "арсенал",
               "psg", "bayern munich", "баварі", "juventus", "ювентус", "milan",
               "динамо київ", "шахтар",
               "athlete", "спортсмен", "stadium", "стадіон", "arena", "арена",
               "league", "ліг", "season", "сезон",
               "transfer", "трансфер", "contract signed", "підписав контракт",
               "score", "рахунок", "scoreline", "результат матчу",
               "referee", "арбітр", "penalty kick", "пенальті"],
    "negative": []
  },
  "culture": {
    "strong": ["eurovision", "євробачен", "oscar", "оскар", "academy award", "премія оскар",
               "cannes", "канн", "venice film festival", "венеційський кінофестиваль",
               "berlinale", "берлінале", "sundance", "санденс",
               "grammy", "греммі", "emmy", "еммі", "tony award", "tony awards",
               "nobel prize", "нобелівська преміі", "booker prize", "букерівська премія",
               "exhibition", "виставк", "premiere", "прем'єр",
               "met gala", "мет гала", "fashion week", "тиждень моди"],
    "normal": ["music", "музик", "song released", "пісня вийшла",
               "film", "фільм", "movie", "кіно", "cinema", "кінотеатр",
               "book", "книг", "novel", "роман", "memoir", "мемуар",
               "art", "мистецтв", "painting", "картин", "sculpture", "скульптур",
               "theatre", "theater", "театр", "play", "вистав",
               "concert", "концерт", "tour announced", "оголошено тур",
               "album released", "альбом", "single released", "сингл",
               "director", "режисер", "actor", "актор", "actress", "актрис",
               "writer", "письменник", "poet", "поет",
               "museum", "музей", "gallery", "галере",
               "festival", "фестиваль", "celebrity", "знаменитість"],
    "negative": []
  },
  "society": {
    "strong": ["education reform", "освітня реформ", "healthcare reform", "медична реформ",
               "covid", "covid-19", "pandemic", "пандемі",
               "human rights", "права людини", "lgbt", "лгбт",
               "religion", "релігі", "церкв", "church", "vatican", "ватикан", "pope francis", "папа франциск",
               "abortion", "аборт", "gender equality", "гендерна рівність",
               "domestic violence", "домашнє насильство", "femicide", "фемініцид"],
    "normal": ["school", "школ", "university", "університет", "student", "студент",
               "teacher", "вчитель", "professor", "професор",
               "hospital", "лікарн", "doctor", "лікар", "nurse", "медсестр",
               "vaccine", "вакцин", "vaccination", "вакцинаці", "outbreak", "спалах",
               "accident", "аварі", "car crash", "автокатастроф",
               "fire broke out", "пожеж", "rescue", "порятун",
               "protest", "протест", "rally", "мітинг", "demonstration", "демонстраці",
               "society", "суспільств", "community", "громад",
               "migration", "міграці", "refugee", "біженц", "asylum", "притулок",
               "homeless", "безхатченк", "poverty", "бідність",
               "mental health", "психічне здоров'я", "depression", "депресі",
               "drug overdose", "передозуван"],
    "negative": []
  }
}
```

### Part B — Add an `--inspect` mode to `scripts/retag_all.py`

Add a new flag `--inspect` (mutually exclusive with `--dry-run` and the default real-run).

Behavior of `--inspect`:
1. Run the matcher on every article (no DB writes).
2. Collect every article that the new matcher would leave with zero tags.
3. Print the count, then print the **first 50 untagged article titles + first 120 chars of description**, one per line, in this format:
   ```
   [untagged] <title>
              <description excerpt>
   ```
4. This is the diagnostic loop: we eyeball what's still missing and add to the JSON next iteration.

### Part C — Run order
1. Edit `src/lib/tag-keywords.json` per Part A.
2. `npm run lint`.
3. `cd scripts && source venv/bin/activate && python retag_all.py --inspect` — paste the **count** and the **first 50 lines** of the inspector output in your reply.
4. `python retag_all.py --dry-run` — paste the dry-run summary.
5. `python retag_all.py` — paste the real-run summary.
6. `python fetcher.py` — paste the last 30 lines.
7. `python scripts/update_session.py --completed "expand tag keyword vocabulary" --note "Added US/UK/EU political vocab, world leaders, country names, sports leagues+clubs+athletes, tech companies, cultural events. Added --inspect mode to retag_all.py."`
8. Append a `2026-05-02` entry to `docs/changelog.md` with: untagged count before (2075) → after (X), per-tag totals delta, and the new untagged share %.
9. Commit message: `feat(tags): expand keyword vocabulary; add inspector mode`

## Output
Reply with:
1. Diff for `src/lib/tag-keywords.json` (just the size delta is fine if it's huge — confirm "replaced wholesale per plan").
2. Diff for `scripts/retag_all.py` (the new `--inspect` block).
3. Confirmation `npm run lint` passed.
4. **Inspector output**: count of untagged + first 50 lines.
5. Dry-run summary.
6. Real-run summary.
7. Last 30 lines of `python fetcher.py`.
8. Confirmation `update_session.py` ran AND `docs/changelog.md` was appended.
9. The commit hash.

## Read First
- `src/lib/tag-keywords.json` (current version — to overwrite)
- `scripts/retag_all.py` (to add `--inspect` mode)

## Do NOT
- Do NOT change the matcher algorithm, scoring weights, threshold (3), or top-3 cap. This task is vocabulary-only.
- Do NOT add new tags. Stay at 12.
- Do NOT reintroduce a `general` fallback.
- Do NOT remove keywords from the existing dict — this is purely additive plus the new entries shown.
- Do NOT change `tag-keywords.ts` matcher logic — only re-load the new JSON if needed.
- Do NOT touch any UI components.
- Do NOT skip the inspector step. The owner needs to see what is still missing so we can iterate.
