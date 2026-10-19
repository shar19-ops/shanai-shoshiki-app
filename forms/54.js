// 日報（1日・11日・21日始まりの10日分。21日始まりは月末まで最大11日）
// 元Excelは社員CDから社員一覧（社員CDシート）を引いて氏名を出すが、個人情報なので取り込まず氏名は手入力。
(function () {
  const DAYS = 11; // 21日始まりで31日まである月の最大日数
  const PER = 3;   // 1日あたりの行数
  // 組 g（1始まり）の日付。年月・開始日が未入力、または月をまたぐ日は null
  const dayOf = (v, g) => {
    if (!/^\d{4}-\d{2}$/.test(v.ym || '') || !v.start) return null;
    const [y, m] = v.ym.split('-').map(Number);
    const s = Number(v.start);
    if (s < 21 && g > 10) return null; // 1日・11日始まりは10日分
    const d = new Date(y, m - 1, s + g - 1);
    return d.getMonth() === m - 1 ? d : null;
  };
  const groupOf = (r) => Math.floor((r - 1) / PER) + 1;
  const lastDay = (v) => {
    let last = null;
    for (let g = 1; g <= DAYS; g++) { const d = dayOf(v, g); if (d) last = d; }
    return last ? `${last.getMonth() + 1}月 ${last.getDate()}日` : '';
  };
  FORM_DEFS['54'] = {
    code: '般-54', title: '日　報',
    selfStamp: '印', // 本人欄は氏名横の「印」欄（stampCell）
    stamps: [{ boxes: ['承認', '確認', '確認', '確認'] }],
    blocks: [
      { type: 'grid', dense: true, lw: 4, rows: [
        [{ label: '区　分', key: 'kubun', type: 'select', options: ['予定', '実施'], span: 6, lw: 3 },
          { label: '年　月', key: 'ym', type: 'ym', span: 7, lw: 3 },
          { label: '開始日', key: 'start', type: 'select', options: [['1', '1日'], ['11', '11日'], ['21', '21日']], span: 6, lw: 3 },
          { label: '〜', key: 'end', type: 'calc', calc: (n, v) => lastDay(v), span: 5, lw: 1 }],
        [{ label: '所属CD', key: 'deptCd', span: 8 }, { label: '所　属', key: 'dept', span: 16, lw: 3 }],
        [{ label: '社員CD', key: 'empCode', span: 8, maxlength: 7, inputmode: 'numeric', placeholder: '7桁の数字' },
          { label: '氏　名', key: 'name', span: 13, lw: 3 }, { stampCell: true, span: 3 }],
      ] },
      {
        type: 'table', key: 'd', rows: DAYS * PER, groupRows: PER, rowH: 5.3, headH: 6, dense: true,
        columns: [
          { label: '日', key: 'day', w: 3.5, grouped: true, rowCalc: (r, v) => { const d = dayOf(v, groupOf(r)); return d ? String(d.getDate()) : ''; } },
          { label: '曜', key: 'dow', w: 3.5, grouped: true, rowCalc: (r, v) => { const d = dayOf(v, groupOf(r)); return d ? '日月火水木金土'[d.getDay()] : ''; } },
          { label: '工事番号', key: 'koban', w: 17.5, maxlength: 12 },
          { label: '件名（略称）', key: 'subject', w: 17.5 },
          { label: '労務', key: 'romu', w: 4.5, type: 'number', align: 'center' },
          { label: '行動・業務内容', key: 'work', w: 21.5 },
          { label: '経費', key: 'cost', w: 10.5, type: 'money' },
          { label: '費用明細', key: 'detail', w: 21.5 },
        ],
        foot: [[{ label: '', span: 5, lbl: false }, { label: '計' }, { sum: 'cost' }, { label: '', lbl: false }]],
      },
      // 般-01 と同じ形：注意書き＋経費の内訳（交通費・その他を記入）
      { type: 'row', items: [
        { type: 'notes', items: ['※ 日付・曜日は、年月と開始日（1日・11日・21日）から自動で入ります。'] },
        { type: 'grid', w: 45, rows: [
          [{ label: '内訳', span: 4, rs: 2 }, { label: '交通費', key: 'kotsu', type: 'money', unit: '円', span: 20, lw: 6 }],
          [{ label: 'その他', key: 'other', type: 'money', unit: '円', span: 20, lw: 6 }],
        ] },
      ] },
    ],
  };
})();
