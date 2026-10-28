// 本-工務-A0037 苦情処理・契約不適合検査報告書（品質記録様式。元Excel：本-工務-A0037苦情処理・契約不適合検査報告書.xlsx、A4縦1ページ）
// 元は段階ごと（処理計画・処理結果・是正処置）に押印欄があった → 右上にまとめ、段階名を縦書きの見出しにする
// 右端の受信者にデート印。工事長の欄は工事長だけ（工事部長は不要）
(function () {
  // 推定要因（該当する項目に〇）：[区分, 項目]。どの区分も最後に「その他（　）」
  const CAUSES = [
    ['当社の', ['施工不良', '器具類不良', '経年劣化']],
    ['他業者の', ['施工不良', '器具類不良', '経年劣化']],
    ['客先の', ['取扱不良', '要望']],
    ['外的要因', ['自然災害', '人為的']],
  ];

  FORM_DEFS['komu-a0037'] = {
    code: '本-工務-A0037', title: '苦情処理・契約不適合検査報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '受信者',
    meta: [],
    // 押印欄は2段（処理計画・処理結果／是正処置・受信者）にして、表題の幅を取る
    sheetClass: 'stamps-2row',
    stamps: [
      { label: '処理計画', boxes: ['工事長', '作業所長'] },
      { label: '処理結果', boxes: ['工事長', '作業所長'] },
      { label: '是正処置', boxes: ['安全品質|保証部長\n保管'] },
      { boxes: ['受信者'] },
    ],
    blocks: [
      { type: 'grid', lw: 4, rowH: 7, rows: [
        [{ label: '件　名', key: 'subject', span: 24 }],
        [{ label: '発行種別', key: 'kind', type: 'radio', options: ['顧客苦情', '契約不適合検査'], nowrap: true, span: 11 },
          { label: '受信日時', key: 'recvW', type: 'inline', span: 13, parts: [{ key: 'recvDate', type: 'date', jp: true, w: 40 }, { key: 'recvTime', type: 'time' }] }],
        [{ label: '発信者 所属', key: 'fromDept', span: 11 }, { label: '発信者 氏名', key: 'fromName', span: 13 }],
      ] },
      { type: 'free', label: '苦情内容', key: 'naiyo', lines: 5 },
      { type: 'grid', lw: 4, rowH: 7, rows: [
        [{ label: '完　成', key: 'kansei', type: 'ym', span: 8 }, { label: '所　在', key: 'shozai', lw: 3, span: 16 }],
        [{ label: '作業所長', key: 'shocho', span: 24 }],
      ] },
      { type: 'free', label: '処理計画', key: 'keikaku', lines: 3 },
      { type: 'free', label: '処理結果', key: 'kekka', lines: 3, grow: true }, // 残りの高さいっぱい
      // 推定要因：区分ごとに該当する項目へ〇（複数可）、その他は内容を書く
      { type: 'grid', rowH: 6.5, dense: true, rows: CAUSES.map(([cat, items], i) => [
        ...(i === 0 ? [{ label: '推定\n要因', span: 2, rs: CAUSES.length }] : []),
        { label: cat, span: 3 },
        { key: `cause${i}W`, type: 'inline', span: 19, parts: [
          { key: `cause${i}`, type: 'checks', options: [...items, 'その他'] }, '（', { key: `cause${i}Etc` }, '）'] },
      ]) },
      { type: 'notes', items: ['※ 推定要因は、該当する項目に○を記入すること。'] },
      { type: 'grid', lw: 4, rowH: 10, rows: [
        [{ label: '是正処置', key: 'zesei', type: 'radio', options: ['是正処置実施', '上記結果にて処理終了'], span: 24 }],
      ] },
    ],
  };
})();
