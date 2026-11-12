// 本-設計-A0020 妥当性確認報告書（品質記録様式。元Excel：本-設計-A0020 妥当性確認報告書.xlsx、A4縦1ページ）
// 2026-11-12 ユーザー指定でアプリ化（05_設計の保留から）
// 設備の項目ごとに、初期・中期・最終期の確認内容を書く（各期の見出しに月/日）。項目の □ はクリックで ☑（対象の設備）。最後の2行は項目名を書ける
// 「納図」審査・承認欄は元の様式どおり表の下（営業本部長の承認印をもって納図承認）。右端の担当者にデート印（日付は作成日）
(function () {
  const ITEMS = ['電力引込設備', '受変電設備', '発電機設備', '幹線・動力設備', '電灯コンセント設備', '電話設備', 'ＬＡＮ設備',
    'テレビ共聴設備', 'ＩＴＶ設備', 'インターホン設備', '自動火災報知設備', '避雷設備', null, null]; // null：項目名を書く行
  const PHASES = [['p1', '初　期'], ['p2', '中　期'], ['p3', '最終期']];

  const table = { type: 'custom', render: ({ h, field, values, setVal }) => {
    // □ ⇔ ☑（対象の設備）
    const box = (key) => {
      const b = h('button', { type: 'button', class: 's20-box', title: 'クリックで □ ⇔ ☑' }, values[key] === '1' ? '☑' : '□');
      b.addEventListener('click', () => { const on = values[key] !== '1'; setVal(key, on ? '1' : ''); b.textContent = on ? '☑' : '□'; });
      return b;
    };
    const md = (p) => h('span', { class: 's20-md' }, '（', field({ key: `${p}.m`, align: 'center' }), '/', field({ key: `${p}.d`, align: 'center' }), '）');
    const tb = h('tbody', null, h('tr', null, h('th', null, '項　　目'),
      ...PHASES.map(([p, label]) => h('th', null, h('div', { class: 's20-ph' }, h('span', null, label), md(p))))));
    ITEMS.forEach((name, i) => {
      const n = i + 1;
      tb.append(h('tr', null,
        h('td', { class: 's20-item' }, h('div', { class: 's20-item-in' }, box(`i${n}.on`),
          name ? h('span', null, name) : h('div', { class: 's20-name' }, field({ key: `i${n}.name`, placeholder: '（設備名）' })))),
        ...PHASES.map(([p]) => h('td', { class: 's20-ta' }, field({ key: `i${n}.${p}`, type: 'textarea', plain: true, lines: 2 })))));
    });
    return h('table', { class: 'grid s20' }, h('colgroup', null, ...[42, null, null, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  FORM_DEFS['sekkei-a0020'] = {
    code: '本-設計-A0020', title: '妥当性確認報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '担当者', stampDate: 'sakusei', // 担当者にデート印（日付は作成日）
    meta: [],
    stamps: [], // 押印欄は元の様式どおり下部の「納図」審査・承認欄
    bottomStamps: [{ boxes: ['営業本部長', '営業部長', '営業課長', '営業担当', '設計部長', '担当者'] }],
    blocks: [
      { type: 'grid', lw: 3, rowH: 7, rows: [
        [{ label: '件　名', key: 'subject', span: 15 }, { label: '作成日', key: 'sakusei', type: 'date', jp: true, span: 9 }],
        [{ label: '設計番号', key: 'sekkeiNo', span: 15 }, { label: '提出先', key: 'teishutsu', span: 9 }],
        [{ label: '納図予定日', key: 'nozu', type: 'date', jp: true, span: 24 }],
        [{ label: '内　容', key: 'naiyo', type: 'textarea', lines: 2, span: 24 }],
      ] },
      table,
      { type: 'notes', items: ['「納図」審査・承認欄', '営業本部長の承認印をもって納図承認とする。'] },
    ],
  };
})();
