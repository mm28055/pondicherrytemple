/* The temples' regular rituals, from their ritual calendars (October 2026):
   what each does every week, twice a month and every month. The Tamil names
   are drafts, to be corrected in the admin. `tbc`: still to be confirmed.
   `link`: the festival or ritual it is (its web address), when there is one.
   Entered by the migration 20261021_130458_regular_rituals. */

export type RegularEntry = {
  temple: string
  what: string
  tamil?: string
  often: 'weekly' | 'fortnightly' | 'monthly'
  days?: ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[]
  on?: string
  time?: string
  about: string
  link?: string
  tbc?: boolean
}

export const REGULAR_RITUALS: RegularEntry[] = [
  // Varadaraja Perumal
  { temple: 'varadaraja-perumal', what: 'Thayar Thirumanjanam and Ul-purappadu', tamil: 'தாயார் திருமஞ்சனம், உள் புறப்பாடு', often: 'weekly', days: ['fri'], time: '5 pm', link: 'purappadu', about: 'Thayar is given her thirumanjanam, then carried in procession within the temple.' },
  { temple: 'varadaraja-perumal', what: 'Ramar Nakshatra Naal', often: 'monthly', on: 'Punarpoosam', link: 'ramar-nakshatra-naal', about: 'Rama’s birth star: abhishekam in the morning, as an inscription prescribes; ul-purappadu in the evening.' },
  { temple: 'varadaraja-perumal', what: 'Thiruvonam', tamil: 'திருவோணம்', often: 'monthly', on: 'Thiruvonam', about: 'Perumal’s birth star, marked with his thirumanjanam.' },

  // Chetty Koyil (its weekly entries are already in the admin)
  { temple: 'chetty-koil', what: 'Dakshinamurti Abhishekam', tamil: 'தட்சிணாமூர்த்தி அபிஷேகம்', often: 'weekly', days: ['thu'], tbc: true, about: 'An abhishekam for Dakshinamurti on Thursdays, Guru’s day.' },
  { temple: 'chetty-koil', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', time: 'Pradosha kalam', link: 'pradosham', about: 'Abhishekam for the five deities, ul-purappadu and prasadam; Pradosha Nayakar sees the bali peethams served.' },
  { temple: 'chetty-koil', what: 'Maasa Pirappu', often: 'monthly', on: 'the first day of the month', link: 'maasa-pirappu', about: 'One of the five parvams of the month: Pradosha Nayakar is carried in procession.' },
  { temple: 'chetty-koil', what: 'Pournami', often: 'monthly', on: 'Pournami', time: 'evening', link: 'pournami', about: 'Pradosha Nayakar purappadu; in the evening, abhishekam for Ambal and her ul-purappadu.' },
  { temple: 'chetty-koil', what: 'Amavasya', often: 'monthly', on: 'Amavasya', time: 'evening', link: 'amavasya', about: 'Pradosha Nayakar purappadu; in the evening, Parashakti is carried in procession within the temple.' },
  { temple: 'chetty-koil', what: 'Krittikai', often: 'monthly', on: 'Krittikai', time: '10 am to noon', link: 'krittikai', about: 'Abhishekam for Pillayar, Murugar, Palani Andavar and Iswarar; ul-purappadu in the evening.' },
  { temple: 'chetty-koil', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', time: '11 am', link: 'theipirai-ashtami', about: 'An abhishekam for Bhairava in the late morning.' },
  { temple: 'chetty-koil', what: 'Lada Chinnamman Abhishekam', tamil: 'லாட சின்னம்மன் அபிஷேகம்', often: 'monthly', on: 'Pournami', time: '6:30 pm', about: 'At the Lada Chinnamman shrine by the Kenikulam, an abhishekam for the goddess.' },
  { temple: 'chetty-koil', what: 'Lada Chinnamman Puja', tamil: 'லாட சின்னம்மன் பூஜை', often: 'monthly', on: 'Amavasya', about: 'At the Lada Chinnamman shrine, a puja, naivedyam and prasadam.' },
  { temple: 'chetty-koil', what: 'Thiruvonam', tamil: 'திருவோணம்', often: 'monthly', on: 'Thiruvonam', tbc: true, about: 'Perumal’s birth star: an agal vilakku lit with ghee by noon; perhaps an ul-purappadu.' },

  // Angalamman (Muthialpet)
  { temple: 'angala-parameswari', what: 'Amavasya', often: 'monthly', on: 'Amavasya', time: 'night', link: 'amavasya', about: 'Unjal utsavam, then at night the kumbha padayal, with varnippu songs by Pechaiamman.' },
  { temple: 'angala-parameswari', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', link: 'theipirai-ashtami', about: 'Abhishekam for Kalkatta Kali, who stands here in place of Bhairavar.' },
  { temple: 'angala-parameswari', what: 'Pechaiamman Padayal', tamil: 'பேச்சாயி அம்மன் படையல்', often: 'weekly', days: ['sun'], tbc: true, about: 'Pechaiamman is offered an egg with a handful of rice, praying for children.' },

  // Ghousiga Balasubramaniya
  { temple: 'ghousika-balasubramaniar', what: 'Krittikai', often: 'monthly', on: 'Krittikai', time: 'early morning', link: 'krittikai', about: 'Abhishekam and puja early in the morning; visitors come for archanai and darshan all day.' },

  // Kamakshi Amman
  { temple: 'kamakshi-amman', what: 'Paal Abhishekam', tamil: 'பால் அபிஷேகம்', often: 'weekly', days: ['fri'], link: 'abhishekam', about: 'Amman’s milk abhishekam, followed by deeparadhanai.' },
  { temple: 'kamakshi-amman', what: 'Dakshinamurti Abhishekam', tamil: 'தட்சிணாமூர்த்தி அபிஷேகம்', often: 'weekly', days: ['thu'], tbc: true, about: 'An abhishekam for Dakshinamurti on Thursdays, Guru’s day.' },
  { temple: 'kamakshi-amman', what: 'Krittikai', often: 'monthly', on: 'Krittikai', time: '10:30 am', link: 'krittikai', about: 'An abhishekam for Murugan.' },

  // Kannika Parameswari
  { temple: 'kanniga-parameswari', what: 'Kuberan Yantra Archanai', tamil: 'குபேர யந்திர அர்ச்சனை', often: 'weekly', days: ['thu'], time: '4 pm or 6 pm', about: 'Archanai for the Kubera yantra found when the temple was built.' },
  { temple: 'kanniga-parameswari', what: 'Vishnu Sahasranamam and Ramar Bhajanai', tamil: 'விஷ்ணு சகஸ்ரநாமம், ராமர் பஜனை', often: 'weekly', days: ['sat'], time: 'evening', about: 'The priest leads the Vishnu Sahasranamam at sayaraksha; then a Ramar bhajanai group sings.' },
  { temple: 'kanniga-parameswari', what: 'Mahalakshmi Puja', often: 'monthly', on: 'the first Friday', time: '6 am and 6 pm', link: 'mahalakshmi-puja', about: 'Gopuja at the door at dawn; in the evening the Mahalakshmi puja, with the Lalita Sahasranamam.' },
  { temple: 'kanniga-parameswari', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', link: 'pradosham', about: 'An abhishekam for Siva.' },
  { temple: 'kanniga-parameswari', what: 'Chaturthi', tamil: 'சதுர்த்தி', often: 'fortnightly', on: 'Chaturthi', about: 'An abhishekam for Vinayaka, on both Chaturthis: after Amavasya, and Sankatahara after Pournami.' },
  { temple: 'kanniga-parameswari', what: 'Krittikai', often: 'monthly', on: 'Krittikai', link: 'krittikai', about: 'An abhishekam for Murugan.' },
  { temple: 'kanniga-parameswari', what: 'Shukla Sashti', tamil: 'வளர்பிறை சஷ்டி', often: 'monthly', on: 'Shukla Sashti', about: 'An abhishekam for Murugan, on the sixth day after Amavasya.' },
  { temple: 'kanniga-parameswari', what: 'Poosam', tamil: 'பூசம்', often: 'monthly', on: 'Poosam', about: 'An abhishekam for the Kubera yantra; Pushya is the star for wealth.' },
  { temple: 'kanniga-parameswari', what: 'Ramar Nakshatra Naal', often: 'monthly', on: 'Punarpoosam', link: 'ramar-nakshatra-naal', about: 'An abhishekam for Rama, on his birth star.' },
  { temple: 'kanniga-parameswari', what: 'Pooram', tamil: 'பூரம்', often: 'monthly', on: 'Pooram', about: 'An abhishekam for Ambal, on the birth star of Vasavi Kanyaka Parameswari.' },
  { temple: 'kanniga-parameswari', what: 'Pournami', often: 'monthly', on: 'Pournami', link: 'pournami', about: 'The Satyanarayana puja.' },

  // Lawspet Murugan
  { temple: 'siva-subramania-lawspet', what: 'Rahu Kala Durga Puja', often: 'weekly', days: ['tue'], time: '3:30 pm', link: 'rahu-kala-durga-puja', about: 'Durga puja in Rahu kalam; annadanam for some four hundred people.' },
  { temple: 'siva-subramania-lawspet', what: 'Rahu Kala Durga Puja', often: 'weekly', days: ['fri'], time: '10:30 am', link: 'rahu-kala-durga-puja', about: 'Durga puja in the Friday Rahu kalam.' },
  { temple: 'siva-subramania-lawspet', what: 'Rahu and Ketu Abhishekam', tamil: 'ராகு கேது அபிஷேகம்', often: 'weekly', days: ['sat'], time: '9:30 am', link: 'abhishekam', about: 'Rahu and Ketu are given milk, vibhuti and panneer, in Rahu kalam.' },
  { temple: 'siva-subramania-lawspet', what: 'Krittikai', often: 'monthly', on: 'Krittikai', link: 'krittikai', about: 'Morning abhishekam for the utsavar with Valli and Devasena, and the moolavar; evening thanga ther ul-purappadu.' },
  { temple: 'siva-subramania-lawspet', what: 'Shukla Sashti', tamil: 'வளர்பிறை சஷ்டி', often: 'monthly', on: 'Shukla Sashti', time: '7 am', about: 'Abhishekam, alangaram and deeparadhanai.' },
  { temple: 'siva-subramania-lawspet', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', link: 'pradosham', about: 'Three rounds: the Vedam, the Siva vadyam and the Thiruvasagam.' },
  { temple: 'siva-subramania-lawspet', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', link: 'theipirai-ashtami', about: 'A puja for Bhairavar.' },
  { temple: 'siva-subramania-lawspet', what: 'Sankatahara Chaturthi', tamil: 'சங்கடஹர சதுர்த்தி', often: 'monthly', on: 'Sankatahara Chaturthi', time: '6 pm', about: 'An abhishekam for Vinayakar, with the Vinayakar Agaval.' },

  // Manakkula Vinayaka
  { temple: 'manakkula-vinayakar', what: 'Chaturthi', tamil: 'சதுர்த்தி', often: 'fortnightly', on: 'Chaturthi', about: 'Vinayaka’s ul-purappadu on both Chaturthis, Valarpirai and Theipirai.' },
  { temple: 'manakkula-vinayakar', what: 'Krittikai', often: 'monthly', on: 'Krittikai', link: 'krittikai', about: 'Subrahmanya is carried in procession within the temple.' },

  // Mutthumariamman
  { temple: 'mutthumariamman', what: 'Velli Kavasa Alankaram', tamil: 'வெள்ளி கவச அலங்காரம்', often: 'weekly', days: ['fri'], about: 'Amman is adorned in her silver kavasam.' },
  { temple: 'mutthumariamman', what: 'Pournami', often: 'monthly', on: 'Pournami', link: 'pournami', about: 'A puja with the kalasam; a group of women recite the Lalita Sahasranamam.' },
  { temple: 'mutthumariamman', what: 'Sankatahara Chaturthi', tamil: 'சங்கடஹர சதுர்த்தி', often: 'monthly', on: 'Sankatahara Chaturthi', about: 'Sankatahara Chaturthi is marked.' },

  // Nandikeswara
  { temple: 'nandikeswara', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', link: 'pradosham', about: 'With the Kailaya vadhyam, and a discourse on the Sivapuranam by Dr Sankara Devi.' },
  { temple: 'nandikeswara', what: 'Amavasya', often: 'monthly', on: 'Amavasya', link: 'amavasya', about: 'Abhishekam and puja for the Guru.' },
  { temple: 'nandikeswara', what: 'Pournami', often: 'monthly', on: 'Pournami', link: 'pournami', about: 'An abhishekam for Vinayakar.' },
  { temple: 'nandikeswara', what: 'Shukla Sashti', tamil: 'வளர்பிறை சஷ்டி', often: 'monthly', on: 'Shukla Sashti', about: 'An abhishekam for Murugan.' },
  { temple: 'nandikeswara', what: 'Krittikai', often: 'monthly', on: 'Krittikai', link: 'krittikai', about: 'An abhishekam for Murugan.' },
  { temple: 'nandikeswara', what: 'Sankatahara Chaturthi', tamil: 'சங்கடஹர சதுர்த்தி', often: 'monthly', on: 'Sankatahara Chaturthi', time: '5:30 pm', about: 'An abhishekam for Gangai Vinayakar next door, in the evening.' },

  // Vedapuriswara (its Tuesday Durga puja is already in the admin); the panchaparvam
  { temple: 'vedapuriswara', what: 'Maasa Pirappu', often: 'monthly', on: 'the first day of the month', link: 'maasa-pirappu', about: 'One of the panchaparvam days: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Amavasya', often: 'monthly', on: 'Amavasya', link: 'amavasya', about: 'One of the panchaparvam days: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Pournami', often: 'monthly', on: 'Pournami', link: 'pournami', about: 'One of the panchaparvam days: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', link: 'theipirai-ashtami', about: 'Part of the panchaparvam: Bhairava abhishekam in the morning, Pradosha Murti ul-purappadu in the evening.' },
  { temple: 'vedapuriswara', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', link: 'pradosham', about: 'Part of the panchaparvam: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Masa Shivaratri', tamil: 'மாத சிவராத்திரி', often: 'monthly', on: 'Chaturdashi', about: 'The monthly Shivaratri, among the panchaparvam days.' },
  { temple: 'vedapuriswara', what: 'Krittikai', often: 'monthly', on: 'Krittikai', link: 'krittikai', about: 'Abhishekam and alangaram, and Murugan’s ul-purappadu.' },
]

/* Words for the regular rituals already in the admin (where none are given there yet). */
export const EXISTING_WORDS: { what: string; tamil: string; about: string }[] = [
  { what: 'Bhairava Abhishekam', tamil: 'பைரவர் அபிஷேகம்', about: 'Bhairava puja and abhishekam on Sunday evenings, repeated on Bhairava Ashtami.' },
  { what: 'Lalita Trishati Archanai and Parashakti Ul-purappadu', tamil: 'லலிதா திரிசதி அர்ச்சனை, பராசக்தி உள் புறப்பாடு', about: 'The Lalita Trishati archanai for Ambigai, then Parashakti is carried in procession within the temple.' },
  { what: 'Palani Andavar Abhishekam', tamil: 'பழனி ஆண்டவர் அபிஷேகம்', about: 'After the Durga abhishekam and Murugan puja, an abhishekam for Palani Andavar.' },
  { what: 'Durga puja', tamil: 'துர்க்கை பூஜை', about: 'Durga abhishekam and puja on Tuesday afternoons, in Rahu kalam.' },
]
