// 営業活動報告書（行先・経費）— 1週間ごとに回送
(function () {
  const DOW = ['月', '火', '水', '木', '金', '土', '日'];
  FORM_DEFS['01'] = {
    code: '般-01', title: '営業活動報告書', subtitle: '（行先・経費）',
    selfStamp: '発行', // 本人欄（デート印を押す欄）
    meta: [
      { label: '週の開始日（月）', key: 'week', type: 'date' },
      { label: '氏名', key: 'name', w: 40 },
    ],
    stamps: [{ boxes: ['承認', '経理部長', '本部長', '部店長', '課長', '発行'] }],
    blocks: [
      {
        type: 'table', key: 'days', rows: 7, rowH: 26,
        columns: [
          { label: '月日', key: 'md', w: 9, align: 'center', placeholder: '月/日' },
          { label: '曜', key: 'dow', w: 4, head: (r) => DOW[r - 1] },
          { label: '行　先', key: 'dest', w: 20, type: 'textarea', plain: true },
          { label: '実施報告', key: 'report', w: 36, type: 'textarea', plain: true },
          { label: '経費', key: 'cost', w: 11, type: 'money' },
          { label: '費用明細', key: 'detail', w: 20, type: 'textarea', plain: true },
        ],
        foot: [[{ label: '合　計', span: 4 }, { sum: 'cost' }, { label: '', lbl: false }]],
      },
      { type: 'row', items: [
        { type: 'notes', items: ['※ 1週間ごとに回送すること。'] },
        { type: 'grid', w: 45, rows: [
          [{ label: '内訳', span: 4, rs: 3 }, { label: '交通費', key: 'kotsu', type: 'money', unit: '円', span: 20, lw: 6 }],
          [{ label: '電話代', key: 'tel', type: 'money', unit: '円', span: 20, lw: 6 }],
          [{ label: 'その他', key: 'other', type: 'money', unit: '円', span: 20, lw: 6 }],
        ] },
      ] },
    ],
  };
})();
