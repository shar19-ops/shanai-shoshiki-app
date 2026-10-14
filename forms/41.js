// 東電自家用申込依頼書
(function () {
  // フリガナ付き項目：フリガナ行（細）＋本体
  const kana = (label, key, o = {}) => [
    { items: [{ label: 'フリガナ', key: key + 'Kana', lw: 5, span: 24 }], thin: true },
    [{ label, key, lw: 5, span: 24, ...o }],
  ];
  FORM_DEFS['41'] = {
    code: '般-41', title: '東電自家用申込依頼書',
    selfStamp: '依頼者', // 本人欄（デート印を押す欄）
    meta: [{ label: '受電開始希望日', key: 'juden', type: 'date' }],
    stamps: [{ boxes: ['承認\n工事本部長\nRE部長', '工事長', '工事管理課長', '依頼者'] }],
    blocks: [
      { type: 'notes', items: ['■新設で高圧受電に限る（原則として受電の8ヶ月前までに依頼してください）'] },
      { type: 'grid', dense: true, rows: [
        '■ 契約情報（本社）',
        ...kana('契約名義', 'kName'),
        [{ label: '郵便番号', key: 'kZip', type: 'zip', placeholder: '000-0000', lw: 5, span: 12 }, { label: '電話番号', key: 'kTel', type: 'tel', lw: 4, span: 12 }],
        ...kana('住所', 'kAddr'),
        ...kana('建物名', 'kBldg'),
        '■ 契約者連絡窓口',
        [{ label: '部署名', key: 'mBu', lw: 5, span: 12 }, { label: '担当者名', key: 'mName', lw: 4, span: 12 }],
        '■ 需要場所情報',
        ...kana('需要場所名義', 'jName'),
        ...kana('住所', 'jAddr', { prefix: '〒' }),
        ...kana('建物名', 'jBldg'),
        '■ 郵送先情報',
        ...kana('郵送先名義', 'yName'),
        ...kana('住所', 'yAddr', { prefix: '〒' }),
        ...kana('建物名', 'yBldg'),
        [{ label: '建築会社名', key: 'kensetsu', lw: 5, span: 24 }],
        [{ label: '契約種別', key: 'shubetsu', lw: 5, span: 12 }, { label: '契約電力', key: 'kw', type: 'number', unit: 'kW', lw: 4, span: 12 }],
        '■ 主任技術者情報',
        [{ label: '許可番号', key: 'kyokaNo', lw: 5, span: 12 }, { label: '許可年月日', key: 'kyokaD', type: 'date', lw: 4, span: 12 }],
        ...kana('会社名', 'sCompany'),
        [{ label: '電話番号', key: 'sTel', type: 'tel', lw: 5, span: 12 }, { label: '東京電力PG ID', key: 'pgId', lw: 4, span: 12 }],
        [{ label: '必要図面', lw: 5, span: 5 }, { text: '案内図・付近見取り図・外構図・幹線系統図・幹線各階平面図・QB単線結線図', span: 19 }],
      ] },
      { type: 'spacer' },
    ],
  };
})();
