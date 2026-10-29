// 本-安全-A0001 安全・衛生検査指導報告書（品質記録様式。元Excel：本-安全-A0001安全・衛生検査指導報告書.xlsx）
// 一般書式と同じテンプレート：押印欄は右上（元は下部に9つ。2段に並べる）、本人欄は発行者
(function () {
  const MARKS = ['○', '×', '／']; // 判定（元Excelの入力規則）
  // 検査項目：[区分, [[番号, 文章], ...]]
  const LEFT = [
    ['安全管理', [
      [1, '安全書類関係の提出･記載内容は（元方事業者へ）'],
      [2, '労働基準監督署への届出書類は（着工前に提出）'],
      [3, '送り出し教育･新規入場者教育の実施と控えは'],
      [4, '作業員名簿の作成と整備（協力会社毎）は'],
      [5, '協力工事会社からの労務安全書類関係の提出･記載内容は'],
      [6, '安全関係行事の参加（朝礼･KY活動･工程打合せ･協議会等）記録はあるか'],
      [7, '中小企業主･一人親方等が作業している時は、「特別労災に加入」を確認はしたか'],
      [8, '安全指示書の活用、サインはされているか'],
      [9, '掲示物等はよいか（組織図･緊急連絡先･緊急時手順（心得）･病院案内図･施工体系図（下請負業者編成表）･火元責任者･社旗･安全旗）'],
      [10, '安全作業手順書は作成し、活用されているか'],
      [11, '適正配置の確認は良いか（作業主任者、高齢者、疾病等）'],
    ]],
    ['衛生管理', [
      [12, '資材置場･加工場の照度･整理･整頓･社名表示'],
      [13, '定期健康診断の実施状況、写しの控えはあるか'],
      [14, '高速切断機･ベビーサンダー等使用時の保護用具の着用、と石の交換、試運転（有資格者）は'],
      [15, '事務所の整理･整頓はよいか（救急箱･消火器の設置）'],
    ]],
    ['作業規律', [
      [16, '正しい服装･保安帽･墜落制止用器具･安全靴の装着状況'],
      [17, '喫煙は定められた場所でしているか'],
      [18, '不安全･ヒヤリハット等の作業はないか'],
      [19, '立ち入り禁止区域内、又は吊荷作業区域内等の通行はないか'],
      [20, '作業後の清掃と使用資材の片付けは良いか'],
    ]],
  ];
  const RIGHT = [
    ['墜落・転落', [
      [21, '脚立（可搬式作業台）の単独使用時の適正使用（天板作業･セット位置）は良いか'],
      [22, 'ローリングタワーの手摺･巾木･昇降設備･ストッパ･アウトリガ･安全看板･社名･責任者等の表示・設置位置は'],
      [23, '高所作業車（自走式）の使用状況は（有資格者･使用責任者の表示･点検記録）等'],
      [24, '高所作業には墜落制止用器具を使用して作業しているか'],
      [25, 'パイプシャフト･ラックシャフト･ボイドスリーブ等の床開口部の養生は'],
    ]],
    ['工具の管理', [
      [26, '高速切断機･ベビーサンダー等の回転部保護カバーは'],
      [27, '持込み電動工具の使用許可証と自主点検表は'],
      [28, '電動工具の接地は良いか（二重絶縁は不要）'],
      [29, '電工ドラム･延長コードに傷は･3芯コードか'],
    ]],
    ['その他', [
      [30, '盗難保険に加入しているか（元請け・自社）'],
      [31, '受電後の安全対策は（盤類の危険表示･施錠･キーの保管･復電チェック）'],
      [32, '停電工事･活線切替え工事等の作業手順書と安全対策は作成され周知されているか'],
      [33, '会社･現場災害防止協議会等の指示事項が現場担当者･作業員に周知と控えの確認'],
      [34, '施工管理員は作業員がすべき作業をしていないか'],
      [35, '所内会議を行い周知と現場を把握しているか'],
    ]],
  ];
  const GOALS = 7; // 月安全衛生目標の行数
  const LABEL_W = 'calc((210mm - 24mm) * 4 / 24)'; // 下の表の見出し列（24分割の4列）と同じ幅

  // 検査項目の表（左右で同じ形）。区分は縦書き
  function checkTable({ h, field }, groups, extra) {
    const head = h('tr', null,
      h('th', { colspan: 3 }, '検　査　項　目'), h('th', null, '判定'));
    const tb = h('tbody', null, head);
    groups.forEach(([name, items]) => {
      items.forEach(([no, text], i) => {
        tb.append(h('tr', { class: i === 0 ? 'q-grp' : null },
          i === 0 ? h('td', { class: 'lbl q-cat', rowspan: items.length }, name) : null,
          h('td', { class: 'q-no' }, no),
          h('td', { class: 'q-txt' }, text),
          h('td', { class: 'q-chk' }, field({ key: `j${no}`, type: 'select', options: MARKS, align: 'center' }))));
      });
    });
    if (extra) extra(tb);
    return h('table', { class: 'grid dense q-check' },
      h('colgroup', null, h('col', { style: 'width:6mm' }), h('col', { style: 'width:5.5mm' }), h('col'), h('col', { style: 'width:9mm' })),
      tb);
  }

  // 右表の下：月安全衛生目標（記入欄＋判定）
  const goals = ({ h, field }) => (tb) => {
    for (let i = 1; i <= GOALS; i++) {
      tb.append(h('tr', { class: i === 1 ? 'q-grp' : null },
        // 何月の目標かを記入できるように、見出しの上に月の欄
        i === 1 ? h('td', { class: 'lbl q-cat q-goal-h', rowspan: GOALS },
          h('div', { class: 'q-month' }, field({ key: 'goalMonth', align: 'center', maxlength: 2, inputmode: 'numeric' })),
          h('div', { class: 'q-vt' }, '月安全衛生目標')) : null,
        h('td', { class: 'q-goal', colspan: 2 }, field({ key: `goal${i}` })),
        h('td', { class: 'q-chk' }, field({ key: `goalJ${i}`, type: 'select', options: MARKS, align: 'center' }))));
    }
  };

  const render = (ctx) => ctx.h('div', { class: 'q-cols' },
    checkTable(ctx, LEFT),
    checkTable(ctx, RIGHT, goals(ctx)));

  FORM_DEFS['anzen-a0001'] = {
    code: '本-安全-A0001', title: '安全･衛生検査指導報告書',
    seitei: '02/09/12', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定（2026-10-27 指示）
    selfStamp: '発行者', // 本人欄（デート印を押す欄）
    meta: [
      { label: '検査日', key: 'date', type: 'date', w: 30 },
      { label: '天候', key: 'weather', w: 14, cls: 'fixw near' }, // 検査日のすぐ横
    ],
    // 元は下部に横一列（社長〜発行者、安全管理者の欄に「保管」）。右上に2段で並べる
    // ユーザー指定：支店長は本部長・RE部長の欄を共用（押印部に「支店は支店長」と薄く印字。2026-10-28）
    // '|' は見出しの改行、'\n' 以降は押印部に薄く印字
    stamps: [
      { boxes: ['社長', '本店長', '総括安全|衛生管理者', '安全管理者\n保管'] },
      { boxes: ['衛生管理者', '工事本部長|RE部長\n支店は支店長', '工事長', '発行者'] },
    ],
    stampClass: 'stack',
    // 工番〜検査者名は押印欄の左の空き（タイトルの下）に置く。見出し列は下の表と同じ幅
    headBlocks: [
      { type: 'grid', cols: 2, colWidths: [LABEL_W, null], dense: true, rowH: 5, rows: [
        [{ label: '工　番', key: 'koban', lw: 1, span: 2, maxlength: 12 }],
        [{ label: '件　名', key: 'subject', lw: 1, span: 2 }],
        [{ label: '施工部署', key: 'sekoDept', lw: 1, span: 2 }],
        [{ label: '作業所長名', key: 'shocho', lw: 1, span: 2, unit: '印' }],
        [{ label: '検査部署', key: 'kensaDept', lw: 1, span: 2 }],
        [{ label: '検査者名', key: 'kensasha', lw: 1, span: 2, unit: '印', unitInkan: true }], // 印は発行者と同じ苗字の認印（修正指示書）
      ] },
    ],
    blocks: [
      { type: 'grid', lw: 4, dense: true, rowH: 5, rows: [
        [{ label: '規　模', key: 'chika', prefix: '地下', unit: '階', span: 7 },
          { key: 'chijo', prefix: '地上', unit: '階', span: 3 },
          { key: 'touya', prefix: '塔屋', unit: '階', span: 3 },
          { label: '延面積', lw: 3, key: 'menseki', type: 'number', unit: '㎡', span: 7 },
          { key: 'kosu', prefix: '（', unit: '戸）', span: 4 }],
        [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 16 },
          { label: '進捗率', lw: 3, key: 'shinchoku', type: 'number', unit: '%', span: 8 }],
        [{ label: '施工場所', key: 'basho', span: 12 }, { label: '元方事業者', key: 'motokata', span: 12 }],
        [{ label: '作業員数', key: 'nShain', prefix: '社員', unit: '名', type: 'number', span: 8 },
          { key: 'nKyoryoku', prefix: '協力会社', unit: '名', type: 'number', span: 4 },
          { label: '元方責任者', key: 'motokataSekinin', span: 12 }],
        [{ label: '協力会社', key: 'kyo1', prefix: '1次', span: 10 }, { key: 'kyo2', prefix: '2次', span: 7 }, { key: 'kyo3', prefix: '3次', span: 7 }],
        [{ label: '検査時の\n作業内容', key: 'sagyo', type: 'textarea', lines: 2, span: 24 }],
      ] },
      { type: 'custom', render },
      { type: 'notes', items: ['※ 判定欄には良い：○　悪い：×をつける。×の付いた項目については「検査指摘事項・確認書（本-品質-A0020）」に指摘事項を詳しく記録し、作業所長に交付、コピーを本書に添付回送する。該当しない項目は／を記入'] },
      { type: 'free', label: '所　見', key: 'shoken', lines: 2, grow: true },
    ],
  };
})();
