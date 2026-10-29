// 本-品質-A0013 計測機器使用前点検表（品質記録様式。元Excel：本ー品質ーA0013 計測機器使用前点検表.xlsx、A4縦1ページ＝22回分）
// 元の様式に押印欄はない（点検者は行ごとの欄のまま）。電池・外部損傷・0調整は「あり／なし」を選ぶ
// 計測機器ごとに点検の記録をためるので、管理番号ごとにJSONファイルに保存（ファイル名に管理番号・機器名。ユーザー指定）。22回を超えたらページを足す
(function () {
  const ROWS = 22;
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);

  const list = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const ari = (key) => h('td', { class: 'h13-sel' }, field({ key, type: 'radio', options: ['あり', 'なし'], nowrap: true, align: 'center' }));
    const tb = h('tbody', null, h('tr', null, ...['点検日', '電　池', '外部損傷', '0 調 整', '備　　考', '点検者'].map((t) => h('th', null, t))));
    for (let i = 1; i <= ROWS; i++) {
      const n = (page - 1) * ROWS + i;
      tb.append(h('tr', null, h('td', null, field({ key: `r${n}.date`, type: 'date', jp: true, style: 'short' })),
        ari(`r${n}.denchi`), ari(`r${n}.sonsho`), ari(`r${n}.zero`),
        h('td', null, field({ key: `r${n}.biko` })), h('td', null, field({ key: `r${n}.tenkensha`, align: 'center' }))));
    }
    const table = h('table', { class: 'grid h13' }, h('colgroup', null, ...[22, 27, 27, 27, null, 22].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^r(\d+)\./.exec(key);
      return m && Number(m[1]) > (page - 1) * ROWS && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${ROWS}回分）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= ROWS; i++) Object.keys(values).filter((key) => key.startsWith(`r${(page - 1) * ROWS + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '「ファイルに保存」で管理番号ごとに残せます（ファイル名に管理番号が入ります）。')));
  } });

  const head = { type: 'grid', lw: 4, rowH: 7, rows: [
    [{ label: '管理番号', key: 'kanri', span: 10 }, { label: '機器名', key: 'kiki', span: 14 }],
    [{ label: '件　名', key: 'subject', span: 24 }],
  ] };

  FORM_DEFS['hin-a0013'] = {
    code: '本-品質-A0013', title: '計測機器使用前点検表',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true,
    fileKeys: ['kanri', 'kiki'], // ファイル名は「本-品質-A0013_管理番号_機器名_日付.json」
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [head, list(i + 1)],
    })),
  };
})();
