// 本-安全-A0015 安全衛生重点管理表（品質記録様式。元Excel：本-安全-A0015安全衛生重点管理表.xlsx、A4縦1ページ）
// A0001 に寄せる：押印欄は右上に2段（元は下部に横一列）、右端の作成者にデート印、支店長は本部長・RE部長の欄を共用
// 点検は3回まで（点検実施月日①〜③）。評点①〜③の列がそれぞれの点検に対応し、小計・合計・総合評価は自動
(function () {
  const DOW = '日月火水木金土';
  // 点検事項：[見出し, [[文章, 点数], ...]]（点数の合計は100）
  const SECTIONS = [
    ['『社内安全衛生管理関係書類の整備はよいか』', [
      ['現場管理記録(安全衛生目標の実施記録等)', 10],
      ['労務安全に関する書類', 10],
      ['適用事業報告書、時間外･休日労働に関する協定書(労基署)', 8],
    ]],
    ['『現場安全衛生関係書類の整備はよいか』(得意先･提出書類)', [
      ['安全衛生管理に関する誓約書', 3],
      ['労働者名簿', 5],
      ['健康診断書 (コピー)', 5],
      ['有資格者 (免許･特別教育・技能講習等)', 3],
      ['新規入場者教育の実施･記録の社内保管', 5],
      ['安全管理組織図･緊急連絡先･緊急病院連絡先', 3],
      ['持込み機械工具の許可記録･許可シールの貼付け', 3],
    ]],
    ['『作業環境管理はよいか』', [
      ['朝礼･KYK･その他、災防協･安全衛生協議会の参加', 7],
      ['服装･保護帽(安全帯･保護帽･マスク･メガネ等)の着用･使用', 5],
      ['移動足場(脚立･可搬式作業台・高所作業車)の点検･適正使用', 6],
      ['火元責任者、消火器の設置･表示', 2],
      ['資材置場･作業場の整理整頓･清掃', 5],
      ['労働災害(通勤災害含む)を起こしていないか', 20],
    ]],
  ];
  const COLS = [1, 2, 3]; // 評点①〜③（点検実施月日①〜③に対応）
  const key = (s, i, c) => `p${s}_${i}_${c}`;
  const sub = (n, s, c) => SECTIONS[s][1].reduce((t, _, i) => t + n(key(s, i, c)), 0);
  const total = (n, c) => SECTIONS.reduce((t, _, s) => t + sub(n, s, c), 0);
  const entered = (v, c) => SECTIONS.some(([, items], s) => items.some((_, i) => String(v[key(s, i, c)] ?? '') !== ''));
  // 総合評価：評点を入れた一番新しい回の合計で判定（優：100〜85　良：84〜65　可：64〜0）
  const toNum = (x) => { const n = Number(String(x ?? '').replace(/[,，\s]/g, '')); return isNaN(n) ? 0 : n; };
  const rating = (v) => {
    const c = [...COLS].reverse().find((x) => entered(v, x));
    if (!c) return '';
    const t = SECTIONS.reduce((a, [, items], s) => a + items.reduce((b, _, i) => b + toNum(v[key(s, i, c)]), 0), 0);
    return t >= 85 ? '優' : t >= 65 ? '良' : '可';
  };
  const md = (iso) => (iso ? `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}` : '／');

  // 点検事項の表：左に点検事項と評点、右に指導・指示事項／講評／総合評価、下に現場の特記事項と評価者
  const render = ({ h, field, values, setVal }) => {
    // 総合評価：自動で〇。クリックで別の評価に付け替え（〇は1つだけ）。evalManual は手で選んだ評価（'-' は〇なし、'' は自動）
    const chosen = (v) => (v.evalManual === '-' ? '' : v.evalManual || rating(v));
    const evCells = ['優', '良', '可'].map((g) => {
      const btn = h('button', { type: 'button', class: 'inp mark-btn', title: 'クリックで総合評価を付け替え', onclick: () => {
        const next = chosen(values) === g ? '' : g; // 同じものをもう一度押すと〇を外す
        setVal('evalManual', next === rating(values) ? '' : next || '-');
      } });
      return { g, btn };
    });
    const evSync = field({ key: 'evalSync', type: 'calc', calc: (n, v) => { const c = chosen(v); evCells.forEach((e) => { e.btn.textContent = c === e.g ? '〇' : ''; }); return ''; } });
    evSync.style.display = 'none';
    const num = (k) => field({ key: k, type: 'number', align: 'center', dec: 0 });
    const calc = (k, fn) => field({ key: k, type: 'calc', align: 'center', calc: fn });
    const tb = h('tbody');
    tb.append(h('tr', null,
      h('th', null, 'No.'), h('th', { colspan: 2 }, '点　検　事　項'), h('th', null, '点数'),
      // 評点の見出しの下に、その回の点検実施月日（月/日）を自動で表示
      ...COLS.map((c) => h('th', { class: 'q15-sc' }, '評点', h('div', { class: 'q15-md' }, calc(`md${c}`, (n, v) => md(v[`insp${c}`]))))),
      h('th', null, '指導・指示事項')));
    // 右の列：指導・指示事項（3番目の見出しの「2」まで）、講評、総合評価
    let row = 0;
    const rightCol = (tr) => {
      if (row === 0) tr.append(h('td', { class: 'q15-memo', rowspan: 17 }, field({ key: 'shido', type: 'textarea', plain: true, lines: 1 })));
      else if (row === 17) tr.append(h('td', { class: 'lbl' }, '講　評'));
      else if (row === 18) tr.append(h('td', { class: 'q15-memo', rowspan: 4 }, field({ key: 'kohyo', type: 'textarea', plain: true, lines: 1 })));
      row++;
    };
    SECTIONS.forEach(([title, items], s) => {
      const t = h('tr', { class: 'q15-sec' }, h('td'), h('td', { class: 'lbl q15-title', colspan: 2 }, title), h('td', { class: 'q15-na' }), ...COLS.map(() => h('td', { class: 'q15-na' })));
      rightCol(t); tb.append(t);
      items.forEach(([text, pts], i) => {
        const tr = h('tr', null, h('td', { class: 'q15-c' }, String(i + 1)), h('td', { class: 'q15-txt', colspan: 2 }, text),
          h('td', { class: 'q15-c' }, String(pts)), ...COLS.map((c) => h('td', null, num(key(s, i, c)))));
        rightCol(tr); tb.append(tr);
      });
      const st = h('tr', { class: 'q15-sub' }, h('td'), h('td'), h('td', { class: 'lbl' }, '小　計'),
        h('td', { class: 'q15-c' }, String(items.reduce((a, [, p]) => a + p, 0))),
        ...COLS.map((c) => h('td', null, calc(`sub${s}_${c}`, (n) => sub(n, s, c)))));
      rightCol(st); tb.append(st);
    });
    tb.append(h('tr', { class: 'q15-total' },
      h('td', { class: 'lbl', colspan: 2 }, '現　場　の　特　記　事　項'), h('td', { class: 'lbl' }, '合　計'), h('td', { class: 'q15-c' }, '100'),
      ...COLS.map((c) => h('td', null, calc(`total${c}`, (n) => total(n, c)))),
      h('td', { class: 'lbl' }, '総　合　評　価')));
    // 評価者・現場責任者・工事長/工事課長：回ごとに名前
    [['hyoka', '評価者'], ['sekinin', '現場責任者'], ['kojicho', '工事長/工事課長']].forEach(([k, label], r) => {
      tb.append(h('tr', { class: 'q15-sign' },
        r === 0 ? h('td', { class: 'q15-memo', colspan: 2, rowspan: 3 }, field({ key: 'tokki', type: 'textarea', plain: true, lines: 1 })) : null,
        h('td', { class: 'lbl', colspan: 2 }, label),
        ...COLS.map((c) => h('td', null, field({ key: `${k}${c}`, align: 'center' }))),
        r === 0 ? h('td', { class: 'q15-eval', rowspan: 3 }, evSync, h('div', { class: 'q15-evals' },
          ...evCells.map(({ g, btn }) => h('div', { class: 'q15-ev' }, h('span', { class: 'q15-g' }, g), btn)))) : null));
    });
    return h('table', { class: 'grid dense q15' },
      h('colgroup', null, h('col', { style: 'width:7mm' }), h('col'), h('col', { style: 'width:22mm' }), h('col', { style: 'width:9mm' }),
        ...COLS.map(() => h('col', { style: 'width:13mm' })), h('col', { style: 'width:40mm' })),
      tb);
  };

  // 点検実施月日（年月日＋曜日を1つの欄に）・天候・巡視者
  const insp = (c) => [
    { label: `点検実施月日${'①②③'[c - 1]}`, key: `insp${c}W`, type: 'inline', lw: 5, span: 13, parts: [
      { key: `insp${c}`, type: 'date', jp: true, w: 38 },
      { key: `insp${c}Dow`, type: 'calc', align: 'left', calc: (n, v) => (v[`insp${c}`] ? `（${DOW[new Date(v[`insp${c}`] + 'T00:00').getDay()]}）` : '（　）') }] },
    { label: '天　候', key: `tenko${c}`, lw: 3, span: 5 },
    { label: '巡視者', key: `junshi${c}`, lw: 3, span: 6 }];

  const LABEL_W = 'calc((210mm - 24mm) * 4 / 24)'; // 下の表の見出し列（24分割の4列）と同じ幅

  FORM_DEFS['anzen-a0015'] = {
    code: '本-安全-A0015', title: '安全衛生重点管理表',
    seitei: '08/06/18', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作成者', // 押印欄の右端（作成者）にデート印
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    // 元は下部に横一列（社長〜作成者）。右上に2段。支店長は本部長・RE部長の欄を共用、工事長の欄は工事長だけ
    stamps: [
      { boxes: ['社長', '本店長', '総括安全|衛生管理者', '安全管理者'] },
      { boxes: ['衛生管理者', '工事本部長|RE部長\n支店は支店長', '工事長', '作成者'] },
    ],
    stampClass: 'stack',
    headBlocks: [
      { type: 'grid', cols: 2, colWidths: [LABEL_W, null], dense: true, rowH: 5.5, rows: [
        [{ label: '工　番', key: 'koban', lw: 1, span: 2, maxlength: 12 }],
        [{ label: '件　名', key: 'subject', lw: 1, span: 2 }],
        [{ label: '施工場所', key: 'basho', lw: 1, span: 2 }],
        [{ label: '部　署', key: 'dept', lw: 1, span: 2 }],
        [{ label: '現場責任者', key: 'sekininsha', lw: 1, span: 2 }],
      ] },
    ],
    blocks: [
      { type: 'grid', lw: 4, dense: true, rowH: 5.5, rows: [
        [{ label: '事業所', key: 'office', unit: '本部', span: 8 },
          { label: '完成月', key: 'kansei', type: 'ym', lw: 3, span: 7 },
          { label: '建築会社', key: 'kenchiku', lw: 3, span: 9 }],
        insp(1), insp(2), insp(3),
        [{ label: '工事本部長/支店長', key: 'honbucho', lw: 6, span: 12 },
          { label: '工事長/工事課長', key: 'kojicho', lw: 6, span: 12 }],
        [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 15 },
          { label: '発注方式', key: 'hatchu', lw: 3, span: 9 }],
        [{ label: '建設概要', key: 'chika', prefix: '地下', unit: '階', span: 7 },
          { key: 'chijo', prefix: '地上', unit: '階', span: 3 },
          { key: 'touya', prefix: '塔屋', unit: '階', span: 3 },
          { label: '延面積', lw: 3, key: 'menseki', type: 'number', unit: '㎡', span: 7 },
          { key: 'kosu', type: 'number', unit: '戸', span: 4 }],
        [{ label: '協力工事会社', key: 'kyo1', prefix: '1次', span: 10 }, { key: 'kyo2', prefix: '2次', span: 7 },
          { key: 'kyoN', type: 'inline', span: 7, parts: [{ key: 'kyoNo', w: 6, align: 'center' }, '次', { key: 'kyo3' }] }],
      ] },
      { type: 'custom', render },
      { type: 'notes', items: ['（評価基準　優：100～85　良：84～65　可：64～0）　※ 総合評価は最新回の合計で自動判定（クリックで変更可）'] },
    ],
  };
})();
