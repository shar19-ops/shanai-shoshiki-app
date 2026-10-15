// 設計料手続き管理リスト（A4横）
FORM_DEFS['25'] = {
  code: '般-25', title: '設計料手続き管理リスト', orientation: 'landscape',
  meta: [{ label: '作成日', key: 'date', type: 'date' }],
  blocks: [
    {
      type: 'table', key: 'rows', rows: 12, rowH: 7.2,
      columns: [
        { label: 'No', key: 'no', w: 3, rowNo: true },
        { label: '件　名', key: 'subject', w: 16 },
        { label: '工番', key: 'koban', w: 8, align: 'center' },
        { label: '契約金額', key: 'amount', w: 8, type: 'money' },
        { label: '設計契約先', key: 'partner', w: 8 },
        { label: '作図工期', key: 'term', w: 9, align: 'center', placeholder: '例 26/4/1～27/3/31' },
        { label: '作図業連', key: 'gyoren', w: 5.5, align: 'center' },
        { label: '設計依頼書', key: 'irai', w: 5.5, align: 'center' },
        { label: '見積書提出', key: 'mitsu', w: 5.5, align: 'center' },
        { label: '命令書発行', key: 'meirei', w: 5.5, align: 'center' },
        { label: '請求予定日', key: 'yotei', w: 5.5, align: 'center' },
        { label: '請求書発行', key: 'seikyu', w: 5.5, align: 'center' },
        { label: '最終原価\n計算書確認', key: 'genka', w: 6, align: 'center' },
        { label: '担当', key: 'tanto', w: 5, align: 'center' },
      ],
    },
    { type: 'notes', items: ['※日付欄は「26/4/1」のように記入。'] },
    // 原本の注記（★・■）を、原本と同じ5列の並び・罫線なしで表示
    { type: 'custom', render: ({ h }) => h('div', { class: 'flow-notes' },
      h('div', { class: 'fn-star' }, '★作図協力業者リスト＝NET安価業者にて選定'),
      h('div', { class: 'fn-cols' }, [
        ['■図面枚数', '■設計金額', '■設計工期', '　確定後業連発行'],
        ['■業連承認', '　受理後発行', '　→設計依頼書と', '　　命令書発行'],
        ['■取決後発行', '　→契約', '※100万円以上＝', '　研究開発費7％必要',
          '※命令書発行時、作図業連（承認版）と工事経費（収入印紙）を添付', '※契約用としてなら命令書発行が先'],
        ['■最終月に', '　担当者と協議', '　設計料請求'],
        ['■設計済みか？', '　設計料外注請求書回送済みか？'],
      ].map((lines) => h('div', null, lines.map((t) => h('div', null, t)))))) },
    { type: 'spacer' },
  ],
};
