// 本-設計-A0001 有資格者台帳（品質記録様式。元Excel：本-設計-A0001 有資格者台帳.xlsx、A4縦1ページ＝36名）
// 設計部員全員で作成・共有（ユーザー指定）：ファイルに保存して BOX の設計部フォルダに置き、Box Drive から開いて上書きする
// 認定日（3種・2種・1種設計者）は、日付と認定者の認印（元は手押しの認め印 → クリックで苗字を入れて三文判風の認印）
// 1ページ30名（認印を押せる高さにするため、元の36名から減らした）。人数が増えたらページを足す。元の様式に押印欄はない
(function () {
  const PER_PAGE = 30;
  const GRADES = [['g3', '3種設計者'], ['g2', '2種設計者'], ['g1', '1種設計者']];
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）

  const ledger = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    // 認定日の欄：日付（左）と認定者の認印（右）
    const nintei = (n, g) => h('td', { class: 's01-nt' }, h('div', { class: 's01-nt-in' },
      h('div', { class: 's01-nt-d' }, field({ key: k(n, g), type: 'date', jp: true, style: 'short' })),
      h('div', { class: 'in-sm' }, field({ key: k(n, `${g}in`), type: 'inkan' }))));
    const tb = h('tbody', null,
      h('tr', null, h('th', { rowspan: 2 }, '氏　　名'), h('th', { colspan: 3 }, '認　定　日'), h('th', { rowspan: 2 }, '取　得　資　格')),
      h('tr', null, ...GRADES.map(([, label]) => h('th', null, label))));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      tb.append(h('tr', null, h('td', null, field({ key: k(n, 'name') })), ...GRADES.map(([g]) => nintei(n, g)),
        h('td', null, field({ key: k(n, 'shikaku') }))));
    }
    const table = h('table', { class: 'grid s01' },
      h('colgroup', null, ...[30, 32, 32, 32, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^d(\d+)\./.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}名）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`d${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '認印の欄はクリックで押印（認定者の苗字）。「ファイルに保存」したファイルを BOX の設計部フォルダに置くと、設計部で共有できます。')));
  } });

  FORM_DEFS['sekkei-a0001'] = {
    code: '本-設計-A0001', title: '有資格者台帳',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    meta: [],
    stamps: [], // 元の様式に押印欄なし
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [ledger(i + 1), { type: 'notes', items: ['※　認定日記入欄には認定日と認定者の認め印を記すこと。（認印の欄はクリックで押印）'] }],
    })),
  };
})();
