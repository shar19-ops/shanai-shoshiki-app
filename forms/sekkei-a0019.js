// 本-設計-A0019 設計検証書（品質記録様式。元Excel：本-設計-A0019 設計検証書.xlsx、A4縦2ページ＝表紙・設計検証）
// 元の様式どおり1枚目は表紙（工事名・設計番号・設計部長と検証者の押印欄・検証日・会社名）、2枚目にチェック項目と設計検証内容
// 検証者はクリックでデート印（日付は検証日）。チェック項目の「設計部長検証」と設計検証内容の「設計部長承認」はクリックで認印（苗字）
// 別法による計算・試験・類似設計との比較は「必要／不要」をクリックで選び、方法を書く。ファイルに保存して BOX の設計部フォルダで共有
(function () {
  const CHECKS = [
    ['c1', '設計計画書の内容を網羅している事を確認した。'],
    ['c2', '各計算書の計算方法及びその結果、図面記載等が適切である事を確認した。'],
  ];
  const BETSU = [['b1', '別法による計算'], ['b2', '別法による試験'], ['b3', '類似設計との比較']];

  // 表紙（上：工事名・表題・設計番号／下：検証日・会社名。間に押印欄＝元の様式どおり）
  const coverTop = { type: 'custom', render: ({ h, field }) => h('div', { class: 's19-cover' },
    h('div', { class: 's19-koji' }, h('div', { class: 's19-koji-in' }, field({ key: 'koji', align: 'center', placeholder: '工事名' })), h('span', null, '工事')),
    h('div', { class: 's19-title' }, '設　計　検　証　書'),
    h('div', { class: 's19-no' }, h('span', null, '設計番号'), h('div', { class: 's19-no-in' }, field({ key: 'sekkeiNo', align: 'center', placeholder: '000-00-00000' })))) };
  const coverBottom = { type: 'custom', render: ({ h, field }) => h('div', { class: 's19-cover' },
    h('div', { class: 's19-date' }, h('span', null, '検証日'), h('div', { class: 's19-date-in' }, field({ key: 'kensho', type: 'date', jp: true }))),
    h('div', { class: 's19-co' }, '株式会社　雄 電 社　本店　設計部')) };

  // 2枚目：チェック項目
  const checks = { type: 'custom', render: ({ h, field }) => {
    const ink = (key) => h('td', { class: 'in-sm s19-ink' }, field({ key, type: 'inkan' }));
    const tb = h('tbody', null, h('tr', null, h('th', { colspan: 2, class: 's19-lh' }, 'チェック項目'), h('th', null, '設計部長', h('br'), '検　証')));
    CHECKS.forEach(([key, text]) => tb.append(h('tr', null, h('td', { class: 's19-dot' }, '・'), h('td', { class: 's19-txt' }, text), ink(`${key}.in`))));
    BETSU.forEach(([key, label]) => tb.append(h('tr', null, h('td', { class: 's19-dot' }, '・'),
      h('td', { class: 's19-betsu' }, h('div', { class: 's19-b-row' }, h('span', { class: 's19-b-lbl' }, label),
        field({ key: `${key}.need`, type: 'radio', options: ['必要', '不要'], nowrap: true })),
      h('div', { class: 's19-b-row' }, h('span', { class: 's19-b-how' }, '方法…'), h('div', { class: 's19-b-in' }, field({ key: `${key}.how` })))),
      ink(`${key}.in`))));
    return h('table', { class: 'grid s19' }, h('colgroup', null, ...[7, null, 22].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  // 設計検証内容（右上に設計部長の承認印）
  const naiyo = { type: 'custom', render: ({ h, field }) => h('table', { class: 'grid s19 s19-nai' },
    h('colgroup', null, h('col'), h('col', { style: 'width:22mm' })),
    h('tbody', null,
      h('tr', null, h('th', { rowspan: 2, class: 's19-lh' }, '設計検証内容'), h('th', null, '設計部長')),
      h('tr', null, h('th', null, '承　認')),
      // 承認印の欄は見出しのすぐ下（20mm）。その下は空き
      h('tr', null, h('td', { class: 's19-nai-ta', rowspan: 2 }, field({ key: 'naiyo', type: 'textarea', plain: true, lines: 12 })), h('td', { class: 'in-sm s19-ink s19-shonin' }, field({ key: 'shonin', type: 'inkan' }))),
      h('tr', null, h('td', { class: 's19-rest' })))) };

  FORM_DEFS['sekkei-a0019'] = {
    code: '本-設計-A0019', title: '設計検証書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    selfStamp: '検証者', stampDate: 'kensho', // 検証者にデート印（日付は検証日）
    meta: [],
    pages: [
      // 表紙：押印欄は設計番号の下（元の様式どおり、設計部長・検証者）
      { subtitle: '（表紙）', stamps: [], blocks: [coverTop, { type: 'stamps', align: 'center', groups: [{ boxes: ['設計部長', '検証者'] }] }, coverBottom, { type: 'spacer' }] },
      { subtitle: '（設計検証）', stamps: [], blocks: [
        { type: 'para', text: '設計仕様、設計図書構成等の観点から、設計計画書と完成した設計図書を比較し検証する。' },
        checks, naiyo,
      ] },
    ],
  };
})();
