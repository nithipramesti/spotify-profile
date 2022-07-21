import axios from "axios";
import { useEffect, useState } from "react";
import { PlaylistsGrid, SectionWrapper } from "../components";
import { getCurrentUserPlaylist } from "../spotify";
import { catchErrors } from "../utils";

const Playlist = () => {
  const [playlistsData, setPlaylistsData] = useState(null);
  const [playlist, setPlaylists] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userPlaylist = await getCurrentUserPlaylist();
      setPlaylistsData(userPlaylist.data);
    };

    // run fetchData function & catch the error (if exist)
    catchErrors(fetchData());
  }, []);

  useEffect(() => {
    if (!playlistsData) {
      return;
    }

    const fetchMoreData = async () => {
      if (playlistsData.next) {
        const { data } = await axios.get(playlistsData.next);
        setPlaylistsData(data);
      }
    };

    setPlaylists((playlist) => [
      ...(playlist ? playlist : []),
      ...playlistsData.items,
    ]);

    catchErrors(fetchMoreData());
  }, [playlistsData]);

  return (
    <main>
      {playlist && (
        <SectionWrapper title="Playlists" breadcrumb="true">
          <PlaylistsGrid playlists={playlist} />
        </SectionWrapper>
      )}
    </main>
  );
};

export default Playlist;
