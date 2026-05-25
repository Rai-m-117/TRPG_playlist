async function loadSessions() {

  const response = await fetch("data.json");
  const sessions = await response.json();

  setupFilters(sessions);
  renderCards(sessions);
}

function setupFilters(sessions) {

  const systemFilter = document.getElementById("systemFilter");
  const yearFilter = document.getElementById("yearFilter");
  const kpFilter = document.getElementById("kpFilter");
  const playerFilter = document.getElementById("playerFilter");
  const sortFilter = document.getElementById("sortFilter");
  const searchInput = document.getElementById("searchInput");

  const systems = [...new Set(sessions.map(s => s.system))];
  const years = [...new Set(sessions.map(s => s.year))];
  const kps = [...new Set(sessions.flatMap(s => s.kps))];
  const players = [...new Set(sessions.flatMap(s => s.players))];

  systems.forEach(v => systemFilter.innerHTML += `<option value="${v}">${v}</option>`);
  years.sort((a,b)=>b-a).forEach(v => yearFilter.innerHTML += `<option value="${v}">${v}</option>`);
  kps.sort().forEach(v => kpFilter.innerHTML += `<option value="${v}">${v}</option>`);
  players.sort().forEach(v => playerFilter.innerHTML += `<option value="${v}">${v}</option>`);

  function update() {

    const text = searchInput.value.toLowerCase();

    const filtered = sessions.filter(s => {

      return (
        s.title.toLowerCase().includes(text) &&
        (!systemFilter.value || s.system === systemFilter.value) &&
        (!yearFilter.value || s.year == yearFilter.value) &&
        (!kpFilter.value || s.kps.includes(kpFilter.value)) &&
        (!playerFilter.value || s.players.includes(playerFilter.value))
      );

    });

    const sort = sortFilter.value;

    if (sort === "title") filtered.sort((a,b)=>a.title.localeCompare(b.title,"ja"));
    if (sort === "year") filtered.sort((a,b)=>b.year-a.year);
    if (sort === "system") filtered.sort((a,b)=>a.system.localeCompare(b.system,"ja"));
    if (sort === "duration") filtered.sort((a,b)=>a.durationSort-b.durationSort);

    renderCards(filtered);
  }

  searchInput.addEventListener("input", update);
  systemFilter.addEventListener("change", update);
  yearFilter.addEventListener("change", update);
  kpFilter.addEventListener("change", update);
  playerFilter.addEventListener("change", update);
  sortFilter.addEventListener("change", update);
}

function renderCards(sessions) {

  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  sessions.forEach(session => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img class="thumbnail" src="${session.thumbnail}" alt="">
      <div class="content">

        <div class="title">${session.title}</div>

        <div class="meta">
          ${session.system} / ${session.date} / ${session.duration}
        </div>

        ${
          session.videoType === "playlist"
          ? `<a class="playlist-button" href="${session.playlistUrl}" target="_blank">再生リスト</a>`
          : `<div class="part-buttons">
              ${session.partLinks.map(p =>
                `<a class="playlist-button" href="${p.url}" target="_blank">${p.name}</a>`
              ).join("")}
            </div>`
        }

        <div class="detail">
          <div class="detail-title">KP</div>
          <div>${session.kps.join(" / ")}</div>

          <div class="detail-title">PL</div>
          <div>${session.players.join(" / ")}</div>

          ${
            session.memo
              ? `<div class="memo">${session.memo}</div>`
              : ""
          }
        </div>

      </div>
    `;

    const detail = card.querySelector(".detail");

    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("playlist-button")) return;
      detail.classList.toggle("open");
    });

    container.appendChild(card);
  });
}

loadSessions();