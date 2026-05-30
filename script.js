// data.jsonを読み込んで初期表示を行う
async function loadSessions() {

const response = await fetch("data.json");
const sessions = await response.json();

// フィルター初期化
setupFilters(sessions);

// 全件表示
renderCards(sessions);
}

// フィルター項目を生成し、検索機能を設定
function setupFilters(sessions) {

const systemFilter = document.getElementById("systemFilter");
const yearFilter = document.getElementById("yearFilter");
const kpFilter = document.getElementById("kpFilter");
const playerFilter = document.getElementById("playerFilter");
const sortFilter = document.getElementById("sortFilter");
const searchInput = document.getElementById("searchInput");

// 重複を除いた選択肢一覧を取得
const systems = [...new Set(sessions.map(s => s.system))];
const years = [...new Set(sessions.map(s => s.year))];
const kps = [...new Set(sessions.flatMap(s => s.kps))];
const players = [...new Set(sessions.flatMap(s => s.players))];

// 各プルダウンに選択肢を追加
systems.forEach(v => systemFilter.innerHTML += `<option value="${v}">${v}</option>`);
years.sort((a,b)=>b-a).forEach(v => yearFilter.innerHTML += `<option value="${v}">${v}</option>`);
kps.sort().forEach(v => kpFilter.innerHTML += `<option value="${v}">${v}</option>`);
players.sort().forEach(v => playerFilter.innerHTML += `<option value="${v}">${v}</option>`);

// フィルター更新時の処理
function update() {

```
// 検索文字列を取得
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

// 並び替え設定取得
const sort = sortFilter.value;

// 指定条件でソート
if (sort === "title") filtered.sort((a,b)=>a.title.localeCompare(b.title,"ja"));
if (sort === "year") filtered.sort((a,b)=>b.year-a.year);
if (sort === "system") filtered.sort((a,b)=>a.system.localeCompare(b.system,"ja"));
if (sort === "duration") filtered.sort((a,b)=>a.durationSort-b.durationSort);

// 結果を再描画
renderCards(filtered);
```

}

// 各入力欄の変更を監視
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

// 再描画前に一旦空にする
container.innerHTML = "";

sessions.forEach(session => {

```
const card = document.createElement("div");
card.className = "card";

// カードHTML生成
card.innerHTML = `
  <img class="thumbnail" src="${session.thumbnail}" alt="">
  <div class="content">

    <div class="title">${session.title}</div>

    <div class="meta">
      ${session.system} / ${session.date} / ${session.duration}
    </div>

    ${
      // 再生リスト形式
      session.videoType === "playlist"
      ? `<a class="playlist-button" href="${session.playlistUrl}" target="_blank">再生リスト</a>`

      // Part分割形式
      : `<div class="part-buttons">
          ${session.partLinks.map(p =>
            `<a class="playlist-button" href="${p.url}" target="_blank">${p.name}</a>`
          ).join("")}
        </div>`
    }

    <!-- クリックで展開される詳細情報 -->
    <div class="detail">
      <div class="detail-title">KP</div>
      <div>${session.kps.join(" / ")}</div>

      <div class="detail-title">PL</div>
      <div>${session.players.join(" / ")}</div>

      ${
        // メモが存在する場合のみ表示
        session.memo
          ? `<div class="memo">${session.memo}</div>`
          : ""
      }
    </div>

  </div>
`;

const detail = card.querySelector(".detail");

// カードクリックで詳細を開閉
card.addEventListener("click", (e) => {

  // 再生リストボタンは通常リンク動作を優先
  if (e.target.classList.contains("playlist-button")) return;

  detail.classList.toggle("open");
});

container.appendChild(card);
```

});
}

// 初期起動
loadSessions();
