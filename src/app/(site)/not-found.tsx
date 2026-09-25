import { NotFoundContent } from "@/components/NotFoundContent";

/* Rendered when a page in the site section calls notFound() — e.g. an
   unknown temple id. The (site) layout already supplies the nav and footer. */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
