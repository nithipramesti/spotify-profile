import axios from "axios";

//map for localStorage keys
const LOCALSTORAGE_KEYS = {
  accessToken: "spotify_access_token",
  refreshToken: "spotify_refresh_token",
  expireTime: "spotify_token_expire_time",
  timestamp: "spotify_token_timestamp",
};

//map to retrieve localStorage values
const LOCALSTORAGE_VALUES = {
  accessToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.accessToken),
  refreshToken: window.localStorage.getItem(LOCALSTORAGE_KEYS.refreshToken),
  expireTime: window.localStorage.getItem(LOCALSTORAGE_KEYS.expireTime),
  timestamp: window.localStorage.getItem(LOCALSTORAGE_KEYS.timestamp),
};

export const logout = () => {
  // clear al localStorage items
  for (const property in LOCALSTORAGE_KEYS) {
    window.localStorage.removeItem(LOCALSTORAGE_KEYS[property]);
  }

  //navigate to homepage
  window.location = window.location.origin;
};

const hasTokenExpired = () => {
  const { accessToken, timestamp, expireTime } = LOCALSTORAGE_VALUES;

  if (!accessToken || !accessToken) {
    return false;
  }

  const millisecondsElapsed = Date.now() - Number(timestamp);
  return millisecondsElapsed / 1000 > Number(expireTime);
};

const refreshToken = async () => {
  try {
    //logout if there's no refresh token stored
    //or we're managed to get into a reload infinite loop
    if (
      !LOCALSTORAGE_VALUES.refreshToken ||
      LOCALSTORAGE_VALUES.refreshToken === "undefined" ||
      Date.now() - Number(LOCALSTORAGE_VALUES.timestamp) / 1000 < 1000
    ) {
      console.error("No refresh token available");
      logout();
    }

    // use '/refresh_token' endpoint from node app
    const { data } = await axios.get(
      `/refresh_token?refresh_token=${LOCALSTORAGE_VALUES.refreshToken}`
    );

    // update local storage values
    window.localStorage.setItem(
      LOCALSTORAGE_KEYS.accessToken,
      data.accessToken
    );
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    // reload the page for localStorage updates to be reflected
    window.location.reload();
  } catch (e) {
    console.error(e);
  }
};

const getAccessToken = () => {
  //get url query params value
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  //set url query params into an object (queryParams)
  const queryParams = {
    [LOCALSTORAGE_KEYS.accessToken]: urlParams.get("access_token"),
    [LOCALSTORAGE_KEYS.refreshToken]: urlParams.get("refresh_token"),
    [LOCALSTORAGE_KEYS.expireTime]: urlParams.get("expires_in "),
  };
  const hasError = urlParams.get("error");

  //if there's an error OR the token in localStorage has expired, refresh the token
  if (
    hasError ||
    hasTokenExpired() ||
    LOCALSTORAGE_VALUES.accessToken === "undefined"
  ) {
    refreshToken();
  }

  //if there is a valid access token in localStorage, use that
  if (
    LOCALSTORAGE_VALUES.accessToken &&
    LOCALSTORAGE_VALUES.accessToken !== "undefined"
  ) {
    return LOCALSTORAGE_VALUES.accessToken;
  }

  //if there is a token in the URL query params, user is logging in for the first time
  if (queryParams[LOCALSTORAGE_KEYS.accessToken]) {
    //store the query params in local storage
    for (const property in queryParams) {
      window.localStorage.setItem(property, queryParams[property]);
    }

    //set time stamp
    window.localStorage.setItem(LOCALSTORAGE_KEYS.timestamp, Date.now());

    //return access token from query params
    return queryParams[LOCALSTORAGE_KEYS.accessToken];
  }

  //we should never get here!
  return false;
};

export const accessToken = getAccessToken();

axios.defaults.baseURL = "https://api.spotify.com/v1";
axios.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
axios.defaults.headers["Content-Type"] = "application/json";

export const getCurrentUserProfile = () => axios.get("/me");

export const getCurrentUserPlaylist = (limit = 20) => {
  return axios.get(`/me/playlists?limit=${limit}`);
};

export const getTopArtists = (time_range = "short_term") => {
  return axios.get(`/me/top/artists?time_range=${time_range}`);
};

export const getTopTracks = (time_range = "short_term") => {
  return axios.get(`/me/top/tracks?time_range=${time_range}`);
};

export const getPlaylistId = (playlist_id) => {
  return axios.get(`/playlists/${playlist_id}`);
};
