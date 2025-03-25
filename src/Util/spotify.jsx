let accessToken;
const clientId = "d150a326ba81479a822fb798b9548d52";
const redirectUrl = 'https://jammingbymero.netlify.app/';

const Spotify = {
    // 🔑 Step 1: Get or request an access token
    getAccessToken() {
        if (accessToken) return accessToken;

        // Check if the token is in the URL
        const tokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiryMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (tokenMatch && expiryMatch) {
            accessToken = tokenMatch[1];
            const expiresIn = Number(expiryMatch[1]);

            // Clear the token after it expires
            window.setTimeout(() => (accessToken = ''), expiresIn * 1000);

            // Remove the token from the URL
            window.history.pushState('Access Token', null, '/');

            return accessToken;
        }

        // If no token, redirect to Spotify authorization
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}`;
        window.location = authUrl;
    },

    // 🔎 Step 2: Search for tracks
    async search(term) {
        try {
            const token = this.getAccessToken();
            if (!token) throw new Error("Access token missing");

            const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(term)}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);

            const data = await response.json();
            if (!data.tracks) throw new Error("No tracks found");

            // Map and return track details
            return data.tracks.items.map(track => ({
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }));

        } catch (error) {
            console.error("Error in search:", error.message);
            return [];
        }
    },

    // 🎵 Step 3: Save playlist
    async savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) {
            console.warn("Playlist name or track URIs missing");
            return;
        }

        try {
            const token = this.getAccessToken();
            if (!token) throw new Error("Access token missing");

            const headers = { Authorization: `Bearer ${token}` };

            // Get the user's Spotify ID
            const userResponse = await fetch('https://api.spotify.com/v1/me', { headers });
            if (!userResponse.ok) throw new Error("Failed to fetch user ID");

            const userData = await userResponse.json();
            const userId = userData.id;

            // Create a new playlist
            const playlistResponse = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ name })
            });
            if (!playlistResponse.ok) throw new Error("Failed to create playlist");

            const playlistData = await playlistResponse.json();
            const playlistId = playlistData.id;

            // Add tracks to the playlist
            await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ uris: trackUris })
            });

            console.log("Playlist saved successfully!");

        } catch (error) {
            console.error("Error saving playlist:", error.message);
        }
    }
};

export default Spotify;
