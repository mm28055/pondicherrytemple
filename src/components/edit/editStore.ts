/* Admin2: which editable box is open, shared between the boxes (Editable)
   and the bar at the foot of the screen (EditBar); and the page's
   photographs, if it has any (PhotoArea), for the bar's Photos button. */

export type OpenBox = {
  label: string;
  rich: boolean;
  /** a longer text's styles: headings and quotations too ("full"), or lists only ("short") */
  styles?: "full" | "short";
  /** several lines: Enter starts a new line, Ctrl+Enter saves */
  long: boolean;
  save: () => void | Promise<void>;
  cancel: () => void;
  admin: string;
  /** whether anything has been typed in it */
  changed: () => boolean;
  /** brought into view */
  show: () => void;
  done: () => void;
};

/** A page's photographs, as Admin2 arranges them: a festival's, a temple's
    or a field note's (their order kept in photo-orders, lib/photoOrders). */
export type PhotoAreaInfo = {
  kind: "observances" | "temples" | "field-notes";
  id: number;
  /** its name, for the panel's heading ("Ghousiga Balasubramaniya Koyil") */
  label: string;
  /** for file names ("ghousika-balasubramaniar") */
  slug: string;
  /** the tags a photo added here is given (a note's: its temples and festivals) */
  tags: { temples?: number[]; observances?: number[] };
};

type State = {
  open: OpenBox | null;
  busy: boolean;
  message: string;
  photos: PhotoAreaInfo | null;
  /** the photos panel: open, and any files dropped to be added */
  arranging: { files: File[] } | null;
  /** true while Admin2 is on (its bar is on the page): the photo viewer shows boxes too */
  editing: boolean;
};

let state: State = { open: null, busy: false, message: "", photos: null, arranging: null, editing: false };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

export const editStore = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
  open: (box: OpenBox) => set({ open: box, busy: false, message: "" }),
  close() {
    state.open?.done();
    clearTimeout(timer);
    set({ open: null, busy: false, message: "" });
  },
  busy: (busy: boolean) => set({ busy }),
  flash(message: string) {
    clearTimeout(timer);
    set({ message });
    timer = setTimeout(() => set({ message: "" }), 4000);
  },
  /** the page's photographs (or none, when it goes) */
  setPhotos: (photos: PhotoAreaInfo | null) => set({ photos }),
  arrange: (files: File[] = []) => set({ arranging: { files } }),
  doneArranging: () => set({ arranging: null }),
  setEditing: (editing: boolean) => set({ editing }),
};
