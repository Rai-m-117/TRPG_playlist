// data.jsonを読み込み、初期表示を行う
async function loadSessions() {

  const response = await fetch("data.json");
  const sessions = await response.json();

  // フィルターを初期化
  setupFilters(sessions);

  // 全カードを表示
  renderCards(sessions);
}

// フィルターや検索機能を設定
function setupFilters(sessions) {

  const systemFilter = document.getElementById("systemFilter");
  const yearFilter = document.getElementById("yearFilter");
  const kpFilter = document.getElementById("kpFilter");
  const playerFilter = document.getElementById("playerFilter");
  const sortFilter = document.getElementById("sortFilter");
  const searchInput = document.getElementById("searchInput");

  // 重複を除いた一覧を取得
  const systems = [...new Set(sessions.map(s => s.system))];
  const years = [...new Set(sessions.map(s => s.year))];
  const kps = [...new Set(sessions.flatMap(s => s.kps))];
  const players = [...new Set(sessions.flatMap(s => s.players))];

  // プルダウンに項目を追加
  systems.forEach(v => systemFilter.innerHTML += `<option value="${v}">${v}</option>`);
  years.sort((a,b)=>b-a).forEach(v => yearFilter.innerHTML += `<option value="${v}">${v}</option>`);
  kps.sort().forEach(v => kpFilter.innerHTML += `<option value="${v}">${v}</option>`);
  players.sort().forEach(v => playerFilter.innerHTML += `<option value="${v}">${v}</option>`);

  // 検索・絞り込み・並び替え実行
  function update() {

    const text = searchInput.value.toLowerCase();

    // 条件に一致するセッションのみ抽出
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

    // 並び替え
    if (sort === "title") filtered.sort((a,b)=>a.title.localeCompare(b.title,"ja"));
    if (sort === "year") filtered.sort((a,b)=>b.year-a.year);
    if (sort === "system") filtered.sort((a,b)=>a.system.localeCompare(b.system,"ja"));
    if (sort === "duration") filtered.sort((a,b)=>a.durationSort-b.durationSort);

    // 再描画
    renderCards(filtered);
  }

  // 各入力の変更を監視
  searchInput.addEventListener("input", update);
  systemFilter.addEventListener("change", update);
  yearFilter.addEventListener("change", update);
  kpFilter.addEventListener("change", update);
  playerFilter.addEventListener("change", update);
  sortFilter.addEventListener("change", update);
}

// セッションカードを生成して表示
function renderCards(sessions) {

  const container = document.getElementById("cardContainer");

  // 一旦中身を空にする
  container.innerHTML = "";

  sessions.forEach(session => {

    // カード生成
    const card = document.createElement("div");
    card.className = "card";

    // カード内容を設定
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

    // 詳細欄を取得
    const detail = card.querySelector(".detail");

    // カードクリックで詳細開閉
    card.addEventListener("click", (e) => {

      // 再生リストボタンは開閉対象外
      if (e.target.classList.contains("playlist-button")) return;

      detail.classList.toggle("open");
    });

    // カードを画面に追加
    container.appendChild(card);
  });
}

// 初期起動
loadSessions();