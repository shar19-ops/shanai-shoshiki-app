// 本-品質-A0018 不適合処理報告書（品質記録様式。元Excel：本ー品質ーA0018 不適合処理報告書.xlsx、A4縦1ページ）
// 検査者が発行 → 作業所長が不適合処理結果を記入 → 検査者が再検査 → 安全品質保証部長が是正処置を判断して保管
// 押印欄は元の様式どおり各欄の右下（grid の stamps）。見出しの下に日付（空欄なら「/　　/」）。検査者・安全品質保証部長は2か所あるので stampKey で分ける
// 発行種別・不適合度・再検査結果・是正処置はクリックで選ぶ。作業所長にデート印
(function () {
  const sec = (t, span) => ({ text: t, span, cls: 'h15-sec' });
  const st = (boxes, stampKey, span = 1, rs) => ({ stamps: [{ boxes, dates: true, stampKey }], span, rs });

  FORM_DEFS['hin-a0018'] = {
    code: '本-品質-A0018', title: '不適合処理報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 検査者・作業所長・品質保証部の間で書き足していくのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0018_工番_件名_日付.json」
    selfStamp: '作業所長',
    sheetClass: 'h18',
    meta: [{ label: '作成日', key: 'sakusei', type: 'date', jp: true }],
    stamps: [], // 押印欄は各欄の右下（元の様式どおり）
    blocks: [
      { type: 'grid', cols: 5, colWidths: ['22mm', '40mm', '16mm', null, '20mm'], rowH: 7, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, lw: 1, span: 2 }, { label: '件　名', key: 'subject', lw: 1, span: 3 }],
        [{ label: '発行種別', key: 'shubetsu', type: 'radio', lw: 1, span: 4,
          options: ['1．工程内検査', '2．中間検査', '3．最終検査', '4．顧客苦情', '5．現場巡回検査', '6．その他'] }, st(['検査者\n発　行'], 'h.', 1, 3)],
        [{ label: '検 査 員', key: 'kensainW', type: 'inline', lw: 1, span: 4, parts: [{ key: 'kensain' }, '※顧客苦情の場合は受信'] }],
        [{ label: '被検査者', key: 'hikensa', lw: 1, span: 4 }],
        [{ key: 'kigenW', type: 'inline', span: 5, parts: ['下記不適合について', { key: 'kigen', type: 'date', jp: true, style: 'md', w: 32 }, 'までに処理をお願いします。'] }],
        [sec('不適合事項', 5)],
        [{ key: 'futekigo', type: 'textarea', lines: 6, span: 5 }],
      ] },
      { type: 'grid', cols: 3, colWidths: [null, '20mm', '20mm'], rows: [
        [{ key: 'doW', type: 'inline', span: 3, parts: ['不適合度：', { key: 'do', type: 'radio', options: ['Ａ', 'Ｂ', 'Ｃ', 'Ｄ'], nowrap: true }] }],
        [sec('不適合処理結果', 3)],
        [{ key: 'kekka', type: 'textarea', lines: 4, span: 1 }, st(['工事長|工事部長', '作業所長'], 's.', 2)],
      ] },
      { type: 'notes', items: ['特別採用を申請した場合は、「特別採用申請・確認書（本－工務－A0038）」を添付する。'] },
      { type: 'grid', cols: 6, colWidths: ['22mm', null, '24mm', '36mm', '20mm', '20mm'], rowH: 7, rows: [
        [{ label: '再検査結果', key: 'saikensa', type: 'radio', options: ['合　格', '不合格'], nowrap: true, lw: 1, span: 2 },
          { label: '最終検査日', key: 'saishu', type: 'date', jp: true, lw: 1, span: 4 }],
        [sec('検査者所見', 4), st(['安全品質|保証部長', '検査者'], 'r.', 2, 2)],
        [{ key: 'shoken', type: 'textarea', lines: 3, span: 4 }],
      ] },
      { type: 'notes', items: ['不適合度Ｃは再検査不要'] },
      { type: 'grid', cols: 4, colWidths: ['22mm', null, '56mm', '20mm'], rows: [
        [{ label: '是正処置', key: 'zeseiMemo', type: 'textarea', lines: 3, lw: 1, span: 2 },
          { key: 'zesei', type: 'radio', vertical: true, options: ['1．是正処置実施', '3．上記結果にて処理終了'], span: 1 }, st(['安全品質|保証部長\n保　管'], 'c.')],
      ] },
      { type: 'para', text: '保管：品質保証部', style: 'text-align:right;font-weight:bold;margin:0' },
    ],
  };
})();
