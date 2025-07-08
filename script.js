let playlists = [];
let songs = [];

// --- Static Data Example ---
// const playlists = [];
  
  // --- Player State ---
  let currentIndex = 0;
  let isPlaying = false;
  let isShuffle = true;
  let isRepeat = false;
  let audio = new Audio();
  let playQueue = songs.filter(s => s.isTrending); // Default: trending
  let shuffleQueue = [];
  let shufflePos = 0;
  
  // --- DOM Elements ---
  const playerCover = document.getElementById('playerCover');
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const progressBar = document.getElementById('progressBar');
  const progress = document.getElementById('progress');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  
  // --- Volume/Mute Logic (fix for new IDs) ---
  const volumeBarDiv = document.getElementById('volume-slider');
  const volumeFillDiv = volumeBarDiv ? volumeBarDiv.querySelector('div') : null;
  let lastVolume = 1;
  const volumeBtn = document.getElementById('volumeBtn');
  if (volumeBarDiv && volumeFillDiv) {
    function setVolumeBar(vol, updateLast = true) {
      audio.volume = vol;
      if (updateLast && vol > 0) lastVolume = vol;
      volumeFillDiv.style.width = (vol * 100) + '%';
      if (volumeBtn) {
        if (vol === 0) {
          volumeBtn.querySelector('i').className = 'fas fa-volume-mute';
        } else {
          volumeBtn.querySelector('i').className = 'fas fa-volume-up';
        }
      }
    }
    // Click to set volume
    volumeBarDiv.addEventListener('click', (e) => {
      const rect = volumeBarDiv.getBoundingClientRect();
      const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      setVolumeBar(percent);
    });
    // Drag to set volume
    let isDragging = false;
    volumeBarDiv.addEventListener('mousedown', (e) => {
      isDragging = true;
      const rect = volumeBarDiv.getBoundingClientRect();
      const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      setVolumeBar(percent);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const rect = volumeBarDiv.getBoundingClientRect();
        const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
        setVolumeBar(percent);
      }
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
    });
    // Mute/unmute
    if (volumeBtn) {
      volumeBtn.addEventListener('click', () => {
        if (audio.volume > 0) {
          setVolumeBar(0, false);
        } else {
          setVolumeBar(lastVolume > 0 ? lastVolume : 1, false);
        }
      }); 
    }
    // Set initial fill
    setVolumeBar(audio.volume);
  }
  
  const volumeBtnMobile = document.getElementById('volumeBtnMobile');
  if (volumeBtnMobile) {
    volumeBtnMobile.addEventListener('click', () => {
      if (audio.volume > 0) {
        setVolumeBar(0, false);
        volumeBtnMobile.querySelector('i').className = 'fas fa-volume-mute';
      } else {
        setVolumeBar(lastVolume > 0 ? lastVolume : 1, false);
        volumeBtnMobile.querySelector('i').className = 'fas fa-volume-up';
      }
    });
    // Keep icon in sync with volume changes
    audio.addEventListener('volumechange', () => {
      if (audio.volume === 0) {
        volumeBtnMobile.querySelector('i').className = 'fas fa-volume-mute';
      } else {
        volumeBtnMobile.querySelector('i').className = 'fas fa-volume-up';
      }
    });
  }
  
  // --- UI Rendering ---
  function renderPlaylistCards() {
    const container = document.getElementById('playlistCards');
    container.innerHTML = '';
    playlists.forEach(pl => {
      container.innerHTML += `
        <div class="bg-gray-800 bg-opacity-40 hover:bg-opacity-60 transition rounded flex items-center overflow-hidden cursor-pointer group" data-id="${pl.id}">
          <img src="${pl.cover}" class="w-16 h-16 object-cover rounded" alt="${pl.name}">
          <div class="p-4 flex-1">
            <h3 class="font-bold truncate">${pl.name}</h3>
            <p class="text-gray-400 text-sm">${pl.description}</p>
          </div>
          <button class="mr-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform hover:scale-105 shadow-lg">
            <i class="fas fa-play text-black"></i>
          </button>
        </div>
      `;
    });
    // Add click listeners
    Array.from(container.children).forEach((card, idx) => {
      card.addEventListener('click', () => {
        setPlayQueueForPlaylist(playlists[idx].id);
        currentIndex = 0;
        playSong(currentIndex);
        // Log the song names for the selected playlist
        const playlistSongs = songs.filter(s => s.playlist === playlists[idx].id);
        console.log('Playlist songs:', playlistSongs.map(s => s.name));
        renderPlaylistView(playlists[idx].id);

      });
    });
  }
  
  function renderSongCards() {
    const container = document.getElementById('songCards');
    container.innerHTML = '';
    const trendingSongs = songs.filter(s => s.isTrending);
    trendingSongs.forEach((song, idx) => {
      container.innerHTML += `
        <div class="trendcard group cursor-pointer" data-idx="${idx}">
          <div class="relative mb-3">
            <img src="${song.cover}" class="w-full aspect-square object-cover rounded shadow-lg" alt="${song.name}">
            <button class="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform hover:scale-105 shadow-lg">
              <i class="fas fa-play text-black"></i>
            </button>
          </div>
          <h3 class="font-bold truncate">${song.name}</h3>
          <p class="text-gray-400 text-sm truncate">${song.artist}</p>
        </div>
      `;
    });
    // Add click listeners
    Array.from(container.children).forEach((card, idx) => {
      card.addEventListener('click', () => {
        setPlayQueueForTrending();
        currentIndex = idx;
        playSong(currentIndex);
      });
    });
  }
  
  function renderMiniPlaylistCard(currentPlaylistId) {
    const miniCard = document.getElementById('miniPlaylistCard');
    const createLikedDiv = document.querySelector('#sidebar .mt-8');
    // Only show mini cards if playlist view is open
    const playlistView = document.getElementById('playlistView');
    if (playlistView && playlistView.classList.contains('hidden')) {
      miniCard.innerHTML = '';
      miniCard.classList.add('hidden');
      if (createLikedDiv) createLikedDiv.classList.remove('hidden');
      return;
    }
    // Show all playlists as mini cards
    let html = '<div class="space-y-2 max-h-48 overflow-y-auto">';
    playlists.forEach(pl => {
      html += `
        <div class="flex items-center bg-gray-800 bg-opacity-60 rounded-lg p-2 cursor-pointer hover:bg-opacity-80 transition group" data-playlist-id="${pl.id}">
          <img src="${pl.cover}" class="w-12 h-12 object-cover rounded-lg mr-3 flex-shrink-0" alt="${pl.name}">
          <div class="flex-1 min-w-0">
            <div class="font-bold text-white text-sm truncate whitespace-nowrap overflow-hidden">${pl.name}</div>
            <div class="text-xs text-gray-400 truncate whitespace-nowrap overflow-hidden">${pl.description || ''}</div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    miniCard.innerHTML = html;
    miniCard.classList.remove('hidden');
    if (createLikedDiv) createLikedDiv.classList.add('hidden');
    // Add click handlers for each mini card
    Array.from(miniCard.querySelectorAll('[data-playlist-id]')).forEach(card => {
      card.onclick = function() {
        const pid = card.getAttribute('data-playlist-id');
        renderPlaylistView(pid);
        // Hide sidebar on mobile after click
        if (window.innerWidth < 768) {
          sidebar.classList.add('hidden');
          sidebar.classList.remove('fixed');
          sidebar.classList.remove('z-40');
          const closeBtn = document.getElementById('closeSidebarBtn');
          if (closeBtn) closeBtn.style.display = 'none';
        }
      };
    });
  }
  
  const origRenderPlaylistView = renderPlaylistView;
  renderPlaylistView = function(playlistId) {
    origRenderPlaylistView(playlistId);
    renderMiniPlaylistCard(playlistId);
  };
  
  function renderPlaylistView(playlistId) {
    const playlist = playlists.find(pl => pl.id === playlistId);
    const playlistSongs = songs.filter(s => s.playlist === playlistId);
    const playlistView = document.getElementById('playlistView');
    let html = '';
    // Playlist Header (mobile back button is rendered and controlled here)
    html += `<div class="playlist-header p-6 pt-12 pb-16 relative">
      <button id="playlistMobileBackBtn" class="md:hidden flex items-center text-white text-lg font-bold absolute left-0 top-0 z-20 bg-black bg-opacity-60 px-2 py-1 rounded mt-0"><i class="fas fa-chevron-left mr-2"></i>Back</button>
      <div class="flex flex-col items-center text-center gap-4 md:flex-row md:items-end md:text-left md:gap-6">
        <img src="${playlist ? playlist.cover : ''}" alt="${playlist ? playlist.name : ''}" class="w-20 h-20 md:w-48 md:h-48 shadow-2xl rounded mb-2 md:mb-0">
        <div>
          <p class="text-sm uppercase tracking-wider">Public Playlist</p>
          <h1 class="text-5xl font-bold mt-2 mb-6">${playlist ? playlist.name : 'Playlist'}</h1>
          <p class="text-gray-300">${playlist ? playlist.description : ''}</p>
          <div class="flex items-center justify-center md:justify-start mt-4 text-sm gap-2">
            <a href="#" class="font-bold hover:underline">Spotify</a>
            <span class="mx-1">•</span>
            <span>${playlistSongs.length} songs</span>
          </div>
        </div>
      </div>
    </div>`;
    // Playlist Controls
    html += `<div class="px-6 py-4 flex items-center">
      <button class="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform play-button" id="playlistPlayBtn">
        <i class="fas fa-play text-xl"></i>
      </button>
      <button class="ml-6 text-gray-400 hover:text-white">
        <i class="far fa-heart text-2xl"></i>
      </button>
      <button class="ml-4 text-gray-400 hover:text-white">
        <i class="fas fa-ellipsis-h text-2xl"></i>
      </button>
    </div>`;
    // Songs List Header
    html += `<div class="px-6 pb-32">
      <div class="grid grid-cols-12 text-gray-400 text-sm uppercase border-b border-gray-800 pb-2 mb-4">
        <div class="col-span-1 text-left">#</div>
        <div class="col-span-9 text-left">Title</div>
        <div class="col-span-2 text-right">Duration</div>
      </div>`;
    // Song Rows
    playlistSongs.forEach((song, idx) => {
      html += `<div class="song-row rounded-md p-2 flex items-center hover:bg-gray-800 cursor-pointer" data-idx="${idx}">
        <div class="w-10 text-left text-gray-400">${idx + 1}</div>
        <div class="flex items-center flex-1 min-w-0">
          <img src="${song.cover}" alt="${song.name}" class="w-10 h-10 mr-4 rounded">
          <div class="min-w-0">
            <div class="text-white truncate max-w-full">${song.name}</div>
            <div class="text-gray-400 text-sm truncate max-w-full">${song.artist}</div>
          </div>
        </div>
        <div class="text-gray-400 text-right w-16"><span id="duration-${idx}">...</span></div>
      </div>`;
    });
    html += '</div>';
    playlistView.innerHTML = html;
    playlistView.classList.remove('hidden');
    document.querySelector('main').classList.add('hidden');
    // Play all button handler
    document.getElementById('playlistPlayBtn').onclick = function() {
      setPlayQueueForPlaylist(playlistId);
      currentIndex = 0;
      playSong(currentIndex);
    };
    // Song row click handlers
    Array.from(playlistView.querySelectorAll('.song-row')).forEach((row, idx) => {
      row.addEventListener('click', () => {
        setPlayQueueForPlaylist(playlistId);
        currentIndex = idx;
        playSong(currentIndex);
      });
    });
    // After rendering, load durations for each song
    playlistSongs.forEach((song, idx) => {
      const audioTmp = new Audio(song.url);
      audioTmp.addEventListener('loadedmetadata', function() {
        const dur = formatTime(audioTmp.duration);
        const el = document.getElementById(`duration-${idx}`);
        if (el) el.textContent = dur;
      });
    });
    // Move mobile back button logic inside renderPlaylistView so it always attaches after rendering
    setTimeout(() => {
      const playlistMobileBackBtn = document.getElementById('playlistMobileBackBtn');
      if (playlistMobileBackBtn) {
        playlistMobileBackBtn.onclick = function() {
          const playlistView = document.getElementById('playlistView');
          playlistView.classList.add('hidden');
          document.querySelector('main').classList.remove('hidden');
          renderMiniPlaylistCard(null);
        };
      }
    }, 0);
  }
  
  // --- Player Logic ---
  function playSong(idx) {
    const song = playQueue[idx];
    if (!song) return;
    audio.src = song.url;
    audio.play();
    isPlaying = true;
    updatePlayerBar(song);
    updatePlayPauseIcon();
    // Show playbar info and heart button when a song is played
    playerCover.style.display = '';
    playerTitle.style.display = '';
    playerArtist.style.display = '';
    if (playerHeartBtn) playerHeartBtn.style.display = '';
  }
  
  function updatePlayerBar(song) {
    playerCover.src = song.cover;
    playerTitle.textContent = song.name;
    playerArtist.textContent = song.artist;
    playerTitle.className = 'text-sm font-medium truncate max-w-[110px] md:max-w-[180px]';
    playerArtist.className = 'text-gray-400 text-xs truncate max-w-[110px] md:max-w-[180px]';
  }
  
  const playSVG = `<svg width="28" height="28" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="0.203125" width="32" height="32" rx="16" fill="white"/><g clip-path="url(#clip0_0_1508)"><path d="M11 9.91611C10.9999 9.79317 11.0321 9.67236 11.0935 9.56584C11.1549 9.45932 11.2432 9.37084 11.3497 9.30931C11.4561 9.24778 11.5769 9.21537 11.6998 9.21533C11.8227 9.2153 11.9435 9.24764 12.05 9.30911L22.94 15.5971C23.0463 15.6586 23.1346 15.7469 23.1959 15.8533C23.2573 15.9597 23.2896 16.0803 23.2896 16.2031C23.2896 16.3259 23.2573 16.4466 23.1959 16.5529C23.1346 16.6593 23.0463 16.7476 22.94 16.8091L12.05 23.0971C11.9436 23.1585 11.8229 23.1909 11.7001 23.1909C11.5772 23.1909 11.4565 23.1586 11.3501 23.0972C11.2437 23.0358 11.1553 22.9474 11.0939 22.841C11.0324 22.7347 11 22.614 11 22.4911V9.91611Z" fill="black"/></g><defs><clipPath id="clip0_0_1508"><rect width="16" height="16" fill="white" transform="translate(8 8.20312)"/></clipPath></defs></svg>`;
  const pauseSVG = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="12" fill="white"/>
    <rect x="7.5" y="7" width="2.5" height="10" fill="black"/>
    <rect x="13.5" y="7" width="2.5" height="10" fill="black"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" fill="#ffffff"/>
  </svg>`;
  function updatePlayPauseIcon() {
    if (isPlaying) {
      playPauseIcon.innerHTML = pauseSVG;
    } else {
      playPauseIcon.innerHTML = playSVG;
    }
  }
  // Set initial icon on page load
  updatePlayPauseIcon();
  
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
    } else {
      audio.play();
      isPlaying = true;
    }
    updatePlayPauseIcon();
  });
  
  audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayPauseIcon();
  });
  audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayPauseIcon();
  });
  audio.addEventListener('ended', () => {
    if (isRepeat) {
      playSong(currentIndex);
    } else {
      nextBtn.click();
    }
  });
  audio.addEventListener('timeupdate', () => {
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
    progress.style.width = ((audio.currentTime / audio.duration) * 100 || 0) + '%';
  });
  progressBar.addEventListener('click', (e) => {
    const percent = e.offsetX / progressBar.offsetWidth;
    audio.currentTime = percent * audio.duration;
  });
  
  // --- Improved Shuffle/Repeat Logic ---
  function generateShuffleQueue(startIdx = 0) {
    if (playQueue.length === 0) return [];
    const indices = Array.from({length: playQueue.length}, (_, i) => i).filter(i => i !== startIdx);
    const shuffled = shuffle(indices);
    return [startIdx, ...shuffled];
  }
  function playSongFromQueue(idx) {
    currentIndex = idx;
    playSong(currentIndex);
  }
  nextBtn.addEventListener('click', () => {
    if (isRepeat) {
      playSong(currentIndex);
    } else if (isShuffle) {
      if (!shuffleQueue.length) {
        shuffleQueue = generateShuffleQueue(currentIndex);
        shufflePos = 0;
      }
      shufflePos++;
      if (shufflePos >= shuffleQueue.length) {
        shuffleQueue = generateShuffleQueue(currentIndex);
        shufflePos = 0;
      }
      playSongFromQueue(shuffleQueue[shufflePos]);
    } else {
      if (currentIndex < playQueue.length - 1) {
        playSong(currentIndex + 1);
      } else {
        playSong(0);
      }
    }
  });
  prevBtn.addEventListener('click', () => {
    if (isRepeat) {
      playSong(currentIndex);
    } else if (isShuffle) {
      if (!shuffleQueue.length) {
        shuffleQueue = generateShuffleQueue(currentIndex);
        shufflePos = 0;
      }
      shufflePos--;
      if (shufflePos < 0) {
        shufflePos = shuffleQueue.length - 1;
      }
      playSongFromQueue(shuffleQueue[shufflePos]);
    } else {
      if (currentIndex > 0) {
        playSong(currentIndex - 1);
      } else {
        playSong(playQueue.length - 1);
      }
    }
  });
  audio.addEventListener('ended', () => {
    if (isRepeat) {
      playSong(currentIndex);
    } else if (isShuffle) {
      nextBtn.click();
    } else {
      if (currentIndex < playQueue.length - 1) {
        playSong(currentIndex + 1);
      } else {
        playSong(0);
      }
    }
  });
  shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('text-green-500', isShuffle);
    if (isShuffle) {
      isRepeat = false;
      repeatBtn.classList.remove('text-green-500');
      shuffleQueue = generateShuffleQueue(currentIndex);
      shufflePos = 0;
    }
  });
  repeatBtn.addEventListener('click', () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('text-green-500', isRepeat);
    if (isRepeat) {
      isShuffle = false;
      shuffleBtn.classList.remove('text-green-500');
    }
  });
  
  function shuffle(array) {
    let a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  function formatTime(sec) {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  
  // Sidebar toggle for mobile
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('fixed');
      sidebar.classList.remove('z-40');
      sidebar.classList.add('z-50'); // Make sidebar overlay playbar on mobile
      // Show close button on mobile
      const closeBtn = document.getElementById('closeSidebarBtn');
      if (closeBtn) closeBtn.style.display = '';
    });
  }
  // Sidebar close button for mobile
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', () => {
      sidebar.classList.add('hidden');
      sidebar.classList.remove('fixed');
      sidebar.classList.remove('z-50'); // Remove z-50 when closing
      sidebar.classList.add('z-40');    // Restore z-40 for desktop
      closeSidebarBtn.style.display = 'none';
    });
  }
  // Playlist mobile back button
  const playlistMobileBackBtn = document.getElementById('playlistMobileBackBtn');
  if (playlistMobileBackBtn) {
    playlistMobileBackBtn.addEventListener('click', () => {
      const playlistView = document.getElementById('playlistView');
      playlistView.classList.add('hidden');
      document.querySelector('main').classList.remove('hidden');
      renderMiniPlaylistCard(null);
    });
  }
  
  // --- Ensure playQueue is set correctly for trending or playlist ---
  function setPlayQueueForTrending() {
    playQueue = songs.filter(s => s.isTrending);
    shuffleQueue = generateShuffleQueue(0);
    shufflePos = 0;
  }
  function setPlayQueueForPlaylist(playlistId) {
    playQueue = songs.filter(s => s.playlist === playlistId);
    shuffleQueue = generateShuffleQueue(0);
    shufflePos = 0;
  }
  
  // --- Initial Render ---
  renderPlaylistCards();
  renderSongCards();
  // Remove playSong(0); // Do not auto-select or play any song on load
  // Set play icon on reload
  updatePlayPauseIcon();
  // Set playbar cover and info to hidden by default
  playerCover.style.display = 'none';
  playerTitle.style.display = 'none';
  playerArtist.style.display = 'none';
  // Hide heart button by default
  const playerHeartBtn = playerArtist.parentElement.nextElementSibling;
  if (playerHeartBtn) playerHeartBtn.style.display = 'none';
  

  // Ensure shuffle is selected by default
  shuffleBtn.classList.add('text-green-500');

  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      // Only toggle if a song is loaded
      if (audio.src) {
        if (audio.paused) {
          audio.play();
          isPlaying = true;
        } else {
          audio.pause();
          isPlaying = false;
        }
        updatePlayPauseIcon();
      }
      return false;
    }
    // Volume up/down with arrow keys
    if (e.code === 'ArrowUp') {
      e.preventDefault();
      let newVol = Math.min(audio.volume + 0.1, 1);
      if (typeof setVolumeBar === 'function') setVolumeBar(newVol);
      else audio.volume = newVol;
    }
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      let newVol = Math.max(audio.volume - 0.1, 0);
      if (typeof setVolumeBar === 'function') setVolumeBar(newVol);
      else audio.volume = newVol;
    }
    // 10s skip forward/backward
    if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (audio.src && !isNaN(audio.duration)) {
        audio.currentTime = Math.min(audio.currentTime + 10, audio.duration);
      }
    }
    if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (audio.src && !isNaN(audio.duration)) {
        audio.currentTime = Math.max(audio.currentTime - 10, 0);
      }
    }
  });

  // Add logic to header back button
  const headerBackBtn = document.querySelector('header .fa-chevron-left')?.closest('button');
  if (headerBackBtn) {
    headerBackBtn.onclick = function() {
      const playlistView = document.getElementById('playlistView');
      if (!playlistView.classList.contains('hidden')) {
        playlistView.classList.add('hidden');
        document.querySelector('main').classList.remove('hidden');
        renderMiniPlaylistCard(null);
      } else {
        // Optionally: implement normal back navigation here
      }
    };
  }

  // Fetch playlists and songs from JSON files
  Promise.all([
    fetch('playlists.json').then(res => res.json()),
    fetch('songs.json').then(res => res.json())
  ]).then(([playlistsData, songsData]) => {
    playlists = playlistsData;
    songs = songsData;
    playQueue = songs.filter(s => s.isTrending);
    // Now render UI
    renderPlaylistCards();
    renderSongCards();
    // Set play icon on reload
    updatePlayPauseIcon();
    // Set playbar cover and info to hidden by default
    playerCover.style.display = 'none';
    playerTitle.style.display = 'none';
    playerArtist.style.display = 'none';
    // Hide heart button by default
    const playerHeartBtn = playerArtist.parentElement.nextElementSibling;
    if (playerHeartBtn) playerHeartBtn.style.display = 'none';
    // Ensure shuffle is selected by default
    shuffleBtn.classList.add('text-green-500');
  });