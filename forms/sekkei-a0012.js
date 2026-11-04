// 本-設計-A0012 設計アウトプット（品質記録様式。元Excel：本-設計-A0012 設計アウトプット.xlsx、A4縦2ページ＝表紙・設計からのアウトプット）
// 設計担当者が作成、課長・部長が審査・承認（ユーザー指定）：ファイルに保存して BOX の設計部フォルダに置き、Box Drive から開いて上書きする
// 表紙は本-設計-A0019 と同じ作り（工事名・設計番号・押印欄＝承認者 設計部長／審査者 設計課長／作成者 設計担当責任者・作成日・会社名）
// 作成者はクリックでデート印（日付は作成日）。チェック項目・指摘事項の「設計担当CK」「設計課長審査」はクリックで認印（苗字）
(function () {
  const CHECKS = [
    '顧客要求事項を満たしている事を確認した。',
    '法的要求事項を満たしている事を確認した。',
    '施工、サービス提供に対して適切な情報を提供している事を確認した。',
    '施工上の合否判定基準の記載を確認した。',
    '電気設備を利用し維持管理する上で、電気設備が安全で適切に機能する事を確認した。',
    '各計算書の計算方法及びその結果、図面記載等が適切である事を確認した。',
  ];
  const SHITEKI = 10; // 指摘事項・修正内容の行数

  // 表紙（上：工事名・表題・設計番号／下：作成日・会社名。間に押印欄＝元の様式どおり）
  const coverTop = { type: 'custom', render: ({ h, field }) => h('div', { class: 's19-cover' },
    h('div', { class: 's19-koji' }, h('div', { class: 's19-koji-in' }, field({ key: 'koji', align: 'center', placeholder: '工事名' })), h('span', null, '工事')),
    h('div', { class: 's19-title' }, '設 計 ア ウ ト プ ッ ト'),
    h('div', { class: 's19-no' }, h('span', null, '設計番号'), h('div', { class: 's19-no-in' }, field({ key: 'sekkeiNo', align: 'center', placeholder: '000-00-00000' })))) };
  const coverBottom = { type: 'custom', render: ({ h, field }) => h('div', { class: 's19-cover' },
    h('div', { class: 's19-date' }, h('span', null, '作　成'), h('div', { class: 's19-date-in' }, field({ key: 'sakusei', type: 'date', jp: true }))),
    h('div', { class: 's19-co' }, '株式会社　雄 電 社　本店　設計部')) };

  // 2枚目
  const output = { type: 'custom', render: ({ h, field }) => {
    const ink = (key) => h('td', { class: 'in-sm s19-ink' }, field({ key, type: 'inkan' }));
    const tosho = h('table', { class: 'grid s19 s12t' }, h('colgroup', null, h('col', { style: 'width:26mm' }), h('col', { style: 'width:18mm' }), h('col')),
      h('tbody', null,
        h('tr', null, h('th', { rowspan: 2 }, '設計図書'), h('th', null, '図　面'), h('td', null, field({ key: 'zumen', type: 'checks', options: ['実施図', '確認図'] }))),
        h('tr', null, h('th', null, '計算書'), h('td', null, field({ key: 'keisan', type: 'checks', options: ['変圧器容量', '電圧降下', '電界強度', '照度'] })))));
    const chk = h('table', { class: 'grid s19' }, h('colgroup', null, ...[7, null, 20, 20].map((w) => h('col', { style: w ? `width:${w}mm` : null }))),
      h('tbody', null, h('tr', null, h('th', { colspan: 2, class: 's19-lh' }, 'チェック項目'), h('th', null, '設計担当', h('br'), 'CK'), h('th', null, '設計課長', h('br'), '審査')),
        ...CHECKS.map((t, i) => h('tr', null, h('td', { class: 's19-dot' }, '・'), h('td', { class: 's19-txt' }, t), ink(`c${i + 1}.ck`), ink(`c${i + 1}.shinsa`)))));
    const shiteki = h('table', { class: 'grid s19 s12s' }, h('colgroup', null, ...[22, null, 20, 20].map((w) => h('col', { style: w ? `width:${w}mm` : null }))),
      h('tbody', null, h('tr', null, h('th', null, '日　付'), h('th', null, '指　摘　事　項　・　修　正　内　容'), h('th', null, '設計担当', h('br'), 'CK'), h('th', null, '設計課長', h('br'), '審査')),
        ...Array.from({ length: SHITEKI }, (_, i) => h('tr', null, h('td', null, field({ key: `s${i + 1}.date`, type: 'date', jp: true, style: 'short' })),
          h('td', null, field({ key: `s${i + 1}.naiyo` })), ink(`s${i + 1}.ck`), ink(`s${i + 1}.shinsa`)))));
    const gohi = h('table', { class: 'grid s19' }, h('colgroup', null, h('col'), h('col', { style: 'width:40mm' })),
      h('tbody', null, h('tr', null, h('th', { class: 's19-lh' }, '設計課長によるアウトプット合否判定'), h('td', { class: 's12-gohi' }, field({ key: 'gohi', type: 'radio', options: ['合', '否'], nowrap: true, align: 'center' })))));
    return h('div', { class: 's12-body' },
      h('div', { class: 'blk-title' }, '設計からのアウトプット'), tosho,
      h('p', { class: 'para' }, '設計担当責任者は、「設計図書」の構成及び内容（計算書方法及びその結果、図面の記載等）が適切であるかをチェックし、設計課長の審査を受ける。'),
      chk, h('p', { class: 'para' }, '指摘事項が有る場合、指摘・修正内容を記載し、再度審査を受ける。'), shiteki, gohi);
  } };

  FORM_DEFS['sekkei-a0012'] = {
    code: '本-設計-A0012', title: '設計アウトプット',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '作成者', stampDate: 'sakusei', // 作成者（設計担当責任者）にデート印
    meta: [],
    pages: [
      { subtitle: '（表紙）', stamps: [], blocks: [coverTop,
        { type: 'stamps', align: 'center', groups: [{ boxes: ['承認者\n設計部長', '審査者\n設計課長', '作成者\n設計担当責任者'] }] }, coverBottom, { type: 'spacer' }] },
      { subtitle: '（設計からのアウトプット）', stamps: [], blocks: [output] },
    ],
  };
})();
