// 本-品質-00015 重点管理事項チェックリスト（品質記録様式 03標準・基準。元Word：本-品質-00015重点管理事項ﾁｪｯｸﾘｽﾄ.doc、A4縦1ページ、押印欄なし）
// 工番・件名・検査日・検査種別（1つ選ぶ＝元の様式の「○で囲む」）・検査者は上の表。
// 管理項目・合否判定基準は元の様式の文のまま（電力引込の止水処理は判定基準が3つ）。合否はクリックで ○ → × → － → 空欄、
// 是正確認日は日付、備考は自由記入（元の様式に印刷された「電力会社の図面協議は完了しているか。」「（設置箇所）」は欄の上に小さく残す）
(function () {
  // [管理項目, [合否判定基準...], 備考の欄に印刷された文]
  const ITEMS = [
    ['防火区画貫通部の処理方法は良いか。', ['施工要領書等が承諾され認定工法通り施工され記録写真がある。']],
    ['動力盤分岐回路の開閉器容量・電線サイズは負荷容量に対し、適切か。', ['盤図、施工図に記載されている負荷容量・電線サイズは、負荷表で確認していること。']],
    ['バスダクト施工後のチェックは適切に行われているか。', ['施工チェックリストで確認されているか、ジョイナー部増し締めボルト頭の切断がされていること。']],
    ['電力会社への申し込みは、計画通りに、行なわれているか。', ['申し込み書類等の副本に受付番号が、記入されている事。'], '電力会社の図面協議は完了しているか。'],
    ['自家用電気工作物の場合、主任技術者が工事着手前に選任されているか。', ['受領印の押印された「保安管理業務外部委託承認申請書」の写しがあること。']],
    ['電力量計の表示と計量範囲に相違はないか。', ['負荷を接続して、該当する電力量計が適正に動作することを確認する。']],
    ['電力引込及び情報通信の引込管の止水処理は完全か。', ['地中から建物への引込み部に、防水鋳鉄管が施設され、管路口防水装置で処理されている。',
      '防水鋳鉄管がない場合は、止水方法が明確に計画されている。', 'プルボックスには、25A以上のドレン管が施設されている。']],
    ['分電盤、動力盤の増締めはよいか。', ['マーキング2回以上で、増締め確認シールが貼付され、試験成績書が作成されている。']],
    ['既存盤類等改修箇所、内容の明示はされているか。', ['完成図等で施工年、請負者、改修内容を明確にし、盤内に設置されている。']],
    ['2線式パイロットスイッチの場合、適合負荷電流値は適正か。', ['施工図に負荷電流が記載され、現地の電流値が合っていること。'], '（設置箇所）'],
    ['住宅に於いて、梁下の照明器具は納まっているか。', ['天井内の有効寸法・断熱材を確認している。']],
    ['建築物機械等設置・移転・変更届の提出の有無を確認しているか。', ['発電設備燃料の種類及び数量を確認している。']],
    ['工事計画届出書（環境関連設備）の提出の有無を確認しているか。', ['発電機の燃料使用量の確認が出来ている。']],
    ['新築躯体工事において、止水階の計画を確認しているか。', ['電気関係室・EPSの水害防止策が取られている。']],
    ['水中照明・屋外床照明の有無の確認はしているか。', ['照明器具への漏水を検討している。']],
    ['店舗の動力負荷の試験方法確認しているか。', ['特に無負荷の場合の試験方法を計画している。']],
  ];
  const MARKS = ['', '○', '×', '－'];

  const list = { type: 'custom', render: ({ h, field, values, setVal }) => {
    const tb = h('tbody', null, h('tr', null, ...['管理項目', '合否判定基準', '合否', '是正確認日', '備　　考'].map((t) => h('th', null, t))));
    let n = 0;
    ITEMS.forEach(([item, kijun, pre], i) => kijun.forEach((k, j) => {
      n++;
      const key = `q${n}`;
      // 合否：クリックで ○ → × → － → 空欄
      const btn = h('button', { type: 'button', class: 'inp mark-btn h15c-mark', title: 'クリックで ○（合格）→ ×（不合格）→ －（該当なし）→ 空欄' }, values[key] || '');
      btn.addEventListener('click', () => {
        const next = MARKS[(MARKS.indexOf(values[key] || '') + 1) % MARKS.length];
        setVal(key, next); btn.textContent = next;
      });
      const biko = field({ key: `${key}.biko`, type: 'textarea', plain: true, lines: 1 });
      biko.classList.add('h15c-biko');
      const grow = () => { biko.style.height = '0'; biko.style.height = biko.scrollHeight + 'px'; };
      biko.addEventListener('input', grow);
      requestAnimationFrame(grow);
      tb.append(h('tr', null,
        j === 0 ? h('td', { class: 'h15c-text', rowspan: kijun.length }, item) : null,
        h('td', { class: 'h15c-text' }, k),
        h('td', { class: 'h15c-pass' }, btn),
        h('td', null, field({ key: `${key}.zesei`, type: 'date', jp: true, style: 'short' })),
        h('td', { class: 'h15c-bikotd' }, pre && j === 0 ? h('div', { class: 'h15c-pre' }, pre) : null, biko)));
    }));
    return h('table', { class: 'grid h15c' }, h('colgroup', null, ...[56, 56, 10, 21, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } };

  FORM_DEFS['hin-00015'] = {
    code: '本-品質-00015', title: '重点管理事項チェックリスト',
    seitei: '08/10/24', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日は他の品質記録様式と同じ
    fileIO: true, // 現場・検査ごとに書くのでファイルに保存
    sheetClass: 'h15c',
    meta: [],
    stamps: [], // 元の様式に押印欄はない
    blocks: [
      { type: 'grid', cols: 6, colWidths: ['17mm', '30mm', '14mm', null, '17mm', '34mm'], rowH: 7, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, lw: 1, span: 2 }, { label: '件　名', key: 'subject', lw: 1, span: 2 },
          { label: '検査日', key: 'kensabi', type: 'date', jp: true, lw: 1, span: 2 }],
        [{ label: '検査種別', key: 'shubetsu', type: 'radio', nowrap: true, lw: 1, span: 4,
          options: ['1．工程内検査', '2．現場巡回検査', '3．中間検査', '4．竣工検査'] },
          { label: '検査者', key: 'kensasha', lw: 1, span: 2 }],
      ] },
      { type: 'para', text: '※1．検査種別欄は該当番号を選ぶ。　2．合否欄は、合格：○、不合格：×、該当なし：－ を記入する（クリックで切り替え）。', style: 'font-size:7.5pt;text-align:right;margin:.6mm 0 1.2mm' },
      list,
    ],
  };
})();
