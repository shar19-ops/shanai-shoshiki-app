// 本-品質-A0011 計測機器借用依頼書（品質記録様式。元Excel：本ー品質ーA0011 計測機器借用依頼書.xlsx、A4縦1ページ）
// 押印欄は右上（元も右上）、作業所長（依頼する人）にデート印。元の日付欄はなし
// 表は17行。左が作業所長記入欄（計測機器名称・管理番号）、右が品質保証部・支店工事部記入欄（貸出日・貸出者・返却日・受領者）
(function () {
  const ROWS = 17;
  const list = { type: 'custom', render: ({ h, field }) => {
    const date = (key) => field({ key, type: 'date', jp: true, style: 'short' });
    const tb = h('tbody', null,
      h('tr', null, h('th', { colspan: 3 }, '作業所長記入欄'), h('th', { colspan: 4 }, '品質保証部・支店工事部記入欄')),
      h('tr', null, h('th', null, ''), h('th', null, '計測機器名称'), h('th', null, '管理番号'), h('th', null, '貸出日'), h('th', null, '貸出者'), h('th', null, '返却日'), h('th', null, '受領者')));
    for (let i = 1; i <= ROWS; i++) {
      tb.append(h('tr', null, h('td', { class: 'h11-no' }, String(i)),
        h('td', null, field({ key: `r${i}.name` })), h('td', null, field({ key: `r${i}.kanri`, align: 'center' })),
        h('td', null, date(`r${i}.kashi`)), h('td', null, field({ key: `r${i}.kashite`, align: 'center' })),
        h('td', null, date(`r${i}.henkyaku`)), h('td', null, field({ key: `r${i}.juryo`, align: 'center' }))));
    }
    return h('table', { class: 'grid h11' }, h('colgroup', null, ...[7, null, 26, 21, 22, 21, 22].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  FORM_DEFS['hin-a0011'] = {
    code: '本-品質-A0011', title: '計測機器借用依頼書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作業所長',
    meta: [{ label: '作成日', key: 'sakusei', type: 'date', jp: true }],
    stamps: [{ boxes: ['作業所長'] }],
    blocks: [
      { type: 'grid', lw: 4, rowH: 7, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, span: 24 }],
        [{ label: '件　名', key: 'subject', span: 24 }],
        [{ label: '借用期間', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 24 }],
        [{ label: '納入希望日', key: 'kibo', type: 'date', jp: true, span: 24 }],
      ] },
      list,
    ],
  };
})();
