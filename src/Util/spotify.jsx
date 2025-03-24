import js from "@eslint/js";

let accessToken;
const clientId = "d150a326ba81479a822fb798b9548d52";
const redirectUrl = 'http://localhost:4000/';

const Spotify = {
    getAccessToken() {
        if (accessToken) return accessToken;

        // Check for access token and expiry time in URL
        const tokenInUrl = window.location.href.match(/access_token=([^&]*)/);
        const expiryTime = window.location.href.match(/expires_in=([^&]*)/);

        if (tokenInUrl && expiryTime) {
            accessToken = tokenInUrl[1];
            const expiresIn = Number(expiryTime[1]);

            // Clear accessToken after expiration
            window.setTimeout(() => (accessToken = ''), expiresIn * 1000);
            
            // Remove the access token from URL for a cleaner look
            window.history.pushState('Access Token', null, '/');

            return accessToken;
        }

        // 🔥 Fixed redirect_uri parameter
        const redirect = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}`;
        window.location = redirect;
    },

    async search(term) {
        const accessToken = this.getAccessToken();  // Make sure we have a valid token

        if (!accessToken) {
            console.error('Access token is missing!');
            return [];
        }

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                console.error('Failed to fetch:', response.status, response.statusText);
                return [];
            }

            const jsonResponse = await response.json();

            if (!jsonResponse.tracks) {
                console.error('No tracks found.');
                return [];
            }

            // 🔥 Corrected artists property
            return jsonResponse.tracks.items.map(t => ({
                id: t.id,
                name: t.name,
                artist: t.artists[0].name,  // ✅ Fixed artists array
                album: t.album.name,
                uri: t.uri
            }));

        } catch (error) {
            console.error('Error fetching Spotify data:', error);
            return [];
        }
    },

    savePlaylist(name, trackUris) {
        if (!name || !trackUris) return;
        const aToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${aToken}` };
        let userId;
        return fetch('https://api.spotify.com/v1/me', { headers: headers })
        .then(response => response.json())
        .then((jsonResponse) => 
            {userId = jsonResponse.id
             let playlistId;   
             return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name })   
            })
            .then(response => response.json())
            .then((jsonResponse) => {
                playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackUris })
                });
            })
    });
    }
};

export default Spotify;
