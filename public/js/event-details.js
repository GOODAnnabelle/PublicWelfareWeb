// Event details page JavaScript file

// Get URL parameter
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Show error message
function showError(container, message) {
  container.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>${message}</p>
    </div>
  `;
}

// Format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, starting to fetch event details');
  // Get event ID and load details
  const eventId = getUrlParameter('id');
  console.log('Retrieved event ID:', eventId);
  if (eventId) {
    fetchEventDetails(eventId);
  } else {
    const detailsContainer = document.getElementById('event-details').querySelector('.container');
    showError(detailsContainer, 'Event ID not found, please return to homepage and select an event again');
  }
});

// Fetch event details
async function fetchEventDetails(eventId) {
  console.log('Starting to fetch event details, ID:', eventId);
  const detailsContainer = document.getElementById('event-details').querySelector('.container');
  console.log('Found container element:', detailsContainer);
  
  try {
    console.log('Sending API request:', `${API_BASE_URL}/events/${eventId}`);
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    console.log('API response status:', response.status, response.ok);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error('Failed to fetch event details');
    }
    
    const event = await response.json();
    console.log('Retrieved event data:', event);
    renderEventDetails(event, detailsContainer);
  } catch (error) {
    console.error('Failed to fetch event details:', error);
    showError(detailsContainer, error.message || 'Failed to fetch event details, please try again later');
  }
}

// Render event details
function renderEventDetails(event, container) {
  console.log('Starting to render event details:', event);
  
  // Use event's image URL, if not available use default image
  const imageUrl = event.image_url || `https://picsum.photos/800/400?random=${event.event_id}`;
  console.log('Using image URL:', imageUrl);
  
  // Category tags
  const categoryTags = (event.categories && event.categories.length > 0) 
    ? event.categories.map(category => 
        `<span class="category-tag">${category.name}</span>`
      ).join('')
    : '<span class="category-tag">Charity Activity</span>';
  
  container.innerHTML = `
    <div class="event-header">
      <h1>${event.title}</h1>
      <div class="event-meta">
        <div class="meta-item">
          <i class="fas fa-calendar"></i>
          <span>${formatDate(event.start_date)} - ${formatDate(event.end_date)}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${event.city}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-building"></i>
          <span>${event.charity_name}</span>
        </div>
      </div>
      <div class="event-categories">
        ${categoryTags}
      </div>
    </div>
    
    <div class="event-image-large" style="background-image: url('${imageUrl}')"></div>
    
    <div class="event-description">
      <h2>Event Details</h2>
      <p>${event.description}</p>
    </div>
    
    <div class="charity-info">
      <h3>Organizer Information</h3>
      <p>${event.charity_description || 'No detailed description available'}</p>
      <div class="charity-contact">
        ${event.charity_website ? `<p><strong>Website:</strong> <a href="${event.charity_website}" target="_blank">${event.charity_website}</a></p>` : ''}
        ${event.charity_email ? `<p><strong>Email:</strong> ${event.charity_email}</p>` : ''}
        ${event.charity_phone ? `<p><strong>Phone:</strong> ${event.charity_phone}</p>` : ''}
      </div>
    </div>
    
    <div class="back-button">
      <a href="index.html" class="btn btn-secondary">Back to Home</a>
    </div>
  `;
}