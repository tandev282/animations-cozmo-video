// Cozmo Studio - Main Application Logic
(function() {
  'use strict';

  // Video Sources Configuration (GitHub Streaming & CDN)
  const VIDEO_SOURCES = {
    jsdelivr: {
      id: 'jsdelivr',
      name: 'GitHub CDN (Nhanh, Cloudflare)',
      subtext: 'Từ GitHub CDN (Cloudflare)',
      badge: '● Phát từ GitHub CDN (Online)',
      getUrl: (id) => `https://cdn.jsdelivr.net/gh/cozmo4hri/animations@master/animation-set/${id}.MOV.mp4`
    },
    'github-raw': {
      id: 'github-raw',
      name: 'GitHub Raw (Trực tiếp)',
      subtext: 'Từ GitHub Raw',
      badge: '● Phát từ GitHub Raw (Online)',
      getUrl: (id) => `https://raw.githubusercontent.com/cozmo4hri/animations/master/animation-set/${id}.MOV.mp4`
    }
  };

  // State
  let animations = [];
  let filteredAnimations = [];
  let selectedAnim = null;
  let favorites = new Set();
  
  let currentFilter = 'has-video'; // 'has-video', 'all', 'favorites'
  let currentGroup = 'all';
  let searchQuery = '';
  let currentSort = 'id-asc';
  let currentSource = 'jsdelivr';
  let fallbackAttempts = 0;
  let autoNext = true;
  let isLooping = false;

  // DOM Elements
  const videoEl = document.getElementById('cozmo-video');
  const videoContainer = document.getElementById('video-container');
  const videoOverlay = document.getElementById('video-overlay');
  const btnOverlayPlay = document.getElementById('btn-overlay-play');
  const noVideoState = document.getElementById('no-video-state');
  const videoLoader = document.getElementById('video-loader');
  const loaderSubtext = document.getElementById('loader-subtext');
  const videoErrorState = document.getElementById('video-error-state');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');
  const btnRetryVideo = document.getElementById('btn-retry-video');
  const btnOpenGithub = document.getElementById('btn-open-github');
  const videoSourceSelect = document.getElementById('video-source-select');
  
  const animListEl = document.getElementById('anim-list');
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const groupSelect = document.getElementById('group-select');
  const sortSelect = document.getElementById('sort-select');
  const filterChips = document.getElementById('filter-chips');
  
  const chipCountVideo = document.getElementById('chip-count-video');
  const chipCountAll = document.getElementById('chip-count-all');
  const chipCountFav = document.getElementById('chip-count-fav');
  const resultsCountText = document.getElementById('results-count-text');

  // Controls
  const btnPlayPause = document.getElementById('btn-play-pause');
  const iconPlay = btnPlayPause.querySelector('.icon-play');
  const iconPause = btnPlayPause.querySelector('.icon-pause');
  const playBtnText = document.getElementById('play-btn-text');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnReplay = document.getElementById('btn-replay');
  const timelineWrapper = document.getElementById('timeline-wrapper');
  const timelinePlayed = document.getElementById('timeline-played');
  const currentTimeEl = document.getElementById('current-time');
  const totalTimeEl = document.getElementById('total-time');
  const playbackSpeed = document.getElementById('playback-speed');
  const autoNextToggle = document.getElementById('auto-next-toggle');
  const loopToggle = document.getElementById('loop-toggle');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // Details
  const detailId = document.getElementById('detail-id');
  const detailGroup = document.getElementById('detail-group');
  const detailDuration = document.getElementById('detail-duration');
  const detailVideoStatus = document.getElementById('detail-video-status');
  const detailGithubLink = document.getElementById('detail-github-link');
  const detailName = document.getElementById('detail-name');
  const btnCopyName = document.getElementById('btn-copy-name');
  const btnFavoriteToggle = document.getElementById('btn-favorite-toggle');
  const favBtnText = document.getElementById('fav-btn-text');

  // Modal & Toast
  const btnShortcuts = document.getElementById('btn-shortcuts');
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const toastNotification = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-msg');

  // Loader and Error Helpers
  function showLoader(show, subtext = null) {
    if (!videoLoader) return;
    if (show) {
      if (loaderSubtext) {
        loaderSubtext.textContent = subtext || VIDEO_SOURCES[currentSource].subtext;
      }
      videoLoader.style.display = 'flex';
    } else {
      videoLoader.style.display = 'none';
    }
  }

  function hideError() {
    if (videoErrorState) videoErrorState.style.display = 'none';
  }

  function showError(title, message, animId) {
    showLoader(false);
    if (!videoErrorState) return;
    if (errorTitle && title) errorTitle.textContent = title;
    if (errorMessage && message) errorMessage.textContent = message;
    if (btnOpenGithub && animId) {
      btnOpenGithub.href = `https://github.com/cozmo4hri/animations/blob/master/animation-set/${animId}.MOV.mp4`;
    }
    videoErrorState.style.display = 'flex';
  }

  function handleVideoError() {
    if (!selectedAnim || !selectedAnim.hasVideo) return;
    
    // Auto fallback order: jsdelivr <-> github-raw
    if (fallbackAttempts === 0) {
      fallbackAttempts++;
      const nextSource = currentSource === 'jsdelivr' ? 'github-raw' : 'jsdelivr';
      console.warn(`Video load failed with ${currentSource}, trying fallback ${nextSource}...`);
      showToast(`Đang chuyển nguồn dự phòng: ${VIDEO_SOURCES[nextSource].name}...`);
      
      const nextUrl = VIDEO_SOURCES[nextSource].getUrl(selectedAnim.id);
      showLoader(true, `Dự phòng: ${VIDEO_SOURCES[nextSource].subtext}`);
      detailVideoStatus.textContent = VIDEO_SOURCES[nextSource].badge;
      videoEl.src = nextUrl;
      videoEl.load();
      videoEl.play().catch(() => updatePlayButton(false));
      return;
    }
    
    showError(
      'Không thể phát video từ nguồn hiện tại',
      `Không thể phát video hoạt ảnh #${selectedAnim.id}. Vui lòng kiểm tra kết nối mạng hoặc thử đổi nguồn video sang GitHub Raw.`,
      selectedAnim.id
    );
  }

  // Load Saved Preferences
  function loadPreferences() {
    try {
      const savedFavs = localStorage.getItem('cozmo_favorites');
      if (savedFavs) {
        favorites = new Set(JSON.parse(savedFavs));
      }
      const savedAutoNext = localStorage.getItem('cozmo_auto_next');
      if (savedAutoNext !== null) {
        autoNext = savedAutoNext === 'true';
        autoNextToggle.checked = autoNext;
      }
      const savedSource = localStorage.getItem('cozmo_video_source');
      if (savedSource && VIDEO_SOURCES[savedSource]) {
        currentSource = savedSource;
      } else {
        currentSource = 'jsdelivr';
      }
      if (videoSourceSelect) {
        videoSourceSelect.value = currentSource;
      }
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  function saveFavorites() {
    try {
      localStorage.setItem('cozmo_favorites', JSON.stringify(Array.from(favorites)));
    } catch (e) {}
  }

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    toastMsg.textContent = msg;
    toastNotification.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 2400);
  }

  // Initialize Data
  async function initData() {
    loadPreferences();

    if (window.COZMO_ANIMATIONS && window.COZMO_ANIMATIONS.length > 0) {
      animations = window.COZMO_ANIMATIONS;
    } else {
      // Fallback: try fetching data from anim_record.csv
      try {
        const resp = await fetch('data/anim_record.csv');
        const text = await resp.text();
        const lines = text.split('\n');
        animations = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          const parts = line.split(',');
          if (parts.length >= 4) {
            const id = parseInt(parts[0]);
            const hasVideo = id <= 348;
            animations.push({
              id: id,
              name: parts[1],
              group: parts[2],
              duration: parts[3],
              hasVideo: hasVideo,
              videoSrc: hasVideo ? VIDEO_SOURCES[currentSource].getUrl(id) : null
            });
          }
        }
      } catch (err) {
        console.error('Failed to load CSV:', err);
      }
    }

    populateGroups();
    updateCounts();
    applyFilters();

    // Default selection
    if (filteredAnimations.length > 0) {
      selectAnimation(filteredAnimations[0], false);
    }
  }

  // Vietnamese Translations for Groups/Emotions
  const GROUP_TRANSLATIONS = {
    'admire': 'Ngưỡng mộ',
    'ask': 'Hỏi / Vòi vĩnh',
    'badword': 'Nói bậy / Giận dữ',
    'bored': 'Buồn chán',
    'celebrat': 'Ăn mừng',
    'dizzy': 'Chóng mặt',
    'fail': 'Thất bại',
    'find': 'Tìm kiếm',
    'found': 'Tìm thấy',
    'frustrated': 'Bực bội',
    'giggle': 'Cười khúc khích',
    'guarddog': 'Chó canh gác',
    'happy': 'Vui vẻ',
    'hello': 'Chào hỏi',
    'hiccup': 'Nấc cụt',
    'highenergy': 'Đầy năng lượng',
    'ideatoplay': 'Ý tưởng chơi',
    'like': 'Yêu thích',
    'lose': 'Thua trận',
    'lowenergy': 'Yếu pin',
    'match_no': 'Không khớp',
    'newarea': 'Khám phá mới',
    'petdetection': 'Nhận diện thú cưng',
    'playerno': 'Người chơi từ chối',
    'playeryes': 'Người chơi đồng ý',
    'reacttocube': 'Phản ứng với khối Cube',
    'reacttoface': 'Phản ứng với khuôn mặt',
    'reenrollment': 'Nhận diện lại',
    'request': 'Yêu cầu',
    'sleep': 'Đi ngủ',
    'struggle': 'Chật vật',
    'stuck': 'Bị kẹt',
    'succes': 'Thành công',
    'thankyou': 'Cảm ơn',
    'turbo': 'Tăng tốc',
    'turtleroll': 'Lật ngửa',
    'upgrade': 'Nâng cấp',
    'upset': 'Buồn bã',
    'wheely': 'Bốc đầu',
    'wiggle': 'Lắc lư',
    'win': 'Chiến thắng',
    'others': 'Khác'
  };

  function getGroupVN(grp) {
    return GROUP_TRANSLATIONS[grp] || grp;
  }

  // Populate Groups Dropdown
  function populateGroups() {
    const groups = new Set();
    animations.forEach(a => {
      if (a.group) groups.add(a.group);
    });

    const sortedGroups = Array.from(groups).sort();
    sortedGroups.forEach(grp => {
      const opt = document.createElement('option');
      opt.value = grp;
      opt.textContent = `${grp} (${getGroupVN(grp)})`;
      groupSelect.appendChild(opt);
    });
  }

  // Update Stats & Counts
  function updateCounts() {
    const totalCount = animations.length;
    const videoCount = animations.filter(a => a.hasVideo).length;
    const favCount = animations.filter(a => favorites.has(a.id)).length;

    chipCountVideo.textContent = videoCount;
    chipCountAll.textContent = totalCount;
    chipCountFav.textContent = favCount;

    document.getElementById('stat-videos-count').textContent = videoCount;
    document.getElementById('stat-total-count').textContent = totalCount;
  }

  // Filter & Sort Logic
  function applyFilters() {
    filteredAnimations = animations.filter(anim => {
      // Filter tab
      if (currentFilter === 'has-video' && !anim.hasVideo) return false;
      if (currentFilter === 'favorites' && !favorites.has(anim.id)) return false;

      // Group filter
      if (currentGroup !== 'all' && anim.group.toLowerCase() !== currentGroup.toLowerCase()) {
        return false;
      }

      // Search query (Supports both English and Vietnamese)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = anim.name.toLowerCase().includes(q);
        const matchId = anim.id.toString() === q || ('#' + anim.id) === q;
        const matchGroup = anim.group.toLowerCase().includes(q);
        const matchGroupVN = (GROUP_TRANSLATIONS[anim.group] || '').toLowerCase().includes(q);
        if (!matchName && !matchId && !matchGroup && !matchGroupVN) return false;
      }

      return true;
    });

    // Sort
    filteredAnimations.sort((a, b) => {
      if (currentSort === 'id-asc') return a.id - b.id;
      if (currentSort === 'id-desc') return b.id - a.id;
      if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
      if (currentSort === 'group-asc') return a.group.localeCompare(b.group) || a.id - b.id;
      return 0;
    });

    renderList();
  }

  // Render Animations List
  function renderList() {
    animListEl.innerHTML = '';
    resultsCountText.textContent = `Hiển thị ${filteredAnimations.length} hoạt ảnh`;

    if (filteredAnimations.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-list-state';
      emptyDiv.innerHTML = `
        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="1.5" fill="none">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <p>Không tìm thấy hoạt ảnh nào phù hợp.</p>
      `;
      animListEl.appendChild(emptyDiv);
      return;
    }

    filteredAnimations.forEach(anim => {
      const card = document.createElement('div');
      card.className = `anim-card ${selectedAnim && selectedAnim.id === anim.id ? 'active' : ''}`;
      card.dataset.id = anim.id;

      const isFav = favorites.has(anim.id);

      card.innerHTML = `
        <div class="anim-card-left">
          <div class="anim-card-top-row">
            <span class="anim-id">#${anim.id}</span>
            <span class="group-tag ${anim.group}" title="${anim.group} - ${getGroupVN(anim.group)}">${anim.group} • ${getGroupVN(anim.group)}</span>
          </div>
          <div class="anim-title" title="${anim.name}">${anim.name}</div>
        </div>
        <div class="anim-card-right">
          <span class="anim-duration">${anim.duration}</span>
          <div class="video-icon-indicator ${anim.hasVideo ? '' : 'disabled'}" title="${anim.hasVideo ? 'Có video MP4' : 'Chưa có video'}">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
              ${anim.hasVideo 
                ? '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>'
                : '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'
              }
            </svg>
          </div>
          <button class="fav-card-btn ${isFav ? 'favorited' : ''}" title="${isFav ? 'Bỏ yêu thích' : 'Yêu thích'}" data-fav-id="${anim.id}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </button>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.fav-card-btn')) {
          toggleFavorite(anim.id);
          return;
        }
        selectAnimation(anim, true);
      });

      animListEl.appendChild(card);
    });
  }

  // Select Animation & Update View
  function selectAnimation(anim, autoPlay = true) {
    if (!anim) return;
    selectedAnim = anim;
    fallbackAttempts = 0;
    hideError();

    // Update Detail Panel
    detailId.textContent = `#${anim.id}`;
    detailGroup.textContent = `${anim.group} (${getGroupVN(anim.group)})`;
    detailGroup.className = `group-pill ${anim.group}`;
    detailDuration.textContent = `⏱ ${anim.duration}`;
    detailName.textContent = anim.name;

    if (detailGithubLink) {
      if (anim.hasVideo) {
        detailGithubLink.href = `https://github.com/cozmo4hri/animations/blob/master/animation-set/${anim.id}.MOV.mp4`;
        detailGithubLink.style.display = 'inline-flex';
      } else {
        detailGithubLink.style.display = 'none';
      }
    }

    const isFav = favorites.has(anim.id);
    btnFavoriteToggle.classList.toggle('favorited', isFav);
    favBtnText.textContent = isFav ? 'Đã yêu thích' : 'Yêu thích';

    // Update List Active State
    const cards = animListEl.querySelectorAll('.anim-card');
    cards.forEach(c => {
      if (parseInt(c.dataset.id) === anim.id) {
        c.classList.add('active');
        c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        c.classList.remove('active');
      }
    });

    // Handle Video Loading
    if (anim.hasVideo) {
      noVideoState.style.display = 'none';
      if (videoErrorState) videoErrorState.style.display = 'none';
      videoEl.style.display = 'block';

      const sourceConfig = VIDEO_SOURCES[currentSource] || VIDEO_SOURCES.jsdelivr;
      detailVideoStatus.textContent = sourceConfig.badge;
      detailVideoStatus.style.color = 'var(--accent-emerald)';

      const targetSrc = sourceConfig.getUrl(anim.id);

      showLoader(true, sourceConfig.subtext);
      videoEl.src = targetSrc;
      videoEl.playbackRate = parseFloat(playbackSpeed.value);
      videoEl.loop = isLooping;

      if (autoPlay) {
        videoEl.play().catch(e => {
          console.log('Autoplay deferred, click to play:', e);
          updatePlayButton(false);
        });
      } else {
        updatePlayButton(false);
      }
    } else {
      showLoader(false);
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
      videoEl.style.display = 'none';
      videoOverlay.classList.remove('hidden');
      noVideoState.style.display = 'flex';
      detailVideoStatus.textContent = '○ Chưa có video ghi hình';
      detailVideoStatus.style.color = 'var(--text-muted)';
      updatePlayButton(false);
      currentTimeEl.textContent = '00:00.0';
      totalTimeEl.textContent = anim.duration;
      timelinePlayed.style.width = '0%';
    }
  }

  // Toggle Favorite
  function toggleFavorite(id) {
    if (favorites.has(id)) {
      favorites.delete(id);
      showToast(`Đã xóa animation #${id} khỏi yêu thích`);
    } else {
      favorites.add(id);
      showToast(`Đã thêm animation #${id} vào yêu thích ⭐`);
    }
    saveFavorites();
    updateCounts();

    if (currentFilter === 'favorites') {
      applyFilters();
    } else {
      // Update individual card and detail star
      const card = animListEl.querySelector(`.anim-card[data-id="${id}"]`);
      if (card) {
        const favBtn = card.querySelector('.fav-card-btn');
        const isFav = favorites.has(id);
        favBtn.classList.toggle('favorited', isFav);
        favBtn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
      }
      if (selectedAnim && selectedAnim.id === id) {
        const isFav = favorites.has(id);
        btnFavoriteToggle.classList.toggle('favorited', isFav);
        favBtnText.textContent = isFav ? 'Đã yêu thích' : 'Yêu thích';
      }
    }
  }

  // Play / Pause Toggle
  function togglePlay() {
    if (!selectedAnim || !selectedAnim.hasVideo) return;
    if (videoEl.paused || videoEl.ended) {
      videoEl.play();
    } else {
      videoEl.pause();
    }
  }

  function updatePlayButton(isPlaying) {
    if (isPlaying) {
      iconPlay.style.display = 'none';
      iconPause.style.display = 'inline-block';
      playBtnText.textContent = 'Tạm dừng';
      videoOverlay.classList.add('hidden');
    } else {
      iconPlay.style.display = 'inline-block';
      iconPause.style.display = 'none';
      playBtnText.textContent = 'Phát';
      videoOverlay.classList.remove('hidden');
    }
  }

  // Navigate Next / Prev
  function playNext() {
    if (filteredAnimations.length === 0) return;
    let currentIndex = filteredAnimations.findIndex(a => selectedAnim && a.id === selectedAnim.id);
    if (currentIndex === -1) currentIndex = 0;
    
    let nextIndex = currentIndex + 1;
    if (nextIndex >= filteredAnimations.length) {
      nextIndex = 0; // Loop around to start
    }
    selectAnimation(filteredAnimations[nextIndex], true);
  }

  function playPrev() {
    if (filteredAnimations.length === 0) return;
    let currentIndex = filteredAnimations.findIndex(a => selectedAnim && a.id === selectedAnim.id);
    if (currentIndex === -1) currentIndex = 0;
    
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = filteredAnimations.length - 1;
    }
    selectAnimation(filteredAnimations[prevIndex], true);
  }

  function replayCurrent() {
    if (!selectedAnim || !selectedAnim.hasVideo) return;
    videoEl.currentTime = 0;
    videoEl.play();
  }

  // Format Time Helper
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  }

  // Event Listeners Setup
  function setupEvents() {
    // Video Events
    videoEl.addEventListener('loadstart', () => {
      if (selectedAnim && selectedAnim.hasVideo) {
        showLoader(true);
        hideError();
      }
    });

    videoEl.addEventListener('loadeddata', () => {
      showLoader(false);
      hideError();
    });

    videoEl.addEventListener('canplay', () => {
      showLoader(false);
      hideError();
    });

    videoEl.addEventListener('waiting', () => {
      if (selectedAnim && selectedAnim.hasVideo && !videoEl.paused) {
        showLoader(true, 'Đang tải đệm...');
      }
    });

    videoEl.addEventListener('playing', () => {
      showLoader(false);
      hideError();
      updatePlayButton(true);
    });

    videoEl.addEventListener('play', () => updatePlayButton(true));
    videoEl.addEventListener('pause', () => updatePlayButton(false));
    videoEl.addEventListener('ended', () => {
      updatePlayButton(false);
      if (autoNext && !isLooping) {
        playNext();
      }
    });

    videoEl.addEventListener('error', () => {
      handleVideoError();
    });

    videoEl.addEventListener('timeupdate', () => {
      if (videoEl.duration) {
        const percent = (videoEl.currentTime / videoEl.duration) * 100;
        timelinePlayed.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(videoEl.currentTime);
        totalTimeEl.textContent = formatTime(videoEl.duration);
      }
    });

    // Timeline seek
    timelineWrapper.addEventListener('click', (e) => {
      if (!videoEl.duration) return;
      const rect = timelineWrapper.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoEl.currentTime = pos * videoEl.duration;
    });

    // Video Click & Overlay
    videoEl.addEventListener('click', togglePlay);
    videoOverlay.addEventListener('click', togglePlay);

    // Playback buttons
    btnPlayPause.addEventListener('click', togglePlay);
    btnNext.addEventListener('click', playNext);
    btnPrev.addEventListener('click', playPrev);
    btnReplay.addEventListener('click', replayCurrent);

    // Speed Selector
    playbackSpeed.addEventListener('change', (e) => {
      videoEl.playbackRate = parseFloat(e.target.value);
    });

    // Auto-Next Toggle
    autoNextToggle.addEventListener('change', (e) => {
      autoNext = e.target.checked;
      try { localStorage.setItem('cozmo_auto_next', autoNext); } catch (err) {}
      showToast(autoNext ? 'Đã bật tự chuyển tiếp' : 'Đã tắt tự chuyển tiếp');
    });

    // Loop Toggle
    loopToggle.addEventListener('change', (e) => {
      isLooping = e.target.checked;
      videoEl.loop = isLooping;
      showToast(isLooping ? 'Đã bật chế độ lặp vô tận' : 'Đã tắt lặp');
    });

    // Fullscreen
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen();
      }
    });

    // Copy Buttons
    btnCopyName.addEventListener('click', () => {
      if (!selectedAnim) return;
      navigator.clipboard.writeText(selectedAnim.name).then(() => {
        showToast('Đã sao chép tên hoạt ảnh! 📋');
      });
    });

    // Favorite Button in details
    btnFavoriteToggle.addEventListener('click', () => {
      if (!selectedAnim) return;
      toggleFavorite(selectedAnim.id);
    });

    // Search Box
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      btnClearSearch.style.display = searchQuery ? 'block' : 'none';
      applyFilters();
    });

    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      btnClearSearch.style.display = 'none';
      applyFilters();
      searchInput.focus();
    });

    // Filter Chips
    filterChips.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      filterChips.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });

    // Group & Sort Selects
    groupSelect.addEventListener('change', (e) => {
      currentGroup = e.target.value;
      applyFilters();
    });

    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
    });

    // Video Source Switcher
    if (videoSourceSelect) {
      videoSourceSelect.addEventListener('change', (e) => {
        currentSource = e.target.value;
        try {
          localStorage.setItem('cozmo_video_source', currentSource);
        } catch (err) {}

        const srcCfg = VIDEO_SOURCES[currentSource];
        showToast(`Đã chuyển nguồn video: ${srcCfg ? srcCfg.name : currentSource}`);

        if (selectedAnim && selectedAnim.hasVideo) {
          selectAnimation(selectedAnim, true);
        }
      });
    }

    // Video Retry Action
    if (btnRetryVideo) {
      btnRetryVideo.addEventListener('click', () => {
        hideError();
        if (selectedAnim && selectedAnim.hasVideo) {
          fallbackAttempts = 0;
          selectAnimation(selectedAnim, true);
        }
      });
    }

    // Modal Shortcuts
    btnShortcuts.addEventListener('click', () => {
      shortcutsModal.style.display = 'flex';
    });

    btnCloseModal.addEventListener('click', () => {
      shortcutsModal.style.display = 'none';
    });

    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) {
        shortcutsModal.style.display = 'none';
      }
    });

    // Global Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // If typing in input, don't trigger media shortcuts
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
        return;
      }

      if (e.key === 'Escape') {
        shortcutsModal.style.display = 'none';
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'ArrowRight') {
        e.preventDefault();
        playNext();
      } else if (e.key === 'b' || e.key === 'B' || e.key === 'ArrowLeft') {
        e.preventDefault();
        playPrev();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        replayCurrent();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        playPrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playNext();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        btnFullscreen.click();
      } else if (e.key === 'm' || e.key === 'M') {
        videoEl.muted = !videoEl.muted;
        showToast(videoEl.muted ? 'Đã tắt tiếng (Muted)' : 'Đã bật tiếng');
      } else if (e.key === '?') {
        shortcutsModal.style.display = 'flex';
      }
    });
  }

  // Start Application
  window.addEventListener('DOMContentLoaded', () => {
    setupEvents();
    initData();
  });
})();
