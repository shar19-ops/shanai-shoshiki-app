// 本-品質-A0052 施工検討会開催通知書（品質記録様式。元Excel：本ー品質ーA0052施工検討会開催通知書.xlsx、A4縦1ページ）
// ISOの要求事項【8.1】はヘッダーの番号の後ろ。要出席の □ はクリックで ■（チェック表のご指示）
// 出席・欠席の欄は日付（yy/mm/dd、空欄なら「/　/」）と、クリックで三文判風の認印（欄ごとに苗字。本-品質-A0051 の承認印と同じ）。クリックの押印は支店長・工事長・工事課長・作業所長だけ（ほかは紙で回送するので押印の空欄だけ）
// 営業担当は読みやすさのため設計事務所・建築会社の行の右へ（元の様式は設計種別の行）。工番・件名・事業所・部署・作業所長・開催日・開催場所の項目名は 本-品質-A0053 施工検討会報告書 と同じにする（A0053 で取り込む）
(function () {
  // 巡回順：左の列・右の列（元の様式の並び）
  const LEFT = ['工事本部長', 'ＲＥ部長', '支店長', '工事長\n工事部長', '工事課長', '作業所長', '工事管理課長', '設計見積部長'];
  const RIGHT = ['設計部長', '購買部長', '安全品質\n保証部長', '品質技術部長', '安全品質部長', '安全部長', '検査安全部長', 'ＩＳＯ部長'];
  window.HIN_A0052_ROLES = [...LEFT, ...RIGHT]; // A0053 で出席者を取り込むときに使う

  const table = { type: 'custom', render: ({ h, field, values, setVal }) => {
    const br = (s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
    // 要出席：クリックで □ ⇔ ■
    const need = (key) => {
      const btn = h('button', { type: 'button', class: 'h52-need', title: 'クリックで □ ⇔ ■' }, values[key] ? '■' : '□');
      btn.addEventListener('click', () => { const on = !values[key]; setVal(key, on ? '1' : ''); btn.textContent = on ? '■' : '□'; });
      return btn;
    };
    // 出席・欠席の欄：日付と認印。工事長／工事部長は元の様式どおり「保管」を薄く印字
    // クリックで押印できるのは支店長・工事長／工事部長・工事課長・作業所長だけ（ユーザー指定）。
    //   ほかの役職は今は紙で回送する想定なので、日付（空欄なら「/　/」）と押印の空欄だけ（クリックの押印機能はなし）
    const STAMP = [3, 4, 5, 6];
    const cell = (key, n) => h('td', { class: 'h52-st' }, field({ key, type: 'date', jp: true, style: 'yy/mm/dd' }),
      n === 4 ? h('span', { class: 'h52-keep' }, '保　管') : null,
      STAMP.includes(n) ? field({ key: `${key}.name`, type: 'inkan' }) : h('div', { class: 'h52-paper' }));
    const half = (role, n) => [h('th', { class: 'h52-role' }, ...br(role)), h('td', { class: 'h52-needc' }, need(`y${n}`)),
      cell(`s${n}`, n), cell(`k${n}`, n)];
    const tb = h('tbody', null, h('tr', null, ...['巡　回　順', '要出席', '出　席', '欠　席', '巡　回　順', '要出席', '出　席', '欠　席'].map((t) => h('th', null, t))));
    LEFT.forEach((role, i) => tb.append(h('tr', null, ...half(role, i + 1), ...half(RIGHT[i], i + 9))));
    return h('table', { class: 'grid h52' }, h('colgroup', null, ...[27, 12, null, null, 27, 12, null, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  FORM_DEFS['hin-a0052'] = {
    code: '本-品質-A0052', title: '施工検討会開催通知書',
    iso: '【8.1】運用の計画及び管理', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '03/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 関係者に回送して押印してもらうのでファイルに保存（A0053 でも読み込む）
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0052_工番_件名_日付.json」
    sheetClass: 'h52',
    meta: [],
    stamps: [], // 押印は出席・欠席の欄
    blocks: [
      { type: 'grid', rowH: 6.6, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, lw: 3, span: 8 }, { label: '件　名', key: 'subject', lw: 3, span: 16 }],
        [{ label: '事 業 所', key: 'jigyo', lw: 3, span: 8 }, { label: '施工部署', key: 'busho', lw: 3, span: 8 }, { label: '作業所長', key: 'shocho', lw: 3, span: 8 }],
        [{ label: '開 催 日', key: 'kaisaibi', type: 'date', jp: true, lw: 3, span: 7 },
          { label: '開催時間', key: 'tFrom', key2: 'tTo', type: 'daterange', kind: 'time', lw: 3, span: 10 },
          { label: '開催場所', key: 'basho', lw: 3, span: 7 }],
        [{ label: '発 注 者\n（施　主）', key: 'hatchu', lw: 3, span: 12 }, { label: '契 約 先\n（元　請）', key: 'keiyaku', lw: 3, span: 12 }],
        [{ label: '設計事務所', key: 'sekkeiJimusho', lw: 3, span: 8 }, { label: '建築会社', key: 'kenchiku', lw: 3, span: 8 }, { label: '営業担当', key: 'eigyo', lw: 3, span: 8 }],
        [{ label: '設計種別', key: 'sekkeiShu', type: 'radio', options: ['他社', '自社'], nowrap: true, lw: 3, span: 8 },
          { label: '受注状況', key: 'juchu', type: 'radio', options: ['契約済', '未'], nowrap: true, lw: 3, span: 8 },
          { label: '工事引継\n会議', key: 'hikitsugi', type: 'radio', options: ['済', '未'], nowrap: true, lw: 3, span: 8 }],
      ] },
      table,
      { type: 'notes', items: [
        '1.　工事長/工事部長は、工事命令書発行後1ヶ月以内に、出席を要請する関係者の□を■のように塗りつぶして、発行すること。',
        '2.　関係者は、出席であれば出席欄に押印し、欠席であれば欠席欄に押印して回送すること。',
        '3.　作業所長は、施工検討会当日「施工計画書」（案）を出席者へ、電子データ又はコピーし配布すること。また、設計図及び関係文書を用意すること。',
      ] },
    ],
  };
})();
