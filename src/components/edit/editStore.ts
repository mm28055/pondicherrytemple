/* Admin2: which editable box is open, shared between the boxes (Editable)
   and the bar at the foot of the screen (EditBar). */

export type OpenBox = {
  label: string;
  rich: boolean;
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

type State = { open: OpenBox | null; busy: boolean; message: string };

let state: State = { open: null, busy: false, message: "" };
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
};
