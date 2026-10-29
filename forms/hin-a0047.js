// 本-品質-A0047 現場巡回検査報告書（品質記録様式。元Excel：本ー品質ーA0047 現場巡回検査報告書.xlsx、A4縦1ページ）
// ISOの要求事項【8.2.3】はヘッダーの番号の後ろ（ユーザー指定）。監視及び測定項目（O・Q・C・D・S・E・I の31項目）の合否はクリックで 合 → 否 → 空欄
// 押印欄はヘッダーの右上（ユーザー指定。元の様式の最下段の空欄は削除）。8つを4つずつ2段、日付付き。巡回検査者（発行）はクリックでデート印（日付は検査日）
(function () {
  const ITEMS = [
    ['O', ['社員の配置に不足/過剰は無いか', '社員の出勤状況に問題はないか']],
    ['Q', ['品質目標を「品質目標(本-品質-A0110)」で設定し、実施しているか', '工事部長が承認した施工計画書に基づいて、作業を実施しているか',
      '軽微な不具合は無いか', '電力会社への申し込みは計画通りに行われ、その控えはあるか（高圧・低圧）', '官公署その他への届出手続等は、計画されその通り行われているか',
      '施工図は、計画通りに作成され、承認されているか', '製作図は、計画通りに作成され、承認され、納期に問題ないか',
      '作業計画書・施工要領書・送電（停電）計画書は、計画通りに作成され、承認されているか', '工事内容の変更等の協議をした場合には、「協議書」等で記録を残しているか',
      '顧客の苦情は無いか']],
    ['C', ['電線の余長の管理は適正に行っているか', '外注費の原価は予算内で収まるか', '資材費の原価は予算内で収まるか', '労務費の原価は予算内で収まるか',
      '現場経費は予算内で収まるか', '追加･変更の見積は顧客に提出しているか', '追加･変更の取決めに問題はないか']],
    ['D', ['実施工程表を作成し、進捗管理しているか', '建築工程に進み/遅れは無いか', '建築工程に対して、当社の遅れは無いか', '協力会社作業員の配置に不足/過剰は無いか']],
    ['S', ['安全衛生目標を「安全衛生目標(本-品質-A0120)」で設定し、実施しているか', '施工体制台帳、再下請負通知書、施工体系図等は、整備しているか']],
    ['E', ['環境目標を「環境目標（本-品質-A0130）」で設定し、実施しているか']],
    ['I', ['情報セキュリティ対策（PC,外付HDDにセキュリティワイヤー装着,PCは社外持出禁止、重要書類・電子媒体は施錠管理）']],
  ];
  const MARKS = ['', '合', '否'];

  const list = { type: 'custom', render: ({ h, field, values, setVal }) => {
    const tb = h('tbody', null, h('tr', null, h('th', { colspan: 2 }, '監　視　及　び　測　定　項　目'), h('th', null, '合否'), h('th', null, '否　の　場　合　の　処　置')));
    let n = 0;
    ITEMS.forEach(([cat, items]) => items.forEach((text, i) => {
      n++;
      const key = `q${n}`;
      // 合否：クリックで 合 → 否 → 空欄
      const btn = h('button', { type: 'button', class: 'inp mark-btn h47-mark', title: 'クリックで 合 → 否 → 空欄' }, values[key] || '');
      btn.addEventListener('click', () => {
        const next = MARKS[(MARKS.indexOf(values[key] || '') + 1) % MARKS.length];
        setVal(key, next); btn.textContent = next;
      });
      tb.append(h('tr', null, i === 0 ? h('td', { class: 'h47-cat', rowspan: items.length }, cat) : null,
        h('td', { class: 'h47-item' }, text), h('td', null, btn), h('td', null, field({ key: `${key}.shochi` }))));
    }));
    return h('table', { class: 'grid h47' }, h('colgroup', null, ...[6, null, 10, 75].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  FORM_DEFS['hin-a0047'] = {
    code: '本-品質-A0047', title: '現場巡回検査報告書',
    iso: '【8.2.3】プロセスの監視及び測定', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '00/11/10', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 現場ごとに巡回のたびに書くのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0047_工番_件名_日付.json」
    selfStamp: '巡回検査者',
    stampDate: 'kensabi', // デート印の日付は検査日
    sheetClass: 'h47',
    meta: [],
    stamps: [{ boxes: ['社　長', '本店長', '工事本部長|RE部長', '支店長'], dates: true }, { boxes: ['工事長|工事部長', '工事管理|課長', '安全品質|保証部長\n保　管', '巡回検査者\n発　行'], dates: true }],
    // 工番・件名・注文者・契約金額・工期は表題の下（押印欄の左の空き）に置く。本-安全-A0001 と同じ（ユーザー指定）
    headBlocks: [
      { type: 'grid', cols: 2, colWidths: ['20mm', null], rowH: 6, rows: [
        [{ label: '工　番', key: 'koban', lw: 1, span: 2, maxlength: 12 }],
        [{ label: '件　名', key: 'subject', lw: 1, span: 2 }],
        [{ label: '注 文 者', key: 'chumon', lw: 1, span: 2 }],
        [{ label: '契約金額', key: 'kingaku', type: 'money', prefix: '￥', align: 'left', lw: 1, span: 2 }],
        [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', jp: true, lw: 1, span: 2 }],
      ] },
    ],
    blocks: [
      // 上の表・監視及び測定項目・現況と所感は隙間なくつなぐ（1枚に収めるため）
      { type: 'col', fit: true, gap: 0, items: [
      { type: 'grid', rowH: 5.6, rows: [
        [{ label: '部　署', key: 'busho', lw: 2, span: 6 }, { label: '所　長', key: 'shocho', lw: 2, span: 6 },
          { label: '検査日', key: 'kensabi', type: 'date', jp: true, style: 'short', lw: 2, span: 6 },
          { label: '前　回\n検査日', key: 'zenkai', type: 'date', jp: true, style: 'short', lw: 2, span: 6 }],
      ] },
      list,
      { type: 'grid', rows: [
        [{ text: '建築現況', span: 12, cls: 'h15-sec' }, { text: '電気設備現況', span: 12, cls: 'h15-sec' }],
        [{ key: 'kenchiku', type: 'textarea', lines: 2, span: 12 }, { key: 'denki', type: 'textarea', lines: 2, span: 12 }],
        [{ text: '所感', span: 24, cls: 'h15-sec' }],
        [{ key: 'shokan', type: 'textarea', lines: 2, span: 24 }],
      ] },
      ] },
      { type: 'notes', items: [
        '1.　合否欄は、合格の場合は合、不合格の場合は否を記入し、否の場合は処置欄に処置を記載すること。',
        '2.　作業所への指示は、「不適合処理報告書(本-品質-A0018)」及び/又は「検査指摘事項･確認書(本-品質-A0020)」に記載して、作業所長に交付する。そのコピーを本票に添付すること。',
      ] },
    ],
  };
})();
