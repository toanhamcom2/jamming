import React from "react";
import styles from './Playlist.module.css';
import TrackList from '../TrackList/TrackList';
function Playlist(props) {
  function handleNameChange({target}) {
    props.onNameChange(target.value);
  }
  return (
    <div className={styles.Playlist}>
      <input defaultValue={"New Playlist"} onChange={handleNameChange} />
      {/* <!-- Add a TrackList component --> */}
      <TrackList userSearchResults={props.playlistTracks} onRemove={props.onRemove} isRemoval={false} />
      <button className={styles["Playlist-save"]} onClick={props.onSave}>
        SAVE TO SPOTIFY
      </button>
    </div>
  );
}

export default Playlist;