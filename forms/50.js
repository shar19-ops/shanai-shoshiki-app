// 工期設定チェックリスト（ユーザー指定：ほかの帳票に寄せず、元のExcelのままの見た目で）
// 元Excel：般ー50.工期設定ﾁｪｯｸﾘｽﾄ.xlsx（A4横・1ページ）。列幅・行の高さ・罫線・網かけを元に合わせる
(function () {
  const MARKS = ['〇', '△', '×', '－']; // 確認欄の選択肢（元Excelの入力規則）
  // 元Excelの列幅（pt）。左表 C〜H、右表 J〜O、間の I は余白
  const LEFT = [88.5, 28.5, 94.5, 94.5, 94.5, 94.5];
  const RIGHT = [88.5, 28.5, 94.5, 94.5, 106.5, 82.5];
  const GAP = 10.5;
  const TOTAL = LEFT.reduce((a, b) => a + b) + GAP + RIGHT.reduce((a, b) => a + b);
  const W = 281; // 用紙の横幅に収める幅（mm）
  const mm = (pt) => (pt * W / TOTAL).toFixed(2) + 'mm';
  const ROW = mm(19.5); // 行の高さ（元は 19.5pt）

  // 左表：項目 → 確認＋文章（1〜2行）。split: true は2行の間に線を引く（行政への申請）
  const LEFT_ITEMS = [
    ['自然要因', [['降雨量・降雪量（雨休率の設定等）'], ['猛暑日（夏期におけるWBGT３１以上の不稼働日'], ['河川の出水期における作業制限'], ['寒冷・多雪地域における冬期休止期間'], ['その他の気象、海象などを含む自然要因']]],
    ['休日・法定外\n労働時間', [['時間外労働規制の遵守、週休二日の確保', '十分な工期確保や交代勤務制の実施に必要な経費は、請負代金の額に反映']]],
    ['イベント', [['年末年始、夏季休暇、GW,地元の催事等の特別休暇・', '不稼働日や交通規制期間']]],
    ['規制条件', [['鉄道近接、航空規制などの立地に係る規制条件や', '周辺への振動、騒音等への配慮'], ['搬出入時間の規制や工事車両の規制（進入時間、重量、', '台数）等の道路条件']]],
    ['契約方式', [['分離発注で当該工事に関する複数の工事がある場合、', 'その有無や内容']]],
    ['関係者との\n調整', [['地元住民や地元団体（農業、漁業組合等）、電力・ガス等', 'の占用企業との協議期間'], ['関係者との協議調整が未了の場合（用地未買収等）、', '協議内容や完了予定時期']]],
    ['労務・安全\n衛生', [['労働安全衛生法等関係法令を遵守し、労働者の安全を', '確保するための十分な工期を設定']]],
    ['行政への申請', [{ split: true, lines: ['特車通行許可や道路使用許可、特定建設作業実施届、', '建築確認など、必要な各種申請期間'] }]],
  ];
  const RIGHT_ITEMS = [
    ['準備', [['資機材の調達や人員の確保に要する時間（物品納入や', '建設機械の搬入に要する時間）'], ['設計図書で未決定の事項や仕様の未確認'], ['工事着手前の試掘調査、土質調査や照査、現地の条件', 'を踏まえた施工計画の作成に要する期間'], ['ヤードや現場事務所設置、進入路や敷地造成、仮設整備', '（電力・給排水・濁水処理・給気等）の整備期間']]],
    ['施工', [['設備工事における、前工事工程を踏まえた設備工事の', '着手可能日、総合試運転調整の期間'], ['基礎工事や躯体工事における、スリーブ取付、建て込み', '埋設配管の作業期間'], ['天井内配管配線工事における、配線工事作業期間'], ['間仕切り内配管配線工事における、配管配線工事期間'], ['器具付け工事における、仕上げからの器具取付期間'], ['受電前における、使用前自主検査の検査期間'], ['外構工事における、地中埋設引管工事の作業期間']]],
    ['設計変更', [['設計変更発生時における、積算、施工図変更の期間'], ['']]],
    ['後片付け', [['完了検査、竣工検査・引き渡し前の後片付けや清掃、', '竣工後の初期点検に要する時間']]],
  ];

  function render({ h, field }) {
    const colg = (ws) => h('colgroup', null, ws.map((w) => h('col', { style: `width:${mm(w)}` })));
    const td = (attrs, ...kids) => h('td', { ...attrs, style: `height:${ROW};` + (attrs.style || '') }, ...kids);
    const lines = (t) => String(t).split('\n').flatMap((s, i) => (i ? [h('br'), s] : [s]));
    const mark = (key) => field({ key, type: 'select', options: MARKS, align: 'center' });

    // 項目の表（左右共通）。prefix：保存キーの頭（L／R）
    function itemsTable(widths, items, prefix, extra) {
      const tb = h('tbody');
      tb.append(h('tr', null, td({ class: 'k50-h' }, '項　目'), td({ class: 'k50-h' }, '確認'), td({ class: 'k50-h', colspan: 4 }, '工期設定に関わる要因・条件')));
      let n = 0;
      items.forEach(([name, list]) => {
        const span = list.reduce((a, it) => a + (Array.isArray(it) ? Math.max(1, it.length) : it.lines.length), 0);
        list.forEach((it, i) => {
          n++;
          const key = `${prefix}${n}`;
          const rows = Array.isArray(it) ? (it.length > 1 ? 2 : 1) : it.lines.length;
          const text = Array.isArray(it) ? it : it.lines;
          const first = h('tr');
          if (i === 0) first.append(td({ class: 'k50-item', rowspan: span }, ...lines(name)));
          first.append(td({ class: 'k50-chk', rowspan: rows }, mark(key)));
          if (!Array.isArray(it) && it.split) {
            first.append(td({ class: 'k50-txt', colspan: 4 }, text[0]));
            tb.append(first);
            text.slice(1).forEach((t) => tb.append(h('tr', null, td({ class: 'k50-txt', colspan: 4 }, t))));
          } else {
            first.append(td({ class: 'k50-txt k50-multi', colspan: 4, rowspan: rows }, ...text.flatMap((t, j) => (j ? [h('br'), t] : [t]))));
            tb.append(first);
            if (rows === 2) tb.append(h('tr'));
          }
        });
      });
      if (extra) extra(tb, td, mark);
      return h('table', { class: 'k50-tbl' }, colg(widths), tb);
    }

    // 右表の「その他」5行と、確認者の欄（確認者／日付／発行の押印）
    const others = (tb, td2, mk) => {
      for (let i = 1; i <= 5; i++) {
        const tr = h('tr');
        if (i === 1) tr.append(td2({ class: 'k50-item', rowspan: 5 }, 'その他'));
        tr.append(td2({ class: 'k50-chk' }, mk(`O${i}`)));
        tr.append(td2({ class: 'k50-in', colspan: 3 }, field({ key: `Otext${i}` })));
        if (i === 1) tr.append(td2({ class: 'k50-conf-h' }, '確認者'));
        if (i === 2) tr.append(td2({ class: 'k50-in k50-conf-d' }, field({ key: 'confDate', align: 'center', placeholder: '/　　/' })));
        if (i === 3) tr.append(td2({ class: 'k50-conf-s', rowspan: 3 },
          h('div', { class: 'self-stamp', title: 'クリックで押印設定' }), h('span', { class: 'k50-hatsu' }, '発', h('br'), '行')));
        tb.append(tr);
      }
    };

    const left = h('div', { class: 'k50-side' },
      h('div', { class: 'k50-head' },
        h('div', { class: 'k50-title' }, '工期設定チェックリスト'),
        h('div', { class: 'k50-law' }, '建設業法：第１９条の５')),
      h('table', { class: 'k50-tbl k50-cap' }, colg(LEFT), h('tbody', null, h('tr', null, td({ colspan: 6 }, '1⃣　工期全般にわたって考慮すべき事項の例')))),
      itemsTable(LEFT, LEFT_ITEMS, 'L'),
      h('div', { class: 'k50-legend' },
        h('div', null, h('span', { class: 'k50-legend-h' }, '【確認凡例】'), '〇：条件を明示し、工期に反映済　　△：条件を一部明示し、工期に反映済'),
        h('div', null, h('span', { class: 'k50-legend-h' }, ''), '×：条件が明示できず、工期に未反映　　－：該当工事で対象外')));

    const right = h('div', { class: 'k50-side' },
      h('table', { class: 'k50-tbl k50-top' }, colg(RIGHT), h('tbody', null,
        h('tr', null, td({ class: 'k50-th', colspan: 2 }, '契約時確認'), td({ class: 'k50-in', colspan: 2 }, field({ key: 'keiyaku1', align: 'center' })), td({ class: 'k50-in', colspan: 2 }, field({ key: 'keiyaku2', align: 'center' }))),
        h('tr', null, td({ class: 'k50-th', colspan: 2 }, '工事名称'), td({ class: 'k50-in k50-white', colspan: 4 }, field({ key: 'koji' }))))),
      h('table', { class: 'k50-tbl k50-cap' }, colg(RIGHT), h('tbody', null, h('tr', null, td({ colspan: 6 }, '2⃣　工程別に考慮すべき事項の例')))),
      itemsTable(RIGHT, RIGHT_ITEMS, 'R', others),
      h('div', { class: 'k50-note' }, '※見積依頼書/注文書付属書 （労務・材料労務）発行時に、本書を添付する。'));

    return h('div', { class: 'k50', style: `--k50-gap:${mm(GAP)};--k50-row:${ROW}` }, left, right);
  }

  FORM_DEFS['50'] = {
    code: '般-50', title: '工期設定チェックリスト',
    orientation: 'landscape',
    bare: true, // 共通の表題・押印欄は使わず、元のExcelのままの見た目
    footerRight: '般-50　　25/07/25　制定',
    selfStamp: '発行', // 確認者の欄（発行）にデート印
    blocks: [{ type: 'custom', render }],
  };
})();
