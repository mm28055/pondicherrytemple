import { notFound } from "next/navigation";

/* Any address the site doesn't have gets the site's own "not here" page. */
export default function Missing() {
  notFound();
}
