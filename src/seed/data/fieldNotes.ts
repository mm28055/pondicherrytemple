import type { FieldNote } from "./types";

/* SAMPLE field notes, edited from the running log for the launch.
   The writing is Arun's and Deepa's; titles and light copy-editing are
   mine. Nothing new has been added — only removed and tidied.
   `editorial.removed` records what came out, so the authors can check the
   edit before approving.

   Interviews, videos, audio and photo sets go in this same list, with
   `kind` set accordingly — the Field Notes tab holds everything recorded
   in the field. */

export const fieldNotes: FieldNote[] = [
  {
    id: "2026-03-23-first-day-at-chetty-kovil",
    kind: "note",
    region: "pondicherry",
    date: "2026-03-23",
    temples: ["chetty-kovil"],
    observances: ["brahmotsavam", "dhvajarohanam"],
    occasion: "The Brahmotsavam begins",
    title: "The first day at Chetty Kovil",
    authors: ["Arunaditya"],
    body: [
      "My first day at Chetty Kovil. I arrive a little after the dhvajarohanam, as they offer rice balls as bali around the dhvajasthambham.",
      "The little astra utsava murti — the one that eventually takes a dip in the sea on the Teerthavari day — is kept on a stool to the left of the dhvajasthambham, and all archanais and offerings are made to it as well. All the other utsava murtis are out, watching the bali offerings and the deeparchanais.",
    ],
    editorial: {
      status: "awaiting-approval",
      removed: [
        "Deepa's paragraph naming a girl at the flag hoisting",
        "How a priest's phone number was obtained",
      ],
    },
  },
  {
    id: "2026-04-06-pancha-vinayaka-procession",
    kind: "note",
    region: "pondicherry",
    date: "2026-04-06",
    temples: ["manakkula-vinayakar"],
    observances: ["purappadu"],
    occasion: "Pancha Vinayaka veethi ula",
    title: "Waiting for the Pancha Vinayaka procession",
    authors: ["Arunaditya", "Deepa Reddy"],
    body: [
      "Alangaram for the utsava murtis first; then the ubhayakarar must be present before the swamis are taken out around the temple prakaram. The time given is 7pm, but the swamis don't come out until 9, and the procession starts at 9:30.",
      "Meanwhile the vahana and cart owners have been waiting since 7:30. They're paid for this work, so they don't mind. Everyone works part time; they have day jobs. The man we speak to works at a school. We talk for a long time about the part-time, gig-work-like system all around — the only way, it seems, to make things work, from the priests down to the men arranging the carts for street festivals.",
      "The gajavahana is from the Chetty Kovil. The man who looks after it tells us he manages forty temples, and that they share these things between them freely, at no cost. If a temple asks, they give.",
      "The woman minding the shoe stall is from Tirunelveli. People leave their chappals outside anyway, the crowds are small, and the stall barely gets by. Why did you come here, in spite of all the hardship? we ask her. <em>“Because sitting in front of Him feels good,”</em> she says immediately. <em>“He brought me here and made me sit.”</em>",
      "And not to forget the mooshikas at the shoe stall, eating bits of prasadam.",
    ],
    editorial: {
      status: "awaiting-approval",
      removed: [
        "The shoe-stall woman's name",
        "A health detail about the man who manages the vahanas",
        "The shoe-stall tender amount and remarks on temples renting out space",
        "The dispute among the band over which song to play",
      ],
    },
  },
  {
    id: "2026-04-22-thirumanjanam-varadaraja-perumal",
    kind: "note",
    region: "pondicherry",
    date: "2026-04-22",
    temples: ["varadaraja-perumal"],
    observances: ["ramanuja-utsavam", "thirumanjanam", "purappadu"],
    occasion: "Ramanuja utsavam",
    title: "Thirumanjanam, through the smoke",
    authors: ["Arunaditya", "Deepa Reddy"],
    body: [
      "9am. Ramanujar is brought out. The prasadam given to all is fine jaggery crumbs mixed with cashews and raisins. Ramanujar makes one parikrama and enters the shrine; the garbhagriha door is shut.",
      "At about 10:30 the Thirumanjanam begins. Incense, something like sambrani, produces a great deal of smoke, veiling the moola Perumal inside, who is entirely bare for the thirumanjanam. In front of the Perumal is his utsava murti with his consorts, partially clothed; in front of them and to the side, facing south, is Ramanujar. The visuals are splendid — such a rich and intense sight. The flames of the deepams and aradhanais, visible through the smoke and partially lighting the deities, are like some occult dream, shining light on parts of yourself within.",
      "It was a very <em>paavam</em> feeling, not being able to be inside the sanctum performing the abhishekam!",
      "<h3>The process</h3>",
      "It starts with what seems to be an archanai for the ubhayakara family, who are sitting in the doorway of the inner prakaram. When the priests ring the bells, the nadaswaram starts outside, in the maha mandapam where we are all seated.",
      "The Bhattar lights the thattu vilakku and the process begins — milk, curd, fruits, honey, elaneer and more. Each time, the Bhattar shows the dhoop, the arati deepam and then the thattu deepam to all the figures, and between each abhishekam the deities are washed with water. The Perumal utsava murti is garlanded first with tulasi, then with flowers. There is prabandham chanting for some time.",
      "At the end the curtain is drawn and we stand. When it opens again there is another pouring, from the kalasam this time, through a special ladle over a plate crafted so that the kalasa theertham comes through as a shower. It seems to be done for the main deity first and then for the utsava murtis, ending with Ramanujar.",
      "The alangaram, we're told, will take an hour. The evening purappadu is set for 7pm; it is more like 8 by the time it begins.",
    ],
    editorial: {
      status: "awaiting-approval",
      removed: [
        "A security guard's name",
        "The aside on the Atthi Varada figure",
        "The research questions noted while waiting in the mandapam",
        "A devotee's name, and all of his remarks on the priests' earnings, families and salaries",
        "A named priest's comment on Vaikhanasa practice",
        "Internal queries ('where was it set before?', '[sahasra dhaara?]')",
      ],
    },
  },
];
