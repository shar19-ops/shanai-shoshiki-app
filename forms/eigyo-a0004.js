// 本-営業-A0004 受注物件引継票（品質記録様式。元Excel：本-営業-A0004受注物件引継票.xlsx、A4縦1ページ）
// 押印欄は右上（元は右下に横一列）。右端の営業担当者（発行・保管）にデート印、工事本部長/RE部長・購買部長は受領印
// 支店長は営業本部長の欄を共用
(function () {
  const DOW = '日月火水木金土';
  const dow = (k) => ({ key: `${k}Dow`, type: 'calc', align: 'left', w: 9, calc: (n, v) => (v[k] ? `（${DOW[new Date(v[k] + 'T00:00').getDay()]}）` : '（　）') });
  // 添付書類（元の様式の書類名のまま）
  const DOCS = ['工事概要書', '工程表', '現場案内図', '積算原稿', '積算数量調書', '系統毎積算数量調書', '設計図書', '契約内訳書控', '契約内容確認書等', 'VE･CD項目一覧'];

  FORM_DEFS['eigyo-a0004'] = {
    code: '本-営業-A0004', title: '受注物件引継票',
    seitei: '06/03/30', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '営業担当者',
    meta: [],
    stamps: [{ boxes: ['本店長', '工事本部長|RE部長\n受領', '購買部長\n受領', '営業本部長\n支店は支店長', '営業担当者'] }],
    blocks: [
      // 48分割（金額の行で、見出し・金額・粗利の幅を細かく合わせるため）
      { type: 'grid', cols: 48, lw: 6, rowH: 6.5, dense: true, rows: [
        [{ label: '受注報告', key: 'jucyu', type: 'date', span: 18 },
          { label: '引継会', key: 'hikitsugiW', type: 'inline', span: 30, parts: [
            { key: 'hikitsugi', type: 'date', jp: true, w: 36 }, dow('hikitsugi'), { key: 'hikitsugiT', type: 'time' }] }],
        [{ label: '工　番', key: 'koban', maxlength: 12, span: 18 }, { label: '見積No.', key: 'mitsumoriNo', span: 30 }],
        [{ label: '契約先', key: 'keiyakusaki', span: 18 }, { label: '件　名', key: 'subject', span: 30 }],
        // 金額は11桁（100億円単位）まで入る幅に（ユーザー指定）
        [{ label: '見積金額', key: 'mitsumori', type: 'money', unit: '円', lw: 5, span: 16 },
          { label: '契約金額', key: 'keiyaku', type: 'money', unit: '円', lw: 5, span: 16 },
          { label: '実行金額', key: 'jikko', type: 'money', unit: '円', lw: 5, span: 16 }],
        // 注文書の行は金額の行の直下（ユーザー指定）
        [{ label: '注文書', key: 'chumon', type: 'ym', span: 18 }, { label: '第1回請求', key: 'seikyu1', type: 'ym', lw: 8, span: 16 },
          // 粗利＝（契約金額−実行金額）÷契約金額、小数点第1位まで（第2位以下は切り捨て。ユーザー指定）
          { label: '粗　利', key: 'arari', type: 'calc', unit: '%', dec: 1, lw: 5, span: 14,
            calc: (n) => (n('keiyaku') ? (Math.trunc(Math.round((n('keiyaku') - n('jikko')) / n('keiyaku') * 1e6) / 1e4 * 10) / 10).toFixed(1) : '') }],
        [{ label: '現場状況', key: 'genbaW', type: 'inline', span: 30, parts: [
            { key: 'genbaDate', type: 'date', jp: true, w: 36 }, '現在', { key: 'genba' }] },
          { label: '設計協力', key: 'sekkeiW', type: 'inline', span: 18, parts: [
            { key: 'sekkei', type: 'radio', options: ['有'] }, '（', { key: 'sekkeiNote' }, '）', { key: 'sekkei', type: 'radio', options: ['無'] }] }],
        [{ label: '営業背景', key: 'haikei', type: 'textarea', plain: true, h: 14, span: 48 }], // 3行程度（ユーザー指定）
      ] },
      // 推薦・分類は記号で選ぶ（一覧を開くと意味も出る）。凡例は表の見出しの上に小さな文字で（ユーザー指定）
      { type: 'table', key: 'maker', rows: 5, rowH: 5.5, dense: true, headH: 6,
        title: '指定メーカーリスト',
        caption: '推薦〔施主（施）・設計事務所（事）・ゼネコン（建）・社内（社）〕　　分類〔指定（◎）・金額が合えば（○）・見積を取って下さい（△）〕',
        columns: [
          { label: 'No', key: 'no', w: 5, rowNo: true },
          { label: '品　名', key: 'hinmei', w: 22 },
          { label: '推薦', key: 'suisen', w: 7, type: 'select', align: 'center', codeOnly: true,
            options: [['施', '施（施主）'], ['事', '事（設計事務所）'], ['建', '建（ゼネコン）'], ['社', '社（社内）']] },
          { label: '分類', key: 'bunrui', w: 7, type: 'select', align: 'center', codeOnly: true,
            options: [['◎', '◎（指定）'], ['○', '○（金額が合えば）'], ['△', '△（見積を取って下さい）']] },
          { label: 'メーカー', key: 'maker', w: 20 },
          { label: '代理店', key: 'dairiten', w: 20 },
          { label: '推薦依頼者', key: 'iraisha', w: 19 },
        ],
      },
      { type: 'table', key: 'docs', rows: DOCS.length, rowH: 5, dense: true, headH: 6, title: '添付書類 チェック欄',
        columns: [
          { label: '書　類　名', key: 'name', w: 26, align: 'left', head: (r) => DOCS[r - 1] },
          { label: '工事', key: 'koji', w: 7, type: 'select', options: ['○'], align: 'center' },
          { label: '購買', key: 'kobai', w: 7, type: 'select', options: ['○'], align: 'center' },
          { label: '発　行　日', key: 'date', w: 26, type: 'date' },
          { label: '備　考', key: 'note', w: 34 },
        ],
      },
      { type: 'free', label: '引継会議事項', key: 'gijiko', lines: 2, grow: true },
      { type: 'grid', lw: 4, rowH: 6.5, dense: true, rows: [
        [{ label: 'プロセス', span: 4 }, { label: '開　催　日', span: 8 }, { label: '本店長', span: 4 }, { label: 'その他出席者', span: 8 }],
        [{ label: 'NET検討会', span: 4 },
          { key: 'netW', type: 'inline', span: 8, parts: [{ key: 'netDate', type: 'date', jp: true }, dow('netDate')] },
          { key: 'netHoncho', type: 'radio', options: ['出席', '欠席'], nowrap: true, span: 4 }, { key: 'netOthers', span: 8 }],
        [{ label: '施工検討会', span: 4 },
          { key: 'sekoW', type: 'inline', span: 8, parts: [{ key: 'sekoDate', type: 'date', jp: true }, dow('sekoDate')] },
          { key: 'sekoHoncho', type: 'radio', options: ['出席', '欠席'], nowrap: true, span: 4 }, { key: 'sekoOthers', span: 8 }],
      ] },
      { type: 'notes', items: [
        '※ 添付書類の系統毎とは、電力幹線、弱電幹線、Fユニット等をいう。　※ 施工検討会は、NET検討会後1ヶ月以内に開催する。',
        '※ 工事本部長（工事部長）･購買部長にそれぞれ配布し、受領印を受けたものを品質保証部に配布し、営業担当者が保管する。',
      ] },
    ],
  };
})();
