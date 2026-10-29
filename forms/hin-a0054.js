// 本-品質-A0054 工事反省会開催通知書（品質記録様式。元Excel：本ー品質ーＡ0054工事反省会開催通知書.xlsx、A4縦1ページ）
// 本-品質-A0052 施工検討会開催通知書と同じ作り（チェック表のご指示）。見た目の CSS も A0052 と共通（h52）
// ISOの要求事項【9.1.3】【10.3】はヘッダーの番号の後ろ。要出席の □ はクリックで ■
// 出席・欠席の欄は日付（yy/mm/dd、空欄なら「/　/」）。クリックの押印（三文判風の認印）は A0052 と同じ人（支店長・工事長／工事部長・作業所長）だけ、ほかは紙で回送するので押印の空欄
//   （A0052 の工事課長は、この様式の巡回順にない）
// 巡回順の右の列の最後は元の様式どおり役職名の空欄（書き込める）。下に主たる審議事項（発議者・項目）
// 工番・件名・事業所・部署・作業所長・開催日・開催場所の項目名は A0052 と同じ（本-品質-A0055 工事反省会議事録 で取り込む）
(function () {
  // 巡回順：左の列・右の列（元の様式の並び）。右の列の最後は役職名の空欄
  const LEFT = ['本店長', '工事本部長\nＲＥ部長', '支店長', '工事長\n工事部長', '作業所長', '工事管理課', '営業部長', '設計見積部長'];
  const RIGHT = ['設計部長', '安全品質\n保証部長', '品質技術部長', '安全品質部長', '安全部長', '検査安全部長', 'ＩＳＯ部長', ''];
  const STAMP = [3, 4, 5]; // クリックで押印できる：支店長・工事長／工事部長・作業所長
  const ROWS = 3; // 主たる審議事項の行数

  const table = { type: 'custom', render: ({ h, field, values, setVal }) => {
    const br = (s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
    // 要出席：クリックで □ ⇔ ■
    const need = (key) => {
      const btn = h('button', { type: 'button', class: 'h52-need', title: 'クリックで □ ⇔ ■' }, values[key] ? '■' : '□');
      btn.addEventListener('click', () => { const on = !values[key]; setVal(key, on ? '1' : ''); btn.textContent = on ? '■' : '□'; });
      return btn;
    };
    // 出席・欠席の欄：日付と押印。工事長／工事部長は元の様式どおり「保管」を薄く印字
    const cell = (key, n) => h('td', { class: 'h52-st' }, field({ key, type: 'date', jp: true, style: 'yy/mm/dd' }),
      n === 4 ? h('span', { class: 'h52-keep' }, '保　管') : null,
      STAMP.includes(n) ? field({ key: `${key}.name`, type: 'inkan' }) : h('div', { class: 'h52-paper' }));
    const role = (r, n) => (r ? h('th', { class: 'h52-role' }, ...br(r)) : h('th', { class: 'h52-role h54-free' }, field({ key: `role${n}`, align: 'center' })));
    const half = (r, n) => [role(r, n), h('td', { class: 'h52-needc' }, need(`y${n}`)), cell(`s${n}`, n), cell(`k${n}`, n)];
    const tb = h('tbody', null, h('tr', null, ...['巡　回　順', '要出席', '出　席', '欠　席', '巡　回　順', '要出席', '出　席', '欠　席'].map((t) => h('th', null, t))));
    LEFT.forEach((r, i) => tb.append(h('tr', null, ...half(r, i + 1), ...half(RIGHT[i], i + 9))));
    return h('table', { class: 'grid h52 h54' }, h('colgroup', null, ...[27, 12, null, null, 27, 12, null, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  // 主たる審議事項（発議者・項目）
  const shingi = { type: 'custom', render: ({ h, field }) => {
    const tb = h('tbody', null, h('tr', null, h('th', { rowspan: ROWS + 1, class: 'h54-sh' }, '主たる', h('br'), '審議事項'), h('th', null, '発　議　者'), h('th', null, '項　　目')));
    for (let i = 1; i <= ROWS; i++) tb.append(h('tr', null, h('td', null, field({ key: `sh${i}.who` })), h('td', null, field({ key: `sh${i}.item` }))));
    return h('table', { class: 'grid h54s' }, h('colgroup', null, ...[22, 36, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  FORM_DEFS['hin-a0054'] = {
    code: '本-品質-A0054', title: '工事反省会開催通知書',
    iso: '【9.1.3】分析及び評価　【10.3】継続的改善', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '03/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 関係者に回送して押印してもらうのでファイルに保存（A0055 でも読み込む）
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0054_工番_件名_日付.json」
    sheetClass: 'h52',
    meta: [],
    stamps: [], // 押印は出席・欠席の欄
    blocks: [
      { type: 'grid', rowH: 6.6, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, lw: 3, span: 8 }, { label: '件　名', key: 'subject', lw: 3, span: 16 }],
        [{ label: '事 業 所', key: 'jigyo', lw: 3, span: 8 }, { label: '部　署', key: 'busho', lw: 3, span: 8 }, { label: '作業所長', key: 'shocho', lw: 3, span: 8 }],
        [{ label: '開 催 日', key: 'kaisaibi', type: 'date', jp: true, lw: 3, span: 7 },
          { label: '開催時間', key: 'tFrom', key2: 'tTo', type: 'daterange', kind: 'time', lw: 3, span: 10 },
          { label: '開催場所', key: 'basho', lw: 3, span: 7 }],
        [{ label: '発 注 者\n（施　主）', key: 'hatchu', lw: 3, span: 12 }, { label: '契 約 先\n（元　請）', key: 'keiyaku', lw: 3, span: 12 }],
        [{ label: '設計事務所\n設計監理者', key: 'sekkeiJimusho', lw: 3, span: 8 }, { label: '建築会社', key: 'kenchiku', lw: 3, span: 8 }, { label: '営業担当', key: 'eigyo', lw: 3, span: 8 }],
      ] },
      // 巡回順の表と主たる審議事項は隙間なくつなぐ
      { type: 'col', fit: true, gap: 0, items: [table, shingi] },
      { type: 'notes', items: [
        '1.　工事長/工事部長は、工事引渡し後1ヶ月以内に、出席を要請する関係者の□を■のように塗りつぶして、発行すること。',
        '2.　関係者は、出席であれば出席欄に押印し、欠席であれば欠席欄に押印して回送すること。',
        '3.　作業所長は、工事反省会当日「施工計画書」、「品質記録」、「NET検討会報告書」、「施工検討会報告書」、「現場巡回検査報告書」、「中間検査報告書」、「最終検査報告書」、「不適合処理報告書」、「検査指摘事項･確認書」、「是正処置要求書･報告書」のコピー、関係文書を用意すること。',
      ] },
    ],
  };
})();
