import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { accessToken, logout, getCurrentUserProfile } from "./spotify";
import { catchErrors } from "./utils";
import { Login, Profile } from "./pages";
import { GlobalStyle } from "./styles";
import styled from "styled-components/macro";

const StyledLogoutButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--white);
  font-size: var(--fz-sm);
  font-weight: 700;
  border-radius: var(--border-radius-pill);
  z-index: 10;
  @media (min-width: 768px) {
    right: var(--spacing-lg);
  }
`;

function App() {
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setToken(accessToken);

    const fetchData = async () => {
      const { data } = await getCurrentUserProfile();
      setProfile(data);
    };

    catchErrors(fetchData());
  }, []);

  return (
    <div className="App">
      <GlobalStyle />
      <header className="App-header">
        {!token ? (
          <Login />
        ) : (
          <>
            <StyledLogoutButton onClick={logout}>Log Out</StyledLogoutButton>
            <BrowserRouter>
              <Routes>
                <Route path="/top-artist" element={<h1>Top Artist</h1>} />
                <Route path="/top-tracks" element={<h1>Top Tracks</h1>} />
                <Route path="/playlists/:id" element={<h1>Playlist</h1>} />
                <Route path="/playlists" element={<h1>Playlist</h1>} />
                <Route path="/" element={<Profile />} />
              </Routes>
            </BrowserRouter>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
