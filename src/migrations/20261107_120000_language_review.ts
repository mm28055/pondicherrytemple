import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await languageReviewData({ payload, req })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the old spellings are not kept: nothing to put back
}

/* The site-wide language review of 7 November 2026, as settled in the "Sthalam
   language review" document: one spelling for each transliterated word, British
   English, names in their Sanskrit form when they stand alone (Rama) and Tamil
   in a phrase (Ramar purappadu), typos, and the colloquialisms chosen one by
   one. Only these words change, in each record's own current text, so what was
   written on live stays. Web addresses, Tamil and Devanagari script, street
   names, official temple names and links are left alone. Newer drafts are put
   back still drafts. Runs again harmlessly. */

/** Single places: [what is written, what it becomes]. */
const PLACES: [string, string][] = [
  // typos
  ['Aademic Advisor', 'Academic Advisor'],
  ['Iingam', 'lingam'],
  ['Shankrachaya', 'Shankaracharya'],
  ['is said to drawn her', 'is said to have drawn her'],
  ['Medeival', 'Medieval'],
  ['lilly', 'lily'],
  ['Nararaja', 'Nataraja'],
  ['Balayalam', 'Balalayam'],
  ['Balayalan', 'Balalayam'],
  ['upto', 'up to'],
  ['saree', 'sari'],
  ['Whatsapp', 'WhatsApp'],
  ['Youtube', 'YouTube'],
  ['inteteresting', 'interesting'],
  ['dieties', 'deities'],
  ['wordhipped', 'worshipped'],
  ['Schdule', 'Schedule'],
  ['synchoronized', 'synchronised'],
  ['circumabulations', 'circumambulations'],
  ['flmy', 'filmy'],
  ['tappiocca', 'tapioca'],
  ['afterall', 'after all'],
  ['thats’', 'that’s'],
  ['thats', 'that’s'],
  ['patchs', 'patches'],
  ['barefeet', 'bare feet'],
  ['groundrules', 'ground rules'],
  ['He give us', 'He gives us'],
  ['arrivals’t completion', 'arrivals’ completion'],
  ['Pantanjali', 'Patanjali'],
  ['Lakshamana', 'Lakshmana'],
  ['Ramamujar', 'Ramanujar'],
  ['Navagrava', 'Navagraha'],
  ['tryaodashi', 'trayodashi'],
  ['dakshnina', 'dakshina'],
  ['Theirpirai', 'Theipirai'],
  ['Krisha paksha', 'Krishna paksha'],
  ['Maonmani', 'Manonmani'],
  ['Manounemani', 'Manonmani'],
  ['Manumutthumariamman', 'Manimutthumariamman'],
  ['Rudabhishekam', 'Rudrabhishekam'],
  ['Sankaranayarana', 'Shankaranarayana'],
  ['Shankaranaryana', 'Shankaranarayana'],
  ['VInayaka', 'Vinayaka'],
  ['Rahi Kalam', 'Rahu Kalam'],
  ['Seldal', 'Sedal'],
  ['Muugan', 'Murugan'],
  ['purappdu', 'purappadu'],
  ['Sanakaradevi', 'Sankaradevi'],
  ['Madhayamam', 'Madhyamam'],
  ['adhayapakas', 'adhyapakas'],
  ['unyahavam', 'Punyahavacanam'],
  ['Purnahavuti', 'Purnahuti'],
  ['Rusrakha', 'Rudraksha'],
  ['utava murtis', 'utsava murtis'],
  [' and frankly putting it sneaked out.', '.'],
  ['Panchamithi', 'Panchami tithi'],
  ['Prityangara', 'Pratyangira'],
  ['Prithyungara', 'Pratyangira'],
  ['Kommmati', 'Kommati'],
  // colloquialisms
  ['but boy were we wrong', 'but we were wrong'],
  ['was mighty long', 'was very long'],
  ['this mighty stupid', 'this rather foolish'],
  ['looking mighty grand', 'looking very grand'],
  ['is super cute', 'is charming'],
  ['major crowd, super interesting morning', 'a large crowd, a very interesting morning'],
  ['were super nice', 'were very kind'],
  ['Very cute.', 'Delightful.'],
  ['a cute embroidered green suit', 'a charming embroidered green suit'],
  ['look like cigars (yikes),', 'look like cigars,'],
  [' Yikes.', ''],
  ['Wow :)', 'Wow.'],
  ['aathukarar’s nethi :)', 'aathukarar’s nethi.'],
  ['long story short, he’s', 'in short, he’s'],
  ['(gosh, the waiting, the delays)', '(the waiting, the delays)'],
  ['when all is done and dusted', 'when all is over'],
  ['those awesome paniyaarams', 'those excellent paniyaarams'],
  ['The band guys', 'The band members'],
  ['uninterested looking guys', 'uninterested looking men'],
  ['a big fan of', 'a great admirer of'],
  ['[Cop asks me', '[A policeman asks me'],
  ['Another cop', 'Another policeman'],
  ['explains them thusly', 'explains them this way'],
  ['LOTS of women', 'Many women'],
  [' (sheepish emoji here, but not like I have not been over-my-head busy!)', ''],
  ['who turns out to be spot-on', 'who turns out to be right'],
  ['his backside or pin-alankaram', 'his pin-alankaram'],
  ['a pretty young woman', 'a young woman'],
  ['shrine – fancy!', 'shrine.'],
  ['which pretty much no other', 'which almost no other'],
  ['followed it pretty much all day', 'followed it almost all day'],
  ['built pretty much out of', 'built almost entirely out of'],
  ['is basically done', 'is done'],
  ['was basically the same', 'was the same'],
  ['Basically it’s a copper pot', 'It’s a copper pot'],
  ['a whole lot of neon green', 'a great many neon green'],
  ['are a whole lot of kaappu', 'are a great many kaappu'],
]

/** One form for a word: [the form, the spellings it replaces], any capitals, plurals kept. */
const WORDS: [string, ...string[]][] = [
  ['alankaram', 'alangaram', 'alankram'],
  ['alankara', 'alangara', 'alangaara'],
  ['alankarified', 'alangarified'],
  ['Alvar', 'Alwar', 'Azhwar', 'Azhvar'],
  ['Nammalvar', 'Nammazhvar'],
  ['Periyalvar', 'Perialvar', 'Perialwar'],
  ['Garudalvar', 'Garudazhwar'],
  ['Chakrattalvar', 'Cakratthazhvar'],
  ['Koyil', 'Koil'],
  ['puja', 'pooja'],
  ['sannadhi', 'sannathi', 'Sanandhi'],
  ['Abhishekam', 'Abhisekam', 'Abishekam', 'Abhisegam', 'Ambhishekam', 'Abhiskekam'],
  ['Ambal', 'Ampal', 'Ampaal'],
  ['Annapurni', 'Annapoorni'],
  ['Anthathi', 'Anthadi'],
  ['Ardhanariswara', 'Ardhanareeswara', 'Ardhanarisvara'],
  ['Bhagavatar', 'Bhagavathar'],
  ['Bhikshatanar', 'Bhiksatanar', 'Bhikshadanar'],
  ['Bhoota', 'Bhuta', 'Bootha'],
  ['Brahmotsavam', 'Brahmotsavan', 'Brahmostavam'],
  ['Chandikeswara', 'Chandikeswarar', 'Chandesha', 'Chandikeshwarar', 'Chandiswara', 'Candikeshvara'],
  ['Chandrasekara', 'Chandrashekhara'],
  ['Chaturdashi', 'Chaturthasi'],
  ['Chaturthi', 'Chaturti', 'Chathurti'],
  ['Chinnamman', 'Chinnaman', 'Chinamman'],
  ['Dakshinamurti', 'Daksinamurti', 'Dakshinamuthy'],
  ['darshan', 'Darsan'],
  ['darshanam', 'Darisanam', 'Darsanam'],
  ['Dashami', 'Dasami'],
  ['davanam', 'dhavana'],
  ['Davanotsavam', 'Dhavanotsavam'],
  ['Deeparadhanai', 'Deepaaradhanai', 'Deepadadhanai', 'Deeparahanai', 'Deeparadhnai'],
  ['Dhvajarohanam', 'Dvajarohanam', 'Dwajarohana'],
  ['dhvajastambha', 'dvajasthamba', 'dwajasthamba', 'dhvajasthambham', 'Dhvavajastambha'],
  ['dwadasa', 'dwadasha', 'dhvadhasa'],
  ['Ellaiamman', 'Ellaiyamman'],
  ['garbhagriha', 'garba griha', 'garbha griha', 'garbhagrha', 'garbhagrham', 'garbhagriham', 'garbagriha'],
  ['ghosti', 'Goshti', 'Ghosthi'],
  ['Gnanambigai', 'Gnanambika'],
  ['Hayagriva', 'Hayagreeva'],
  ['Kailaya', 'Kayilaya'],
  // the document's dictionary chose the long forms: kaalam, kaala, not kalam, kala
  ['kaalam', 'kalam'],
  ['kaala', 'kala'],
  ['ucchikaalam', 'ucchikalam', 'uchhikalam'],
  ['ucchikaala', 'uccikala'],
  ['kaalasandhi', 'kalasandhi'],
  ['kalasa', 'kalasha'],
  ['kalasam', 'kalasham', 'kalsham'],
  ['Karpaka', 'Karpaga'],
  ['Karthikai', 'Karthigai', 'Kartthikai'],
  ['Kathavarayan', 'Katavarayan'],
  ['Krittikai', 'Krittikkai', 'Krithikai'],
  ['Kumbhabhishekam', 'Kumbabhishekam', 'Kumabhishekam', 'Kumbhabhishekham', 'Kumbhabhisekam', 'Kumabhshekam', 'Kumabhisekam'],
  ['kunkuma', 'kumkuma'],
  ['kunkuma', 'kumkum'],
  ['kunkumam', 'kumkumam'],
  ['Lalita', 'Lalitha'],
  ['madaveethi', 'mada veethi'],
  ['Mahishasura', 'Mahisasura'],
  ['Mamunigal', 'Maamunigal'],
  ['Manakkula', 'Manakula', 'Manakkular'],
  ['Maniyakkarar', 'Maniyakarar', 'Manikarar'],
  ['masam', 'maasam'],
  ['masa', 'maasa'],
  ['Masi', 'Maasi'],
  ['Masi Maham', 'Masi Magam', 'Masi Maagam'],
  ['Moolamurti', 'Moolamurthi', 'Mulamurti'],
  ['moolasthanam', 'moola sthanam', 'moolastanam'],
  ['Moolavar', 'Mulavar', 'Mulaver'],
  ['Mrtsangrahanam', 'Mritsangrahanam'],
  ['Mutthalarajan', 'Muthalarajan', 'Mutthalaraja'],
  ['Mutthupallakku', 'Mutthupalakku', 'Mutthupalaku'],
  ['Nandhikeswara', 'Nandikeswara', 'Nandhikeshwara'],
  ['Navaratri', 'Navarathri'],
  ['neruppu', 'nerupu'],
  ['odhuvar', 'othuvar'],
  ['padhigam', 'Pathigam', 'padigam'],
  ['pallakku', 'pallaq'],
  ['palliyarai', 'palliarai'],
  ['panchamrutam', 'panchamritam'],
  ['pandal', 'pandhal'],
  ['Parameswari', 'Parameshwari'],
  ['Parashakti', 'Parasakti', 'Parashakthi'],
  ['Parvati', 'Parvathi'],
  ['pasuram', 'Paasuram'],
  ['Pratishtha', 'Pratisthai', 'Pratishtai', 'prathishta', 'Pratistha', 'prathistha', 'prathishtha', 'Pratishta'],
  ['Punyahavacanam', 'Punyaha Vachanam'],
  ['purappadu', 'Purappatu'],
  ['Purnahuti', 'Poornahuti'],
  ['talam', 'taalam'],
  ['ragam', 'raagam'],
  ['Rajarajeswari', 'Rajarajeshwari'],
  ['saatthupadi', 'saathupadi', 'Sathupadi', 'Satthupadi'],
  ['Saattrumurai', 'Sattrumurai', 'Sarrumurai', 'Satrumurai', 'Satrumarai', 'Satturmurai'],
  ['Sahasranamam', 'Sahasrananam'],
  ['Sankaradevi', 'Shankaradevi'],
  ['Sankatahara', 'Sangatahara'],
  ['Saptavarana', 'Sapthavarna', 'Saptavaranam', 'Sathavaranam'],
  ['Shakti', 'Sakti', 'Sakthi', 'Shakthi'],
  ['Shankhabhishekam', 'Sanghabhishekam'],
  ['Shravana', 'Sravana'],
  ['Siddheswari', 'Siddheshvari', 'Siddhewari'],
  ['Sivaratri', 'Shivaratri'],
  ['Mahasivaratri', 'Mahashivaratri'],
  ['Siva', 'Shiva'],
  ['Sri', 'Shri'],
  ['Swati', 'Swathi'],
  ['theemidi', 'Theemitti', 'Theemithi'],
  ['Theerthavari', 'Teerthavari', 'Tirthavari'],
  ['Thirukoyil', 'Thirukkoyil', 'Thirukoil'],
  ['Thirumanjanam', 'Tirumanjanam'],
  ['Thiruvahindrapuram', 'Tiruvaheendrapuram', 'Thiruvahindrpuram'],
  ['Thiruvaimozhi', 'Thiruvaymozhi'],
  ['Thiruveethi', 'Tiruviti'],
  ['tithi', 'thithi'],
  ['Tripurasundari', 'Thripurasundari', 'Tiripurasundari'],
  ['Tritiya', 'Trittiya'],
  ['ubhayakara', 'ubhayakarar', 'ubhakara'],
  ['utsava murti', 'utsavamurti'],
  ['utsavam', 'Uthsavam', 'utsva'],
  ['utsavar', 'Uthsavar'],
  ['Utthiram', 'Uthiram', 'Uttiram'],
  ['Vaishnava', 'Vaishanava'],
  ['Vasanta', 'Vasantha'],
  ['Vedapuriswara', 'Vedapuriswarar', 'Vedapureeswarar', 'Veapuriswara'],
  ['Vidaiyatri', 'Vidayattri', 'Vidayatri'],
  ['Vigneswara', 'Vigneshwara', 'Vighnesvara', 'Vighneswara', 'Vighneshwara'],
  ['Vinayaka', 'Vinaayaka'],
  ['Vishakam', 'Vishakham', 'Visakam'],
  ['Vishwakarma', 'Viswakarma', 'Vishvakarma'],
  ['yagasala', 'yaga salai', 'yagashala', 'yagasalai', 'yaga shala'],
  // decisions
  ['Ghousiga', 'Ghousika'],
  ['Kannika', 'Kanniga'],
  ['Swami', 'Swamy'],
  ['Thirukumaran', 'Thirukkumaran'],
  ['Mattaiyadi', 'Mattaiadi'],
  ['Tavakola', 'Tavaloka'],
  ['Ramradjou', 'Ramrajdou'],
  ['Jayashankar', 'Jaishankar'],
  ['Ramar', 'Raamar'],
]

/** Names: alone the second form; in a phrase (the next word below) as they are. */
const NAMES: [string, string][] = [
  ['Ramar', 'Rama'], ['Ramanujar', 'Ramanuja'], ['Vinayakar', 'Vinayaka'], ['Vinayagar', 'Vinayaka'],
  ['Natarajar', 'Nataraja'], ['Narasimhar', 'Narasimha'], ['Bhairavar', 'Bhairava'], ['Ranganathar', 'Ranganatha'],
  ['Anjaneyar', 'Anjaneya'], ['Hayagrivar', 'Hayagriva'], ['Somaskandar', 'Somaskanda'], ['Chandrasekarar', 'Chandrasekara'],
  ['Pandarinathar', 'Pandarinatha'], ['Pandurangar', 'Panduranga'], ['Viswanathar', 'Viswanatha'], ['Varadarajar', 'Varadaraja'],
  ['Vishwaksenar', 'Vishwaksena'], ['Garudan', 'Garuda'], ['Kuberan', 'Kubera'], ['Arjunan', 'Arjuna'],
  ['Venugopalan', 'Venugopala'], ['Kothandaraman', 'Kodandarama'],
]
const PHRASE = /^(purappadu|utsavams?|utsava|utsavar|abhishekams?|sannadhis?|koyils?|temples?|shrines?|pujai?|alankaram|paattu|jayanti|thirumanjanam|vahanam?|mandapam|ul|veethi|thirukalyanam|kalyanam|janma|deepam|navami|pattabhishekam|yantra|thavasu|davasu|bhajanai)$/i

/** British English: what is matched at the start of a word. */
const BRITISH: [RegExp, string][] = [
  [/(?<![A-Za-z])(un|Un)?([Cc])olor/g, '$1$2olour'],
  [/(?<![A-Za-z])([Nn])eighbor/g, '$1eighbour'],
  [/(?<![A-Za-z])([Hh])onor(?!ar|if)/g, '$1onour'],
  [/(?<![A-Za-z])([Ff])avorite/g, '$1avourite'],
  [/(?<![A-Za-z])([Cc])enter(s?)(?![A-Za-z])/g, '$1entre$2'],
  [/(?<![A-Za-z])([Tt])heater(s?)(?![A-Za-z])/g, '$1heatre$2'],
  [/(?<![A-Za-z])armor(?![A-Za-z])/g, 'armour'],
  [/(?<![A-Za-z])([Ss])avory(?![A-Za-z])/g, '$1avoury'],
  [/(?<![A-Za-z])cozy(?![A-Za-z])/g, 'cosy'],
  [/(?<![A-Za-z])woolen(?![A-Za-z])/g, 'woollen'],
  [/(?<![A-Za-z])petaled(?![A-Za-z])/g, 'petalled'],
  [/(?<![A-Za-z])traveled(?![A-Za-z])/g, 'travelled'],
  [/(?<![A-Za-z])modeled(?![A-Za-z])/g, 'modelled'],
  [/(?<![A-Za-z])bejeweled(?![A-Za-z])/g, 'bejewelled'],
  [/(?<![A-Za-z])skillful(?![A-Za-z])/g, 'skilful'],
  [/(?<![A-Za-z])fulfill(ment)?(?![A-Za-z])/g, 'fulfil$1'],
  [/(?<![A-Za-z])([Oo]rgani|[Rr]eali|[Rr]ecogni|[Aa]nglici|[Cc]hristiani|[Gg]allici|[Rr]ituali|[Uu]tili|[Mm]ateriali|[Ss]ynthesi|[Ee]mphasi|[Rr]evitali|[Ss]peciali|[Ee]quali|[Dd]estabili|[Hh]armoni|[Ss]acrali)z/g, '$1s'],
]

/** Words run together where a printed line was lost: a line break between them. */
const RUN_TOGETHER = /(?<![A-Za-z])(?:DeepaaradhanaiMaalai|PaarayanaiMaalai|DeeparadhanaiMaalai|CarvingOrgani[sz]ers|recitalOrgani[sz]ers|festivalsOrgani[sz]ers|competitionOrgani[sz]ers|KirthanasOrgani[sz]ers|YogaOrgani[sz]ers|podhuIndru|PudhankizhamaiKaalai|ChandrakanthaDwitiya|MookambikaTuesday|VarahiWeds|downwardsFriday|IllasuppettaiNavarathri|ChaturdashiChithirai|ChaturdashiPurattasi|NandhikeswaraGangai|VinayakaLawspet|SubramaniaswamySaram|SubramaniaswamyAngalammanAngalamman|townSakti|SubramaniaswamyPerumalSivanSundara|vinayakaVarasiddhi|VinayakarMettupalayam|MutthumariammanSri|UlagamutthumariammanThandamutthumariammanMutthalammanChetty|cattutalAnnabhiseka|alankaramSotasopacara|diparadhanaMaha|diparadhanaAnnam|pujaiAnnabhiseka|pujaiDiparadhanaPiracada|purappaduSri|PandanathanThursday|GuruvayurappanFriday|KothandaramanSaturday|PandaripuranatharSunday)(?![A-Za-z])/g
const BREAK = ' '

const rx = new Map<string, RegExp>()
const wordRx = (w: string) => {
  let r = rx.get(w)
  if (!r) rx.set(w, (r = new RegExp(`(?<![A-Za-z\\u00C0-\\u024F])${w.replace(/ /g, '[ -]')}(s?)(?![A-Za-z\\u00C0-\\u024F])`, 'gi')))
  r.lastIndex = 0
  return r
}
/** The new form with the capitals of the old. */
const likeCase = (to: string, from: string) => {
  if (from.length > 2 && from === from.toUpperCase()) return to.toUpperCase()
  const first = from[0] === from[0].toUpperCase() ? to[0].toUpperCase() : to[0].toLowerCase()
  return first + to.slice(1)
}

export const placesFound = new Map<string, number>()

export function reviewed(text: string, rich = false): string {
  if (/who holds a parrot/.test(text)) return text // a quoted translation
  let s = text
  for (const [from, to] of PLACES) {
    const body = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`${/^[A-Za-z]/.test(from) ? '(?<![A-Za-z])' : ''}${body}${/[A-Za-z]$/.test(from) ? '(?![A-Za-z])' : ''}`, 'g')
    const next = s.replace(re, to)
    if (next !== s) {
      placesFound.set(from, (placesFound.get(from) ?? 0) + 1)
      s = next
    }
  }
  s = s.replace(RUN_TOGETHER, (m) => m.replace(/([a-z])(?=[A-Z])/g, `$1${rich ? BREAK : ' '}`))
  s = s.replace(/\)(?=(?:Organi[sz]ers|Competitions))/g, rich ? `)${BREAK}` : ') ')
  // kept as they stand: official names and street names
  const kept: string[] = []
  s = s.replace(/Arulmigu Manakkula Vinayagar|Isparin Dharmaradja Covil Street|Samedha Shri Vedapuriswarar Thirukoyil|Koil (?=St\b|Street)/g, (m) => {
    kept.push(m)
    return `${kept.length - 1}`
  })
  s = s
    .replace(/(?<![A-Za-z])Adi(?= (?:Masam|masam|maasam|Velli|Fridays?|\d))/g, 'Aadi')
    .replace(/(?<=month of )Adi(?![A-Za-z])/g, 'Aadi')
    .replace(/(?<![A-Za-z])Ani(?![A-Za-z])/g, 'Aani')
    .replace(/(?<![A-Za-z])Avani(?![A-Za-z])/g, 'Aavani')
  for (const [to, ...froms] of WORDS)
    for (const from of froms) s = s.replace(wordRx(from), (m, plural) => likeCase(to, m.slice(0, m.length - plural.length)) + plural)
  for (const [name, alone] of NAMES) {
    s = s.replace(new RegExp(`(?<![A-Za-z])${name}(?![A-Za-z])((?:['’]s)?)([ -]?)([A-Za-z]*)`, 'g'), (_m, own, gap, next) => {
      const phrase = PHRASE.test(next)
      const form = phrase ? (name === 'Vinayagar' ? 'Vinayakar' : name) : alone
      return `${form}${own}${gap}${next}`
    })
  }
  for (const [re, to] of BRITISH) s = s.replace(re, to)
  return s.replace(/(\d+)/g, (_m, i) => kept[Number(i)])
}

type Node = { type?: string; text?: string; children?: Node[]; [k: string]: unknown }

/** Rich text with its words reviewed; a text with a lost line gets its break back. */
function reviewRich(body: any): any {
  const walk = (n: Node): Node[] => {
    if (n.type === 'text' && typeof n.text === 'string') {
      const parts = reviewed(n.text, true).split(BREAK)
      return parts.flatMap((text, i) => [...(i ? [{ type: 'linebreak', version: 1 } as Node] : []), { ...n, text }])
    }
    return [Array.isArray(n.children) ? { ...n, children: n.children.flatMap(walk) } : n]
  }
  return { ...body, root: { ...body.root, children: body.root.children.flatMap(walk) } }
}

const NOT_WORDS = new Set(['id', 'tamil', 'time', 'tbc', 'temple', 'blockType', 'blockName'])
/** A value with its words reviewed: strings, rich text, and arrays and groups of them. */
function reviewValue(v: any): any {
  if (typeof v === 'string') return reviewed(v)
  if (Array.isArray(v)) return v.map(reviewValue)
  if (v && typeof v === 'object') {
    if (v.root?.children) return reviewRich(v)
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, NOT_WORDS.has(k) ? x : reviewValue(x)]))
  }
  return v
}

/** The fields of a record that changed, or null. */
function changes(doc: any, fields: string[]): Record<string, unknown> | null {
  const out: Record<string, unknown> = {}
  for (const k of fields) {
    if (doc[k] === undefined || doc[k] === null) continue
    const next = reviewValue(doc[k])
    if (JSON.stringify(next) !== JSON.stringify(doc[k])) out[k] = next
  }
  return Object.keys(out).length ? out : null
}

const COLLECTIONS: [string, string[]][] = [
  ['temples', ['knownAs', 'shortName', 'deity', 'intro', 'ritualDay']],
  ['observances', ['name', 'alsoKnownAs', 'gloss', 'about', 'recursWhen']],
  ['field-notes', ['title', 'occasion', 'body']],
  ['films', ['title', 'body']],
  ['temple-pieces', ['title', 'body']],
  ['books', ['title', 'parts']],
  ['drawings', ['title']],
  ['photo-sets', ['title', 'short']],
  ['occasions', ['label', 'schedule', 'yearNote']],
  ['media', ['alt', 'caption']],
  ['weekly-rituals', ['what', 'atTemples']],
  ['special-tithis', ['name']],
  ['special-nakshatras', ['name']],
  ['regions', ['intro']],
]
const GLOBALS: [string, string[]][] = [
  ['about-page', ['lede', 'sections', 'team', 'contactText']],
  ['home-page', ['headline', 'opening', 'quote', 'quoteAfter', 'bookHeading', 'bookText']],
  ['section-descriptions', ['observances', 'fieldNotes', 'films', 'articles', 'books']],
]

/** A temple's official name stays, apart from the two spellings decided for it. */
const templeName = (s: string) => s.replace(/Kanniga/g, 'Kannika').replace(/Ghousika/g, 'Ghousiga')

const META = new Set(['id', 'createdAt', 'updatedAt', '_status', 'createdBy'])
const whole = (doc: Record<string, unknown>) => Object.fromEntries(Object.entries(doc).filter(([k]) => !META.has(k)))

export async function languageReviewData(
  { payload, req }: Pick<MigrateUpArgs, 'payload' | 'req'>,
  { dry = false, log }: { dry?: boolean; log?: (where: string, field: string, before: unknown, after: unknown) => void } = {},
): Promise<void> {
  const quiet = { req, overrideAccess: true, depth: 0, context: { skipRevalidate: true } } as const
  const made: Record<string, number> = {}
  const change = (collection: string, doc: any) => {
    const out: Record<string, unknown> = changes(doc, COLLECTIONS.find(([s]) => s === collection)![1]) ?? {}
    if (collection === 'temples' && typeof doc.name === 'string' && templeName(doc.name) !== doc.name) out.name = templeName(doc.name)
    return Object.keys(out).length ? out : null
  }

  for (const [collection] of COLLECTIONS) {
    const drafts = !!(payload.collections as any)[collection]?.config.versions?.drafts
    const { docs: all } = await payload.find({ collection, limit: 0, pagination: false, ...(drafts ? { draft: true } : {}), ...quiet } as any)
    for (const latest of all as any[]) {
      if (!drafts) {
        const c = change(collection, latest)
        if (!c) continue
        for (const k of Object.keys(c)) log?.(`${collection}/${latest.slug ?? latest.id}`, k, latest[k], c[k])
        if (!dry) await payload.update({ collection, id: latest.id, data: { ...(latest.slug ? { slug: latest.slug } : {}), ...c }, ...quiet } as any)
        made[collection] = (made[collection] ?? 0) + 1
        continue
      }
      const { docs: pub } = await payload.find({ collection, limit: 1, draft: false, where: { and: [{ id: { equals: latest.id } }, { _status: { equals: 'published' } }] }, ...quiet } as any)
      const published = pub[0] as any
      const c = published ? change(collection, published) : null
      if (published && c) {
        for (const k of Object.keys(c)) log?.(`${collection}/${published.slug ?? published.id}`, k, published[k], c[k])
        if (!dry) await payload.update({ collection, id: published.id, data: { ...whole(published), ...c, _status: 'published' }, draft: false, ...quiet } as any)
        made[collection] = (made[collection] ?? 0) + 1
      }
      if (latest._status === 'draft') {
        const d = change(collection, latest)
        if ((c || d) && !dry) await payload.update({ collection, id: latest.id, data: { ...whole(latest), ...d, _status: 'draft' }, draft: true, ...quiet } as any)
        if (d && !published) made[collection] = (made[collection] ?? 0) + 1
      }
    }
  }

  for (const [slug, fields] of GLOBALS) {
    const doc = (await payload.findGlobal({ slug, ...quiet } as any)) as any
    const c = changes(doc, fields)
    if (!c) continue
    for (const k of Object.keys(c)) log?.(`global/${slug}`, k, doc[k], c[k])
    if (!dry) await payload.updateGlobal({ slug, data: c, ...quiet } as any)
    made[slug] = 1
  }
  payload.logger.info(`language review: ${JSON.stringify(made)}`)
}
