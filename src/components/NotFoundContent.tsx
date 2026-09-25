import Link from "next/link";

export function NotFoundContent() {
  return (
    <div className="wrap">
      <div className="page-head">
        <div className="kicker">Not in the archive</div>
        <h1 className="page-title">Not here — yet</h1>
        <p className="page-lede">
          The link may be mistyped, or the entry may not have been written. The archive grows temple
          by temple.
        </p>
        <div className="home-links">
          <Link className="arrow-link" href="/pondicherry">
            The temples
          </Link>
          <Link className="arrow-link" href="/">
            Home
          </Link>
        </div>
      </div>
      <div style={{ height: 80 }} />
    </div>
  );
}
