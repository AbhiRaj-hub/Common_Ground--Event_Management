const grid = document.getElementById("events-grid");
const searchInput = document.getElementById("search-input");
const filterButtons = document.querySelectorAll(".filter-btn");

let activeCategory = "All";
let searchQuery = "";

function renderEvents(eventsList) {
    grid.innerHTML = "";
    if (eventsList.length === 0) {
        grid.innerHTML = `<div class="empty-state">No matching events found.</div>`;
        return;
    }

    eventsList.forEach(evt => {
        const card = document.createElement("article");
        card.className = "event-card";
        card.innerHTML = `
            <div>
                <span class="badge">${evt.category}</span>
                <h3>${evt.name}</h3>
                <p class="event-desc">${evt.description}</p>
            </div>
            <div>
                <div class="event-meta">
                    <span>Date: ${evt.date} at ${evt.time}</span>
                    <span>Venue: ${evt.venue}</span>
                    <span>Capacity: ${evt.seats} seats</span>
                </div>
                <button class="btn" data-id="${evt.id}">Register</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function applyFilters() {
    const filtered = EVENTS_DATA.filter(evt => {
        const matchesCategory = activeCategory === "All" || evt.category === activeCategory;
        const matchesSearch = evt.name.toLowerCase().includes(searchQuery) ||
                              evt.venue.toLowerCase().includes(searchQuery) ||
                              evt.description.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    renderEvents(filtered);
}

searchInput.addEventListener("input", e => {
    searchQuery = e.target.value.trim().toLowerCase();
    applyFilters();
});

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCategory = btn.dataset.category;
        applyFilters();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    renderEvents(EVENTS_DATA);
});
