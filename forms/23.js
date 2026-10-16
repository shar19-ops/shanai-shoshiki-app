// 工事概要書
(function () {
  // 会社ブロック（住所・会社名・担当者・TEL）
  const party = (label, key) => [
    [{ label, span: 4, rs: 3 }, { label: '住所', key: key + 'Addr', lw: 4, span: 20 }],
    [{ label: '会社名', key: key + 'Name', lw: 4, span: 20, req: true }],
    [{ label: '担当者名', key: key + 'Person', lw: 4, span: 10 }, { label: '会社TEL', key: key + 'Tel', type: 'tel', lw: 3, span: 10 }],
  ];
  // 2次・3次…は次数を入力
  const crew = (label, key) => [
    [label ? { label, span: 4, rs: 3 } : { key: key + 'Lv', unit: '次工事班', span: 4, rs: 3, align: 'center' }, { label: '住所', key: key + 'Addr', lw: 4, span: 20 }],
    [{ label: '会社名', key: key + 'Name', lw: 4, span: 12 }, { label: 'TEL', key: key + 'Tel', type: 'tel', lw: 2, span: 8 }],
    [{ label: '責任者名', key: key + 'Person', lw: 4, span: 10 }, { label: '自宅住所・TEL', key: key + 'Home', lw: 4, span: 10 }],
  ];

  FORM_DEFS['23'] = {
    code: '般-23', title: '工事概要書',
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    blocks: [
      { type: 'grid', dense: true, rows: [
        [{ label: '工　番', key: 'koban', span: 9 }, { label: '件　名', key: 'subject', span: 15, req: true }],
        [{ label: '営業担当', key: 'eigyo', span: 12 }, { label: '工事担当', key: 'koji', span: 12 }],
        [{ label: '契約金額', key: 'amount', type: 'money', unit: '円', span: 12 }, { label: '請求日', key: 'seikyu', span: 6, lw: 3 }, { label: '支払日', key: 'shiharai', span: 6, lw: 3 }],
        [{ label: '受注先', key: 'juchu', span: 12, req: true }, { label: '支払条件', key: 'joken', span: 12, req: true }],
        [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 24, req: true }], // 「〜」の両側に罫線なし
        [{ label: '現　場', span: 4, rs: 2 }, { label: '住所', key: 'siteAddr', lw: 4, span: 20, req: true }],
        [{ label: 'TEL', key: 'siteTel', type: 'tel', lw: 4, span: 10 }, { span: 10 }],
        ...party('施　主', 'seshu'),
        ...party('契約先', 'keiyaku'),
        ...party('設計事務所', 'sekkei'),
        [{ label: '建築会社', span: 4, rs: 5 }, { label: '会社住所', key: 'kenAddr', lw: 4, span: 20 }],
        [{ label: '現場住所', key: 'kenSiteAddr', lw: 4, span: 20 }],
        [{ label: '会社名', key: 'kenName', lw: 4, span: 10, req: true }, { label: '会社TEL', key: 'kenTel', type: 'tel', lw: 3, span: 10 }],
        [{ label: '担当者名', key: 'kenPerson', lw: 4, span: 10, req: true }, { label: '現場TEL', key: 'kenSiteTel', type: 'tel', lw: 3, span: 10 }],
        [{ label: '現場責任者名', key: 'kenChief', lw: 4, span: 10, req: true }, { label: '現場TEL', key: 'kenChiefTel', type: 'tel', lw: 3, span: 10 }],
        [{ label: '建物概要', span: 4, rs: 5 }, { label: '防火対象物', key: 'bouka', lw: 4, span: 10 }, { label: '延面積', key: 'nobe', unit: '㎡', lw: 3, span: 10, req: true }],
        [{ label: '敷地面積', key: 'shikichi', unit: '㎡', lw: 4, span: 10 }, { label: '地下室面積', key: 'chika', unit: '㎡', lw: 3, span: 10 }],
        [{ label: '建築面積', key: 'kenchikuM', unit: '㎡', lw: 4, span: 10 }, { label: '構造', key: 'kozo', lw: 3, span: 10, suggest: CODES.kozo, req: true }],
        [{ label: '棟数', key: 'tou', unit: '棟', lw: 4, span: 10, req: true }, { label: 'その他', key: 'sonota', lw: 3, span: 10 }],
        [{ label: '建物階数', key: 'kaisu', lw: 4, span: 20, req: true, placeholder: '例：地上5階 地下1階 塔屋1階' }],
        ...crew('1次工事班', 'c1'),
        ...crew(null, 'c2'),
        ...crew(null, 'c3'),
      ] },
      { type: 'notes', items: ['注1：不要の欄は棒線で消す。　注2：色付きの欄は必須記入。'] },
      { type: 'free', label: '備考・注意事項', key: 'biko', lines: 3, grow: true },
    ],
  };
})();
