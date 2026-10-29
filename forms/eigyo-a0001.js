// 本-営業-A0001 契約内容確認書（設計・積算）（品質記録様式。元Excel：本-営業-A0001契約内容確認書.xlsx、A4縦1ページ）
// 押印欄は右上（元は右下に承認者・作成者）、右端の作成者にデート印。表題の「（設計・積算）」は、元は該当する方に〇 → 表題の下で選ぶ
// 1ページ＝1回の発行。ページを足すと発行回数が1つずつ増える（修正指示書）。JSONファイルに保存・読み込み（物件ごとにつぎ足す）
//   物件コード・件名・発行部署・作成者・区分はどのページも同じ。確認日・打合・顧客確認者・添付書類・確認事項・押印欄の日付はページごと
(function () {
  const COMMON = ['bukken', 'subject', 'dept', 'author', 'kubun'];
  const pageCount = (v) => Math.max(1, Number(v.pageCount) || 1);
  // n 回目のキー：1回目はそのまま、2回目からは 'p2.' などを付ける
  const pk = (n, key) => (COMMON.includes(key) || n === 1 ? key : `p${n}.${key}`);
  const ownKey = (key, n) => {
    if (n === 1) return /^p\d+\./.test(key) || COMMON.includes(key) || key === 'pageCount' ? null : key;
    return key.startsWith(`p${n}.`) ? key.slice(`p${n}.`.length) : null;
  };

  // 最後のページの下：発行の追加・削除（印刷しない）
  const pageButtons = (n) => ({ type: 'custom', render: ({ h, values, setVal, rebuild }) => {
    const total = pageCount(values);
    if (n !== total) return h('div');
    const del = () => {
      const has = Object.keys(values).some((key) => ownKey(key, total) && String(values[key] ?? '') !== '');
      if (has && !confirm(`${total}回目の入力を消して、ページを減らしますか？`)) return;
      Object.keys(values).filter((key) => ownKey(key, total)).forEach((key) => delete values[key]);
      setVal('pageCount', String(total - 1)); rebuild();
    };
    return h('div', { class: 'k1-pages no-print' },
      h('button', { type: 'button', onclick: () => { setVal('pageCount', String(total + 1)); rebuild(); } }, `＋ ${total + 1}回目の発行を追加`),
      total > 1 ? h('button', { type: 'button', onclick: del }, `${total}回目を削除`) : null,
      h('span', { class: 'k1-hint' }, '発行回数はページの順に自動で入ります。1回分だけ印刷するときは、印刷画面の「ページ」でそのページを指定してください。'));
  } });

  FORM_DEFS['eigyo-a0001'] = {
    code: '本-営業-A0001', title: '契約内容確認書',
    seitei: '99/01/06', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作成者',
    fileIO: true, // 物件ごとに発行をつぎ足すのでファイルに保存（修正指示書）
    fileKeys: ['bukken', 'subject'], // ファイル名は「本-営業-A0001_物件コード_件名_日付.json」
    meta: [{ label: '区　分', key: 'kubun', type: 'radio', options: ['設計', '積算'], nowrap: true, cls: 'noline lg' }],
    stamps: [{ boxes: ['承認者', '作成者'] }],
    pages: (v) => Array.from({ length: pageCount(v) }, (_, i) => i + 1).map((n) => ({
      subtitle: pageCount(v) > 1 ? `（${n}/${pageCount(v)}）` : '',
      stampKey: pk(n, ''),
      blocks: [
        { type: 'grid', lw: 4, rowH: 8, rows: [
          [{ label: '物件コード', key: 'bukken', span: 14 }, { label: '発行回数', key: pk(n, 'kaisu'), type: 'calc', align: 'center', calc: () => `${n}　回`, lw: 4, span: 10 }],
          [{ label: '件　名', key: 'subject', span: 24 }],
          [{ label: '発行部署', key: 'dept', span: 14 }, { label: '作成者', key: 'author', lw: 4, span: 10 }],
          [{ label: '確認日', key: pk(n, 'date'), type: 'date', span: 14 }, { label: '打　合', key: pk(n, 'uchiawase'), lw: 4, span: 10 }],
          [{ label: '', span: 4 }, { label: '会　社　名', span: 8 }, { label: '部　署', span: 6 }, { label: '氏　名', span: 6 }],
          [{ label: '顧客確認者', span: 4 }, { key: pk(n, 'cCompany'), span: 8 }, { key: pk(n, 'cDept'), span: 6 }, { key: pk(n, 'cName'), span: 6 }],
          [{ label: '添付書類名', key: pk(n, 'tenpu'), type: 'textarea', plain: true, h: 22, span: 24 }],
        ] },
        { type: 'free', label: '確認事項記入欄', key: pk(n, 'kakunin'), lines: 16, grow: true },
        { type: 'notes', items: [
          '1. 保管部署　① 設計依頼の場合 → 設計見積部　② 設計依頼以外の場合 → 営業本部、支店',
          '2. 承認者　　① 設計依頼の場合 → 社内設計：営業本部長、社外設計：本店長　② 設計依頼以外の場合 → 営業本部長、支店長',
          '※ この確認書には以下の事項のみ記入すること。①顧客からの要求事項　②顧客の了解を得られた事項',
        ] },
        pageButtons(n),
      ],
    })),
  };
})();
