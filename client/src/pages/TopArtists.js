import { useEffect, useState } from "react";
import { catchErrors } from "../utils";
import { getTopArtists } from "../spotify";
import {
  ArtistsGrid,
  Loader,
  SectionWrapper,
  TimeRangeButtons,
} from "../components";

const TopArtists = () => {
  const [topArtists, setTopArtists] = useState(null);
  const [activeRange, setActiveRange] = useState("short");

  useEffect(() => {
    const fetchData = async () => {
      const userTopArtist = await getTopArtists(`${activeRange}_term`);
      setTopArtists(userTopArtist.data);
    };

    // run fetchData function & catch the error (if exist)
    catchErrors(fetchData());
  }, [activeRange]);

  return (
    <>
      <main>
        {topArtists && topArtists.items ? (
          <SectionWrapper>
            <TimeRangeButtons
              activeRange={activeRange}
              setActiveRange={setActiveRange}
            />
            <SectionWrapper title="Top Artists" breadcrumb="true">
              <ArtistsGrid artists={topArtists.items.slice(0, 10)} />
            </SectionWrapper>
          </SectionWrapper>
        ) : (
          <Loader />
        )}
      </main>
    </>
  );
};

export default TopArtists;
