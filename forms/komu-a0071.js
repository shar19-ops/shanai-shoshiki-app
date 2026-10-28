// 本-工務-A0071 優良職長表彰申請書（品質記録様式。元Excel：本-工務-A0071優良職長表彰申請書.xlsx、A4縦1ページ）
// 押印欄は右上（元は下部に横一列）、右端の申請者（発行）にデート印。支店長は工事本部長/RE部長の欄を共用、工事長の欄は工事長だけ
// 申請理由の「計」は、レを付けた項目の数を自動で数える（16以上で表彰対象）
(function () {
  // 評価項目：[区分, [文章, ...]]
  const ITEMS = [
    ['法令遵守', ['建設業法、電気工事業法、労働安全衛生法等の法令を遵守している。']],
    ['原価管理\n資材管理', [
      '作業員に施工方法を指導し、配線経路等を最短経路で施工し、電線・ケーブルの過剰使用を抑制した。',
      '作業員に施工方法を指導し、配線の余長を的確に管理し、配線の建設副産物(端材)の発生を抑制した。',
      '作業員に施工方法を指導し、配線支持材の使用量を必要最小限の数量で施工した。',
      '作業員に施工方法を指導し、電線管、BOX類、支持材などの資材を効率よく使用し、無駄を無くし、建設副産物(廃材)の発生を抑制した。',
      '資材の在庫管理(整理、整頓、清潔、清掃)が優秀で、損傷、汚れ、発錆等による建設副産物(廃材)の発生を抑制した。']],
    ['施工管理\n品質管理', [
      '工事担当者の指示を確実に、実施した。',
      '施工方法のVE提案を積極的に行った。',
      '施工図、施工要領書を周知し、的確に施工した。',
      '施工上の問題点の報告及び改善提案を実施した。',
      '工程内検査を自主的に実施して、記録を作成し、工事担当者に報告した。',
      '官庁検査、得意先検査などに立会って協力した。',
      '施工の出来栄えが優れていた。']],
    ['工程管理', [
      '他職種との工程調整を行い、工事担当者に報告した。',
      '工程にあわせて、応援の手配等は自主的に行った。']],
    ['安全管理\n労務管理', [
      '無事故、無災害であった。',
      '再下請負通知書、契約書の写し、作業員名簿、健康診断書の写し等の提出及び修正状況は、良好であった。',
      '作業所のルールを全員に周知し、実施した。',
      '朝礼、KYミーティング等の参加、活動状況が良好であった。',
      '安全作業に留意し、声かけ運動を積極的に行った。']],
    ['環境管理', [
      '建設副産物の分別を確実に実施した。',
      '毎日の作業後の片付け、清掃をよく実施した。',
      '一斉清掃に、積極的に参加した。']],
  ];
  const TARGET = 16; // 該当項目が16以上で表彰対象
  const keys = ITEMS.flatMap(([, list], g) => list.map((_, i) => `r${g + 1}_${i + 1}`));
  const count = (v) => keys.filter((k) => Array.isArray(v[k]) && v[k].length).length;

  const reasons = { type: 'custom', render: ({ h, field }) => {
    const lines = (s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
    const tb = h('tbody', null, h('tr', null, h('th', { colspan: 3 }, '評　価　項　目'), h('th', null, '該当')));
    ITEMS.forEach(([cat, list], g) => list.forEach((t, i) => tb.append(h('tr', { class: i === 0 ? 'q-grp' : null },
      i === 0 ? h('td', { class: 'lbl a71-cat', rowspan: list.length }, ...lines(cat)) : null,
      h('td', { class: 'q-no' }, String(i + 1)),
      h('td', { class: 'q-txt' }, t),
      h('td', { class: 'q-chk' }, field({ key: `r${g + 1}_${i + 1}`, type: 'checks', options: [''], align: 'center' }))))));
    tb.append(h('tr', { class: 'q-grp' },
      h('td', { class: 'lbl', colspan: 3 }, '計（', h('span', { class: 'a71-judge' }, field({ key: 'judge', type: 'calc', align: 'left',
        calc: (n, v) => (count(v) >= TARGET ? '表彰対象' : `あと${TARGET - count(v)}項目で表彰対象`) })), '）'),
      h('td', { class: 'q-chk' }, field({ key: 'total', type: 'calc', align: 'center', showZero: true, calc: (n, v) => count(v) }))));
    return h('div', null, h('div', { class: 'blk-title' }, '3. 申請理由'), h('table', { class: 'grid dense q-check a71' },
      h('colgroup', null, h('col', { style: 'width:20mm' }), h('col', { style: 'width:5mm' }), h('col'), h('col', { style: 'width:12mm' })), tb));
  } };

  FORM_DEFS['komu-a0071'] = {
    code: '本-工務-A0071', title: '優良職長表彰申請書',
    seitei: '10/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '申請者',
    sheetClass: 'tight-gap', // 項目が多いので、欄と欄の間と選択肢の余白を詰めて1ページに
    meta: [],
    stamps: [{ boxes: ['総務部長\n保管', '社長', '本店長\n承認', '工事本部長|RE部長\n支店は支店長', '工事長', '申請者\n発行'] }],
    blocks: [
      { type: 'grid', lw: 4, rowH: 5.6, dense: true, title: '1. 申請する協力会社の職長', rows: [
        [{ label: '会社名', key: 'company', span: 15 }, { label: '代表者名', key: 'daihyo', span: 9 }],
        [{ label: '職長名', key: 'shokucho', span: 24 }],
        [{ label: '住　所', key: 'addr', span: 15 }, { label: 'TEL', key: 'tel', type: 'tel', span: 9 }],
        [{ label: '工　番', key: 'koban', maxlength: 12, span: 9 }, { label: '工事名称', key: 'kojiName', span: 15 }],
        [{ label: '請負次数', key: 'jisu', type: 'number', unit: '次', align: 'center', span: 9 }, { label: '工事内容', key: 'kojiNaiyo', span: 15 }],
        [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 24 }],
        [{ label: '職長教育', key: 'kyoiku', span: 15 }, { label: '修了日', key: 'kyoikuDate', type: 'date', span: 9 }],
        [{ label: '他の資格', key: 'shikaku', span: 15 }, { label: '取得日', key: 'shikakuDate', type: 'date', span: 9 }],
      ] },
      { type: 'grid', lw: 4, rowH: 5.6, dense: true, title: '2. 請負体系', rows: [
        [{ label: '請負次数', span: 4 }, { label: '会　社　名', span: 10 }, { label: '代　表　者　名', span: 10 }],
        ...[['1', '一　次'], ['2', '二　次'], ['3', '三　次']].map(([n, label]) => [
          { label, span: 4 }, { key: `uke${n}Company`, span: 10 }, { key: `uke${n}Daihyo`, span: 10 }]),
      ] },
      reasons,
      { type: 'notes', items: [
        '※1 該当する項目には、□にレを記入すること。　※2 該当項目が16以上ある場合に表彰対象とする。',
        '※3 職長教育修了証及び他の資格のコピーを添付すること。　※4 毎年度11月30日までに随時提出すること。',
      ] },
    ],
  };
})();
