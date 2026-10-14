// 契約条件確認事項　経費
(function () {
  const ITEMS = [
    '会社協力会費', '現場安全協議会会費', '現場事務所負担金　（場内・場外）', '現場事務所光熱費', '現場事務所　備品・事務用品',
    '現場接地タワークレーン借用', '仮設ELV等昇降機の借用　（日中作業・夜間作業）', '資材揚重仮設費用（揚重センター等）',
    '共通足場（外部足場、内部足場　他）', '可搬式作業台・高所作業車・パレット台車代', '産廃処理費（基本分別処理で産廃量削減します）',
    '受電後の電気料金', '着工から引き渡し迄の主任技術者費用', '残土処分費（基本　場内敷均し処理）', '盗難保険',
    '設備基礎（照明等含む）', '耐火区画処理シール',
  ];
  const MARU = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
  const YN = ['●', '〇'];

  FORM_DEFS['24'] = {
    code: '般-24', title: '契約条件確認事項', subtitle: '（経費）',
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    blocks: [
      { type: 'grid', rows: [
        [{ label: '見積番号', key: 'mitsuNo', span: 9 }, { label: '件　名', key: 'subject', span: 15 }],
        [{ label: '取引先名', key: 'client', span: 15 }, { label: '担当者', key: 'person', span: 9 }],
      ] },
      { type: 'para', text: '負担区分：●＝有り　〇＝無し', style: 'text-align:right;font-size:9pt' },
      {
        type: 'table', key: 'items', rows: 20, rowH: 8.6,
        columns: [
          { label: 'No.', key: 'no', w: 6, head: (r) => MARU[r - 1] },
          { label: '契約条件確認事項', key: 'item', w: 44, align: 'left', head: (r) => ITEMS[r - 1] ?? null },
          { label: '取引先', key: 'client', w: 9, type: 'select', options: YN, align: 'center' },
          { label: '雄電社', key: 'yuden', w: 9, type: 'select', options: YN, align: 'center' },
          { label: '備　考', key: 'note', w: 32 },
        ],
      },
      { type: 'spacer' },
    ],
  };
})();
