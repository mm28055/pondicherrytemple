import { HOME_TA } from "@/content/homeTa";
import { WRITINGS_TA } from "@/content/writingsTa";
import { IntroText } from "@/components/edit/IntroText";
import { getPhotos } from "@/lib/data";
import { fieldNotesIndex } from "@/lib/fieldNotesIndex";
import { onePerEvent, STRIP_PHOTOS } from "@/lib/photoPack";
import { FieldNotesBrowser } from "@/components/FieldNotesBrowser";
import { HomeStrip } from "@/components/HomeStrip";

/** The Field Notes page; with `ta`, in Tamil. */
export async function FieldNotesView({ ta = false }: { ta?: boolean }) {
  const T = ta ? WRITINGS_TA : null;
  const { rows, filters } = await fieldNotesIndex(ta);

  // the home page's strip of photographs, the same in every way: one from
  // each of the latest events, the newest first, all of them in turn
  // (only the latest STRIP_PHOTOS events: thousands would weigh the page down)
  const stripPhotos = onePerEvent(await getPhotos(), STRIP_PHOTOS)
    .map(({ id, small, alt, focus, width, height }) => ({ id, small, alt, focus, width, height }));

  return (
    <div className={ta ? "wrap in-ta" : "wrap"} lang={ta ? "ta" : undefined}>
      <FieldNotesBrowser
        ta={ta}
        rows={rows}
        filters={filters}
        intro={<p className="page-lede">{T ? T.intro : <IntroText name="fieldNotes" />}</p>}
        strip={stripPhotos.length > 0 && <HomeStrip photos={stripPhotos} all={ta ? HOME_TA.allPhotos : undefined} base={ta ? "/ta/photographs" : undefined} />}
      />
    </div>
  );
}
