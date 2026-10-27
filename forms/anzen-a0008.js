// 本-安全-A0008 盗難報告書（品質記録様式。元Excel：本-安全-A0008盗難報告書.xls、A3横1ページ）
// 本-安全-A0006・A0007 に寄せる（A3横、押印欄は上に1段、右端の報告者にデート印、支店長は本部長・RE部長の欄を共用）
// 左：報告者・現場・被害と届出・盗難保険・被害品・状況／右：盗難現場見取図（略図の欄）・再発防止策・部長の意見
(function () {
  const DAMAGE_ROWS = 14; // 被害の品名の行数（元Excelと同じ）
  // 日時（年月日＋時刻「頃」）を1つの欄に
  const when = (k) => ({ key: `${k}W`, type: 'inline', parts: [{ key: `${k}D`, type: 'date', jp: true, w: 38 }, { key: `${k}T`, type: 'time' }, '頃'] });

  const head = { type: 'grid', lw: 3, rowH: 7, dense: true, rows: [
    [{ label: '店　名', key: 'office', type: 'select', options: LISTS.offices, span: 7 },
      { label: '報告日', key: 'reportDate', type: 'date', span: 7 },
      { label: '報告者', key: 'reporter', span: 10 }],
    [{ label: '工　番', key: 'koban', maxlength: 12, span: 8 }, { label: '件　名', key: 'subject', span: 16 }],
    [{ label: '所在地', key: 'addr', span: 16 }, { label: 'TEL', key: 'tel', type: 'tel', lw: 2, span: 8 }],
    [{ label: '部　署', key: 'dept', span: 12 }, { label: '現場担当者', key: 'tanto', lw: 4, span: 12 }],
  ] };

  const incident = { type: 'grid', lw: 3, rowH: 7, dense: true, rows: [
    // 被害の日時・被害発見の日時は同じ高さ（どちらも2行分）。届出警察署は名称とTELを1つの欄に2段（間に横罫線なし）
    [{ label: '被害の日時', ...when('higai'), span: 11, h: 14 },
      { label: '届出警察署', key: 'police', type: 'inline', stack: true, span: 13, h: 14, parts: [{ key: 'policeName' }, { key: 'policeTel', type: 'tel', prefix: 'TEL' }] }],
    [{ label: '被害発見\nの日時', ...when('hakken'), span: 11, rs: 2 },
      { label: '届出の日時', ...when('todoke'), span: 13 }],
    [{ label: '届出人氏名', key: 'todokeName', span: 7 }, { label: '受理番号', key: 'juri', span: 6 }],
    // 盗難保険：当社・他社（ゼネコン）の加入／未加入。当社の加入額は同じ欄に
    [{ label: '盗難保険\n加入状況', key: 'hoken', type: 'inline', span: 24, parts: [
      // 元の様式どおり「加入（　万円）未加入」の並び（同じキーの選択肢を2つに分けて置く）
      '当社：', { key: 'hokenOwn', type: 'radio', options: ['加入'] }, '（', { key: 'hokenAmt', type: 'number', w: 18 }, '万円）',
      { key: 'hokenOwn', type: 'radio', options: ['未加入'] },
      '　他社（ゼネコン）：', { key: 'hokenGc', type: 'radio', options: ['加入', '未加入'] }] }],
  ] };

  // 被害品：被害見積額は数量×単価で自動計算（ユーザー指定）、合計も自動
  const damage = {
    type: 'table', key: 'items', rows: DAMAGE_ROWS, rowH: 6, dense: true,
    columns: [
      { label: '被害の品名及び種類', key: 'name', w: 50 },
      { label: '数　量', key: 'qty', w: 9, type: 'number' },
      { label: '単　価', key: 'price', w: 11, type: 'money' },
      { label: '被害見積額', key: 'amount', w: 14, type: 'calc', calc: (n) => n('qty') * n('price') },
      { label: '備　考', key: 'note', w: 16 },
    ],
    foot: [[{ label: '合　計', span: 3 }, { sum: 'amount' }, { label: '', lbl: false }]],
  };

  FORM_DEFS['anzen-a0008'] = {
    code: '本-安全-A0008', title: '盗難報告書',
    seitei: '06/03/31', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    paper: 'A3', orientation: 'landscape',
    selfStamp: '報告者', // 押印欄の右端（報告者）にデート印（本文の報告者の「印」はなし）
    meta: [],
    // 元は右下に横一列。上に1段で並べ、右端に報告者。支店長は本部長・RE部長の欄を共用（「支店は支店長」と薄く印字）
    stamps: [{ boxes: ['社長', '本店長', '総務部', '総括安全|衛生管理者', '安全品質|保証部長', '工事本部長|RE部長\n支店は支店長', '工事長', '報告者'] }], // 課長の欄は不要（ユーザー指定）
    blocks: [
      { type: 'row', gap: 5, grow: true, items: [
        { type: 'col', items: [head, incident, damage,
          // 状況：コメントと現場写真（Ctrl+V・「画像を追加」。文章の下に並べて印刷、はみ出すときは写真を自動で縮める）
          { type: 'free', label: '状況を具体的に記入（現場状況写真を添付のこと）', key: 'jokyo', lines: 3, grow: true, images: true }] },
        { type: 'col', items: [
          // 見取図：図形・記号・文字・写真を自由に配置（略図の欄）
          { type: 'sketch', label: '盗難現場見取図', key: 'zu', grow: true, hideSyms: ['signal'] }, // 信号の記号は使わない
          { type: 'free', label: '再発防止策', key: 'boshi', lines: 6 },
          { type: 'free', label: '部長の意見', key: 'iken', lines: 5 },
        ] },
      ] },
    ],
  };
})();
