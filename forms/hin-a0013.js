// 本-品質-A0013 計測機器使用前点検表（品質記録様式。元Excel：本ー品質ーA0013 計測機器使用前点検表.xlsx、A4縦1ページ＝22回分）
// 元の様式に押印欄はない（点検者は行ごとの欄のまま）。電池・外部損傷・0調整は「あり／なし」を選ぶ
(function () {
  const ROWS = 22;
  const list = { type: 'custom', render: ({ h, field }) => {
    const ari = (key) => h('td', { class: 'h13-sel' }, field({ key, type: 'radio', options: ['あり', 'なし'], nowrap: true, align: 'center' }));
    const tb = h('tbody', null, h('tr', null, ...['点検日', '電　池', '外部損傷', '0 調 整', '備　　考', '点検者'].map((t) => h('th', null, t))));
    for (let i = 1; i <= ROWS; i++) {
      tb.append(h('tr', null, h('td', null, field({ key: `r${i}.date`, type: 'date', jp: true, style: 'short' })),
        ari(`r${i}.denchi`), ari(`r${i}.sonsho`), ari(`r${i}.zero`),
        h('td', null, field({ key: `r${i}.biko` })), h('td', null, field({ key: `r${i}.tenkensha`, align: 'center' }))));
    }
    return h('table', { class: 'grid h13' }, h('colgroup', null, ...[22, 27, 27, 27, null, 22].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  FORM_DEFS['hin-a0013'] = {
    code: '本-品質-A0013', title: '計測機器使用前点検表',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    blocks: [
      { type: 'grid', lw: 4, rowH: 7, rows: [
        [{ label: '管理番号', key: 'kanri', span: 10 }, { label: '機器名', key: 'kiki', span: 14 }],
        [{ label: '件　名', key: 'subject', span: 24 }],
      ] },
      list,
    ],
  };
})();
