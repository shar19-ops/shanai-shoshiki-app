// 本-品質-A0021 検査報告書（品質記録様式。元Excel：本ー品質ーA0021 検査報告書.xlsx、A4縦1ページ）
// 既存の書式に出来る限り寄せる、押印欄も元の書式のまま（チェック表のご指示）
//   合否判定の右に検査員、添付書類の右に安全品質保証部長（保管）・検査員チーフ、表の下の右に引渡し承認（工事本部長／RE部長・支店長）
// 押印欄は見出しの下に日付（空欄なら「/　　/」）。□はクリックで選ぶ。表は col の fit で隙間なくつなぐ
(function () {
  const L = '20mm'; // 見出しの列の幅（どの表も同じ）
  const date = (key) => ({ key, type: 'date', jp: true });
  const st = (boxes, stampKey, span, rs) => ({ stamps: [{ boxes, dates: true, stampKey }], span, rs });

  FORM_DEFS['hin-a0021'] = {
    code: '本-品質-A0021', title: '検査報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 検査員と品質保証部の間で書き足していくのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0021_工番_件名_日付.json」
    meta: [],
    stamps: [], // 押印欄は元の書式どおり表の中と表の下
    blocks: [
      { type: 'col', fit: true, gap: 0, items: [
        { type: 'grid', cols: 4, colWidths: [L, null, '24mm', '62mm'], rowH: 6.6, rows: [
          [{ label: '事 業 所', key: 'jigyoW', type: 'inline', lw: 1, span: 2, parts: [
            { key: 'jigyo', type: 'radio', options: ['本店', '支店'], nowrap: true }, { key: 'shiten', placeholder: '（支店名）' }] },
            { label: '検 査 日', ...date('kensabi'), lw: 1, span: 2 }],
          [{ label: '部　　署', key: 'busho', lw: 1, span: 2 }, { label: '検査種別', key: 'shubetsu', type: 'radio', options: ['中　間', '竣　工'], nowrap: true, lw: 1, span: 2 }],
          [{ label: '作業所長', key: 'shocho', lw: 1, span: 2 }, { label: '検査員チーフ', key: 'chiefH', lw: 1, span: 2 }],
          [{ label: '工　　番', key: 'koban', maxlength: 12, lw: 1, span: 2 }, { label: '金　　額', key: 'kingaku', type: 'money', lw: 1, span: 2 }],
          [{ label: '件　　名', key: 'subject', lw: 1, span: 4 }],
          [{ label: '工　　期', key: 'kFrom', key2: 'kTo', type: 'daterange', lw: 1, span: 4 }],
          [{ label: '建物概要', rs: 3, span: 1 }, { key: 'yotoW', type: 'inline', span: 3, parts: ['［用　　途］', { key: 'yoto' }] }],
          [{ key: 'kaisuW', type: 'inline', span: 3, parts: ['［階　　数］　　地下', { key: 'chika', w: 12, align: 'center' }, '階 ･ 地上', { key: 'chijo', w: 12, align: 'center' }, '階 ･ PH', { key: 'ph', w: 12, align: 'center' }, '階'] }],
          [{ key: 'menW', type: 'inline', span: 3, parts: ['［延床面積］', { key: 'menseki', w: 30, align: 'right' }, '㎡　（', { key: 'ko', w: 16, align: 'right' }, '戸）'] }],
          [{ label: '得 意 先', key: 'tokui', lw: 1, span: 2 }, { label: '設 計 者', key: 'sekkei', lw: 1, span: 2 }],
        ] },
        { type: 'grid', cols: 3, colWidths: [L, '26mm', null], rowH: 6.6, rows: [
          [{ label: '検　査\nチーム', rs: 2, span: 1 }, { label: '検査員チーフ', key: 'chief', lw: 1, span: 2 }],
          [{ label: '検 査 員', key: 'kensain', lw: 1, span: 2 }],
        ] },
        { type: 'grid', cols: 5, colWidths: [L, '44mm', '8mm', null, '20mm'], rowH: 8.4, rows: [
          [{ label: '合　否\n判　定', rs: 3, span: 1 }, { key: 'gohi', type: 'radio', vertical: true, options: ['合　格', '不合格（再検査へ）'], span: 1, rs: 3 },
            { label: '再\n検\n査', rs: 3, span: 1 },
            { key: 'yoteiW', type: 'inline', span: 1, parts: ['予 定 日', { ...date('yotei'), w: 44 }] }, st(['検 査 員'], 'g.', 1, 3)],
          [{ key: 'jisshiW', type: 'inline', span: 1, parts: ['実 施 日', { ...date('jisshi'), w: 44 }] }],
          [{ key: 'saikensa', type: 'radio', options: ['合　格', '不合格'], nowrap: true, span: 1 }],
        ] },
        { type: 'grid', cols: 1, rows: [
          [{ text: '所感', span: 1, cls: 'h15-sec' }],
          [{ key: 'shokan', type: 'textarea', lines: 6, span: 1 }],
          [{ key: 'kensuW', type: 'inline', span: 1, parts: ['不適合電気設備', { key: 'futekigo', w: 20, align: 'right' }, '件　　　　軽微な不具合', { key: 'keibi', w: 20, align: 'right' }, '件'] }],
        ] },
        { type: 'grid', cols: 5, colWidths: [L, '50mm', null, '20mm', '20mm'], rowH: 6.6, rows: [
          [{ label: '添　付\n書　類', rs: 4, span: 1 }, { text: '不適合処理報告書', span: 1, cls: 'h21-doc' },
            { key: 'b1W', type: 'inline', span: 1, parts: [{ key: 'b1', align: 'right' }, '部'] },
            st(['安全品質|保証部長\n保　管', '検査員チーフ'], 't.', 2, 4)],
          [{ text: '検査指摘事項・確認書', span: 1, cls: 'h21-doc' }, { key: 'b2W', type: 'inline', span: 1, parts: [{ key: 'b2', align: 'right' }, '部'] }],
          [{ text: '特別採用申請・確認書', span: 1, cls: 'h21-doc' }, { key: 'b3W', type: 'inline', span: 1, parts: [{ key: 'b3', align: 'right' }, '部'] }],
          [{ text: '検査チェックリスト', span: 1, cls: 'h21-doc' }, { key: 'b4W', type: 'inline', span: 1, parts: [{ key: 'b4', align: 'right' }, '部'] }],
        ] },
      ] },
      { type: 'notes', items: ['本報告書のコピーを工事本部長（支店にあっては支店長）、担当工事部長に配付すること。'] },
      { type: 'stamps', align: 'right', groups: [{ label: '引渡し承認', boxes: ['工事本部長|RE部長/支店長'], dates: true }] },
      { type: 'para', text: '保管：安全品質保証部', style: 'text-align:right;font-weight:bold;margin:0' },
    ],
  };
})();
