// 最初に実行
async function loadSessions() {

  // data.json取得
  const response =
    await fetch("data.json");

  // JSON化
  const sessions =
    await response.json();

  // フィルタ設定
  setupFilters(sessions);

  // カード表示
  renderCards(sessions);

}

// フィルタ設定
function setupFilters(sessions) {

  // HTML取得
  const systemFilter =
    document.getElementById("systemFilter");

  const yearFilter =
    document.getElementById("yearFilter");

  const kpFilter =
    document.getElementById("kpFilter");

  const playerFilter =
    document.getElementById("playerFilter");

  const sortFilter =
  document.getElementById("sortFilter");

  // システム一覧
  const systems =
    [...new Set(
      sessions.map(session => session.system)
    )];

  // 年一覧
  const years =
    [...new Set(
      sessions.map(session => session.year)
    )];

  // KP一覧
   const kps =
     [...new Set(
       sessions.flatMap(session => session.kps)
     )];

  // PL一覧
  const players =
    [...new Set(
      sessions.flatMap(session => session.players)
    )];

  // システム追加
  systems.forEach(system => {

    systemFilter.innerHTML += `
      <option value="${system}">
        ${system}
      </option>
    `;

  });

  // 年降順
  years.sort((a, b) => b - a);

  // 年追加
  years.forEach(year => {

    yearFilter.innerHTML += `
      <option value="${year}">
        ${year}
      </option>
    `;

  });

  // KP追加
  kps.sort();

  kps.forEach(kp => {

    kpFilter.innerHTML += `
      <option value="${kp}">
        ${kp}
      </option>
    `;

  });

  // PL追加
  players.sort();

  players.forEach(player => {

    playerFilter.innerHTML += `
      <option value="${player}">
        ${player}
      </option>
    `;

  });

  // 検索欄取得
  const searchInput =
    document.getElementById("searchInput");

  // フィルタ更新
  function updateFilter() {

    // 入力値取得
    const searchText =
      searchInput.value.toLowerCase();

    const selectedSystem =
      systemFilter.value;

    const selectedYear =
      yearFilter.value;

    const selectedKp =
      kpFilter.value;

    const selectedPlayer =
      playerFilter.value;
    
    const selectedSort =
      sortFilter.value;

    // 条件一致卓抽出
    const filtered =
      sessions.filter(session => {

        const matchesTitle =
          session.title
            .toLowerCase()
            .includes(searchText);

        const matchesSystem =
          !selectedSystem ||
          session.system === selectedSystem;

        const matchesYear =
          !selectedYear ||
          session.year == selectedYear;

        const matchesKp =
          !selectedKp ||
          session.kps.includes(selectedKp);

        const matchesPlayer =
          !selectedPlayer ||
          session.players.includes(selectedPlayer);

        return (
          matchesTitle &&
          matchesSystem &&
          matchesYear &&
          matchesKp &&
          matchesPlayer
        );

      });

      // シナリオ名順
      if (selectedSort === "title") {

        filtered.sort((a, b) =>
          a.title.localeCompare(b.title, "ja")
        );

      }

      // 通過年順
      if (selectedSort === "year") {

        filtered.sort((a, b) =>
          b.year - a.year
        );

      }

      // システム順
      if (selectedSort === "system") {

        filtered.sort((a, b) =>
          a.system.localeCompare(b.system, "ja")
        );

      }

      // 総時間順
      if (selectedSort === "duration") {

        filtered.sort((a, b) =>
          a.durationSort - b.durationSort
        );

      }


  // 再描画
    renderCards(filtered);

  }

  // イベント監視
  searchInput.addEventListener(
    "input",
    updateFilter
  );

  systemFilter.addEventListener(
    "change",
    updateFilter
  );

  yearFilter.addEventListener(
    "change",
    updateFilter
  );

  kpFilter.addEventListener(
    "change",
    updateFilter
  );

  playerFilter.addEventListener(
    "change",
    updateFilter
  );

  sortFilter.addEventListener(
    "change",
    updateFilter
  );

}

// カード表示
function renderCards(sessions) {

  // 表示場所
  const cardContainer =
    document.getElementById("cardContainer");

  // 初期化
  cardContainer.innerHTML = "";

  // 卓ごと
  sessions.forEach(session => {

    // カード生成
    const card =
      document.createElement("div");

    card.className = "card";

    // HTML生成
    card.innerHTML = `

      <!-- サムネ -->
      <img
        class="thumbnail"
        src="${session.thumbnail}"
        alt="${session.title}">

      <div class="content">

        <!-- タイトル -->
        <div class="title">
          ${session.title}
        </div>

        <!-- システム・年月・時間 -->
        <div class="meta">
          ${session.system}
          /
          ${session.date}
          /
          ${session.duration}
        </div>

        ${
          session.videoType === "playlist"

            ? `

              <!-- 再生リスト -->
              <a
                class="playlist-button"
                href="${session.playlistUrl}"
                target="_blank">
                再生リスト
              </a>

            `
            : `
              <!-- Partボタン -->
             <div class="part-buttons">
                ${session.partLinks.map(part => `
                 <a
                    class="playlist-button"
                    href="${part.url}"
                    target="_blank">
                    ${part.name}
                   </a>
                `).join("")}

              </div>
            `
        }

        </a>

        <!-- 折り畳み詳細 -->
        <div class="detail">

          <!-- KP -->
          <div class="detail-title">
            KP
          </div>

          <div>
           ${session.kps.join(" / ")}
          </div>

          <!-- PL -->
          <div class="detail-title">
            PL
          </div>

          <div>
            ${session.players.join(" / ")}
          </div>

          ${
            session.memo
              ? `
                <!-- メモ -->
                <div class="detail-title">
                  メモ
                </div>
                <div class="memo">
                  ${session.memo}
                </div>
              `
              : ""
          }

        </div>

      </div>

    `;

    // detail取得
    const detail =
      card.querySelector(".detail");

    // カードクリック
    card.addEventListener("click", (event) => {

      // ボタン押した時は無視
      if (
        event.target.classList.contains(
          "playlist-button"
        )
      ) {
        return;
      }

      // 開閉
      detail.classList.toggle("open");

    });

    // カード追加
    cardContainer.appendChild(card);

  });

}

// 実行
loadSessions();