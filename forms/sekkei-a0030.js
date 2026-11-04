// 本-設計-A0030 設計物件プロセス管理表（品質記録様式。元Excel：本-設計-A0030 設計物件ﾌﾟﾛｾｽ管理表(　　年度).xlsx、A3横1ページ＝22件）
// 設計部員全員で作成・共有（ユーザー指定）：ファイルに保存して BOX の設計部フォルダに置き、Box Drive から開いて上書きする
// 1件は2段：設計担当（上段）／協力業者（下段）、設計計画〜妥当性確認は予定日（上段）／実施日（下段）、確認図・実施図は予定日／提出日
//   日付の欄は元の注記どおり「日付」「済」「―（該当なし）」を書くので文字の欄（例：11/5、済、―）
// 1ページ20件、件数が増えたらページを足す。元の様式に押印欄はない（毎月最終金曜日に設計部長が進捗管理）
(function () {
  const PER_PAGE = 20;
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  const k = (n, f) => `d${n}.${f}`; // n：通し番号（1〜）
  const STEPS = [['plan', '設計\n計画'], ['out', 'アウト\nプット'], ['shinsa', '審査'], ['kensho', '検証'], ['dato', '妥当性\n確認']];
  const ZU = [['kakunin', '確認図'], ['jisshi', '実施図']];

  const ledger = (page) => ({ type: 'custom', render: ({ h, field, values, setVal, rebuild }) => {
    const lines = (s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
    const c = (key, cls) => h('td', { class: cls || 's30-d' }, field({ key, align: 'center' }));
    const c2 = (key) => h('td', { rowspan: 2 }, field({ key, align: 'center' }));
    const tb = h('tbody', null,
      h('tr', null, h('th', { rowspan: 2 }, 'No'), h('th', { rowspan: 2 }, '設計番号'), h('th', { rowspan: 2 }, '件　　名'), h('th', null, '設計担当'),
        ...STEPS.map(([, l]) => h('th', null, ...lines(l))), h('th', { rowspan: 2 }, '変更'), ...ZU.map(([, l]) => h('th', null, l)),
        h('th', { rowspan: 2, colspan: 2 }, '品質目標'), h('th', { rowspan: 2 }, '評価表'), h('th', { rowspan: 2 }, '受注', h('br'), '失注'),
        h('th', { rowspan: 2 }, '施工', h('br'), '検討会'), h('th', { colspan: 2 }, '検　査'), h('th', { rowspan: 2 }, '備　　考')),
      h('tr', null, h('th', null, '協力業者'), ...STEPS.map(() => h('th', { class: 's30-sub' }, '予定日', h('br'), '実施日')),
        ...ZU.map(() => h('th', { class: 's30-sub' }, '予定日', h('br'), '提出日')), h('th', null, '中間'), h('th', null, '竣工')));
    for (let i = 1; i <= PER_PAGE; i++) {
      const n = (page - 1) * PER_PAGE + i;
      tb.append(
        h('tr', { class: 'k1-top' },
          h('td', { rowspan: 2, class: 's30-no' }, String(n)), c2(k(n, 'no')),
          h('td', { rowspan: 2, class: 'k1-ta' }, field({ key: k(n, 'subject'), type: 'textarea', plain: true, lines: 1 })),
          c(k(n, 'tanto'), 'k1-sub'), ...STEPS.map(([s]) => c(k(n, `${s}Y`), 'k1-sub')), c2(k(n, 'henko')), ...ZU.map(([z]) => c(k(n, `${z}Y`), 'k1-sub')),
          h('td', { rowspan: 2, colspan: 2, class: 'k1-ta' }, field({ key: k(n, 'mokuhyo'), type: 'textarea', plain: true, lines: 1 })),
          c2(k(n, 'hyoka')), c2(k(n, 'juchu')), c2(k(n, 'kentou')), c2(k(n, 'chukan')), c2(k(n, 'shunko')),
          h('td', { rowspan: 2, class: 'k1-ta' }, field({ key: k(n, 'biko'), type: 'textarea', plain: true, lines: 1 }))),
        h('tr', null, c(k(n, 'kyoryoku'), ''), ...STEPS.map(([s]) => c(k(n, `${s}J`), '')), ...ZU.map(([z]) => c(k(n, `${z}T`), ''))));
    }
    const table = h('table', { class: 'grid k1 s30' },
      h('colgroup', null, ...[9, 24, null, 24, ...Array(5).fill(17), 13, 17, 17, 16, 16, 14, 13, 14, 12, 12, 34].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
    if (page !== pageCount(values)) return table;
    // 最後のページの下に、ページの追加・削除（印刷しない）
    const lastHasData = () => Object.keys(values).some((key) => {
      const m = /^d(\d+)\./.exec(key);
      return m && Number(m[1]) > (page - 1) * PER_PAGE && String(values[key] ?? '') !== '';
    });
    return h('div', null, table, h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(page + 1)); rebuild(); } }, `＋ ページを追加（${PER_PAGE}件）`),
      page > 1 ? h('button', { type: 'button', onclick: () => {
        if (lastHasData() && !confirm(`${page}ページ目には入力があります。消してページを減らしますか？`)) return;
        for (let i = 1; i <= PER_PAGE; i++) Object.keys(values).filter((key) => key.startsWith(`d${(page - 1) * PER_PAGE + i}.`)).forEach((key) => delete values[key]);
        setVal('pageCount', String(page - 1)); rebuild();
      } }, '最後のページを削除') : null,
      h('span', { class: 'k1-hint' }, '日付の欄は「11/5」「済」「―」のように書きます。「ファイルに保存」したファイルを BOX の設計部フォルダに置くと、設計部で共有できます。')));
  } });

  const notes = { type: 'notes', items: ['※1　毎月最終金曜日に設計部長が進捗管理を行う　　　※2　予定日、実施日記入：済　―：該当なし'] };

  FORM_DEFS['sekkei-a0030'] = {
    code: '本-設計-A0030', title: '設計物件プロセス管理表',
    seitei: '09/05/14', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    paper: 'A3', orientation: 'landscape',
    // 元は表題の前に「　　年度」、右上に作成日
    meta: [{ label: '年　度', key: 'nendo', w: 30 }, { label: '作成日', key: 'sakusei', type: 'date', jp: true, right: true }],
    stamps: [], // 元の様式に押印欄なし
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => ({
      subtitle: pageCount(v) > 1 ? `（${i + 1}/${pageCount(v)}）` : '',
      blocks: [ledger(i + 1), notes],
    })),
  };
})();
