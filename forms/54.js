// 日報（1日・11日・21日始まりの10日分。21日始まりは月末まで最大11日）
// 元Excelは社員CDから社員一覧（社員CDシート）を引いて氏名を出すが、個人情報なので取り込まず氏名は手入力。
(function () {
  const DAYS = 11; // 21日始まりで31日まである月の最大日数
  const PER = 3;   // 1日あたりの行数
  // 開始日の選択肢：各月の1日・11日・21日だけ（2か月先〜12か月前、新しい順）。値は 'YYYY-MM-DD'
  const starts = (() => {
    const t = new Date();
    const out = [];
    for (let k = 2; k >= -12; k--) {
      const d = new Date(t.getFullYear(), t.getMonth() + k, 1);
      const y = d.getFullYear(), m = d.getMonth() + 1;
      [21, 11, 1].forEach((day) => out.push([`${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`, `${y}年 ${m}月 ${day}日`]));
    }
    return out;
  })();
  const parse = (v) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.start || '');
    return m ? { y: +m[1], mo: +m[2], s: +m[3] } : null;
  };
  // 組 g（1始まり）の日付。開始日が未選択、または月をまたぐ日は null
  const dayOf = (v, g) => {
    const p = parse(v);
    if (!p) return null;
    if (p.s < 21 && g > 10) return null; // 1日・11日始まりは10日分
    const d = new Date(p.y, p.mo - 1, p.s + g - 1);
    return d.getMonth() === p.mo - 1 ? d : null;
  };
  const groupOf = (r) => Math.floor((r - 1) / PER) + 1;
  // 期間：2026年10月21日 〜 10月31日
  const period = (v) => {
    const p = parse(v);
    if (!p) return '';
    let last = null;
    for (let g = 1; g <= DAYS; g++) { const d = dayOf(v, g); if (d) last = d; }
    return `${p.y}年${p.mo}月${p.s}日 〜 ${last.getMonth() + 1}月${last.getDate()}日`;
  };

  FORM_DEFS['54'] = {
    code: '般-54', title: '日　報',
    selfStamp: '発行者', // 押印欄の右端（発行者）にデート印
    // 表題の下：開始日（各月の1日・11日・21日から選ぶ）を大きめに、その下に期間
    meta: [
      { label: '', key: 'start', type: 'select', options: starts, placeholder: '　　　　年　　月　　日', cls: 'big noline', w: 50 },
      { label: '期間', key: 'period', type: 'calc', align: 'left', calc: (n, v) => period(v), cls: 'newline', w: 60 },
    ],
    stamps: [{ boxes: ['承認', '確認', '確認', '発行者'] }],
    blocks: [
      // 区分は見出しの下に値（予定／実施）を置く
      { type: 'grid', dense: true, rowH: 7.5, rows: [ // 行の高さは通常の1.5倍
        [{ label: '区　分', span: 3 }, { label: '所属CD', key: 'deptCd', span: 11, lw: 3 },
          { label: '社員CD', key: 'empCode', span: 10, lw: 3, maxlength: 7, inputmode: 'numeric', placeholder: '7桁の数字' }],
        [{ key: 'kubun', type: 'select', options: ['予定', '実施'], default: '実施', align: 'center', span: 3 }, { label: '所　属', key: 'dept', span: 11, lw: 3 },
          { label: '氏　名', key: 'name', span: 10, lw: 3 }],
      ] },
      {
        type: 'table', key: 'd', rows: DAYS * PER, groupRows: PER, groupCopy: true, rowH: 5.3, headH: 6, dense: true,
        columns: [
          { label: '日', key: 'day', w: 3.5, grouped: true, rowCalc: (r, v) => { const d = dayOf(v, groupOf(r)); return d ? String(d.getDate()) : ''; } },
          { label: '曜', key: 'dow', w: 3.5, grouped: true, rowCalc: (r, v) => { const d = dayOf(v, groupOf(r)); return d ? '日月火水木金土'[d.getDay()] : ''; } },
          { label: '工事番号', key: 'koban', w: 17.5, maxlength: 12 },
          { label: '件名（略称）', key: 'subject', w: 17.5 },
          { label: '行動・業務内容', key: 'work', w: 26 },
          { label: '経費', key: 'cost', w: 10.5, type: 'money' },
          { label: '費用明細', key: 'detail', w: 21.5 },
        ],
        foot: [[{ label: '', span: 4, lbl: false }, { label: '計' }, { sum: 'cost' }, { label: '', lbl: false }]],
      },
      // 経費の内訳：その他を記入すると、交通費＝計−その他を自動で入れる
      { type: 'row', items: [
        { type: 'notes', items: ['※ 日付・曜日は、表題の下の開始日から自動で入ります。', '※ 内訳はその他を記入。交通費は「計 − その他」で自動。'] },
        { type: 'grid', w: 45, rows: [
          [{ label: '内訳', span: 4, rs: 2 }, { label: '交通費', key: 'kotsu', type: 'calc', calc: (n) => n('d.sum.cost') - n('other'), unit: '円', span: 20, lw: 6 }],
          [{ label: 'その他', key: 'other', type: 'money', unit: '円', span: 20, lw: 6 }],
        ] },
      ] },
    ],
  };
})();
