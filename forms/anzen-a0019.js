// 本-安全-A0019 自動車修理依頼書（品質記録様式。元Excel：本-安全-A0019自動車修理依頼書.xlsx、A4縦1ページ）
// A0018 私有車使用許可願書と同じ形：押印欄は右上（元は下部に横一列。7つあるので2段）、右端の依頼者にデート印
// 支店長は本部長・RE部長の欄を共用、工事長の欄は工事長だけ
(function () {
  const DOW = '日月火水木金土';
  // 年月日＋曜日を1つの欄に
  const dateDow = (k) => ({ key: `${k}W`, type: 'inline', parts: [
    { key: k, type: 'date', jp: true, w: 38 },
    { key: `${k}Dow`, type: 'calc', align: 'left', calc: (n, v) => (v[k] ? `（${DOW[new Date(v[k] + 'T00:00').getDay()]}）` : '（　）') }] });

  FORM_DEFS['anzen-a0019'] = {
    code: '本-安全-A0019', title: '自動車修理依頼書',
    seitei: '10/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '依頼者',
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    stamps: [
      { boxes: ['総括安全|衛生管理者', '経理部長', '総務部長', '安全運転|管理者\n保管'] },
      { boxes: ['工事本部長|RE部長\n支店は支店長', '工事長', '依頼者'] },
    ],
    stampClass: 'stack',
    // 宛名と前文は押印欄の左の空き（表題の下）に置く
    headBlocks: [
      { type: 'para', text: '総括安全衛生管理者　殿' },
      { type: 'para', text: '下記のとおり、自動車の修理を依頼します。' },
    ],
    blocks: [
      { type: 'grid', lw: 4, rowH: 12, rows: [
        // 元の様式は「いずれかに○印をつける」。選択肢の間を空ける（同じキーの選択肢を分けて置く）
        [{ label: '修理区分', key: 'kindW', type: 'inline', span: 24, parts: ['法定点検整備', '故障修理･整備', '車検整備', '交通事故修理']
          .flatMap((o, i) => [i ? '　　' : '　', { key: 'kind', type: 'radio', options: [o] }]) }],
        [{ label: '車　種', key: 'carType', span: 8 }, { label: '登録番号', key: 'carNo', lw: 3, span: 9 },
          { label: '走行距離', key: 'km', type: 'number', unit: 'km', lw: 3, span: 7 }],
      ] },
      // 修理要点（簡単に記入）と概算金額。合計は自動
      { type: 'table', key: 'items', rows: 7, rowH: 12,
        columns: [
          { label: 'No.', key: 'no', w: 8, rowNo: true },
          { label: '修 理 要 点（簡単に記入すること）', key: 'point', w: 70 },
          { label: '概算金額', key: 'amount', w: 22, type: 'money', unit: '円' },
        ],
        foot: [[{ label: '合　計', span: 2 }, { sum: 'amount', unit: '円' }]],
      },
      { type: 'grid', lw: 5, rowH: 12, rows: [
        [{ label: '依頼希望日', ...dateDow('kibo'), span: 12 }, { label: '修理終了\n受領日', ...dateDow('juryo'), span: 12 }],
      ] },
      { type: 'notes', items: ['※ 請求書には、必ずこの依頼書を添付してください。'] },
      { type: 'spacer' },
    ],
  };
})();
