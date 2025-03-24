import React, {useState} from "react";
import styles from './App.module.css';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import SearchBar from '../SearchBar/SearchBar';
import spotify from '../../Util/spotify';

function App () {
  const [searchResults, setSearchResults] = useState([
    {
    name: 'name1',
    artist: 'artist1',
    album: 'album1',
    id: 1,
  },
  {
    name: 'name2',
    artist: 'artist2',
    album: 'album2',
    id: 2,
  },
  
]);  
  const [playlistName, setPlaylistName] = useState('Example My Playlist');
  const [playlistTracks, setPlaylistTracks] = useState([
    {
      name: 'playlistName1',
      artist: 'playlistArtist1',  
      album: 'playlistAlbum1',
      id: 3,
    },
    {
      name: 'playlistName2',
      artist: 'playlistArtist2',  
      album: 'playlistAlbum2',
      id: 4,
    }
  ]);
  function addTrack(track) {
    if (playlistTracks.some(savedTrack => savedTrack.id === track.id)) {
      return;
    }
    setPlaylistTracks([...playlistTracks, track]);
  }

  function removeTrack(track) {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  }
  function updatePlaylistName(name) {
    setPlaylistName(name);
  }
  function savePlaylist() {
    const trackURIs = playlistTracks.map(track => track.uri);
    spotify.savePlaylist(playlistName, trackURIs).then(() => {
      setPlaylistName('New Playlist');
      setPlaylistTracks([]);
    });
  }

  function search(term) {
    spotify.search(term).then(result => setSearchResults(result));
    console.log(term);
  }
  return (
        <div>
        <h1>
          Ja<span className={styles.highlight}>mmm</span>ingg
        </h1>
        <div className={styles.App}>
          {/* <!-- Add a SearchBar component --> */}
          <SearchBar onSearch={search} />
          <div className={styles['App-playlist']}>
            {/* <!-- Add a SearchResults component --> */}
            <SearchResults userSearchResults={searchResults} onAdd={addTrack}/>
            {/* <!-- Add a Playlist component --> */}
            <Playlist playlistName={playlistName} playlistTracks={playlistTracks} onRemove={removeTrack} onNameChange={updatePlaylistName} onSave={savePlaylist}/>
          </div>
        </div>
      </div>
      );
}

export default App;