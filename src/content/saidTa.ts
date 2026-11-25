/* What is written in the admin for the temples' Ritual Cycles (names without
   Tamil there, times, a few words on each), by its English; without Tamil
   here, shown in English. And the festivals' names in the photographs' filter. */

const SAID: Record<string, string> = {
  // names
  "Poosa Nakshatram": "பூச நட்சத்திரம்",
  "Nakshatra Naal": "நட்சத்திர நாள்",
  "Manavala Mamunigal Utsavam": "மணவாள மாமுனிகள் உற்சவம்",
  "Vishwaksena Varuda Thirunakshatra Sattrumurai Utsavam": "விஷ்வக்சேனர் வருடத் திருநட்சத்திர சாற்றுமுறை உற்சவம்",
  "Kedara Gowri Nonbu": "கேதார கௌரி நோன்பு",
  "Dhana Akarshana Puja": "தன ஆகர்ஷண பூசை",
  "Deepavali Amavasya Nonbu": "தீபாவளி அமாவாசை நோன்பு",
  "Deepavali Amavasya Nonbu and Unjal": "தீபாவளி அமாவாசை நோன்பும் ஊஞ்சலும்",
  "Deepavali Amavasya, Kedara Gowri Nonbu": "தீபாவளி அமாவாசை, கேதார கௌரி நோன்பு",
  "Rahu Ketu Peyarchi": "ராகு கேது பெயர்ச்சி",
  "Adi Amavasya Kadal Theerthavari": "ஆடி அமாவாசை கடல் தீர்த்தவாரி",
  "Adi Pooram": "ஆடிப் பூரம்",
  "Kanda Sashti Day 3, PM Purappadu": "கந்த சஷ்டி 3ஆம் நாள், மாலைப் புறப்பாடு",
  "Abhishekam and Puja for Varahi and the Sapta Matrikas": "வராகிக்கும் சப்த மாதர்களுக்கும் அபிஷேகமும் பூசையும்",
  "Vinayaka Abhishekam": "விநாயகர் அபிஷேகம்",
  "Vinayakar Abhishekam": "விநாயகர் அபிஷேகம்",
  "Gangai Vinayaka": "கங்கை விநாயகர்",
  "Nandhikeswara Koyil": "நந்திகேஸ்வரர் கோயில்",
  "Nandhikeswara Samadhi Layout": "நந்திகேஸ்வரர் சமாதியின் தளவரைபடம்",
  "Nandhi Diagrammatic": "நந்தியின் விளக்கப் படம்",
  "Manonmani Mariamman": "மனோன்மணி மாரியம்மன்",
  Draupadi: "திரௌபதி",
  None: "இல்லை",
  "as part of the Veerabhadraswamy Chowdambika Koyil’s Aadi Peruvizha": "வீரபத்திரசுவாமி சௌடாம்பிகை கோயிலின் ஆடிப் பெருவிழாவின் ஒரு பகுதியாக",
  // when
  "On Trayodashi": "திரயோதசி அன்று",
  "On Trayodashi, Pradosha kalam": "திரயோதசி அன்று, பிரதோஷ காலம்",
  "On Chaturdashi": "சதுர்த்தசி அன்று",
  "On Thiruvonam": "திருவோணம் அன்று",
  "On Punarpoosam": "புனர்பூசம் அன்று",
  "On Krittikai": "கிருத்திகை அன்று",
  "On Poosam": "பூசம் அன்று",
  "On Pooram": "பூரம் அன்று",
  "On Amavasya": "அமாவாசை அன்று",
  "On Theipirai Chaturthi": "தேய்பிறை சதுர்த்தி அன்று",
  "On Panchami, 5:30 pm · and 7pm Deeparadhanai": "பஞ்சமி அன்று, மாலை 5:30 · இரவு 7 தீபாராதனை",
  "On the first Friday of the Tamil month, 6 am, then 6 pm": "தமிழ் மாதத்தின் முதல் வெள்ளியன்று, காலை 6, பிறகு மாலை 6",
  "5:30 pm": "மாலை 5:30",
  "10 am to noon": "காலை 10 முதல் நண்பகல் வரை",
  Evening: "மாலை",
  Night: "இரவு",
  "Early morning": "அதிகாலை",
  "Before 10am": "காலை 10க்கு முன்",
  "Sunday, morning": "ஞாயிறு, காலை",
  "Sunday, 6 pm": "ஞாயிறு, மாலை 6",
  "Sunday, evening, 6pm": "ஞாயிறு, மாலை 6",
  "Sunday, after 7:30 pm": "ஞாயிறு, இரவு 7:30க்குப் பிறகு",
  "Tuesday, 3:30 pm": "செவ்வாய், பிற்பகல் 3:30",
  "Tuesday, 3:30 pm onwards": "செவ்வாய், பிற்பகல் 3:30 முதல்",
  "Tuesday, after 4:30 pm": "செவ்வாய், மாலை 4:30க்குப் பிறகு",
  Thursday: "வியாழன்",
  "Thursday, 7 am": "வியாழன், காலை 7",
  "Thursday, 4 pm or 6 pm": "வியாழன், மாலை 4 அல்லது 6",
  Friday: "வெள்ளி",
  "Friday, 5 pm": "வெள்ளி, மாலை 5",
  "Friday, 12 pm": "வெள்ளி, நண்பகல் 12",
  "Friday, after 7:30 pm": "வெள்ளி, இரவு 7:30க்குப் பிறகு",
  "Friday, 10:30 am · Durga puja in the Friday Rahu kaalam.": "வெள்ளி, காலை 10:30 · வெள்ளிக்கிழமை ராகு காலத்தில் துர்க்கை பூசை.",
  "Saturday, 9:30 am": "சனி, காலை 9:30",
  "Saturday, evening": "சனி, மாலை",
  "6am": "காலை 6",
  "7am": "காலை 7",
  "8am": "காலை 8",
  "9am": "காலை 9",
  "11am": "முற்பகல் 11",
  "11am–12 noon": "முற்பகல் 11 – நண்பகல் 12",
  "12 noon": "நண்பகல் 12",
  "5pm": "மாலை 5",
  "6pm": "மாலை 6",
  "7pm": "இரவு 7",
  "8pm": "இரவு 8",
  "9pm": "இரவு 9",
  "When the temple opens": "கோயில் திறக்கும்போது",
  "At opening": "நடை திறக்கும்போது",
  "Breakfast time": "காலை உணவு நேரம்",
  // Vedapuriswara
  "Part of the panchaparvam: the Pradosha Murti is carried in procession within the temple.":
    "பஞ்ச பருவத்தின் ஒரு பகுதி: பிரதோஷ மூர்த்தியின் புறப்பாடு கோயிலுக்குள் நடக்கிறது.",
  "One of the panchaparvam days: the Pradosha Murti is carried in procession within the temple.":
    "பஞ்ச பருவ நாட்களுள் ஒன்று: பிரதோஷ மூர்த்தியின் புறப்பாடு கோயிலுக்குள் நடக்கிறது.",
  "Abhishekam and alankaram, and Murugan’s ul-purappadu.": "அபிஷேகமும் அலங்காரமும், முருகனின் உள் புறப்பாடும்.",
  "The monthly Sivaratri, among the panchaparvam days.": "மாதந்தோறும் வரும் சிவராத்திரி, பஞ்ச பருவ நாட்களுள் ஒன்று.",
  "Part of the panchaparvam: Bhairava abhishekam in the morning, Pradosha Murti ul-purappadu in the evening.":
    "பஞ்ச பருவத்தின் ஒரு பகுதி: காலையில் பைரவர் அபிஷேகம், மாலையில் பிரதோஷ மூர்த்தியின் உள் புறப்பாடு.",
  "Bhajanai-style singing and recitation of the Thiruvasagam, by members of the Siruthondu Nayanar Thiruthonda Sabhai":
    "சிறுத்தொண்ட நாயனார் திருத்தொண்டு சபையினர் பஜனை முறையில் திருவாசகத்தைப் பாடி ஓதுகின்றனர்.",
  "Durga abhishekam and puja on Tuesday afternoons, in Rahu kaalam.":
    "செவ்வாய்க்கிழமைப் பிற்பகல்களில், ராகு காலத்தில், துர்க்கைக்கு அபிஷேகமும் பூசையும்.",
  "Abhishekam for Dakshinamurti on Thursdays, Guru’s day.": "குருவின் நாளான வியாழக்கிழமைகளில் தட்சிணாமூர்த்திக்கு அபிஷேகம்.",
  "1 kaalam puja": "ஒரு காலப் பூசை",
  "2 kaalam puja": "இரு காலப் பூசை",
  "4 kaalam puja": "நான்கு காலப் பூசை",
  "5 kaalam puja": "ஐந்து காலப் பூசை",
  "Abhishekam and aradhanai at every kaalam.": "ஒவ்வொரு காலத்திலும் அபிஷேகமும் ஆராதனையும்.",
  "Thirupalliyezhuchi: the Palliyarai Swami (Vedapuriswara every day, with Tripurasundari on Mondays) is brought in a palanquin to the main sannadhi.":
    "திருப்பள்ளியெழுச்சி: பள்ளியறைச் சுவாமி (நாள்தோறும் வேதபுரீஸ்வரர், திங்கட்கிழமைகளில் திரிபுரசுந்தரியுடன்) பல்லக்கில் முதன்மைச் சன்னிதிக்கு வருகிறார்.",
  "Shuddhannam, offered to every deity, going clockwise around the temple":
    "சுத்தான்னம்; கோயிலை வலமாகச் சுற்றி ஒவ்வொரு தெய்வத்திற்கும் படைக்கின்றனர்.",
  Shuddhannam: "சுத்தான்னம்",
  "With the Palliyarai utsavam": "பள்ளியறை உற்சவத்துடன்",
  "Samba milagu sadam, or pepper rice; milk": "சம்பா மிளகு சாதம்; பால்",
  // Manakkula Vinayaka
  "Abhishekam for Siva and the Pradosha Murti is carried in procession within the temple. Part of the panchaparva utsavam.":
    "சிவனுக்கு அபிஷேகம்; பிரதோஷ மூர்த்தியின் புறப்பாடு கோயிலுக்குள் நடக்கிறது. பஞ்ச பருவ உற்சவத்தின் ஒரு பகுதி.",
  "Subrahmanya is carried in procession within the temple.": "சுப்பிரமணியரின் புறப்பாடு கோயிலுக்குள் நடக்கிறது.",
  "Vinayaka abhishekam and ul-purappadu": "விநாயகர் அபிஷேகமும் உள் புறப்பாடும்",
  "Abhishekam for Vinayaka, the main deity, every day at all four kaalams.": "மூலவரான விநாயகருக்கு நாள்தோறும் நான்கு காலங்களிலும் அபிஷேகம்.",
  Venpongal: "வெண்பொங்கல்",
  "At 11am the sphatika linga is worshipped, every day, with special worship on Pradosham and Mahasivaratri.":
    "நாள்தோறும் முற்பகல் 11 மணிக்கு ஸ்படிக லிங்கத்திற்கு வழிபாடு; பிரதோஷத்திலும் மகா சிவராத்திரியிலும் சிறப்பு வழிபாடு.",
  "Dadhyannam, or curd rice": "தத்யன்னம், அதாவது தயிர் சாதம்",
  "For the sphatika linga: shuddhannam, cooked rice with ghee": "ஸ்படிக லிங்கத்திற்கு: சுத்தான்னம், நெய்யுடன் சாதம்",
  "Kesari or tamarind rice": "கேசரி அல்லது புளி சாதம்",
  "The Palliyarai utsavam, every night: the padukas of Vinayaka are carried from the garbhagriha to the palliyarai. Here the goddess in the palliyarai is Parvati: Vinayaka comes to his mother’s bedchamber at night to sleep.":
    "ஒவ்வோர் இரவும் பள்ளியறை உற்சவம்: விநாயகரின் பாதுகைகள் கருவறையிலிருந்து பள்ளியறைக்குச் செல்கின்றன. இங்கே பள்ளியறையில் இருக்கும் தேவி பார்வதி: இரவில் உறங்க விநாயகர் தம் தாயின் பள்ளியறைக்கு வருகிறார்.",
  "Samba rice with pepper, milagu sadam": "மிளகுடன் சம்பா சாதம், மிளகு சாதம்",
  // Varadaraja Perumal
  "Swami Vedanta Desika’s birth star, marked with his thirumanjanam.": "சுவாமி வேதாந்த தேசிகரின் ஜென்ம நட்சத்திரம், அவருடைய திருமஞ்சனத்துடன்.",
  "Rama’s birth star: abhishekam in the morning, as an inscription prescribes; ul-purappadu in the evening.":
    "ராமரின் ஜென்ம நட்சத்திரம்: ஒரு கல்வெட்டு விதித்துள்ளபடி காலையில் அபிஷேகம்; மாலையில் உள் புறப்பாடு.",
  "Thayar is given her thirumanjanam, then carried in procession within the temple.": "தாயாருக்குத் திருமஞ்சனம், பிறகு கோயிலுக்குள் புறப்பாடு.",
  "A bhajanai session run by the Vaithikuppam bhajanai group, held on Sunday evenings in front of the shrine to Pandarinatha.":
    "வைத்திக்குப்பம் பஜனைக் குழு, ஞாயிற்றுக்கிழமை மாலைகளில், பண்டரிநாதர் சன்னிதி முன் நடத்தும் பஜனை.",
  "Puja at all four kaalams, and each time the naivedyam is shuddhannam. Other foods are made only for special occasions. In the past, this shuddhannam, given out afterwards as prasadam, was an important source of food for those serving the temple; now that rice is plentiful, it has lost that meaning.":
    "நான்கு காலங்களிலும் பூசை; ஒவ்வொரு முறையும் நைவேத்தியம் சுத்தான்னம். சிறப்பு நிகழ்வுகளுக்கு மட்டுமே பிற உணவுகளைச் சமைக்கிறார்கள். முற்காலத்தில், பிறகு பிரசாதமாக வழங்கிய இந்தச் சுத்தான்னம், கோயிலில் தொண்டு புரிவோருக்கு முக்கியமான உணவாக இருந்தது; அரிசி தாராளமாகக் கிடைக்கும் இக்காலத்தில் அது அப்பொருளை இழந்துவிட்டது.",
  "Thirumanjanam for Perumal only on occasions, sponsored by ubhayakaras.": "பெருமாளுக்குத் திருமஞ்சனம் சில நிகழ்வுகளில் மட்டும், உபயகாரர்களின் உபயமாக.",
  // Chetty Koyil
  "Abhishekam for the five deities, ul-purappadu and prasadam; Pradosha Nayakar sees the bali peethams served.":
    "ஐந்து தெய்வங்களுக்கும் அபிஷேகம், உள் புறப்பாடு, பிரசாதம்; பலி பீடங்களுக்குப் படைப்பதைப் பிரதோஷ நாயகர் காண்கிறார்.",
  "Abhishekam for Pillayar, Murugar, Palani Andavar and Iswarar; ul-purappadu in the evening.":
    "பிள்ளையார், முருகர், பழனி ஆண்டவர், ஈஸ்வரர் ஆகியோருக்கு அபிஷேகம்; மாலையில் உள் புறப்பாடு.",
  "Perumal’s birth star marked by an abhishekam and the circumambulation of an agal vilakku (clay lamp) lit with ghee by noon.":
    "பெருமாளின் ஜென்ம நட்சத்திரம்: அபிஷேகமும், நண்பகலுக்குள் நெய்யிட்டு ஏற்றிய அகல் விளக்குடன் வலம் வருதலும்.",
  "Pradosha Nayakar purappadu; in the evening, Parashakti is carried in procession within the temple.":
    "பிரதோஷ நாயகர் புறப்பாடு; மாலையில் பராசக்தியின் புறப்பாடு கோயிலுக்குள் நடக்கிறது.",
  "Pradosha Nayakar purappadu; in the evening, abhishekam for Ambal and her ul-purappadu.":
    "பிரதோஷ நாயகர் புறப்பாடு; மாலையில் அம்பாளுக்கு அபிஷேகமும் உள் புறப்பாடும்.",
  "One of the five parvams of the month: Pradosha Nayakar is carried in procession.": "மாதத்தின் ஐந்து பருவங்களுள் ஒன்று: பிரதோஷ நாயகர் புறப்பாடு.",
  "An abhishekam for Bhairava in the late morning.": "முற்பகலில் பைரவருக்கு அபிஷேகம்.",
  "Bhairava puja and abhishekam on Sunday evenings, repeated on Bhairava Ashtami.":
    "ஞாயிறு மாலைகளில் பைரவர் பூசையும் அபிஷேகமும்; பைரவ அஷ்டமியில் மீண்டும்.",
  "After the Durga abhishekam and Murugan puja, an abhishekam for Palani Andavar.": "துர்க்கை அபிஷேகத்திற்கும் முருகன் பூசைக்கும் பிறகு பழனி ஆண்டவருக்கு அபிஷேகம்.",
  "An abhishekam for Dakshinamurti on Thursdays, Guru’s day.": "குருவின் நாளான வியாழக்கிழமைகளில் தட்சிணாமூர்த்திக்கு அபிஷேகம்.",
  "The Lalita Trishati archanai for Ambigai, then Parashakti is carried in procession within the temple.":
    "அம்பிகைக்கு லலிதா திரிசதி அர்ச்சனை, பிறகு பராசக்தியின் புறப்பாடு கோயிலுக்குள் நடக்கிறது.",
  "6am, Thirupalliyezhuchi: the Palliyarai Swami (Kalathiswara every day, with Gnanambal on Fridays) is brought in a palanquin to the main sannadhi.":
    "காலை 6, திருப்பள்ளியெழுச்சி: பள்ளியறைச் சுவாமி (நாள்தோறும் காளத்தீஸ்வரர், வெள்ளிக்கிழமைகளில் ஞானாம்பாளுடன்) பல்லக்கில் முதன்மைச் சன்னிதிக்கு வருகிறார்.",
  "7am, abhishekam with five things for Swami and Ambal: yennai (oil), paal (milk), abhisheka podi (a mixed powder for abhishekam), manja podi (turmeric powder) and maa podi (rice flour). Every other deity receives a jala, or water, abhishekam only.":
    "காலை 7, சுவாமிக்கும் அம்பாளுக்கும் ஐந்து பொருட்களால் அபிஷேகம்: எண்ணெய், பால், அபிஷேகப் பொடி, மஞ்சள் பொடி, மாப்பொடி (அரிசி மாவு). மற்ற ஒவ்வொரு தெய்வத்திற்கும் ஜல அபிஷேகம், அதாவது நீர் அபிஷேகம், மட்டும்.",
  "Archanai, deeparadhanai": "அர்ச்சனை, தீபாராதனை",
  "9am, shuddhannam, offered in turn to Suryan, Vinayaka, Parameswaran, all in the parivaram, Parvati, Bhairava, Chandikeswara and the bali":
    "காலை 9, சுத்தான்னம்; சூரியன், விநாயகர், பரமேஸ்வரன், பரிவாரத்திலுள்ள எல்லோரும், பார்வதி, பைரவர், சண்டிகேஸ்வரர், பலி பீடம் என வரிசையாகப் படைக்கின்றனர்",
  "Abhishekam for Kalathiswara alone; alankaram, puja, deeparadhanai": "காளத்தீஸ்வரருக்கு மட்டும் அபிஷேகம்; அலங்காரம், பூசை, தீபாராதனை",
  "Abhishekam, alankaram, deeparadhanai": "அபிஷேகம், அலங்காரம், தீபாராதனை",
  "Shuddhannam; thayir sadam, or curd rice": "சுத்தான்னம்; தயிர் சாதம்",
  "Also called Raathri kaalam": "இராத்திரி காலம் என்றும் பெயர்",
  "Milk abhishekam only, for Swami and Ambal.": "சுவாமிக்கும் அம்பாளுக்கும் பால் அபிஷேகம் மட்டும்.",
  "The Palliyarai utsavam: the Palliyarai Swami is returned to the bedchamber, and naivedyam is then offered to Chandikeswara and Bhairava.":
    "பள்ளியறை உற்சவம்: பள்ளியறைச் சுவாமி பள்ளியறைக்குத் திரும்புகிறார்; பிறகு சண்டிகேஸ்வரருக்கும் பைரவருக்கும் நைவேத்தியம் படைக்கின்றனர்.",
  "9pm, samba milagu sadam": "இரவு 9, சம்பா மிளகு சாதம்",
  "Paal and pazham (milk and fruits)": "பாலும் பழமும்",
  // Kamakshi Amman
  "An abhishekam for Murugan.": "முருகனுக்கு அபிஷேகம்.",
  "Amman’s milk abhishekam, followed by deeparadhanai.": "அம்மனுக்குப் பால் அபிஷேகம், தொடர்ந்து தீபாராதனை.",
  "Abhishekam and sandhi puja: a simple water abhishekam every morning, and on special days a full abhishekam with milk as well.":
    "அபிஷேகமும் சந்திப் பூசையும்: நாள்தோறும் காலையில் எளிய நீர் அபிஷேகம்; சிறப்பு நாட்களில் பாலுடன் முழு அபிஷேகமும்.",
  "Upma or pongal": "உப்புமா அல்லது பொங்கல்",
  "Deeparadhanai and annadanam": "தீபாராதனையும் அன்னதானமும்",
  "Kalanda sadam, or mixed rice": "கலந்த சாதம்",
  Deeparadhanai: "தீபாராதனை",
  Milk: "பால்",
  // Sundara Vinayaka
  "In the mornings, and the naivedyam is shuddhannam. Vinayaka receives a very simple alankaram.":
    "காலையில்; நைவேத்தியம் சுத்தான்னம். விநாயகருக்கு மிக எளிய அலங்காரம்.",
  "More kaalam pujas may be done on special occasions, with naivedyams prepared for them.":
    "சிறப்பு நிகழ்வுகளில் கூடுதல் காலப் பூசைகளும், அவற்றுக்கான நைவேத்தியங்களும் உண்டு.",
  // Angalamman
  "Unjal utsavam, then at night the kumbha padayal, with varnippu songs by Pechaiamman.":
    "ஊஞ்சல் உற்சவம்; பிறகு இரவில் கும்பப் படையல், பேச்சாயி அம்மன் வர்ணிப்புப் பாடல்களுடன்.",
  "Abhishekam for Kalkatta Kali, who stands here in place of Bhairava.": "இங்கே பைரவரின் இடத்தில் நிற்கும் கல்கத்தா காளிக்கு அபிஷேகம்.",
  "Pechaiamman is offered an egg with a handful of rice, praying for children.":
    "குழந்தை வரம் வேண்டி, பேச்சாயி அம்மனுக்கு ஒரு பிடிச் சாதத்துடன் ஒரு முட்டை படைக்கின்றனர்.",
  "Full abhishekam, alankaram and deeparadhanai. Every deity of the temple gets a water abhishekam and new vastram.":
    "முழு அபிஷேகம், அலங்காரம், தீபாராதனை. கோயிலின் ஒவ்வொரு தெய்வத்திற்கும் நீர் அபிஷேகமும் புது வஸ்திரமும்.",
  "9am, mahanaivedyam: shuddhannam": "காலை 9, மகா நைவேத்தியம்: சுத்தான்னம்",
  "Thayir sadam (curd rice)": "தயிர் சாதம்",
  "Milk, from the community, bought by the temple": "பால்; சமூகத்தினரிடமிருந்து கோயில் வாங்குவது",
  // Lawspet Murugan
  "Three rounds: the Vedam, the Siva vadyam and the Thiruvasagam.": "மூன்று சுற்றுகள்: வேதம், சிவ வாத்தியம், திருவாசகம்.",
  "Morning abhishekam for the utsavar with Valli and Devasena, and the moolavar; evening thanga ther ul-purappadu.":
    "காலையில் வள்ளி தேவசேனையுடன் உற்சவருக்கும் மூலவருக்கும் அபிஷேகம்; மாலையில் தங்கத் தேர் உள் புறப்பாடு.",
  "Abhishekam, alankaram and deeparadhanai.": "அபிஷேகம், அலங்காரம், தீபாராதனை.",
  "An abhishekam for Vinayaka, with the Vinayaka Agaval recitation.": "விநாயகருக்கு அபிஷேகம், விநாயகர் அகவல் பாராயணத்துடன்.",
  "A puja for Bhairava.": "பைரவருக்குப் பூசை.",
  "Durga puja in Rahu kaalam; annadanam for some four hundred people.": "ராகு காலத்தில் துர்க்கை பூசை; சுமார் நானூறு பேருக்கு அன்னதானம்.",
  "Rahu and Ketu are given milk, vibhuti and panneer, in Rahu kaalam.": "ராகு காலத்தில், ராகுவுக்கும் கேதுவுக்கும் பால், விபூதி, பன்னீர்.",
  "Abhishekam, alankaram and aradhanai for the sphatika linga, with honey, milk, chandanam and panneer, manjal (abhisheka podi) and shuddhannam":
    "ஸ்படிக லிங்கத்திற்கு அபிஷேகம், அலங்காரம், ஆராதனை: தேன், பால், சந்தனம், பன்னீர், மஞ்சள் (அபிஷேகப் பொடி), சுத்தான்னம் ஆகியவற்றால்",
  "Thayir sadam, or curd rice": "தயிர் சாதம்",
  "7pm, viniyogam": "இரவு 7, விநியோகம்",
  "Mixed rice": "கலந்த சாதம்",
  "9pm: the Moolavar, the unjal aradhanai for the utsavar, then Bhairava and Chandikeswara":
    "இரவு 9: மூலவர், உற்சவருக்கு ஊஞ்சல் ஆராதனை, பிறகு பைரவரும் சண்டிகேஸ்வரரும்",
  // Kannika Parameswari
  "An abhishekam for Siva.": "சிவனுக்கு அபிஷேகம்.",
  "Gopuja at the door at dawn, in the evening the Mahalakshmi Puja with Lalitasahasranama recitation.":
    "விடியலில் வாசலில் கோபூசை; மாலையில் லலிதா சஹஸ்ரநாமப் பாராயணத்துடன் மகாலட்சுமி பூசை.",
  "An abhishekam for Murugan, on the sixth day after Amavasya.": "அமாவாசையை அடுத்த ஆறாம் நாளில் முருகனுக்கு அபிஷேகம்.",
  "Vinayaka Abhishekam on both Chaturthis: after Amavasya, and Sankatahara after Pournami.":
    "இரண்டு சதுர்த்திகளிலும் விநாயகர் அபிஷேகம்: அமாவாசைக்குப் பின், பௌர்ணமிக்குப் பின் சங்கடஹர சதுர்த்தி.",
  "An abhishekam for Rama, on his birth star.": "ராமரின் ஜென்ம நட்சத்திரத்தில் அவருக்கு அபிஷேகம்.",
  "An abhishekam for the Kubera yantra; Pushya is the star for wealth.": "குபேர யந்திரத்திற்கு அபிஷேகம்; பூசம் செல்வத்திற்குரிய நட்சத்திரம்.",
  "An abhishekam for Ambal, on the birth star of Vasavi Kanyaka Parameswari": "வாசவி கன்னிகா பரமேஸ்வரியின் ஜென்ம நட்சத்திரத்தில் அம்பாளுக்கு அபிஷேகம்",
  "The Satyanarayana puja.": "சத்யநாராயண பூசை.",
  "Archanai for the Kubera yantra found when the temple was built.": "கோயில் கட்டும்போது கிடைத்த குபேர யந்திரத்திற்கு அர்ச்சனை.",
  "The priest leads the Vishnu Sahasranamam at sayaraksha; then a Ramar bhajanai group sings.":
    "சாயரட்சையில் அர்ச்சகர் விஷ்ணு சஹஸ்ரநாமத்தை முன்னின்று ஓதுகிறார்; பிறகு ஒரு ராமர் பஜனைக் குழு பாடுகிறது.",
  "An abhishekam with five litres of milk, alankaram and deeparadhanai": "ஐந்து லிட்டர் பாலால் அபிஷேகம், அலங்காரம், தீபாராதனை",
  "Kalkandu and paal, offered first and given out": "கற்கண்டும் பாலும்; முதலில் படைத்து, பிறகு வழங்குவது",
  "Sundal, coconut, fruits": "சுண்டல், தேங்காய், பழங்கள்",
  "Paal and pazham, and usually sundal as well": "பாலும் பழமும்; வழக்கமாகச் சுண்டலும்",
  // Nandhikeswara
  "With the Kailaya Vadyam, and a discourse on the Sivapuranam by Dr Sankara Devi.": "கைலாய வாத்தியமும், டாக்டர் சங்கரா தேவியின் சிவபுராணச் சொற்பொழிவும்.",
  "An abhishekam for Gangai Vinayaka next door, in the evening.": "மாலையில், அடுத்துள்ள கங்கை விநாயகருக்கு அபிஷேகம்.",
  "Abhishekam and puja for the Guru.": "குருவுக்கு அபிஷேகமும் பூசையும்.",
  "An abhishekam for Vinayaka.": "விநாயகருக்கு அபிஷேகம்.",
  "Paal abhishekam, a simple alankaram and deeparadhanai for Gangai Vinayaka, the samadhi swami, and Siddheswara and Siddheswari. Every other deity a water abhishekam.":
    "கங்கை விநாயகர், சமாதி சுவாமி, சித்தேஸ்வரர், சித்தேஸ்வரி ஆகியோருக்குப் பால் அபிஷேகம், எளிய அலங்காரம், தீபாராதனை. மற்ற ஒவ்வொரு தெய்வத்திற்கும் நீர் அபிஷேகம்.",
  "The nityapadi pujai": "நித்தியப்படி பூசை",
  "A simple paal-thanni abhishekam: first for Gangai Vinayakar next door (1 kaalam puja in both temples), then the samadhi below, followed by the vrushabha (Nandi) outside, the beeja mantra, the bali, the Vinayaka at the base and the Vinayaka at the gate, and finally Siddheswara and Siddheswari. Only Gangai Vinayakar, the Guru and the Moolamurti receive milk and water abhishekams; all others water only.":
    "எளிய பால்-தண்ணீர் அபிஷேகம்: முதலில் அடுத்துள்ள கங்கை விநாயகருக்கு (இரண்டு கோயில்களிலும் ஒரு காலப் பூசை), பிறகு கீழேயுள்ள சமாதிக்கு, தொடர்ந்து வெளியேயுள்ள விருஷபம் (நந்தி), பீஜ மந்திரம், பலி பீடம், அடியிலுள்ள விநாயகர், வாயிலிலுள்ள விநாயகர், இறுதியாகச் சித்தேஸ்வரர், சித்தேஸ்வரி. கங்கை விநாயகருக்கும் குருவுக்கும் மூலமூர்த்திக்கும் மட்டுமே பாலும் நீரும்; மற்ற எல்லோருக்கும் நீர் மட்டும்.",
  "More abhishekams are done only on special occasions, and then the alankaram can be elaborate. Pujas with sodasha upacharam, showing all the deepams, happen on special days (Pradosham, Krittikai, Navaratri and others), in the evenings around 6.30–7.30pm.":
    "சிறப்பு நிகழ்வுகளில் மட்டுமே கூடுதல் அபிஷேகங்கள்; அப்போது அலங்காரம் விரிவாக இருக்கலாம். எல்லாத் தீபங்களையும் காட்டும் சோடச உபசாரப் பூசைகள் சிறப்பு நாட்களில் (பிரதோஷம், கிருத்திகை, நவராத்திரி முதலியன), மாலை சுமார் 6.30–7.30 மணிக்கு நடக்கின்றன.",
  // Mutthumariamman
  "A puja with the kalasam; a group of women recite the Lalita Sahasranamam.": "கலசத்துடன் பூசை; பெண்கள் குழு ஒன்று லலிதா சஹஸ்ரநாமம் ஓதுகிறது.",
  "Amman is adorned in her silver kavasam.": "அம்மனுக்கு வெள்ளிக் கவச அலங்காரம்.",
  "Nityapadi: paal abhishekam, by the Periya Pusari (Gnanavel). His assistant does the archanai in the evening.":
    "நித்தியப்படி: பெரிய பூசாரி (ஞானவேல்) செய்யும் பால் அபிஷேகம். மாலையில் அர்ச்சனையை அவருடைய உதவியாளர் செய்கிறார்.",
  "Shuddhannam, from the Muraikar’s house": "சுத்தான்னம், முறைக்காரர் வீட்டிலிருந்து",
  // Ghousiga
  "Abhishekam and puja early in the morning; visitors come for archanai and darshan all day.":
    "அதிகாலையில் அபிஷேகமும் பூசையும்; அர்ச்சனைக்கும் தரிசனத்திற்கும் நாள் முழுவதும் மக்கள் வருகிறார்கள்.",
  "A water abhishekam and new vastram for every murti, every day; a full abhishekam for the Moolavar alone.":
    "நாள்தோறும் ஒவ்வொரு மூர்த்திக்கும் நீர் அபிஷேகமும் புது வஸ்திரமும்; மூலவருக்கு மட்டும் முழு அபிஷேகம்.",
  // Manimutthumariamman
  "A water abhishekam and new vastram every day; a full abhishekam only on Fridays, at noon.":
    "நாள்தோறும் நீர் அபிஷேகமும் புது வஸ்திரமும்; வெள்ளிக்கிழமைகளில் மட்டும், நண்பகலில், முழு அபிஷேகம்.",
  "On Fridays at lunchtime, annadanam with mixed rice, vegetable biriyani among them":
    "வெள்ளிக்கிழமைகளில் மதிய உணவு நேரத்தில், காய்கறி பிரியாணி உள்ளிட்ட கலந்த சாதங்களுடன் அன்னதானம்",
  // Manonmani Mariamman
  "A water abhishekam every day. The priest comes twice a day, morning and evening, but in practice it is only archanai, for passers-by who come.":
    "நாள்தோறும் நீர் அபிஷேகம். அர்ச்சகர் காலை, மாலை என நாளுக்கு இருமுறை வருகிறார்; ஆனால் நடைமுறையில், வழியில் வந்து செல்வோருக்கான அர்ச்சனை மட்டுமே.",
  // Draupadi Amman
  "A milk and water abhishekam, and the naivedyam is shuddhannam. Full abhishekams are done on special days, usually just once.":
    "பாலாலும் நீராலும் அபிஷேகம்; நைவேத்தியம் சுத்தான்னம். சிறப்பு நாட்களில் முழு அபிஷேகம், வழக்கமாக ஒருமுறை மட்டுமே.",
};
const key = (s: string) => s.trim().replace(/'/g, "’").replace(/\s+/g, " ");
export const said = (english: string): string =>
  // (a text of several lines, line by line)
  SAID[key(english)] ?? (english.includes("\n") ? english.split("\n").map((l) => (l.trim() ? said(l) : l)).join("\n") : english);
