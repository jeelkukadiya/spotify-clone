# Spotify Clone (https://spotifymaster.netlify.app/)

A web-based clone of Spotify, focused on delivering a familiar music streaming interface and core playback functionality, built using JavaScript, HTML, and CSS.

## Features

- **Modern UI**: Responsive design inspired by Spotify, with sidebar navigation, header, and animated player bar.
- **Playlists & Songs**: Browse playlists and trending songs, fetched from local JSON files.
- **Music Playback**: Play, pause, skip, shuffle, and repeat songs with a dynamic progress bar and volume control.
- **Player Bar**: Persistent player at the bottom with cover art, song info, like button, and playback controls.
- **Mobile Support**: Adaptive sidebar, mobile navigation, and volume/mute controls for smaller screens.
- **Mini Playlist Cards**: Quick access to playlists in the sidebar.
- **Liked Songs**: Special section for favorite tracks (UI only).

## Technologies Used

- **JavaScript**: Handles all dynamic logic, audio playback, playlist/song rendering, and UI interactivity.
- **HTML/CSS**: Semantic HTML5 with extensive use of Tailwind utility classes and custom CSS for layout and effects.
- **FontAwesome**: For Spotify-like icons and playback controls.
- **Local JSON**: Playlists and songs are loaded from `playlists.json` and `songs.json` files.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jeelkukadiya/spotify-clone.git
   cd spotify-clone
   ```

2. **Add Music Data:**
   - Ensure `playlists.json` and `songs.json` exist in the root directory.  
   - (Sample format expected; see code for structure.)

3. **Run Locally:**
   - Simply open `index.html` in your browser.
   - No backend/server required—everything runs in the browser.

## Project Structure

```
spotify-clone/
├── index.html
├── style.css
├── script.js
├── playlists.json
└── songs.json
```

## Usage

- Click on playlists or trending songs to start playback.
- Use the player controls (shuffle, repeat, next, previous, volume, like).
- Responsive sidebar and navigation for both desktop and mobile.

## License

This project is for demo and educational purposes only. Not affiliated with Spotify.

---

> Built by [jeelkukadiya](https://github.com/jeelkukadiya)
