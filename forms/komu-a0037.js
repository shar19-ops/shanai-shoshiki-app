// 本-工務-A0037 苦情処理・契約不適合検査報告書（品質記録様式。元Excel：本-工務-A0037苦情処理・契約不適合検査報告書.xlsx、A4縦1ページ）
// 押印欄は元の様式どおり各欄の右（grid の stamps。本-品質-A0015・A0018 と同じ。修正指示書）：
//   受信者は件名の右、処理計画は欄の右下、処理結果は推定要因の右、是正処置は欄の右。見出しの下に日付（空欄なら「/　　/」）
// 受信者にデート印。工事長の欄は工事長だけ（工事部長は不要）
(function () {
  // 推定要因（該当する項目に〇）：[区分, 項目]。どの区分も最後に「その他（　）」
  const CAUSES = [
    ['当社の', ['施工不良', '器具類不良', '経年劣化']],
    ['他業者の', ['施工不良', '器具類不良', '経年劣化']],
    ['客先の', ['取扱不良', '要望']],
    ['外的要因', ['自然災害', '人為的']],
  ];
  const sec = (t, span) => ({ text: t, span, cls: 'h15-sec' });
  const st = (boxes, stampKey, span = 1, rs) => ({ stamps: [{ boxes, dates: true, stampKey }], span, rs });

  FORM_DEFS['komu-a0037'] = {
    code: '本-工務-A0037', title: '苦情処理・契約不適合検査報告書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '受信者',
    meta: [],
    stamps: [], // 押印欄は各欄の右（元の様式どおり）
    blocks: [
      { type: 'grid', cols: 5, colWidths: ['22mm', '62mm', '22mm', null, '20mm'], rowH: 7, rows: [
        [{ label: '件　名', key: 'subject', lw: 1, span: 4 }, st(['受信者'], 'u.', 1, 3)],
        [{ label: '発行種別', key: 'kind', type: 'radio', options: ['顧客苦情', '契約不適合検査'], nowrap: true, lw: 1, span: 2 },
          { label: '受信日時', key: 'recvW', type: 'inline', lw: 1, span: 2, parts: [{ key: 'recvDate', type: 'date', jp: true, w: 34 }, { key: 'recvTime', type: 'time' }] }],
        [{ label: '発信者 所属', key: 'fromDept', lw: 1, span: 2 }, { label: '発信者 氏名', key: 'fromName', lw: 1, span: 2 }],
      ] },
      { type: 'free', label: '苦情内容', key: 'naiyo', lines: 5 },
      { type: 'grid', lw: 4, rowH: 7, rows: [
        [{ label: '完　成', key: 'kansei', type: 'ym', span: 8 }, { label: '所　在', key: 'shozai', lw: 3, span: 16 }],
        [{ label: '作業所長', key: 'shocho', span: 24 }],
      ] },
      { type: 'grid', cols: 3, colWidths: [null, '20mm', '20mm'], rows: [
        [sec('処理計画', 3)],
        [{ key: 'keikaku', type: 'textarea', lines: 3, span: 1 }, st(['工事長', '作業所長'], 'p.', 2)],
      ] },
      { type: 'free', label: '処理結果', key: 'kekka', lines: 3, grow: true }, // 残りの高さいっぱい
      // 推定要因：区分ごとに該当する項目へ〇（複数可）、その他は内容を書く。右に処理結果の押印欄（元の様式どおり）
      { type: 'grid', cols: 5, colWidths: ['10mm', '18mm', null, '20mm', '20mm'], rowH: 6.5, dense: true, rows: CAUSES.map(([cat, items], i) => [
        ...(i === 0 ? [{ label: '推定\n要因', span: 1, rs: CAUSES.length }] : []),
        { label: cat, span: 1 },
        { key: `cause${i}W`, type: 'inline', span: 1, parts: [
          { key: `cause${i}`, type: 'checks', options: [...items, 'その他'] }, '（', { key: `cause${i}Etc` }, '）'] },
        ...(i === 0 ? [st(['工事長', '作業所長'], 'k.', 2, CAUSES.length)] : []),
      ]) },
      { type: 'notes', items: ['※ 推定要因は、該当する項目に○を記入すること。'] },
      { type: 'grid', cols: 3, colWidths: ['22mm', null, '20mm'], rows: [
        [{ label: '是正処置', key: 'zesei', type: 'radio', options: ['是正処置実施', '上記結果にて処理終了'], lw: 1, span: 2 }, st(['安全品質|保証部長\n保　管'], 'c.')],
      ] },
    ],
  };
})();
