/* The words occasions are made of (the headings over photographs: "Meenakshi
   Alankaram", "PM Purappadu"), for those not given whole in notesTa: the
   longest phrase first, every word of it here, or the occasion stays in
   English. All in small letters. */

const PHRASES: Record<string, string> = {
  // whole ones, first
  "vajrabahu spine climbing": "வஜ்ரபாகுவின் முதுகேறல்",
  "ambu poduthal on kuthirai vahanam": "குதிரை வாகனத்தில் அம்பு போடுதல்",
  "ambal ney pongal reflection": "நெய்ப் பொங்கலில் அம்பாளின் பிரதிபலிப்பு",
  "saraswati alankaram (done by another priest)": "சரஸ்வதி அலங்காரம் (வேறோர் அர்ச்சகர் செய்தது)",
  "fancy dress contest": "மாறுவேடப் போட்டி",
  "visalakshi as saraswati": "சரஸ்வதியாக விசாலாட்சி",
  "visalakshi as ardhanariswara": "அர்த்தநாரீஸ்வரராக விசாலாட்சி",
  "panchasana outside mamunigal": "மாமுனிகளுக்கு வெளியே பஞ்சாசனம்",
  "(unsure)": "(உறுதியில்லை)",
  "miscellaneous photos": "பிற புகைப்படங்கள்",
  "personal anjaneyar puja": "தனிப்பட்ட ஆஞ்சநேயர் பூசை",
  "dance outside": "வெளியே நடனம்",
  "golu market visit": "கொலுச் சந்தை வருகை",
  "palliyarai photos": "பள்ளியறைப் புகைப்படங்கள்",
  "purappadu and up to hayagriva": "புறப்பாடு, ஹயக்ரீவர் வரை",
  "day after missing vishwakarma jayanti": "விஸ்வகர்மா ஜெயந்தியைத் தவறவிட்ட மறுநாள்",
  "lovely dakshinamurti": "அழகிய தட்சிணாமூர்த்தி",
  "tree marriage": "மரத் திருமணம்",
  "varalakshmi nonbu thiruvilakku puja(postponed from pooram)": "வரலட்சுமி நோன்புத் திருவிளக்குப் பூசை (பூரத்திலிருந்து ஒத்திவைத்தது)",
  "thiruvilakku (postponed from pooram)": "திருவிளக்கு (பூரத்திலிருந்து ஒத்திவைத்தது)",
  "bangles for adi pooram": "ஆடிப் பூரத்திற்கான வளையல்கள்",
  "dharmar pattabhishekam and maryada for helpers": "தர்மர் பட்டாபிஷேகமும் உதவியாளர்களுக்கு மரியாதையும்",
  "ubhayakara abhishekam and ther departure": "உபயகாரர் அபிஷேகமும் தேர் புறப்படுதலும்",
  "bhavani sundara vinayaka near kausika": "கௌசிக கோயில் அருகே பவானி சுந்தர விநாயகர்",
  "mahishasuramardini alankaram and ther kalasa hoisting": "மகிஷாசுரமர்த்தினி அலங்காரமும் தேர்க் கலசம் ஏற்றுதலும்",
  "adi tuesday3": "ஆடி மூன்றாம் செவ்வாய்",
  "adi tuesday1": "ஆடி முதல் செவ்வாய்",
  "adi friday1": "ஆடி முதல் வெள்ளி",
  "adi friday2": "ஆடி இரண்டாம் வெள்ளி",
  "aadi friday 2": "ஆடி இரண்டாம் வெள்ளி",
  "aadi friday3 laksharchanai kunkuma": "ஆடி மூன்றாம் வெள்ளி லட்சார்ச்சனை, குங்குமம்",
  "aadi 3rd friday sapta kannika puja 10am-12noon": "ஆடி மூன்றாம் வெள்ளி சப்த கன்னிகா பூசை, காலை 10 – நண்பகல் 12",
  "adi vizha day 2 karagu koozh": "ஆடி விழா 2ஆம் நாள் கரகம், கூழ்",
  "mariamman alankaram process": "மாரியம்மன் அலங்காரம் உருவாகும் முறை",
  "24hours": "24 மணி நேரம்",
  "friday1": "முதல் வெள்ளி",
  "friday2": "இரண்டாம் வெள்ளி",
  "mangani thiruvizha and am damanam on perumal and murugan": "மாங்கனித் திருவிழா, காலையில் பெருமாளுக்கும் முருகனுக்கும் தமனம்",
  "goubert market sculptures from senji temple": "செஞ்சிக் கோயிலிலிருந்து வந்த கூபேர் அங்காடிச் சிற்பங்கள்",
  "friday amman purappadu pradosha nayakar and vishnupati punya kaalam perumal dhvajastambha":
    "வெள்ளிக்கிழமை அம்மன் புறப்பாடு, பிரதோஷ நாயகர், விஷ்ணுபதி புண்ணிய காலம், பெருமாள் கொடிமரம்",
  "durga vaaram utsavam": "துர்க்கை வார உற்சவம்",
  "aravan moksham": "அரவான் மோட்சம்",
  "parade and pandal vinayaka visarjanam": "ஊர்வல, பந்தல் விநாயகர் விசர்ஜனம்",
  "vinayaka chaturthi private visarjanams": "விநாயக சதுர்த்தி தனியார் விசர்ஜனங்கள்",
  "shankara narayanan and family": "சங்கர நாராயணனும் குடும்பத்தினரும்",
  "navashakti karumari amman brahmotsavam friday sedal": "நவசக்தி கருமாரி அம்மன் பிரம்மோற்சவம், வெள்ளிக்கிழமைச் செடல்",
  "parashakti and mutthalarajan padayal": "பராசக்தி, முத்தாளராஜன் படையல்",
  "debbie wastie": "டெபி வேஸ்டி",
  // temples and places
  "vedapuriswara koyil": "வேதபுரீஸ்வரர் கோயில்", "chetty koyil": "செட்டிக் கோயில்", "varsha pirappu": "வருடப் பிறப்பு", "varadaraja perumal koyil": "வரதராஜப் பெருமாள் கோயில்",
  "sundara-vinayakar": "சுந்தர விநாயகர்", "draupadi-amman": "திரௌபதி அம்மன்", "ghousiga-balasubramaniar": "கௌசிக பாலசுப்பிரமணியர்",
  "siva-subramania-lawspet": "லாஸ்பேட்டை முருகன்", "manakkula-vinayakar": "மணக்குள விநாயகர்", "kamakshi-amman": "காமாட்சி அம்மன்", "manonmani-mariamman": "மனோன்மணி மாரியம்மன்",
  ghousiga: "கௌசிக கோயில்", vedapuriswara: "வேதபுரீஸ்வரர்", nandhikeswara: "நந்திகேஸ்வரர்", ellaiamman: "எல்லையம்மன்", angalamman: "அங்காளம்மன்",
  "senkazhuneer amman": "செங்கழுநீர் அம்மன்", "lada chinnamman": "லாட சின்னம்மன்", "lada chinna amman": "லாட சின்ன அம்மன்", mutthalamman: "முத்தாலம்மன்", aalayam: "ஆலயம்",
  "palani andavar": "பழனி ஆண்டவர்", "kama koyil": "காமன் கோயில்", muthialpet: "முத்தியால்பேட்டை", sudugadu: "சுடுகாடு", vaithikuppam: "வைத்திக்குப்பம்", town: "நகர்", pondicherry: "புதுச்சேரி",
  "panchasana peetham": "பஞ்சாசன பீடம்", "golu mandapam": "கொலு மண்டபம்", surroundings: "சுற்றுப்புறம்",
  // deities
  perumal: "பெருமாள்", thayar: "தாயார்", "thayar-perumal": "தாயார்-பெருமாள்", "three-faced thayar": "மும்முகத் தாயார்", murugan: "முருகன்", amman: "அம்மன்", ambal: "அம்பாள்", andal: "ஆண்டாள்", desikar: "தேசிகர்",
  "angalaparameswari": "அங்காள பரமேஸ்வரி", "manavala mamunigal": "மணவாள மாமுனிகள்", mamunigal: "மாமுனிகள்", periyalvar: "பெரியாழ்வார்", bhavani: "பவானி", parashakti: "பராசக்தி", saraswati: "சரஸ்வதி", sarasvati: "சரஸ்வதி", "veda saraswati": "வேத சரஸ்வதி",
  durga: "துர்க்கை", "pratyangira kali": "பிரத்தியங்கிரா காளி", "santana lakshmi": "சந்தான லட்சுமி", lakshmi: "லட்சுமி", mahalakshmi: "மகாலட்சுமி", gajalakshmi: "கஜலட்சுமி", "parvati ekamranatha": "பார்வதி ஏகாம்பரநாதர்",
  skandamata: "ஸ்கந்தமாதா", ardhanariswara: "அர்த்தநாரீஸ்வரர்", "vinayaka alingana": "விநாயக ஆலிங்கன", rajarajeswari: "ராஜராஜேஸ்வரி", varahi: "வராகி", mohini: "மோகினி", meenakshi: "மீனாட்சி", kamakshi: "காமாட்சி", annapurni: "அன்னபூரணி",
  thayyalnayaki: "தையல்நாயகி", nataraja: "நடராஜர்", "ramar": "ராமர்", "sita ramar": "சீதா ராமர்", bhairava: "பைரவர்", bhairavar: "பைரவர்", "sundara krishnan": "சுந்தர கிருஷ்ணன்", dakshinamurti: "தட்சிணாமூர்த்தி", siddheswari: "சித்தேஸ்வரி",
  mahishasuramardini: "மகிஷாசுரமர்த்தினி", narayani: "நாராயணி", mariamman: "மாரியம்மன்", "panduranga": "பாண்டுரங்கன்", garudan: "கருடன்", vinayaka: "விநாயகர்", venugopal: "வேணுகோபாலர்", vishvaksena: "விஷ்வக்சேனர்", "pradosha nayakar": "பிரதோஷ நாயகர்",
  "satthiya nayanar": "சத்தி நாயனார்", "narasimhamunaiyaraiyar nayanar": "நரசிங்க முனையரையர் நாயனார்", sundarar: "சுந்தரர்", panchamurti: "பஞ்சமூர்த்தி", dharmar: "தர்மர்", navaveerargal: "நவவீரர்கள்", ubhayakara: "உபயகாரர்", "shankara narayanan": "சங்கர நாராயணன்", periyandavar: "பெரியாண்டவர்",
  "sphatika linga": "ஸ்படிக லிங்க", yogasakti: "யோக சக்தி",
  // forms
  ravaneswara: "ராவணேஸ்வர", singaravelan: "சிங்காரவேலன்", simhamukhasooran: "சிம்மமுகசூரன்", gajamukhasooran: "கஜமுகசூரன்", samharam: "சம்ஹாரம்", soorasamharam: "சூரசம்ஹாரம்", "vel vanguthal": "வேல் வாங்குதல்", veena: "வீணை", raja: "ராஜ",
  rishabha: "ரிஷபம்", kamadhenu: "காமதேனு", "pazhamudircholai": "பழமுதிர்சோலை", thiruparankundram: "திருப்பரங்குன்றம்", "surya prabhai": "சூரிய பிரபை", "chandra prabhai": "சந்திர பிரபை", sayana: "சயன", thavakolam: "தவக்கோலம்",
  naga: "நாக", kuthirai: "குதிரை", sesha: "சேஷ", yali: "யாளி", hanumantha: "அனுமந்த", simha: "சிம்ம", yanai: "யானை", vahana: "வாகனம்", vahanam: "வாகனம்", vimana: "விமானம்", "nachiyar thirukolam": "நாச்சியார் திருக்கோலம்", mohanavataram: "மோகனாவதாரம்",
  alankaram: "அலங்காரம்", "alankaram process": "அலங்காரம் உருவாகும் முறை", "candana kappu": "சந்தனக் காப்பு", candanakappu: "சந்தனக் காப்பு", "vellai saatthupadi": "வெள்ளை சாத்துபடி", "valayal kaappu": "வளையல்காப்பு", valayal: "வளையல்", "manjal kuzhambu": "மஞ்சள் குழம்பு",
  "mutthupallakku": "முத்துப் பல்லக்கு", "kinni ther": "கிண்ணித் தேர்", "laddu ther": "லட்டுத் தேர்",
  // rites
  abhishekam: "அபிஷேகம்", puja: "பூசை", gopuja: "கோபூசை", homam: "ஹோமம்", purappadu: "புறப்பாடு", "ul-purappadu": "உள் புறப்பாடு", "ul purappadu": "உள் புறப்பாடு", "veethi purappadu": "வீதிப் புறப்பாடு", "veethi ula": "வீதி உலா", veethi: "வீதி", unjal: "ஊஞ்சல்",
  thirumanjanam: "திருமஞ்சனம்", "aani thirumanjanam": "ஆனித் திருமஞ்சனம்", "mangalashasanam-thirumanjanam": "மங்களாசாசனம்-திருமஞ்சனம்", mangalasasanam: "மங்களாசாசனம்", theerthavari: "தீர்த்தவாரி", "kadal theerthavari": "கடல் தீர்த்தவாரி", dhvajavarohanam: "த்வஜாவரோஹணம்", "kodi raising": "கொடியேற்றம்", kodi: "கொடி",
  "vigneswara": "விக்னேஸ்வர", mrtsangrahanam: "மிருத்சங்கிரகணம்", "vastu shanti": "வாஸ்து சாந்தி", pavitraropanam: "பவித்ராரோபணம்", pavitrapuja: "பவித்ரப் பூசை", "ambu poduthal": "அம்பு போடுதல்", "guru puja": "குரு பூசை", gurupuja: "குரு பூசை", "manjal neer": "மஞ்சள் நீர்", muttrothal: "முற்றோதல்",
  "dhana akarshana": "தன ஆகர்ஷண", nonbu: "நோன்பு", "kubera yantra": "குபேர யந்திர", annabhishekam: "அன்னாபிஷேகம்", satyanarayana: "சத்யநாராயண", tarpanam: "தர்ப்பணம்", "kulam tarpanam": "குளத்தில் தர்ப்பணம்", kulam: "குளம்", "sankatahara chaturthi": "சங்கடஹர சதுர்த்தி", shankhabhishekam: "சங்காபிஷேகம்", "108 shankhabhishekam": "108 சங்காபிஷேகம்",
  "yethir sevai": "எதிர் சேவை", sevai: "சேவை", saattrumurai: "சாற்றுமுறை", uriyadi: "உறியடி", "alagu sevai": "அலகு சேவை", pattabhishekam: "பட்டாபிஷேகம்", kalyanam: "கல்யாணம்", thirukalyanam: "திருக்கல்யாணம்", churnotsavam: "சூர்ணோற்சவம்", "dwadasa aradhanam": "துவாதச ஆராதனம்", "mattai adi": "மட்டையடி",
  "gajendra moksham": "கஜேந்திர மோட்சம்", "108 paal kudam": "108 பால் குடம்", "108 pongal": "108 பொங்கல்", pongal: "பொங்கல்", "sedal vizha": "செடல் விழா", "friday sedal": "வெள்ளிக்கிழமைச் செடல்", "ther karagam theemidi": "தேர், கரகம், தீமிதி", karagam: "கரகம்", theemidi: "தீமிதி", "kumbha padayal": "கும்பப் படையல்", padayal: "படையல்",
  bhajanai: "பஜனை", "bhajanai group": "பஜனைக் குழு", "ekadasha rudrabhishekam": "ஏகாதச ருத்ராபிஷேகம்", "palliyarai ezhucci": "பள்ளியறை எழுச்சி", "palliyarai sevai": "பள்ளியறை சேவை", palliyarai: "பள்ளியறை", "utsava": "உற்சவ", golu: "கொலு", "kolam contest": "கோலப் போட்டி", "kolam preparation": "கோல ஏற்பாடு", "kalasa": "கலச",
  laksharchanai: "லட்சார்ச்சனை", maryada: "மரியாதை", visarjanam: "விசர்ஜனம்", parade: "ஊர்வலம்", "sapta kannika": "சப்த கன்னிகா",
  // days and times
  preparatory: "ஆயத்தம்", prep: "ஆயத்தம்", concluding: "நிறைவு", conclusion: "நிறைவு", start: "தொடக்கம்", end: "முடிவு", initial: "தொடக்க", return: "திரும்பும்", pm: "மாலை", am: "காலை", morning: "காலை", monthly: "மாதாந்திர", masa: "மாத",
  sunday: "ஞாயிறு", thursday: "வியாழக்கிழமை", friday: "வெள்ளிக்கிழமை", "saturday shani": "சனிக்கிழமை", "aadi velli": "ஆடி வெள்ளி", adi: "ஆடி", aadi: "ஆடி", "adi pooram": "ஆடிப் பூரம்", "adi pooram valayal": "ஆடிப் பூர வளையல்", "adi pooram valayal kaappu": "ஆடிப் பூர வளையல்காப்பு", "adi pooram abhishekam": "ஆடிப் பூர அபிஷேகம்", "adi amavasya": "ஆடி அமாவாசை", "adi pournami": "ஆடி பௌர்ணமி", "adi vizha": "ஆடி விழா", "andu vizha": "ஆண்டு விழா", "ther vizha": "தேர் விழா", ther: "தேர்",
  deepavali: "தீபாவளி", "deepavali scenes": "தீபாவளிக் காட்சிகள்", amavasya: "அமாவாசை", pournami: "பௌர்ணமி", krittikai: "கிருத்திகை", dashami: "தசமி", vijayadashami: "விஜயதசமி", navaratri: "நவராத்திரி", vidaiyatri: "விடையாற்றி", "navaratri vidaiyatri": "நவராத்திரி விடையாற்றி", pradosham: "பிரதோஷம்", "sani pradosham": "சனிப் பிரதோஷம்",
  "mahalaya amavasya": "மகாளய அமாவாசை", "purattasi chaturdashi": "புரட்டாசி சதுர்த்தசி", "krishna janmashthami": "கிருஷ்ண ஜன்மாஷ்டமி", "krishna janmashtami": "கிருஷ்ண ஜன்மாஷ்டமி", "aavani moola": "ஆவணி மூலம்", "aavani moola utsavam": "ஆவணி மூல உற்சவம்", pavitrotsavam: "பவித்ரோற்சவம்", brahmotsavam: "பிரம்மோற்சவம்", "brahmotsavam prep": "பிரம்மோற்சவ ஆயத்தம்", "brahmotsavam final day": "பிரம்மோற்சவ இறுதி நாள்",
  utsavam: "உற்சவம்", "vasanta utsavam": "வசந்த உற்சவம்", ekadashi: "ஏகாதசி", kaalasandhi: "காலசந்தி", ucchikaala: "உச்சிக்கால", "vinayaka pandals": "விநாயகர் பந்தல்கள்",
  // the rest
  visit: "வருகை", nandavanam: "நந்தவனம்", drone: "டிரோன்", coconuts: "தேங்காய்கள்",
};

const longest = Math.max(...Object.keys(PHRASES).map((k) => k.split(" ").length));

/** One part of an occasion, word by word; null if a word of it is not here.
    "X and Y" is "X, Y"; "Day 3" is "3ஆம் நாள்". */
export function wordsTa(part: string): string | null {
  const whole = PHRASES[part.trim().toLowerCase()];
  if (whole) return whole;
  const out: string[] = [];
  const words = part.trim().toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; ) {
    if (words[i] === "and" && i > 0) {
      out[out.length - 1] += ",";
      i++;
      continue;
    }
    if (words[i] === "the") {
      i++;
      continue;
    }
    if (words[i] === "day" && /^\d+$/.test(words[i + 1] ?? "")) {
      out.push(`${words[i + 1]}ஆம் நாள்`);
      i += 2;
      continue;
    }
    let n = Math.min(longest, words.length - i);
    while (n > 0 && !PHRASES[words.slice(i, i + n).join(" ")]) n--;
    if (!n) return null;
    out.push(PHRASES[words.slice(i, i + n).join(" ")]);
    i += n;
  }
  // (the sandhi: காலைப் புறப்பாடு)
  return out.join(" ").replace(/(காலை|மாலை|தொடக்க|கலச) (?=([கசதப]))/g, (_, w, c) => `${w}${c}் `);
}
