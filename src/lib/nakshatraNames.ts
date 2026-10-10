/* The 27 nakshatras, as the Prokerala Tamil calendar names them, each with
   its icon: the stars of its asterism and the lines joining them, after the
   "Schematic comparison — 27 nakshatra asterisms" table (Iyengar &
   Chakravarty 2021; Pingree & Morrissey 1989). The points are as drawn in
   that table; NakshatraIcon fits them into a square. Which nakshatras fall
   on a day is worked out in tithi.ts, on the server. */

type Shape = { stars: [number, number][]; lines: [number, number][]; marks?: [number, number][] };

const chain = (n: number): [number, number][] => Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);

export const NAKSHATRAS: { name: string; tamil: string; shape: Shape }[] = [
  { name: "Asvini", tamil: "அசுவினி", shape: { stars: [[57, 403], [88, 381], [121, 358]], lines: chain(3) } },
  { name: "Bharani", tamil: "பரணி", shape: { stars: [[199, 351], [274, 351], [239, 396], [239, 433]], lines: [[0, 1], [0, 2], [1, 2], [2, 3]] } },
  {
    name: "Karthikai",
    tamil: "கார்த்திகை",
    shape: { stars: [[341, 381], [360, 397], [367, 380], [381, 386], [387, 366], [410, 350], [408, 376], [435, 376]], lines: [[3, 4], [5, 6]] },
  },
  { name: "Rohini", tamil: "ரோகிணி", shape: { stars: [[541, 332], [541, 355], [509, 391], [575, 391], [541, 430]], lines: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4]] } },
  { name: "Mrigashirsham", tamil: "மிருகசீரிடம்", shape: { stars: [[640, 392], [676, 371], [697, 328], [713, 372], [735, 398]], lines: chain(5) } },
  { name: "Thiruvathirai", tamil: "திருவாதிரை", shape: { stars: [[803, 442], [816, 408], [829, 371], [853, 327]], lines: chain(4) } },
  { name: "Punarpoosam", tamil: "புனர்பூசம்", shape: { stars: [[921, 369], [971, 377], [995, 352], [966, 419]], lines: [[0, 1], [1, 2], [0, 3], [1, 3]] } },
  {
    name: "Poosam",
    tamil: "பூசம்",
    shape: { stars: [[1092, 323], [1092, 352], [1057, 382], [1125, 382], [1094, 397], [1094, 442]], lines: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5]] },
  },
  { name: "Ayilyam", tamil: "ஆயில்யம்", shape: { stars: [[1208, 331], [1189, 352], [1185, 383], [1205, 412], [1227, 432], [1251, 440]], lines: chain(6) } },
  { name: "Makam", tamil: "மகம்", shape: { stars: [[89, 639], [89, 688], [60, 738], [118, 738]], lines: [[0, 1], [1, 2], [1, 3]] } },
  { name: "Pooram", tamil: "பூரம்", shape: { stars: [[199, 696], [231, 680], [281, 656], [273, 713], [210, 734]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] } },
  { name: "Uthiram", tamil: "உத்திரம்", shape: { stars: [[392, 647], [392, 693], [353, 733], [431, 733]], lines: [[0, 1], [1, 2], [1, 3]] } },
  { name: "Hastham", tamil: "அஸ்தம்", shape: { stars: [[540, 647], [540, 692], [500, 692], [580, 692], [540, 737]], lines: [[0, 1], [2, 1], [1, 3], [1, 4]] } },
  {
    name: "Chithirai",
    tamil: "சித்திரை",
    shape: { stars: [[686, 650], [644, 693], [728, 693], [686, 738]], lines: [[0, 1], [0, 2], [1, 3], [2, 3]], marks: [[686, 693]] },
  },
  { name: "Swathi", tamil: "சுவாதி", shape: { stars: [[781, 658], [822, 698], [864, 658], [822, 745]], lines: [[0, 1], [2, 1], [1, 3]] } },
  { name: "Visakam", tamil: "விசாகம்", shape: { stars: [[912, 671], [938, 727], [994, 657]], lines: chain(3) } },
  { name: "Anusham", tamil: "அனுஷம்", shape: { stars: [[1047, 725], [1071, 716], [1082, 686], [1114, 665], [1138, 681]], lines: chain(5) } },
  { name: "Kettai", tamil: "கேட்டை", shape: { stars: [[1223, 634], [1233, 667], [1214, 715], [1216, 744], [1250, 733]], lines: chain(5) } },
  { name: "Moolam", tamil: "மூலம்", shape: { stars: [[85, 931], [85, 975], [85, 1020], [119, 1004], [85, 1053]], lines: [[0, 1], [1, 2], [2, 3], [2, 4]] } },
  { name: "Pooradam", tamil: "பூராடம்", shape: { stars: [[210, 950], [244, 982], [287, 948], [244, 1032]], lines: [[0, 1], [2, 1], [1, 3]] } },
  { name: "Uthiradam", tamil: "உத்திராடம்", shape: { stars: [[391, 952], [353, 1015], [430, 1015]], lines: [[0, 1], [1, 2], [2, 0]] } },
  { name: "Tiruvonam", tamil: "திருவோணம்", shape: { stars: [[539, 940], [539, 985], [502, 985], [576, 985], [539, 1031]], lines: [[0, 1], [2, 1], [1, 3], [1, 4]] } },
  { name: "Avittam", tamil: "அவிட்டம்", shape: { stars: [[685, 943], [704, 972], [664, 1012], [685, 1039]], lines: chain(4) } },
  { name: "Sadhayam", tamil: "சதயம்", shape: { stars: [[824, 951], [790, 996], [859, 996], [824, 1039]], lines: [[0, 1], [0, 2], [1, 3], [2, 3]] } },
  { name: "Poorattadhi", tamil: "பூரட்டாதி", shape: { stars: [[913, 1022], [941, 996], [972, 966], [995, 1001]], lines: chain(4) } },
  { name: "Uthirattadhi", tamil: "உத்திரட்டாதி", shape: { stars: [[1080, 940], [1085, 973], [1071, 991], [1075, 1023], [1099, 1047]], lines: chain(5) } },
  { name: "Revathi", tamil: "ரேவதி", shape: { stars: [[1184, 1021], [1206, 1007], [1230, 992], [1268, 968]], lines: chain(4) } },
];

/** A nakshatra's stars fitted into a 100 × 100 square, centred, with room for the dots. */
export function fitted(shape: Shape) {
  const all = [...shape.stars, ...(shape.marks ?? [])];
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = 80 / Math.max(x1 - x0, y1 - y0);
  const at = ([x, y]: [number, number]): [number, number] => [
    50 + (x - (x0 + x1) / 2) * scale,
    50 + (y - (y0 + y1) / 2) * scale,
  ];
  return { stars: shape.stars.map(at), lines: shape.lines, marks: (shape.marks ?? []).map(at) };
}
