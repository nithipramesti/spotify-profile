import axios from "axios";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SectionWrapper, TrackList } from "../components";
import { getAudioFeaturesFroTracks, getPlaylistId } from "../spotify";
import { StyledDropdown, StyledHeader } from "../styles";
import { catchErrors } from "../utils";

const Playlist = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [tracksData, setTracksData] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [sortValue, setSortValue] = useState("");
  const sortOptions = ["danceability", "tempo", "energy"];

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

    const fetchAudioFeatures = async () => {
      const ids = tracksData.items.map(({ track }) => track.id).join(",");
      const { data } = await getAudioFeaturesFroTracks(ids);

      setAudioFeatures((audioFeatures) => [
        ...(audioFeatures ? audioFeatures : []),
        ...data["audio_features"],
      ]);
    };

    catchErrors(fetchAudioFeatures());
  }, [tracksData]);

  const tracksForTrackList = useMemo(() => {
    if (!tracks) {
      return;
    }

    return tracks.map(({ track }) => track);
  }, [tracks]);

  const tracksWithAudioFeatures = useMemo(() => {
    if (!tracks || !audioFeatures) {
      return null;
    }

    return tracks.map(({ track }) => {
      const trackToAdd = track;

      if (!track.audio_features) {
        const audioFeaturesObj = audioFeatures.find((item) => {
          if (!item || !track) {
            return null;
          }

          return item.id === track.id;
        });

        trackToAdd["audio_features"] = audioFeaturesObj;
      }

      return trackToAdd;
    });
  }, [tracks, audioFeatures]);

  const sortedTracks = useMemo(() => {
    if (!tracksWithAudioFeatures) {
      return null;
    }

    return [...tracksWithAudioFeatures].sort((a, b) => {
      const aFeatures = a["audio_features"];
      const bFeatures = b["audio_features"];

      if (!aFeatures || !bFeatures) {
        return false;
      }

      return bFeatures[sortValue] - aFeatures[sortValue];
    });
  }, [sortValue, tracksWithAudioFeatures]);

  // console.log(sortedTracks);
  console.log(sortValue);

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
              <StyledDropdown>
                <label htmlFor="order-select" className="sr-only">
                  Sort Tracks
                </label>
                <select
                  name="track-order"
                  id="order-select"
                  onChange={(e) => setSortValue(e.target.value)}
                >
                  <option value="">Sort tracks</option>
                  {sortOptions.map((option, i) => (
                    <option value={option} key={i}>
                      {`${option.charAt(0).toUpperCase()}${option.slice(1)}`}
                    </option>
                  ))}
                </select>
              </StyledDropdown>

              {sortedTracks && <TrackList tracks={sortedTracks} />}
            </SectionWrapper>
          </main>
        </>
      )}
    </>
  );
};

export default Playlist;
