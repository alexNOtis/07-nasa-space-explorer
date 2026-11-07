// Find our date picker inputs, button, and gallery on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const API_KEY = 'DEMO_KEY';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Fetch NASA images and display pictures from the selected date range
getImagesButton.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Make sure the user picked both dates
  if (!startDate || !endDate) {
    gallery.innerHTML = '<p class="placeholder">Please select both dates.</p>';
    return;
  }

  gallery.innerHTML = '<p class="placeholder">🔄 Loading space photos...</p>';

  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}&thumbs=true`;

  fetch(apiUrl)
    .then((response) => {
      // If NASA sent back an error, give the user a helpful message
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a bit, or use your own NASA API key.');
      }
      if (!response.ok) {
        throw new Error('NASA could not give us images for those dates. Please try different dates.');
      }
      return response.json();
    })
    .then((data) => {
      // APOD gives us an array with one entry per day
      if (data.length === 0) {
        gallery.innerHTML = '<p class="placeholder">No images were found for this date range.</p>';
        return;
      }

      // Clear the loading message
      gallery.innerHTML = '';

      // Show the newest pictures first
      data.reverse().forEach((item) => {
        let imageUrl = item.url;
        if (item.media_type === 'video') {
          imageUrl = item.thumbnail_url || 'img/NASA-Logo-Large.jpg';
        }

        // Videos can't be shown as an image, so add a link to watch them
        const videoLink = item.media_type === 'video'
          ? `<p><a href="${item.url}" target="_blank" rel="noopener">▶ Watch the video</a></p>`
          : '';

        // Build one gallery card
        // If the picture fails to load, onerror swaps in the NASA logo instead
        const galleryItem = document.createElement('article');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
          <img
            src="${imageUrl}"
            alt="${item.title}"
            onerror="this.onerror=null; this.src='img/NASA-Logo-Large.jpg'; this.classList.add('image-unavailable');"
          />
          <div class="gallery-item-content">
            <h2>${item.title}</h2>
            <p class="gallery-date">${item.date}</p>
            <p>${item.explanation}</p>
            ${videoLink}
          </div>
        `;

        // Add the card to the page
        gallery.appendChild(galleryItem);
      });
    })
    .catch((error) => {
      // Show any error message on the page
      gallery.innerHTML = `<p class="placeholder">${error.message}</p>`;
    });
});