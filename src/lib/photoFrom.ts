/* A photo opened from the home page is shown on the Photographs page (its own
   address); closing it goes back to the home page, not on to the Photographs
   page. The home page leaves word as the photo is pressed; the Photographs
   page takes it as the photo opens. */
const KEY = "photo-from-home";

export const leaveFromHome = () => {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // storage turned off: the photo closes onto the Photographs page
  }
};

/** Whether the photo now opening was pressed on the home page (asked once). */
export const takeFromHome = (): boolean => {
  try {
    const was = sessionStorage.getItem(KEY) === "1";
    sessionStorage.removeItem(KEY);
    return was;
  } catch {
    return false;
  }
};
