// 本-購買-A0008 登録電気工事基幹技能者業務注文付属書（品質記録様式。元Word：本-購買-A0008登録電気工事基幹技能者業務注文付属書.doc、A4横1ページ）
// 業務の表は左右2段（本-購買-A0004 と同じ見た目）。○✕欄はクリックで「空欄 → ○ → ✕ → 空欄」、資格の3項目は最初から○（元の様式のまま）
// 手当の金額＝日額×25日×工期（月）を自動。日額の限度（2,000円）・工期1年当たりの限度（500,000円）を超えたら画面だけに注意を出す
// 押印欄は右上（元は右下）。工事部長は工事本部長（支店は支店長）に（本-購買-A0002 と同じ）
(function () {
  // [区分, [業務, …], 最初の印]
  const GROUPS = [
    ['資格', ['「登録電気工事基幹技能者講習修了証」を所持していること。', '「第一種電気工事士免状」を所持し、過去5年以内に「定期講習」を受講していること。',
      '「職長･安全衛生責任者教育修了証」を所持していること。'], '○'],
    ['施工･品質管理', ['「施工計画書」の内容に関して、当社社員に改善を提案する。', '品質･工程管理計画の問題点に関して、当社社員に改善を提案する。', '他職種との作業調整をする。',
      '「施工図」･「施工要領書」に関して、工法･適正部材･VE等を当社社員に提案する。', '「施工図」･「施工要領書」と現場状況との相違に関して、当社社員に改善を提案する。',
      '「施工図」･「施工要領書」を作業員に周知し、技術指導とチェックをする。', '当社社員が行う施工状況･自主検査等の記録及び写真撮影に協力する。',
      '当社社員が行う「自主検査リスト」の作成とチェックに協力する。', '自主検査による是正作業について、作業員に作業方法を指示する。', '是正作業の完了チェックをし、当社社員に完了報告をする。']],
    ['資材管理', ['「機材搬入計画書」と現場進捗状況の照合と作業調整をする。', '「機材搬入計画書」に関して、当社社員に改善を提案する。', '当社社員が行う資機材の受入検査とその記録作成に協力する。',
      '当社社員が行う受入れ資機材の管理に協力する。', '一般材の発注をする。', '一般材の搬入受入れと在庫管理をする。', '当社社員が行う「揚重計画書」の作成と作業に関する業者間調整に協力する。',
      '「揚重計画書」の内容を作業員に周知する。']],
    ['工程管理', ['当社社員が作成する「総合工程表」、「月間工程表」、「週間工程表」の確認と改善提案及び作業員への周知をする。', '現場内工程会議への出席と調整及び作業員に周知する。',
      '他職種との工程調整をする。', '作業の進捗管理と適正な人員配置をする。', '「作業日報」を作成し、当社社員に報告する。']],
    ['安全管理', ['「安全衛生管理計画書」に関して、当社社員に改善の提案をする。', '災害防止協議会に出席し、その内容を作業員に周知する。',
      '職長会議に出席し、その内容を当社社員へ報告するとともに作業員に周知する。', '作業員名簿を作成し、当社社員に報告する。', '新規入場者教育を実施する。',
      '当社社員が行う「作業手順書」の作成に協力する。', '「作業手順書」に関して当社社員に改善提案をするとともに、作業員に周知する。',
      '当社社員が行う「作業指示書」の作成と周知について協力する。', '「作業指示書」に関して、当社社員に改善提案をする。', 'TBM、KYの実施と当社社員への「報告書」類の作成をする。',
      '作業員の健康状態の把握をする。', '持ち込み工具と作業設備の点検と管理をする。', '場内巡視を実施し、記録作成と作業員への指導をする。',
      '作業員の保護具（ヘルメット、安全帯など）の手配をする。', '火気使用作業の管理と作業終了後のチェックをする。', '作業終了後の清掃及び片付けの状態をチェックする。']],
    ['労務管理', ['作業員の定期健康診断の受診状況をチェックし、当社社員に報告する。', '作業員の入退場を管理し、当社社員に報告する。', '作業員詰所、資材置場等の整理整頓のチェックと指導をする。',
      '場内清掃分担について他業者との割当て調整協議し、作業員に指示をする。']],
    ['その他', ['場内乗入れ車両を管理し、当社社員に報告をする。', '当社社員が行う「産業廃棄物管理票（マニフェスト）」の作成と管理に対する協力をする。',
      '当社社員が行う有害物質（PCB、アスベストなど）の処理方法の作業員への指示と確認に対する協力。', null, null, null]], // null：書き込める空欄の行
  ];
  const SPLIT = ['安全管理', 7]; // 左の段は安全管理の7項目目まで（元の様式と同じ区切り）
  const DAYS = 25;
  const LIMIT_DAY = 2000, LIMIT_YEAR = 500000;

  // 左右の段に分ける：[[区分, [[業務, 番号], …], 最初の印, 続き？], …]
  const cols = [[], []];
  GROUPS.forEach(([cat, items, d]) => {
    const list = items.map((t, i) => [t, i]);
    if (cat === SPLIT[0]) { cols[0].push([cat, list.slice(0, SPLIT[1]), d, false]); cols[1].push([cat, list.slice(SPLIT[1]), d, true]); }
    else cols[cols[1].length ? 1 : 0].push([cat, list, d, false]);
  });

  const table = (groups, withHead) => ({ type: 'custom', render: ({ h, field, values, setVal }) => {
    const MARKS = ['', '○', '✕'];
    const mark = (key, d) => {
      const cur = () => (values[key] === undefined ? (d || '') : values[key]);
      const b = h('button', { type: 'button', class: 'b4-mark', title: 'クリックで ○ → ✕ → 空欄' }, cur());
      b.addEventListener('click', () => { const next = MARKS[(MARKS.indexOf(cur()) + 1) % MARKS.length]; setVal(key, next); b.textContent = next; });
      return b;
    };
    const tb = h('tbody', null, h('tr', null, h('th', { class: 'b4-mh' }, '○✕'), h('th', null, ''), h('th', null, '業務及び作業の内容')));
    groups.forEach(([cat, list, d, cont]) => list.forEach(([t, i], r) => tb.append(h('tr', { class: r === 0 ? 'b4-grp' : null },
      h('td', { class: 'b4-m' }, mark(`m.${cat}.${i}`, d)),
      // 区分は縦書き。右の段に続く安全管理は区分名を出さない（元の様式のまま）
      r === 0 ? h('th', { class: 'b4-lbl b8-cat', rowspan: list.length }, cont ? '' : cat) : null,
      t === null ? h('td', { class: 'b4-in' }, field({ key: `free.${cat}.${i}` })) : h('td', { class: 'b4-txt' }, t)))));
    return h('table', { class: 'grid b4 b8' }, h('colgroup', null, h('col', { style: 'width:5.5mm' }), h('col', { style: 'width:6mm' }), h('col')), tb);
  } });

  // 手当の計算（日額×25×工期（月）＝金額）と限度の注意
  const calc = { type: 'custom', render: ({ h, field }) => {
    const yen = (n) => n.toLocaleString('ja-JP');
    const amount = (v) => { const a = Number(String(v.nichigaku || '').replace(/,/g, '')), m = Number(v.kokiMonth); return a && m ? a * DAYS * m : null; };
    return h('div', { class: 'b8-calc' },
      h('table', { class: 'grid b8-calc-t' }, h('colgroup', null, ...[30, 6, 9, 6, 24, 34].map((w) => h('col', { style: `width:${w}mm` }))), h('tbody', null,
        h('tr', null, h('th', null, '日　額'), h('th', { colspan: 4 }, '工　期（月）'), h('th', null, '金　額')),
        h('tr', null,
          h('td', { class: 'b8-n' }, field({ key: 'nichigaku', type: 'money', unit: '円' })),
          h('td', { class: 'b8-op' }, '×'), h('td', { class: 'b8-op' }, String(DAYS)), h('td', { class: 'b8-op' }, '×'),
          h('td', { class: 'b8-n' }, field({ key: 'kokiMonth', type: 'number', align: 'center', unit: 'か月' })),
          h('td', { class: 'b4-auto b8-n' }, field({ key: 'kingaku', type: 'calc', calc: (_, v) => amount(v), unit: '円' }))))),
      h('div', { class: 'b8-warn no-print' }, field({ key: 'warn', type: 'calc', align: 'left', calc: (_, v) => {
        const a = Number(String(v.nichigaku || '').replace(/,/g, '')), m = Number(v.kokiMonth), msg = [];
        if (a > LIMIT_DAY) msg.push(`日額が限度（${yen(LIMIT_DAY)}円）超え`);
        if (a && m && a * DAYS * 12 > LIMIT_YEAR) msg.push(`工期1年当たり${yen(a * DAYS * 12)}円で限度（${yen(LIMIT_YEAR)}円）超え`);
        return msg.length ? '⚠ ' + msg.join('／') : '';
      } })));
  } };

  const notes = { type: 'notes', items: [
    '※1　登録電気工事基幹技能者の配置を求める場合は、当該者が資格を所持していることを確認すること。',
    '2　登録電気工事基幹技能者に依頼する業務に○、依頼しない業務に✕を記入すること。（○✕の欄はクリックで ○ → ✕ → 空欄）',
    '3　手当として、下表の日額を支給する。なお、日額は\\2,000を限度とし、1件の工事について、工期1年当たりの金額は、\\500,000.-を限度とする。',
  ] };
  const notes2 = { type: 'notes', items: [
    '4　工料注文金額は、工事金額に本金額を合算したものとする。',
    '5　注文書発行時に、注文書付属書に本書を添付して発行する。',
  ] };

  FORM_DEFS['kobai-a0008'] = {
    code: '本-購買-A0008', title: '登録電気工事基幹技能者業務注文付属書',
    seitei: '11/12/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    orientation: 'landscape',
    meta: [],
    stamps: [{ boxes: ['購買部長', '工事本部長\n支店は支店長'] }],
    blocks: [
      { type: 'grid', lw: 2, rowH: 6, rows: [[{ label: '工　番', key: 'koban', maxlength: 12, span: 7 }, { label: '件　名', key: 'subject', span: 17 }]] },
      { type: 'row', gap: 4, items: [table(cols[0]), { type: 'col', gap: 2.5, items: [table(cols[1]), notes, calc, notes2] }] },
    ],
  };
})();
