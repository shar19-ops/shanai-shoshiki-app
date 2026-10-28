// 本-総務-A0012 教育訓練実施記録（品質記録様式。元Word：本-総務-A0012教育訓練実施記録.doc、A4縦1ページ）
// 押印欄は右上（元も右上）、右端の実施責任者にデート印（元の日付欄はなし）
// 受講者は40名（左右20名ずつ、元の様式のまま）。社員番号は7桁の数字なので、所属を縮めて社員番号・氏名を広げる（ユーザー指定）
(function () {
  const N = 20; // 左右それぞれの人数
  const attendees = { type: 'custom', render: ({ h, field }) => {
    const half = (start) => [h('td', { class: 's12-no' }, String(start)),
      h('td', null, field({ key: `a${start}.dept` })), h('td', null, field({ key: `a${start}.code`, align: 'center', maxlength: 7 })) /* 社員番号は7桁 */, h('td', null, field({ key: `a${start}.name` }))];
    const tb = h('tbody', null, h('tr', null, ...[0, 1].flatMap(() => [h('th', null, ''), h('th', null, '所　　属'), h('th', null, '社員番号'), h('th', null, '氏　　名')])));
    for (let i = 1; i <= N; i++) tb.append(h('tr', null, ...half(i), ...half(i + N)));
    return h('div', null, h('div', { class: 'blk-title' }, '受講者'),
      h('table', { class: 'grid s12' }, h('colgroup', null, ...[0, 1].flatMap(() => [6, 26, 26, null].map((w) => h('col', { style: w ? `width:${w}mm` : null })))), tb));
  } };

  FORM_DEFS['somu-a0012'] = {
    code: '本-総務-A0012', title: '教育訓練実施記録',
    seitei: '00/10/03', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '実施責任者',
    meta: [],
    stamps: [{ boxes: ['総務部長', '実施責任者'] }],
    blocks: [
      { type: 'grid', lw: 4, rowH: 7, rows: [
        [{ label: '教育名', key: 'kyoikumei', span: 24 }],
        [{ label: '日　時', key: 'nichijiW', type: 'inline', span: 24, parts: [
          { key: 'fromD', type: 'date', jp: true, w: 42 }, { key: 'fromT', type: 'time', w: 22 }, '　～　',
          { key: 'toD', type: 'date', jp: true, w: 42 }, { key: 'toT', type: 'time', w: 22 }] }],
        [{ label: '場　所', key: 'basho', span: 24 }],
        [{ label: '実施部署', key: 'busho', span: 24 }],
        [{ label: '講　師', key: 'koshi', span: 24 }],
      ] },
      { type: 'grid', lw: 4, rows: [
        [{ label: '教育内容', key: 'naiyo', type: 'textarea', lines: 4, span: 24 }],
        [{ label: '資料名及び\n使用用具名', key: 'shiryo', type: 'textarea', lines: 2, span: 24 }],
        [{ label: '有効性評価', key: 'hyoka', type: 'textarea', lines: 2, span: 24 }],
      ] },
      attendees,
    ],
  };
})();
