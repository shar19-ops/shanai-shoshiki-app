// 本-品質-A0053 施工検討会報告書（品質記録様式。元Excel：本ー品質ーA0053施工検討会報告書.xlsx、A4縦2ページ）
// ISOの要求事項【8.1】はヘッダーの番号の後ろ。1ページ目：工番・件名・開催日・事業所・部署・作業所長・開催場所・出席者、検討事項と実施計画、本店長指示、回送先の押印欄（元の様式どおり最下段に8つずつ2段）
// 2ページ目：検討事項と実施計画の続き、受電・キュービクル搬入などの予定日（1〜7）
// 本-品質-A0052 施工検討会開催通知書のヘッダーの情報（工番・件名・事業所・部署・作業所長・開催日・開催場所）を取り込める（チェック表のご指示）
//   このPCのブラウザに残っている A0052 の内容、または A0052 の保存ファイル（JSON）から
(function () {
  const FIRST = 16, NEXT = 24; // 検討事項の行数（1ページ目・2ページ目）
  const FIXED = { 2: '施工検討書（本－工務－A0032）（添付資料 参照）', 4: 'その他の施工検討事項' }; // 1ページ目の決まった行（元の様式の太字）
  const IMPORT = ['koban', 'subject', 'jigyo', 'busho', 'shocho', 'kaisaibi', 'basho'];
  const PLAN = ['受電 予定日', 'キュービクル搬入 予定日※', '発電機搬入 予定日※', 'その他重量物搬入　予定日※', '幹線延線　予定日※', '送電 予定日※', '停電工事 予定日※'];

  // A0052 から取り込む（印刷しない）
  const importer = { type: 'custom', render: ({ h, values, setVal, rebuild }) => {
    const apply = (v) => {
      const got = IMPORT.filter((k) => v[k]);
      if (!got.length) { alert('施工検討会開催通知書（本-品質-A0052）に、取り込める内容がありません。'); return; }
      if (IMPORT.some((k) => values[k] && v[k] && values[k] !== v[k]) && !confirm('入力済みの項目を、施工検討会開催通知書の内容で置き換えます。よろしいですか？')) return;
      got.forEach((k) => setVal(k, v[k]));
      rebuild();
    };
    const fromFile = () => {
      const inp = h('input', { type: 'file', accept: '.json,application/json', style: 'display:none' });
      inp.addEventListener('change', async () => {
        const f = inp.files[0];
        inp.remove();
        if (!f) return;
        let data;
        try { data = JSON.parse(await f.text()); } catch (e) { alert('JSONファイルとして読み込めませんでした。'); return; }
        if (!data || data.form !== 'hin-a0052' || typeof data.values !== 'object') { alert('施工検討会開催通知書（本-品質-A0052）のファイルではありません。'); return; }
        apply(data.values);
      });
      document.body.append(inp);
      inp.click();
    };
    const run = () => {
      let local = null;
      try { local = JSON.parse(localStorage.getItem('shoshiki:hin-a0052') || 'null'); } catch (e) { /* なし */ }
      if (local && IMPORT.some((k) => local[k]) && confirm(`このPCに入力中の施工検討会開催通知書から取り込みますか？\n（工番：${local.koban || '－'}　件名：${local.subject || '－'}）\n\n「キャンセル」で保存ファイルを選びます。`)) { apply(local); return; }
      fromFile();
    };
    return h('div', { class: 'k1-pages no-print', style: 'margin:0' },
      h('button', { type: 'button', onclick: run }, '施工検討会開催通知書（A0052）から取り込む'),
      h('span', { class: 'k1-hint' }, '工番・件名・事業所・部署・作業所長・開催日・開催場所を取り込みます。'));
  } };

  // 検討事項と実施計画の表（from〜to 行目）
  const list = (from, to, tail) => ({ type: 'custom', render: ({ h, field }) => {
    const tb = h('tbody', null, h('tr', null, h('th', null, 'No'), h('th', null, '検　討　事　項'), h('th', null, '実　施　計　画')));
    for (let n = from; n <= to; n++) {
      tb.append(h('tr', null, h('td', null, field({ key: `r${n}.no`, align: 'center' })),
        FIXED[n] ? h('td', { class: 'h53-fixed' }, FIXED[n]) : h('td', null, field({ key: `r${n}.kento` })),
        h('td', null, field({ key: `r${n}.keikaku` }))));
    }
    if (tail) {
      tb.append(h('tr', null, h('td'), h('td', { class: 'h53-fixed', colspan: 2 }, '■予定日は実施計画に記載の事（4は搬入対象を記載する）')));
      tb.append(h('tr', null, h('td'), h('td', { class: 'h53-note', colspan: 2 }, '※計画書は、実施予定日の2箇月前に安全品質保証部に提出の事')));
      PLAN.forEach((t, i) => tb.append(h('tr', null, h('td', { class: 'h53-no' }, String(i + 1)), h('td', { class: 'h53-plan' }, t), h('td', null, field({ key: `plan${i + 1}` })))));
    }
    return h('table', { class: 'grid h53' }, h('colgroup', null, ...[9, 85, null].map((w) => h('col', { style: w ? `width:${w}mm` : null }))), tb);
  } });

  FORM_DEFS['hin-a0053'] = {
    code: '本-品質-A0053', title: '施工検討会報告書',
    iso: '【8.1】運用の計画及び管理', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '02/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    fileIO: true, // 回送して押印してもらうのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0053_工番_件名_日付.json」
    sheetClass: 'h53',
    meta: [],
    stamps: [], // 回送先の押印欄は元の様式どおり1ページ目の最下段
    pages: [
      { subtitle: '（1/2）', blocks: [
        importer,
        { type: 'grid', rowH: 6.6, rows: [
          [{ label: '工　番', key: 'koban', maxlength: 12, lw: 2, span: 7 }, { label: '件　名', key: 'subject', lw: 2, span: 10 }, { label: '開催日', key: 'kaisaibi', type: 'date', jp: true, lw: 2, span: 7 }],
          [{ label: '事業所', key: 'jigyo', lw: 2, span: 5 }, { label: '部　署', key: 'busho', lw: 2, span: 5 }, { label: '作業所長', key: 'shocho', lw: 3, span: 7 }, { label: '開催場所', key: 'basho', lw: 3, span: 7 }],
          [{ label: '出席者', key: 'shusseki', type: 'textarea', lines: 2, lw: 2, span: 24 }],
        ] },
        list(1, FIRST),
        { type: 'grid', rows: [[{ label: '本店長\n指示', key: 'shiji', type: 'textarea', lines: 2, lw: 2, span: 24 }]] },
        { type: 'stamps', groups: [
          { boxes: ['社　長', '本店長', '工事本部長|RE部長', '工事管理課長', '営業部', '設計見積部', '設計部', '購買部'], dates: true },
          { boxes: ['品質技術部', '安全品質部', '安全部', '検査安全部', 'ＩＳＯ部', '安全品質|保証部長\n保　管', '支店長', '工事長|工事部長\n発　行'], dates: true },
        ] },
        { type: 'notes', items: ['不要回送先は、斜線（／）で抹消すること。'] },
      ] },
      { subtitle: '（2/2）', blocks: [list(FIRST + 1, FIRST + NEXT, true)] },
    ],
  };
})();
