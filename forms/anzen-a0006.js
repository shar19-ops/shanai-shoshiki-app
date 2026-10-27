// 本-安全-A0006 災害報告書（品質記録様式。元Excel：本-安全-A0006災害報告書.xlsx、A4縦2ページ）
// ユーザー指定：A3横1枚、押印欄は上。元の1ページ目を左、2ページ目（時系列・原因・所見）を右に並べる
(function () {
  const vt = (s) => s.split('').join('\n'); // 縦書きの見出し（1文字ずつ改行）
  const LOG_ROWS = 20; // 災害当日の作業状況（時系列）の行数

  // 左：報告の基本情報・被災者・災害発生状況（1列目は縦見出し用の細い列）
  const left = { type: 'grid', cols: 25, colWidths: ['7mm'], lw: 3, rowH: 7, rows: [
    [{ label: '工　番', key: 'koban', lw: 4, span: 13, maxlength: 12 },
      { label: '災害の種類', key: 'shurui', type: 'checks', lw: 3, span: 12, rs: 3,
        options: ['墜落・転落', '転倒', '激突', '飛来・落下', '崩壊・倒壊', '巻き込まれ・はさまれ', '切れ・こすれ', '有害物接触', '感電', '火傷', '疾病', '自動車等による災害'] }],
    [{ label: '件　名', key: 'subject', lw: 4, span: 13 }],
    [{ label: '報告者', key: 'reporter', lw: 4, span: 10 }, { stampCell: true, span: 3 }],
    // 被災者
    [{ label: vt('被災者'), span: 1, rs: 5 },
      { label: '氏　名', key: 'vName', span: 9 },
      { label: '性　別', key: 'sex', type: 'radio', options: ['男', '女'], span: 6 },
      { label: '所　属', key: 'vDept', span: 9 }],
    [{ label: '生年月日', key: 'birth', type: 'date', span: 9 },
      { label: '年　齢', key: 'age', type: 'number', unit: '才', span: 6 },
      { label: '健康状況\n（既往症）', key: 'health', span: 9 }],
    [{ label: '住　所', key: 'addr', prefix: '〒', span: 15 }, { label: 'TEL', key: 'vTel', type: 'tel', span: 9 }],
    [{ label: '職　種', key: 'shokushu', span: 6 },
      { label: '入社年月日', key: 'nyusha', type: 'date', span: 9 },
      { label: '経験年数', key: 'expY', type: 'number', unit: '年', span: 5 },
      { key: 'expM', type: 'number', unit: 'ヶ月', span: 4 }],
    [{ label: '雇用区分', key: 'koyo1', type: 'radio', options: ['雄電社', '会員会社', '非会員会社'], span: 10 },
      { key: 'koyo2', type: 'radio', options: ['社員', '常傭', '日雇', 'その他'], span: 10 },
      { key: 'koyoEtc', prefix: '（', unit: '）', span: 4 }],
    // 災害発生状況
    [{ label: vt('災害発生状況'), span: 1, rs: 7 },
      { label: '発生場所', key: 'place', span: 12 }, { label: '元請名', key: 'motouke', span: 12 }],
    [{ label: '発生日時', key: 'hDate', type: 'date', span: 8 }, { key: 'hTime', type: 'time', unit: '頃', span: 4 },
      { label: '休・不休別', key: 'kyugyo', type: 'radio', options: ['不休', '休業'], span: 7 },
      { key: 'mikomi', type: 'number', prefix: '（見込', unit: '日）', span: 5 }],
    [{ label: '作業名', key: 'sagyoName', span: 12 },
      { label: '作業区分', key: 'sagyoKbn', type: 'radio', options: ['単独作業', '共同作業'], span: 9 },
      { key: 'ninzu', type: 'number', unit: '名', span: 3 }],
    [{ label: '傷病部位', key: 'bui', span: 8 }, { label: '傷病名', key: 'byomei', span: 8 }, { label: '現認者', key: 'genninsha', span: 8 }],
    [{ label: '病院名', key: 'hospital', span: 8 }, { label: '所在地', key: 'hospAddr', span: 10 }, { label: 'TEL', key: 'hospTel', type: 'tel', lw: 2, span: 6 }],
    [{ text: '（事故の内容）①どの様な場所で　②どの様な作業をしているときに　③どの様な物又は環境に　④どの様な不安全な又は有害な状態があって　⑤どのようにして災害が発生したかを具体的に記入', note: true, span: 24 }],
    [{ key: 'naiyo', type: 'textarea', lines: 7, span: 24 }],
  ] };

  // 右：災害当日の作業状況（時系列）・災害原因・安全管理者・総括安全衛生管理者の所見
  const logRows = [];
  for (let i = 1; i <= LOG_ROWS; i++) {
    logRows.push([
      { key: `log${i}d`, span: 2, align: 'center', type: 'number' },
      { key: `log${i}t`, type: 'time', span: 4 },
      { key: `log${i}x`, span: 18 },
    ]);
  }
  const right = { type: 'grid', cols: 25, colWidths: ['7mm'], lw: 3, dense: true, grow: true, rows: [
    [{ label: vt('災害当日の作業状況・災害・処理状況'), span: 1, rs: LOG_ROWS + 1 },
      { label: '日', span: 2 }, { label: '時：分', span: 4 }, { label: '当日朝礼から時系列で記入', span: 18, lalign: 'left' }],
    ...logRows,
    [{ label: vt('災害原因'), span: 1, rs: 2 },
      { text: '物的（不安全状態）・人的（不安全行動）原因（作成者又は部長記入）', note: true, span: 24 }],
    [{ key: 'genin', type: 'textarea', lines: 4, span: 24 }],
    [{ label: vt('安全管理者'), span: 1 }, { key: 'anzenKanri', type: 'textarea', lines: 4, span: 24 }],
    [{ label: vt('総括安全衛生管理者'), span: 1, rs: 2 }, { key: 'sokatsu', type: 'textarea', lines: 4, span: 24 }],
    [{ label: '適用保険', key: 'hoken', type: 'checks', options: ['労災保険（当社）', '労災保険（元請）', '労災保険（特別労災）', 'その他'], span: 19 },
      { key: 'hokenEtc', prefix: '（', unit: '）', span: 5 }],
  ] };

  FORM_DEFS['anzen-a0006'] = {
    code: '本-安全-A0006', title: '災害報告書',
    paper: 'A3', orientation: 'landscape',
    selfStamp: '印', // 報告者の「印」欄にデート印（stampCell）
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    // 元は2ページ目の下に横一列（安全管理者の欄に「保管」）。上に1段で並べる
    // 本-安全-A0001 と同じく、支店長の欄は工事長と同じ欄（工事長・支店長）
    stamps: [{ boxes: ['社長', '本店長', '総務部', '総括安全|衛生管理者', '安全管理者\n保管', '衛生管理者', '工事本部長|RE部長', '工事長|支店長'] }],
    blocks: [
      { type: 'row', gap: 5, grow: true, items: [
        { type: 'col', items: [left, { type: 'image', label: '災害発生状況図', key: 'zu', grow: true }] },
        { type: 'col', items: [right] },
      ] },
      { type: 'notes', items: ['※ この報告書は災害発生後速やかに提出のこと'] },
    ],
  };
})();
