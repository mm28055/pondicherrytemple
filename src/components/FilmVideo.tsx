"use client";

import { useState, type ComponentProps } from "react";

/** A film's (or a field note's) video. If its file cannot be had (missing from
    storage, or in a form this browser cannot play), a plain line says so in
    its place, instead of a player that silently does nothing. `tile`: the small
    still in a list of films (a frame of the video, where it has no still of
    its own), which says only "Film unavailable". */
export function FilmVideo({ tile = false, ...props }: ComponentProps<"video"> & { tile?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span className={tile ? "film-unavailable tile" : "film-unavailable"} role="note">
        {tile ? "Film unavailable" : "This film is unavailable just now."}
      </span>
    );
  return (
    <video
      {...props}
      onError={(e) => {
        setFailed(true);
        props.onError?.(e);
      }}
    />
  );
}
