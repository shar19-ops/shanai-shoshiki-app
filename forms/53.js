// 通勤用定期券購入申請書（元のExcelなし。新規に作成した帳票）
// 項目・値は「通勤用定期券購入台帳_v3.xlsm」の入力シートに合わせる（将来、台帳へ転記できるように）
//   発行日=date／社員ＣＤ=empCode／氏名=name／利用区間1=route1（乗車駅）／利用区間2=route2（降車駅）／経由=via
//   期間(ヵ月)=months（1・3・6の数値）／開始日=start／終了日=end（自動）／金額=amount／工番=koban／件名=subject／備考=note
// 路線が複数のときは「＋ 路線を追加」で利用区間〜開始日の組を足す（ユーザー指定）。1路線目は上のキーのまま、2路線目からは 'r2.' などを付ける
//   4路線までA4の1枚、5路線目からは2枚目（最大8路線）。備考は3行分の高さ。入力検印の押印欄はなし（ユーザー指定）
(function () {
  const PER_FIRST = 4, MAX = 8;
  const routeCount = (v) => Math.min(MAX, Math.max(1, Number(v.routeCount) || 1));
  const rk = (n, key) => (n === 1 ? key : `r${n}.${key}`);
  // 終了日＝台帳と同じ EDATE(開始日, 期間) − 1日（月末はその月の末日にそろえる）
  const endDate = (v, n) => {
    const m = Number(v[rk(n, 'months')]), start = v[rk(n, 'start')];
    if (!start || !m) return '';
    const [y, mo, d] = start.split('-').map(Number);
    const last = new Date(y, mo - 1 + m + 1, 0).getDate();
    const e = new Date(y, mo - 1 + m, Math.min(d, last) - 1);
    return `${e.getFullYear()}年 ${e.getMonth() + 1}月 ${e.getDate()}日`;
  };

  // n 路線目の欄（利用区間・経由・期間・金額・開始日・終了日）。左端に「路線 n」
  const route = (n, many) => ({ type: 'grid', lw: 4, rowH: 9, rows: [
    [{ label: many ? `路線\n${n}` : '路線', span: 2, rs: 4 },
      { label: '利用区間1\n（乗車駅）', key: rk(n, 'route1'), span: 11 }, { label: '利用区間2\n（降車駅）', key: rk(n, 'route2'), span: 11 }],
    [{ label: '経　由', key: rk(n, 'via'), span: 22 }],
    [{ label: '期　間', key: rk(n, 'months'), type: 'select', options: [['1', '1カ月'], ['3', '3カ月'], ['6', '6カ月']], span: 11 },
      { label: '金　額', key: rk(n, 'amount'), type: 'money', unit: '円', span: 11 }],
    [{ label: '開始日', key: rk(n, 'start'), type: 'date', span: 11 },
      { label: '終了日', key: rk(n, 'end'), type: 'calc', calc: (_, v) => endDate(v, n), span: 11 }],
  ] });

  // 最後の路線の下：路線の追加・削除（印刷しない）
  const routeButtons = { type: 'custom', render: ({ h, values, setVal, rebuild }) => {
    const total = routeCount(values);
    const del = () => {
      const keys = Object.keys(values).filter((key) => key.startsWith(`r${total}.`));
      if (keys.some((key) => String(values[key] ?? '') !== '') && !confirm(`路線${total}の入力を消して、路線を減らしますか？`)) return;
      keys.forEach((key) => delete values[key]);
      setVal('routeCount', String(total - 1)); rebuild();
    };
    return h('div', { class: 'k1-pages no-print' },
      total < MAX ? h('button', { type: 'button', onclick: () => { setVal('routeCount', String(total + 1)); rebuild(); } }, '＋ 路線を追加') : null,
      total > 1 ? h('button', { type: 'button', onclick: del }, `路線${total}を削除`) : null,
      h('span', { class: 'k1-hint' }, `路線が複数あるときに足してください（${PER_FIRST}路線までは1枚、${PER_FIRST + 1}路線目からは2枚目。最大${MAX}路線）。`));
  } };

  const head = { type: 'grid', lw: 4, rowH: 10, rows: [
    [{ label: '社員CD', key: 'empCode', span: 10, maxlength: 7, inputmode: 'numeric', placeholder: '7桁の数字' },
      { label: '氏　名', key: 'name', span: 14 }],
    // 工番・件名は社員CDの下（ユーザー指定）
    [{ label: '工　番', key: 'koban', span: 10, maxlength: 12 }, { label: '件　名', key: 'subject', span: 14 }],
  ] };
  // 2枚目の上：社員CD・氏名をそのまま表示
  const head2 = { type: 'grid', lw: 4, rowH: 10, rows: [
    [{ label: '社員CD', key: 'empCode2', type: 'calc', align: 'left', calc: (_, v) => v.empCode || '', span: 10 },
      { label: '氏　名', key: 'name2', type: 'calc', align: 'left', calc: (_, v) => v.name || '', span: 14 }],
  ] };

  FORM_DEFS['53'] = {
    code: '般-53', title: '通勤用定期券購入申請書',
    selfStamp: '申請者', // 本人欄（デート印を押す欄）
    meta: [{ label: '申請日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['承認', '確認', '確認', '申請者'] }],
    pages: (v) => {
      const total = routeCount(v), many = total > 1;
      const nums = (from, to) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
      const first = {
        subtitle: total > PER_FIRST ? '（1/2）' : '',
        blocks: [
          { type: 'para', text: '下記のとおり、通勤用定期券の購入を申請します。' },
          head,
          { type: 'col', gap: 1.5, fit: true, items: nums(1, Math.min(total, PER_FIRST)).map((n) => route(n, many)) },
          ...(total <= PER_FIRST ? [routeButtons] : []),
          { type: 'free', label: '備　考', key: 'note', lines: 3 }, // 備考は3行分（広くしない。ユーザー指定）
          { type: 'notes', items: ['※ 終了日は、期間と開始日から自動で表示されます。'] },
          { type: 'spacer' },
        ],
      };
      if (total <= PER_FIRST) return [first];
      return [first, { subtitle: '（2/2）', stamps: [], blocks: [
        head2,
        { type: 'col', gap: 1.5, fit: true, items: nums(PER_FIRST + 1, total).map((n) => route(n, many)) },
        routeButtons,
        { type: 'spacer' },
      ] }];
    },
  };
})();
