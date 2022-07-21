import axios from "axios";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SectionWrapper, TrackList } from "../components";
import { getPlaylistId } from "../spotify";
import { StyledHeader } from "../styles";
import { catchErrors } from "../utils";

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [tracksData, setTracksData] = useState(null);
  const [tracks, setTracks] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await getPlaylistId(id);
      setPlaylist(data);
      setTracksData(data.tracks);
    };

    // run fetchData function & catch the error (if exist)
    catchErrors(fetchData());
  }, [id]);

  useEffect(() => {
    if (!tracksData) {
      return;
    }

    const fetchMoreData = async () => {
      if (tracksData.next) {
        const { data } = await axios.get(tracksData.next);
        setTracksData(data);
      }
    };

    setTracks((tracks) => [...(tracks ? tracks : []), ...tracksData.items]);

    catchErrors(fetchMoreData());
  }, [tracksData]);

  const tracksForTrackList = useMemo(() => {
    if (!tracks) {
      return;
    }

    return tracks.map(({ track }) => track);
  }, [tracks]);

  console.log(tracksForTrackList);

  return (
    <>
      {playlist && (
        <>
          <StyledHeader>
            <div className="header__inner">
              {playlist.images.length && playlist.images[0].url && (
                <img
                  src={playlist.images[0].url}
                  alt="Playlist Artwork"
                  className="header__img"
                />
              )}
              <div>
                <p className="header__overline">Playlist</p>
                <h1 className="header__name">{playlist.name}</h1>
                <p className="header__meta">
                  {playlist.followers.total ? (
                    <span>
                      {playlist.followers.total}{" "}
                      {`follower${playlist.followers.total !== 1 ? "s" : ""}`}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
          </StyledHeader>

          <main>
            <SectionWrapper title="Playlist" breadcrumb={true}>
              {tracksForTrackList && <TrackList tracks={tracksForTrackList} />}
            </SectionWrapper>
          </main>
        </>
      )}
    </>
  );
};

export default Playlist;
