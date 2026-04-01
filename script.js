document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const memeGrid = document.getElementById("memeGrid");
  const searchInputDesktop = document.getElementById("searchInputDesktop");
  const searchInputMobile = document.getElementById("searchInputMobile");
  const mobileSearchBtn = document.getElementById("mobileSearchBtn");
  const mobileSearchContainer = document.getElementById("mobileSearchContainer");
  const errorContainer = document.getElementById("errorContainer");
  const errorMessageEl = document.getElementById("errorMessage");
  const loadMoreContainer = document.getElementById("loadMoreContainer");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const sortBtn = document.getElementById("sortBtn");
  const sortBtnMobile = document.getElementById("sortBtnMobile");

  // State
  let allMemes = [];
  let displayedMemes = [];
  let isSortedAlpha = false;
  const memesPerPage = 12;
  let currentPage = 1;

  // Imgflip API URL
  const GET_MEMES_API = "https://api.imgflip.com/get_memes";

  // Init App
  const init = async () => {
    try {
      const response = await fetch(GET_MEMES_API);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonStr = await response.json();
      
      if (jsonStr.success) {
        allMemes = jsonStr.data.memes;
        // Keep a copy of initial order
        allMemes = allMemes.map(meme => ({ ...meme }));
        
        // Hide Skeleton and render first batch
        memeGrid.innerHTML = "";
        applyFiltersAndRender();
      } else {
        throw new Error(jsonStr.error_message || "Failed to parse meme data");
      }
    } catch (error) {
      console.error("Error fetching memes:", error);
      showError(error.message);
    }
  };

  // Create Meme Card DOM Element using Neon Pulse Design
  const createMemeCard = (meme, index) => {
    // Generate some fake "social" numbers to match the design vibe
    const likes = (Math.random() * 50 + 1).toFixed(1) + "k";
    const comments = Math.floor(Math.random() * 900 + 100);
    const author = "@" + meme.name.substring(0, 8).replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 99);
    
    // Some logic to vary the card aspect ratio slightly like the mockup
    const aspectClass = index % 4 === 1 ? "aspect-square" : "aspect-[4/5]";
    
    const div = document.createElement("div");
    div.className = "group relative bg-surface-container rounded-lg overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-surface-container-high shadow-xl border border-outline-variant/10";
    
    div.innerHTML = `
      <div class="${aspectClass} w-full overflow-hidden bg-surface-container-highest">
        <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
             loading="lazy" 
             alt="${meme.name}" 
             src="${meme.url}"/>
      </div>
      <div class="p-6">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-headline text-xl font-bold leading-tight group-hover:text-primary transition-colors pr-2">${meme.name}</h3>
          <span class="text-xs font-label text-on-surface-variant mt-1 uppercase tracking-tighter shrink-0">${author}</span>
        </div>
        <div class="flex items-center justify-between mt-auto pt-2">
          <div class="flex gap-4">
            <button class="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors active:scale-90">
              <span class="material-symbols-outlined text-xl" data-icon="favorite">favorite</span>
              <span class="text-sm font-label font-semibold">${likes}</span>
            </button>
            <button class="flex items-center gap-1.5 text-on-surface-variant hover:text-secondary transition-colors active:scale-90">
              <span class="material-symbols-outlined text-xl" data-icon="mode_comment">mode_comment</span>
              <span class="text-sm font-label font-semibold">${comments}</span>
            </button>
          </div>
          <button class="text-on-surface-variant hover:text-tertiary transition-colors active:scale-90">
            <span class="material-symbols-outlined text-xl" data-icon="bookmark">bookmark</span>
          </button>
        </div>
      </div>
    `;
    return div;
  };

  const applyFiltersAndRender = () => {
    let query = searchInputDesktop.value.toLowerCase() || searchInputMobile.value.toLowerCase();
    
    let filtered = allMemes.filter((meme) => meme.name.toLowerCase().includes(query));
    
    if (isSortedAlpha) {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    displayedMemes = filtered;
    currentPage = 1;
    memeGrid.innerHTML = "";
    renderPageChunk();
  };

  const renderPageChunk = () => {
    const startIndex = (currentPage - 1) * memesPerPage;
    const endIndex = startIndex + memesPerPage;
    const chunkToRender = displayedMemes.slice(startIndex, endIndex);
    
    chunkToRender.forEach((meme, i) => {
      memeGrid.appendChild(createMemeCard(meme, startIndex + i));
    });

    // Handle "Load More" visibility
    if (endIndex < displayedMemes.length) {
      loadMoreContainer.classList.remove("hidden");
      loadMoreContainer.classList.add("flex");
    } else {
      loadMoreContainer.classList.add("hidden");
      loadMoreContainer.classList.remove("flex");
    }

    if (displayedMemes.length === 0) {
        memeGrid.innerHTML = `<div class="col-span-full py-12 text-center text-on-surface-variant"><p>No memes found in the abyss.</p></div>`;
    }
  };

  // Error Output
  const showError = (msg) => {
    memeGrid.innerHTML = ""; // Clear skeletons
    errorContainer.classList.remove("hidden");
    errorContainer.classList.add("flex");
    errorMessageEl.textContent = msg;
  };

  // Events
  searchInputDesktop.addEventListener("input", applyFiltersAndRender);
  searchInputMobile.addEventListener("input", applyFiltersAndRender);
  
  mobileSearchBtn.addEventListener("click", () => {
      mobileSearchContainer.classList.toggle("hidden");
      if(!mobileSearchContainer.classList.contains("hidden")) {
          searchInputMobile.focus();
      }
  });

  loadMoreBtn.addEventListener("click", () => {
    currentPage++;
    renderPageChunk();
  });

  const toggleSort = (e) => {
      e.preventDefault();
      isSortedAlpha = !isSortedAlpha;
      
      const icons = [sortBtn.querySelector('.material-symbols-outlined'), sortBtnMobile.querySelector('.material-symbols-outlined')];
      
      icons.forEach(icon => {
          if(isSortedAlpha) {
              icon.style.color = 'var(--primary)';
          } else {
              icon.style.color = '';
          }
      });
      
      applyFiltersAndRender();
  };

  sortBtn.addEventListener("click", toggleSort);
  sortBtnMobile.addEventListener("click", toggleSort);

  // Run
  init();
});
