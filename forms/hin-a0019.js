// 本-品質-A0019 予防処置報告書（品質記録様式。元Word：本-品質-A0019予防処置報告書.doc、A4縦1ページ）
// 6つの欄（起こり得る不適合の特定〜有効性のレビュー）に、それぞれ押印欄。押印欄は元の書式に合わせて各欄の右下（ユーザー指定）
// 見出しの下に日付（空欄なら「/　　/」）。同じ役職の欄が何か所もあるので、欄ごとに stampKey で分ける
(function () {
  const sec = (t) => ({ text: t, span: 2, cls: 'h15-sec' });
  // 欄：見出し、記述欄、右下に押印欄（押印欄の列は1つ20mm）
  const box = (title, key, lines, boxes) => ({ type: 'grid', cols: 2, colWidths: [null, `${boxes.length * 20}mm`], rows: [
    [sec(title)],
    [{ key, type: 'textarea', lines, span: 1 }, { stamps: [{ boxes, dates: true, stampKey: `${key}.` }], span: 1 }],
  ] });

  FORM_DEFS['hin-a0019'] = {
    code: '本-品質-A0019', title: '予防処置報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 品質保証部と部署の間で書き足していくのでファイルに保存
    meta: [{ label: '作成日', key: 'sakusei', type: 'date', jp: true }],
    stamps: [], // 押印欄は各欄の右下（元の書式どおり）
    blocks: [
      box('起こり得る不適合の特定', 'tokutei', 4, ['品質保証課長']),
      box('不適合の原因の特定', 'genin', 5, ['品質保証部長', '品質保証課長']),
      box('予防処置の必要性の評価', 'hitsuyo', 3, ['部署長', '品質保証部長']),
      box('必要な処置の決定及び実施', 'shochi', 5, ['品質保証部長', '部署長']),
      box('とった処置の結果', 'kekka', 3, ['品質保証部長', '部署長']),
      box('とった予防処置の有効性のレビュー', 'review', 4, ['品質保証部長']),
    ],
  };
})();
