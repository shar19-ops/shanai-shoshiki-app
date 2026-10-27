// 本-安全-A0007 交通事故報告書（品質記録様式。元Excel：本-安全-A0007交通事故報告書.xlsx、A3横1ページ）
// ユーザー指定：本-安全-A0006 に寄せる（A3横、押印欄は上に1段、右端の報告者にデート印、工事長・支店長は同じ欄）
// 左：事故の状況・甲（当方）・乙（相手方）・部長・支店長の所見／右：事故現場略図・事故の原因及び状況・各所見
(function () {
  const vt = (s) => s.split('').join('\n'); // 縦書きの見出し（1文字ずつ改行）
  const DOW = '日月火水木金土';
  // 免許証・車輌・保険など、甲（当方）と乙（相手方）で同じ形の行
  const license = (p) => [{ label: '免許証関係', key: `${p}Lic`, type: 'inline', span: 24, parts: [
    '番号：', { key: `${p}LicNo` }, '交付先：', { key: `${p}LicPlace` }, '交付日：', { key: `${p}LicDate`, type: 'date', w: 34 }, '免許種類：', { key: `${p}LicKind` }] }];
  const vehicle = (p) => [{ label: '車輌関係', key: `${p}Car`, type: 'inline', span: 24, parts: [
    '車種：', { key: `${p}CarKind` }, '車名：', { key: `${p}CarName` }, '登録番号：', { key: `${p}CarNo` }] }];
  const insurance = (p, label) => [
    // 期間（日付2つ）が画面でもはみ出さない幅にする
    { label, key: `${p}Co`, span: 6 },
    { label: '保険証書\n番号', key: `${p}No`, lw: 2, span: 6 },
    { label: '期　間', key: `${p}From`, key2: `${p}To`, type: 'daterange', lw: 2, span: 12 }];
  const damage = (p) => [
    { label: '被害の程度', key: `${p}Dmg`, prefix: '傷名・物損', span: 9 },
    { label: '治療日数', key: `${p}Days`, type: 'number', unit: '日', span: 5 },
    { label: '病院 TEL', key: `${p}HospTel`, type: 'tel', span: 10 }];

  const left = { type: 'grid', cols: 25, colWidths: ['7mm'], lw: 3, rowH: 6.5, dense: true, rows: [
    [{ label: '店　名', key: 'office', type: 'select', options: LISTS.offices, lw: 4, span: 9 },
      { label: '所　属', key: 'dept', span: 8 }, { label: '報告者', key: 'reporter', span: 8 }],
    [{ label: '年　度', key: 'nendo', type: 'number', unit: '年度', lw: 4, span: 9 },
      { label: '事故種別', key: 'shubetsu', type: 'radio', options: ['自損', '加害', '被害'], span: 16 }],
    // 事故発生月日：年月日で表示し、曜日は同じ欄に（間に縦罫線なし）
    [{ label: '事故発生月日', key: 'hDT', type: 'inline', lw: 4, span: 13, parts: [
      { key: 'hDate', type: 'date', jp: true, w: 38 },
      { key: 'hDow', type: 'calc', align: 'left', calc: (n, v) => (v.hDate ? `（${DOW[new Date(v.hDate + 'T00:00').getDay()]}）` : '（　）') }] },
      { key: 'hTime', type: 'time', unit: '頃', span: 12 }],
    [{ label: '事故発生場所', key: 'place', unit: '附近', lw: 4, span: 15 }, { label: '届出警察署', key: 'police', span: 10 }],
    [{ label: '事故の形態', key: 'keitai', type: 'inline', lw: 4, span: 25, parts: [
      { key: 'keitaiK', type: 'checks', options: ['衝突', '追突', '接触', '転落', '死傷', '火災', '踏切', '出合頭', 'その他'] }, '（', { key: 'keitaiEtc' }, '）'] }],
    [{ label: '天　候', key: 'tenko', type: 'radio', options: ['晴', '曇', '雨', '雪', '霧'], nowrap: true, lw: 4, span: 10 },
      { label: '交通状況', key: 'kotsu', type: 'radio', options: ['混雑', '普通', '閑散'], nowrap: true, lw: 2, span: 7 },
      { label: '明　暗', key: 'meian', type: 'radio', options: ['昼間', '夜間', '明け方', '夕方'], nowrap: true, lw: 2, span: 8 }],
    [{ label: '道路状況', lw: 4, span: 4, rs: 2 },
      { key: 'road1', type: 'inline', span: 21, parts: [
        '舗装：', { key: 'hoso', type: 'radio', options: ['している', 'していない'] },
        '　歩道：', { key: 'hodo', type: 'radio', options: ['両側にある', '片側にある', 'ない'] },
        '　片側', { key: 'shasen', type: 'radio', options: ['1', '2', '4'] }, '車線'] }],
    [{ key: 'road2', type: 'inline', span: 21, parts: [
      { key: 'kyokusen', type: 'radio', options: ['直線', '右カーブ', '左カーブ'] },
      '　', { key: 'kobai', type: 'radio', options: ['平坦', '坂'] },
      '　見通し：', { key: 'mitoshi', type: 'radio', options: ['良い', '悪い'] },
      '　', { key: 'roMen', type: 'radio', options: ['舗装', '未舗装'] },
      '　', { key: 'toketsu', type: 'checks', options: ['積雪路', '凍結路'] }] }],
    [{ label: '信号又は標識', key: 'shingo', type: 'inline', lw: 4, span: 25, parts: [
      '信号：', { key: 'sig', type: 'radio', options: ['ある', 'ない'] },
      '　駐停車禁止：', { key: 'chusha', type: 'radio', options: ['されていない', 'されている'] },
      '　一時停止：', { key: 'ichiji', type: 'radio', options: ['ある', 'ない'] },
      '　その他（', { key: 'sigEtc' }, '）'] }],
    [{ label: '速　度', key: 'sokudo', type: 'inline', lw: 4, span: 25, parts: [
      '当方', { key: 'spdA', type: 'number', w: 12 }, 'Km/h（制限速度', { key: 'limA', type: 'number', w: 12 }, 'Km/h）',
      '　相手方', { key: 'spdB', type: 'number', w: 12 }, 'Km/h（制限速度', { key: 'limB', type: 'number', w: 12 }, 'Km/h）'] }],
    // 甲・当方
    [{ label: vt('甲・当方'), span: 1, rs: 6 },
      { label: '運転者氏名', key: 'aName', span: 9 },
      { label: '年　令', key: 'aAge', type: 'number', unit: '才', lw: 2, span: 4 },
      { label: '健康状況', key: 'aHealth', span: 11 }],
    license('a'),
    vehicle('a'),
    insurance('aIns1', '保険会社\n（自賠責）'),
    insurance('aIns2', '保険会社\n（任意）'),
    damage('a'),
    // 乙・相手方
    [{ label: vt('乙・相手方'), span: 1, rs: 9 },
      { label: '運転者氏名', key: 'bName', span: 7 },
      { key: 'bSex', type: 'radio', options: ['男', '女'], nowrap: true, span: 3 },
      { label: '年　令', key: 'bAge', type: 'number', unit: '才', lw: 2, span: 4 },
      { label: '健康状況', key: 'bHealth', lw: 2, span: 5 },
      { label: 'TEL', key: 'bTel', type: 'tel', lw: 1, span: 5 }],
    [{ label: '住　所', key: 'bAddr', span: 16 }, { label: '職　業', key: 'bJob', lw: 2, span: 8 }],
    [{ label: '勤務先', key: 'bWork', span: 16 }, { label: 'TEL', key: 'bWorkTel', type: 'tel', lw: 2, span: 8 }],
    license('b'),
    vehicle('b'),
    insurance('bIns1', '契約保険会社\n（自賠責）'),
    insurance('bIns2', '契約保険会社\n（任意）'),
    [{ label: '保険契約者', key: 'kName', prefix: '氏名', span: 8 }, { label: '住　所', key: 'kAddr', lw: 2, span: 10 }, { label: 'TEL', key: 'kTel', type: 'tel', lw: 2, span: 6 }],
    damage('b'),
  ] };

  FORM_DEFS['anzen-a0007'] = {
    code: '本-安全-A0007', title: '交通事故報告書',
    paper: 'A3', orientation: 'landscape',
    sheetClass: 'tight-checks', // 選択肢が多いので文字と間隔を少し詰める
    selfStamp: '報告者', // 押印欄の右端（報告者）にデート印
    meta: [{ label: '提出日', key: 'date', type: 'date' }],
    // 元は右上に横一列（総括安全衛生管理者の欄に「保管」）。本-安全-A0006 と同じく右端に報告者、工事長・支店長は同じ欄（2段）
    stamps: [{ boxes: ['社長', '本店長', '総務部', '総括安全|衛生管理者\n保管', '安全運転|管理者', '本部長|RE部長', '工事長|支店長', '報告者'] }],
    blocks: [
      { type: 'row', gap: 5, grow: true, items: [
        { type: 'col', items: [left, { type: 'free', label: '部長・支店長', key: 'buchoComment', lines: 3, grow: true }] },
        { type: 'col', items: [
          { type: 'image', label: '事故現場略図（判り易く簡単に）　当方：①　相手車：②　進行方向：➔　衝突場所：✖　人：♀　一時停止：▽', key: 'zu', grow: true },
          { type: 'free', label: '事故の原因及び状況（事故当事者記入）', key: 'genin', lines: 6 },
          { type: 'free', label: '本部長・支店長', key: 'honbuComment', lines: 3 },
          { type: 'free', label: '安全運転管理者（正・副）', key: 'anzenComment', lines: 3 },
          { type: 'free', label: '総括安全衛生管理者', key: 'sokatsuComment', lines: 3 },
        ] },
      ] },
    ],
  };
})();
