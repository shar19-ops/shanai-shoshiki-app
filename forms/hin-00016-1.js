// 本-品質-00016 社内検査チェックリスト ①元請負時 巡回・中間・完成検査チェックリスト
//   （品質記録様式 03標準・基準。元Excel：本-品質-00016社内検査ﾁｪｯｸﾘｽﾄ.xlsx の「元請負時（巡回・中間・完成）」シート、A4縦3ページ、押印欄なし）
//   00016 は3つに分ける（ユーザー指定 2026-11-17）：①元請負時（この帳票）②簡易版（中間／竣工）③設備別
// 1ページ目の上に件名・検査日・検査種別（1つ選ぶ＝元の「○で囲む」）・検査者。2・3ページ目は件名・検査日・検査種別を1行で（元の様式は毎ページに見出し）
// 確認項目66は元の文のまま、ページ割りも元のまま（1〜26／27〜55／56〜66＋空き行）。分類は左に縦書き。
// 合否はクリックで ○ → × → － → △ → 空欄（元の入力規則に △ もある）。備考は自由記入（自動で行が伸びる）。空き行は確認項目も書ける
(function () {
  const CATS = [
    ["計画・着工時・工事中提出書類", [
      "社員の配置に不足・過剰は無いか。",
      "「設計図書(謄本図)」は、整備されているか。",
      "「特記仕様書」は、整備されているか。",
      "「現場説明書」の写しは、整備されているか。",
      "「質問回答書」の写しは、整備されているか。",
      "「標準仕様書」は、整備されているか。",
      "「建設工事請負契約書」の写しは、整備されているか。",
      "「請負代金内訳書」の写しは、整備されているか。",
      "「契約工程表」の写しは、整備されているか。",
      "「現場代理人等通知書」（監理（主任）技術者）の写しは、整備されているか。",
      "同上　資格者証の写しは、整備されているか。",
      "「公共工事履行保証証券」の写しは、整備されているか。",
      "「火災保険(組立保険)加入状況報告書」が報告され、写しが整備されているか。",
      "「建設業退職金共済制度の掛金収納書」が報告され、写しが整備されているか。",
      "「工事実績情報(CORINS)登録報告書」は、受注時、変更時及び竣工時に登録され、写しが提出されているか。",
      "「電気保安技術者通知書」が報告され、写しが整備されているか。",
      "「緊急連絡体制」が報告され、写しが整備されているか。",
      "「主要資材・機材発注先通知書」が提出され、写しが整備されているか。",
      "「下請負人報告書」が提出され、写しが整備されているか。",
      "「総合施工計画書」が提出され、写しが整備されているか。",
      "「工種別施工計画書」が提出され、監督職員の承諾を受けているか。",
      "施工検討会が実施されているか。",
      "「品質目標(本-品質-A0110)」が設定され、実施されているか。",
      "「官公署その他への手続(本-工務-A0015)」が作成され、進捗が管理されているか。",
      "「施工図作成プロセス管理表(本-工務-A0012)」が作成され、進捗が管理されているか。",
      "「機器納入仕様書作成プロセス管理表(本-工務-A0013)」が作成され、進捗が管理されているか。",
      "工事に必要とされる有資格者は、適切に配置されているか。",
      "「施工図」は、施工前に監督職員の承諾を得ているか。",
      "「機器納入仕様書」は、製作前に監督職員の承諾を得ているか。",
      "工事内容の変更を協議した場合は、「協議書」等の記録があるか。",
      "「工事材料搬入報告書(材料検収簿)」が提出され、写しが整備されているか。",
      "「工事週報」等が提出され、整備されているか。",
      "「受入検査」が実施され、記録が整備されているか。",
      "「機材の検査に伴う試験」が実施され、記録が整備されているか。",
      "「工程内検査」が実施され、記録が整備されているか。",
      "「施工の検査に伴う試験」が実施され、記録が整備されているか。",
      "「工事記録写真」の撮影及び整理がされているか。",
    ]],
    ["原価", [
      "資材の原価は、予算内で収まるか。",
      "労務費の原価は、予算内で収まるか。",
      "現場経費の原価は、予算内で収まるか。",
      "資材の原価は、予算内で収まるか。",
      "追加・変更の見積りは、顧客に提出されているか。",
      "追加・変更の取決めは、問題ないか。",
    ]],
    ["工程", [
      "「実施工程表」は、監督職員の承諾を得ているか。また、進捗管理及び出来高を記入しているか。",
      "「月間工程表」「3 週工程表」等が提出され、整備されているか。",
      "建築工程に進み・遅れはないか。",
      "建築工程に対して、当社の遅れはないか。",
      "協力会社作業員の配置に過不足はないか。",
    ]],
    ["安全", [
      "現場入口付近に「工事名看板」が掲げられているか。",
      "現場入口付近に「労災保険成立票」が掲示してあるか。",
      "現場入口付近に「建設業許可票」が掲示してあるか。",
      "現場入口付近に「登録電気工事業者届出済票」が掲示してあるか。",
      "現場入口付近に「施工体系図」が掲示してあるか。",
      "「安全衛生目標(本-品質-A0120)」が設定され、実施されているか。",
      "「安全管理計画書」が作成され、実施されているか。",
      "「施工体制報告書」の写しが監督職員に提出しているか。\n「施工体制台帳作成建設工事の通知」「施工体制台帳」\n「再下請負通知書」「施工体系図」「工事担当技術者台帳」\n（変更の都度提出）",
      "同上　添付書類が整備されているか。\n「建設業許可証」「工事請負契約書」「主任(監理)技術者の資格を証する書面」「同左　雇用証明書」",
      "「災害防止協議会」を実施し、その記録が整備されているか。",
      "「ＫＹ」を実施し、記録が整備されているか。",
    ]],
    ["環境", [
      "「環境目標(予想される公害の種類及び対策(本-品質-A0130)」が設定され、実施されているか。",
      "発生材は、「発生材報告書」「発生材調書」が提出され、写しが整備されているか。",
      "建築副産物の発生抑制・処理計画を作成し、実施しているか。記録を整備しているか。",
      "建築副産物の再利用・有価物回収の記録を整備しているか。",
      "建築副産物の再資源化の「リサイクル証明書」の整備をしているか。",
      "産業廃棄物収集運搬業者、産業廃棄物中間・最終処分業者と契約しているか。",
      "「産業廃棄物管理票（A.B2.D.E 票）」の整備をしているか。原本保管、写しを提出。",
    ]],
  ];
  const PAGES = [[1, 26, 0], [27, 55, 0], [56, 66, 15]]; // [最初の番号, 最後の番号, 空き行の数]（元は19行。フッターまで1ページに収まる数）
  const MARKS = ['', '○', '×', '－', '△'];
  const SHUBETSU = ['現場巡回検査', '中間検査', '完成検査'];
  const all = [];
  CATS.forEach(([cat, items]) => items.forEach((text) => all.push({ cat, text })));

  // 備考・空き行の確認項目：長く書くと行が伸びる
  const wrapTa = (field, key) => {
    const ta = field({ key, type: 'textarea', plain: true, lines: 1 });
    ta.classList.add('q16-wrap');
    const grow = () => { ta.style.height = '0'; ta.style.height = ta.scrollHeight + 'px'; };
    ta.addEventListener('input', grow);
    requestAnimationFrame(grow);
    return ta;
  };
  const markBtn = (h, values, setVal, key) => {
    const btn = h('button', { type: 'button', class: 'inp mark-btn q16-mark', title: 'クリックで ○（合格）→ ×（不合格）→ －（該当なし）→ △ → 空欄' }, values[key] || '');
    btn.addEventListener('click', () => {
      const next = MARKS[(MARKS.indexOf(values[key] || '') + 1) % MARKS.length];
      setVal(key, next); btn.textContent = next;
    });
    return btn;
  };

  const table = ([from, to, blanks]) => ({ type: 'custom', render: ({ h, field, values, setVal }) => {
    const tb = h('tbody', null, h('tr', null, h('th', { colspan: 2 }, '番号'), h('th', null, '確　認　項　目'), h('th', null, '合否'), h('th', null, '備　　考')));
    for (let n = from; n <= to; n++) {
      const it = all[n - 1];
      const first = n === from || all[n - 2].cat !== it.cat;
      let span = 0;
      if (first) for (let m = n; m <= to && all[m - 1].cat === it.cat; m++) span++;
      tb.append(h('tr', null,
        first ? h('td', { class: 'q16-cat', rowspan: span }, h('span', null, it.cat)) : null,
        h('td', { class: 'q16-no' }, String(n)),
        h('td', { class: 'q16-text' }, it.text),
        h('td', { class: 'q16-pass' }, markBtn(h, values, setVal, `q${n}`)),
        h('td', null, wrapTa(field, `q${n}.biko`))));
    }
    // 空き行（元の様式の3ページ目の下）：番号・確認項目も書ける
    for (let i = 1; i <= blanks; i++) {
      tb.append(h('tr', null,
        i === 1 ? h('td', { class: 'q16-cat', rowspan: blanks }) : null,
        h('td', { class: 'q16-no' }, field({ key: `x${i}.no`, align: 'center' })),
        h('td', null, wrapTa(field, `x${i}.text`)),
        h('td', { class: 'q16-pass' }, markBtn(h, values, setVal, `x${i}`)),
        h('td', null, wrapTa(field, `x${i}.biko`))));
    }
    return h('table', { class: 'grid q16' }, h('colgroup', null, ...[7, 8, null, 11, 50].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } });

  // 2・3ページ目の上：件名・検査日・検査種別・検査者を1行で（1ページ目で入力した内容を表示）
  const pageHead = { type: 'custom', render: ({ h, values }) => {
    const el = h('div', { class: 'q16-head' });
    const ymd = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : ''; };
    const draw = () => {
      el.innerHTML = '';
      [['件名', values.subject], ['検査日', ymd(values.kensabi)], ['検査種別', values.shubetsu], ['検査者', values.kensasha]].forEach(([k, v]) =>
        el.append(h('span', null, h('b', null, k), v || '')));
    };
    draw();
    document.addEventListener('input', draw); document.addEventListener('change', draw);
    return el;
  } };

  FORM_DEFS['hin-00016-1'] = {
    code: '本-品質-00016', title: '元請負時 巡回・中間・完成検査チェックリスト',
    seitei: '99/04/06', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    fileIO: true, // 検査ごとに書くのでファイルに保存
    sheetClass: 'q16s',
    meta: [],
    stamps: [], // 元の様式に押印欄はない
    pages: PAGES.map((pg, i) => ({
      subtitle: `（${i + 1}/${PAGES.length}）`,
      blocks: [
        ...(i === 0 ? [
          { type: 'grid', cols: 4, colWidths: ['18mm', null, '16mm', '40mm'], rowH: 7, rows: [
            [{ label: '件　名', key: 'subject', type: 'textarea', plain: true, lines: 1, fit2: true, lw: 1, span: 2 }, { label: '検査日', key: 'kensabi', type: 'date', jp: true, lw: 1, span: 2 }],
            [{ label: '検査種別', key: 'shubetsu', type: 'radio', nowrap: true, options: SHUBETSU, lw: 1, span: 2 }, { label: '検査者', key: 'kensasha', lw: 1, span: 2 }],
          ] },
          { type: 'para', text: '※ 合否欄は、合格：○、不合格：×、該当なし：－ を記入する（クリックで切り替え）。', style: 'font-size:7.5pt;text-align:right;margin:.6mm 0 1.2mm' },
        ] : [pageHead]),
        table(pg),
        ...(i === PAGES.length - 1 ? [{ type: 'notes', items: [
          '※1　合否欄は、合格：○　不合格：×　該当なし：－　を記入する。',
          '　2　作業所への指示は、「検査指摘事項・確認書（本-品質-A0021）」に記載して作業所長に交付し、その写しを本票に添付する。',
        ] }] : []),
      ],
    })),
  };
})();
