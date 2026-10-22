/* Each temple's own words for its regular rituals (and their days or tithi,
   and time), as they were written from the temples' ritual calendars and
   entered, before the rituals were given a section for each temple
   (20261022_073543_regular_rituals_at_temples): what the merge gives a
   temple whose ritual had come to be shared with others in one entry, which
   had only one set of words and one time for them all. */

export type OriginalWords = {
  temple: string
  what: string
  often: 'weekly' | 'fortnightly' | 'monthly'
  days?: ('sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat')[]
  on?: string
  time?: string
  about: string
}

export const ORIGINAL_WORDS: OriginalWords[] = [
  { temple: 'vedapuriswara', what: 'Durga puja', often: 'weekly', days: ['tue'], time: '3:30 pm onwards', about: 'Durga abhishekam and puja on Tuesday afternoons, in Rahu kalam.' },
  { temple: 'chetty-koil', what: 'Durga puja', often: 'weekly', days: ['tue'], time: '3:30 pm onwards', about: 'Durga abhishekam and puja on Tuesday afternoons, in Rahu kalam.' },
  { temple: 'chetty-koil', what: 'Palani Andavar Abhishekam', often: 'weekly', days: ['tue'], time: 'After 4:30 pm', about: 'After the Durga abhishekam and Murugan puja, an abhishekam for Palani Andavar.' },
  { temple: 'varadaraja-perumal', what: 'Thayar Thirumanjanam and Ul-purappadu', often: 'weekly', days: ['fri'], time: '5 pm', about: 'Thayar is given her thirumanjanam, then carried in procession within the temple.' },
  { temple: 'chetty-koil', what: 'Lalita Trishati Archanai and Parashakti Ul-purappadu', often: 'weekly', days: ['fri'], time: 'After 7:30 pm', about: 'The Lalita Trishati archanai for Ambigai, then Parashakti is carried in procession within the temple.' },
  { temple: 'chetty-koil', what: 'Bhairava Abhishekam', often: 'weekly', days: ['sun'], time: 'After 7:30 pm', about: 'Bhairava puja and abhishekam on Sunday evenings, repeated on Bhairava Ashtami.' },
  { temple: 'varadaraja-perumal', what: 'Ramar Nakshatra Naal', often: 'monthly', on: 'Punarpoosam', about: 'Rama’s birth star: abhishekam in the morning, as an inscription prescribes; ul-purappadu in the evening.' },
  { temple: 'varadaraja-perumal', what: 'Desikar Thirumanjanam', often: 'monthly', on: 'Thiruvonam', about: 'Perumal’s birth star, marked with his thirumanjanam.' },
  { temple: 'chetty-koil', what: 'Dakshinamurti Abhishekam', often: 'weekly', days: ['thu'], about: 'An abhishekam for Dakshinamurti on Thursdays, Guru’s day.' },
  { temple: 'chetty-koil', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', time: 'Pradosha kalam', about: 'Abhishekam for the five deities, ul-purappadu and prasadam; Pradosha Nayakar sees the bali peethams served.' },
  { temple: 'chetty-koil', what: 'Maasa Pirappu', often: 'monthly', on: 'the first day of the month', about: 'One of the five parvams of the month: Pradosha Nayakar is carried in procession.' },
  { temple: 'chetty-koil', what: 'Pournami', often: 'monthly', on: 'Pournami', time: 'evening', about: 'Pradosha Nayakar purappadu; in the evening, abhishekam for Ambal and her ul-purappadu.' },
  { temple: 'chetty-koil', what: 'Amavasya', often: 'monthly', on: 'Amavasya', time: 'evening', about: 'Pradosha Nayakar purappadu; in the evening, Parashakti is carried in procession within the temple.' },
  { temple: 'chetty-koil', what: 'Krittikai', often: 'monthly', on: 'Krittikai', time: '10 am to noon', about: 'Abhishekam for Pillayar, Murugar, Palani Andavar and Iswarar; ul-purappadu in the evening.' },
  { temple: 'chetty-koil', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', time: '11 am', about: 'An abhishekam for Bhairava in the late morning.' },
  { temple: 'chetty-koil', what: 'Lada Chinnamman Abhishekam', often: 'monthly', on: 'Pournami', time: '6:30 pm', about: 'At the Lada Chinnamman shrine by the Kenikulam, an abhishekam for the goddess.' },
  { temple: 'chetty-koil', what: 'Lada Chinnamman Puja', often: 'monthly', on: 'Amavasya', about: 'At the Lada Chinnamman shrine, a puja, naivedyam and prasadam.' },
  { temple: 'chetty-koil', what: 'Perumal Thirumanjanam', often: 'monthly', on: 'Thiruvonam', about: 'Perumal’s birth star: an agal vilakku lit with ghee by noon; perhaps an ul-purappadu.' },
  { temple: 'angala-parameswari', what: 'Amavasya', often: 'monthly', on: 'Amavasya', time: 'night', about: 'Unjal utsavam, then at night the kumbha padayal, with varnippu songs by Pechaiamman.' },
  { temple: 'angala-parameswari', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', about: 'Abhishekam for Kalkatta Kali, who stands here in place of Bhairavar.' },
  { temple: 'angala-parameswari', what: 'Pechaiamman Padayal', often: 'weekly', days: ['sun'], about: 'Pechaiamman is offered an egg with a handful of rice, praying for children.' },
  { temple: 'ghousika-balasubramaniar', what: 'Krittikai', often: 'monthly', on: 'Krittikai', time: 'early morning', about: 'Abhishekam and puja early in the morning; visitors come for archanai and darshan all day.' },
  { temple: 'kamakshi-amman', what: 'Paal Abhishekam', often: 'weekly', days: ['fri'], about: 'Amman’s milk abhishekam, followed by deeparadhanai.' },
  { temple: 'kamakshi-amman', what: 'Dakshinamurti Abhishekam', often: 'weekly', days: ['thu'], about: 'An abhishekam for Dakshinamurti on Thursdays, Guru’s day.' },
  { temple: 'kamakshi-amman', what: 'Krittikai', often: 'monthly', on: 'Krittikai', time: '10:30 am', about: 'An abhishekam for Murugan.' },
  { temple: 'kanniga-parameswari', what: 'Kuberan Yantra Archanai', often: 'weekly', days: ['thu'], time: '4 pm or 6 pm', about: 'Archanai for the Kubera yantra found when the temple was built.' },
  { temple: 'kanniga-parameswari', what: 'Vishnu Sahasranamam and Ramar Bhajanai', often: 'weekly', days: ['sat'], time: 'evening', about: 'The priest leads the Vishnu Sahasranamam at sayaraksha; then a Ramar bhajanai group sings.' },
  { temple: 'kanniga-parameswari', what: 'Mahalakshmi Puja', often: 'monthly', on: 'the first Friday', time: '6 am and 6 pm', about: 'Gopuja at the door at dawn; in the evening the Mahalakshmi puja, with the Lalita Sahasranamam.' },
  { temple: 'kanniga-parameswari', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', about: 'An abhishekam for Siva.' },
  { temple: 'kanniga-parameswari', what: 'Chaturthi', often: 'fortnightly', on: 'Chaturthi', about: 'An abhishekam for Vinayaka, on both Chaturthis: after Amavasya, and Sankatahara after Pournami.' },
  { temple: 'kanniga-parameswari', what: 'Krittikai', often: 'monthly', on: 'Krittikai', about: 'An abhishekam for Murugan.' },
  { temple: 'kanniga-parameswari', what: 'Shukla Sashti', often: 'monthly', on: 'Shukla Sashti', about: 'An abhishekam for Murugan, on the sixth day after Amavasya.' },
  { temple: 'kanniga-parameswari', what: 'Poosam', often: 'monthly', on: 'Poosam', about: 'An abhishekam for the Kubera yantra; Pushya is the star for wealth.' },
  { temple: 'kanniga-parameswari', what: 'Ramar Nakshatra Naal', often: 'monthly', on: 'Punarpoosam', about: 'An abhishekam for Rama, on his birth star.' },
  { temple: 'kanniga-parameswari', what: 'Pooram', often: 'monthly', on: 'Pooram', about: 'An abhishekam for Ambal, on the birth star of Vasavi Kanyaka Parameswari.' },
  { temple: 'kanniga-parameswari', what: 'Pournami', often: 'monthly', on: 'Pournami', about: 'The Satyanarayana puja.' },
  { temple: 'siva-subramania-lawspet', what: 'Rahu Kala Durga Puja', often: 'weekly', days: ['tue'], time: '3:30 pm', about: 'Durga puja in Rahu kalam; annadanam for some four hundred people.' },
  { temple: 'siva-subramania-lawspet', what: 'Rahu Kala Durga Puja', often: 'weekly', days: ['fri'], time: '10:30 am', about: 'Durga puja in the Friday Rahu kalam.' },
  { temple: 'siva-subramania-lawspet', what: 'Rahu and Ketu Abhishekam', often: 'weekly', days: ['sat'], time: '9:30 am', about: 'Rahu and Ketu are given milk, vibhuti and panneer, in Rahu kalam.' },
  { temple: 'siva-subramania-lawspet', what: 'Krittikai', often: 'monthly', on: 'Krittikai', about: 'Morning abhishekam for the utsavar with Valli and Devasena, and the moolavar; evening thanga ther ul-purappadu.' },
  { temple: 'siva-subramania-lawspet', what: 'Shukla Sashti', often: 'monthly', on: 'Shukla Sashti', time: '7 am', about: 'Abhishekam, alangaram and deeparadhanai.' },
  { temple: 'siva-subramania-lawspet', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', about: 'Three rounds: the Vedam, the Siva vadyam and the Thiruvasagam.' },
  { temple: 'siva-subramania-lawspet', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', about: 'A puja for Bhairavar.' },
  { temple: 'siva-subramania-lawspet', what: 'Sankatahara Chaturthi', often: 'monthly', on: 'Sankatahara Chaturthi', time: '6 pm', about: 'An abhishekam for Vinayakar, with the Vinayakar Agaval.' },
  { temple: 'manakkula-vinayakar', what: 'Chaturthi', often: 'fortnightly', on: 'Chaturthi', about: 'Vinayaka’s ul-purappadu on both Chaturthis, Valarpirai and Theipirai.' },
  { temple: 'manakkula-vinayakar', what: 'Krittikai', often: 'monthly', on: 'Krittikai', about: 'Subrahmanya is carried in procession within the temple.' },
  { temple: 'mutthumariamman', what: 'Velli Kavasa Alankaram', often: 'weekly', days: ['fri'], about: 'Amman is adorned in her silver kavasam.' },
  { temple: 'mutthumariamman', what: 'Pournami', often: 'monthly', on: 'Pournami', about: 'A puja with the kalasam; a group of women recite the Lalita Sahasranamam.' },
  { temple: 'mutthumariamman', what: 'Sankatahara Chaturthi', often: 'monthly', on: 'Sankatahara Chaturthi', about: 'Sankatahara Chaturthi is marked.' },
  { temple: 'nandikeswara', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', about: 'With the Kailaya vadhyam, and a discourse on the Sivapuranam by Dr Sankara Devi.' },
  { temple: 'nandikeswara', what: 'Amavasya', often: 'monthly', on: 'Amavasya', about: 'Abhishekam and puja for the Guru.' },
  { temple: 'nandikeswara', what: 'Pournami', often: 'monthly', on: 'Pournami', about: 'An abhishekam for Vinayakar.' },
  { temple: 'nandikeswara', what: 'Shukla Sashti', often: 'monthly', on: 'Shukla Sashti', about: 'An abhishekam for Murugan.' },
  { temple: 'nandikeswara', what: 'Krittikai', often: 'monthly', on: 'Krittikai', about: 'An abhishekam for Murugan.' },
  { temple: 'nandikeswara', what: 'Sankatahara Chaturthi', often: 'monthly', on: 'Sankatahara Chaturthi', time: '5:30 pm', about: 'An abhishekam for Gangai Vinayakar next door, in the evening.' },
  { temple: 'vedapuriswara', what: 'Maasa Pirappu', often: 'monthly', on: 'the first day of the month', about: 'One of the panchaparvam days: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Amavasya', often: 'monthly', on: 'Amavasya', about: 'One of the panchaparvam days: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Pournami', often: 'monthly', on: 'Pournami', about: 'One of the panchaparvam days: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Theipirai Ashtami', often: 'monthly', on: 'Theipirai Ashtami', about: 'Part of the panchaparvam: Bhairava abhishekam in the morning, Pradosha Murti ul-purappadu in the evening.' },
  { temple: 'vedapuriswara', what: 'Pradosham', often: 'fortnightly', on: 'Trayodashi', about: 'Part of the panchaparvam: the Pradosha Murti is carried in procession within the temple.' },
  { temple: 'vedapuriswara', what: 'Masa Shivaratri', often: 'monthly', on: 'Chaturdashi', about: 'The monthly Shivaratri, among the panchaparvam days.' },
  { temple: 'vedapuriswara', what: 'Krittikai', often: 'monthly', on: 'Krittikai', about: 'Abhishekam and alangaram, and Murugan’s ul-purappadu.' },
  { temple: 'chetty-koil', what: 'Masa Shivaratri', often: 'monthly', on: 'Chaturdashi', about: 'The monthly Shivaratri, among the panchaparvam days.' },
]
