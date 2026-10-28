// 本-品質-A0051 個別工事施工プロセス管理表（品質記録様式。元Excel：本ー品質ーA0051 個別工事施工プロセス管理表.xlsx、A3横1ページ）
// ISOの要求事項【9.1】はヘッダーの番号の後ろ。品質管理のステップ（12列）ごとに、規格要求事項・実施時期・実施予定日・実施者・対象･関連部署・完了承認者・承認印・インプット・プロセス・アウトプット
// ■（必須）・□（任意）は元の様式の印を初期値に、クリックで ■ ⇔ □ を切り替える。承認印の欄は日付（yy/mm/dd。空欄なら「/　/」）と、クリックで三文判風の認印（欄ごとに苗字を入れる。日常管理は月ごとに4つ）
(function () {
  // 項目：'■名前'（必須）・'□名前'（任意）。配列は1行に並べる（例：□購買 □営業）。名前の '\n' は2行目（例：(支店工事統括)）
  const BUY = [['□購買', '□営業'], ['□見積', '□設計'], ['□安全', '□品質']];
  const DOCS = ['■営業物件引継書', '■契約内容確認書', '□現場説明に対する質問回答書', '□現場説明書', '□特記仕様', '□図面'];
  const AUDIT = (timing, input, process) => ({
    step: '内部監査', req: ['9.2内部監査', '9.1監視、測定、分析及び評価'], timing,
    jisshi: ['■主任監査員', '□監査員', '□監査員補'], taisho: ['■現場代理人', '□工事長（支店長）', '□工事課長'],
    shonin: '安全品質保証部長', input, process, output: ['■内部監査計画･報告書', '□是正処置要求書･報告書'],
  });
  const AUDIT2_IN = ['■内部監査計画･報告書', '□（前回）内部監査計画･報告書', '□（前回）是正処置要求書･報告書', '■施工計画書'];
  const AUDIT2_PR = ['■監査実施', '□前回監査のフォローアップ', '□不適合発見', '□不適合処理', '□是正処置'];
  const DAILY = {
    step: '日常管理', req: ['8.5.1製造及びサービス提供の管理', '9.1監視、測定、分析及び評価', '8.6製品及びサービスのリリース'], timing: ['随時（最低1回/月）'],
    jisshi: ['■現場代理人', '■工事長', '□工事本部長(支店長)', '□工事課長'], taisho: [], shonin: '工事長（支店長）', stamps: 4,
    input: ['■施工計画書', '■施工検討会報告書'], process: ['■施工プロセスが計画の通りに実施されているかの監視及び測定'],
    output: ['■現場巡回検査報告書', '□不適合処理報告書', '□検査指摘事項･確認書'],
  };
  const COLS = [
    { step: '営業→工事本部長（支店長）への引継', req: ['8.2.2製品及びサービスに関連する要求事項の明確化'], timing: ['工事命令書', '発行後2週間以内'],
      jisshi: ['■営業担当者'], taisho: ['■工事本部長(支店長)\n(支店工事統括)', '□工事長', '□購買部長'], shonin: '工事長（支店長）',
      input: DOCS, process: ['■顧客要求事項の引継ぎ'], output: DOCS },
    { step: '工事本部長（支店長）→現場代理人の任命及び引継', req: ['5.3組織の役割、責任及び権限', '8.2.2製品及びサービスに関連する要求事項の明確化'], timing: ['工事着手前'],
      jisshi: ['■工事本部長(支店長)\n(支店工事統括)'], taisho: ['■現場代理人', '□工事長', '□工事課長'], shonin: '現場代理人',
      input: DOCS, process: ['■現場代理人の任命', '■顧客要求事項の引継ぎ', '■部署長の特別指示事項'], output: DOCS.slice(1) },
    { step: 'NET検討', req: ['8.1運用の計画及び管理'], timing: ['工事着手後速やかに'],
      jisshi: ['■現場代理人'], taisho: ['■工事本部長(支店長)\n(支店工事統括)', '□工事長', '□工事課長'], shonin: '工事長（支店長）',
      input: DOCS, process: ['□図面検討', '■施工計画書案作成', '■実施工程表作成'], output: ['■施工計画書（案）'] },
    { step: '施工検討会', req: ['8.1運用の計画及び管理', '8.5.1製造及びサービス提供の管理'], timing: ['工事命令書', '発行後1ヶ月以内'],
      jisshi: ['■現場代理人'], taisho: ['□工事本部長\n(支店工事統括)', '■工事長（支店長）', '□工事課長', ...BUY], shonin: '工事長（支店長）',
      input: ['■施工計画書（案）', '■品質目標', '■安全衛生目標', '■環境目標'], process: ['■施工計画内容の検討'], output: ['■施工計画書'] },
    AUDIT(['内部監査計画で指定'], ['■内部監査計画･報告書', '■施工計画書'], ['■監査実施', '□不適合発見', '□不適合処理', '□是正処置']),
    DAILY,
    { step: '中間検査', req: ['9.1監視、測定、分析及び評価', '8.6製品及びサービスのリリース'], timing: ['躯体工事完了', '（上棟）前後'],
      jisshi: ['■検査員チーフ', '□検査員'], taisho: ['■現場代理人', '□工事長（支店長）', '□工事課長'], shonin: '安全品質保証部長\n（品質技術部長）',
      input: ['■社内検査依頼書', '□現場巡回検査報告書', '■社内検査通知書', '■施工計画書'],
      process: ['■検査実施', '□現場巡回検査のフォローアップ', '□不適合発見', '□不適合処理'],
      output: ['■検査報告書', '□不適合処理報告書', '□検査指摘事項･確認書', '□社内検査チェックリスト'] },
    AUDIT(['内部監査計画で指定'], AUDIT2_IN, AUDIT2_PR),
    DAILY,
    { step: '最終検査', req: ['9.1監視、測定、分析及び評価', '8.6製品及びサービスのリリース'], timing: ['竣工前1ヶ月前後'],
      jisshi: ['■検査員チーフ', '□検査員'], taisho: ['■現場代理人', '□工事長（支店長）', '□工事課長'], shonin: '安全品質保証部長\n（品質技術部長）',
      input: ['■社内検査依頼書', '□現場巡回検査報告書', '□（中間）検査報告書', '□不適合処理報告書', '□検査指摘事項･確認書', '■社内検査通知書', '■施工計画書'],
      process: ['■検査実施', '□現場巡回検査のフォローアップ', '□中間検査のフォローアップ', '□不適合発見', '□不適合処理'],
      output: ['■検査報告書', '□不適合処理報告書', '□検査指摘事項･確認書', '□社内検査チェックリスト'] },
    AUDIT(['引渡しの10日以上前', '内部監査計画で指定'], AUDIT2_IN, AUDIT2_PR),
    { step: '工事反省会', req: ['9.1.3分析及び評価', '10.3継続的改善'], timing: ['引渡し後2週間以内'],
      jisshi: ['■工事長(支店長)'], taisho: ['■現場代理人', '□工事本部長\n(支店工事統括)', '□工事課長', ...BUY], shonin: '工事長（支店長）',
      input: ['■施工計画書', '□不適合処理報告書', '□検査指摘事項･確認書', '□是正処置要求書･報告書'],
      process: ['■品質記録の確認', '■工事の結果から、QCDSEについて今後の物件に役立つフィードバック事項を決定'], output: ['■工事反省会議事録', '■品質記録'] },
  ];

  const table = { type: 'custom', render: ({ h, field, values, setVal }) => {
    const br = (s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
    // ■ ⇔ □ をクリックで切り替える印。値がなければ元の様式の印
    const mark = (key, d) => {
      const cur = () => values[key] || d;
      const btn = h('button', { type: 'button', class: 'h51-mark', title: 'クリックで ■ ⇔ □' }, cur());
      btn.addEventListener('click', () => { const next = cur() === '■' ? '□' : '■'; setVal(key, next === d ? '' : next); btn.textContent = next; });
      return btn;
    };
    // 承認印の欄：クリックで苗字を聞いて三文判風の認印を押す（欄ごとに別の人。空欄で取り消し。ユーザー指定）
    //   押せる人の制限はしない（ユーザー指定で今は考えない）
    const inkan = (key) => {
      const box = h('div', { class: 'h51-inkan', title: 'クリックで押印（苗字を入力）' });
      const draw = () => { box.innerHTML = values[key] ? DateStamp.inkan({ name: values[key], color: 'red' }) : '<span class="h51-hint no-print">クリックで押印</span>'; };
      box.addEventListener('click', () => {
        const last = (() => { try { return localStorage.getItem('shoshiki:_inkan') || ''; } catch (e) { return ''; } })();
        const v = prompt('押印する苗字を入力してください（空欄で取り消し）', values[key] || last);
        if (v === null) return;
        const name = v.trim().slice(0, 4);
        setVal(key, name);
        if (name) { try { localStorage.setItem('shoshiki:_inkan', name); } catch (e) { /* noop */ } }
        draw();
      });
      draw();
      return box;
    };
    const items = (c, sec, list) => h('td', { class: 'h51-items' }, ...list.map((it, i) => {
      const one = (s, j) => h('span', { class: 'h51-it' }, mark(`m${c}.${sec}.${i}.${j}`, s[0]), h('span', null, ...br(s.slice(1))));
      return h('div', { class: 'h51-line' }, ...(Array.isArray(it) ? it : [it]).map(one));
    }));
    const row = (label, cls, cell) => h('tr', { class: cls || null }, h('th', null, ...br(label)), ...COLS.map(cell));
    const tb = h('tbody', null,
      row('品質管理の\nステップ', 'h51-step', (c) => h('td', null, c.step)),
      row('規格要求\n事項', 'h51-req', (c) => h('td', null, ...c.req.map((r) => h('div', null, r)))),
      row('実施時期', 'h51-time', (c) => h('td', null, ...c.timing.map((r) => h('div', null, r)))),
      row('実施予定日', 'h51-date', (c, i) => h('td', null, field({ key: `yotei${i + 1}`, type: 'date', jp: true, style: 'short' }))),
      row('実施者', 'h51-who', (c, i) => items(i + 1, 'j', c.jisshi)),
      row('対象･関連\n部署', 'h51-dept', (c, i) => items(i + 1, 't', c.taisho)),
      row('完了承認者', 'h51-appr', (c) => h('td', null, ...br(c.shonin))),
      // 承認印：日付（空欄なら「/　　/」）と押印の欄。日常管理は月ごとに4つ
      row('承認印', 'h51-stamp', (c, i) => h('td', null, ...Array.from({ length: c.stamps || 1 }, (_, k) => {
        const key = `shonin${i + 1}.${k + 1}`;
        return h('div', { class: 'h51-st' + (c.stamps ? ' multi' : '') }, field({ key, type: 'date', jp: true, style: 'yy/mm/dd' }), inkan(`${key}.name`));
      }))),
      row('インプット', 'h51-in', (c, i) => items(i + 1, 'i', c.input)),
      row('プロセス', 'h51-proc', (c, i) => items(i + 1, 'p', c.process)),
      row('アウト\nプット', 'h51-out', (c, i) => items(i + 1, 'o', c.output)));
    return h('table', { class: 'grid h51' }, h('colgroup', null, h('col', { style: 'width:17mm' }), ...COLS.map(() => h('col'))), tb);
  } };

  FORM_DEFS['hin-a0051'] = {
    code: '本-品質-A0051', title: '個別工事施工プロセス管理表',
    iso: '【9.1】監視、測定、分析及び評価', // 元の様式の右上の表示。ヘッダーの番号の後ろに（ユーザー指定）
    seitei: '03/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    paper: 'A3', orientation: 'landscape',
    fileIO: true, // 工事ごとに、工事の進み具合に合わせて書き足すのでファイルに保存
    fileKeys: ['koban', 'subject'], // ファイル名は「本-品質-A0051_工番_件名_日付.json」
    sheetClass: 'h51',
    meta: [{ label: '作成日', key: 'sakusei', type: 'date', jp: true }],
    stamps: [], // 承認印は表の中（ステップごと）
    blocks: [
      { type: 'grid', rowH: 6.5, rows: [
        [{ label: '事業所名', key: 'jigyo', lw: 2, span: 6 }, { label: '部　署', key: 'busho', lw: 2, span: 7 },
          { label: '作成者（工事長・支店長）', key: 'sakusei_sha', lw: 4, span: 11 }],
        [{ label: '工　番', key: 'koban', maxlength: 12, lw: 2, span: 6 }, { label: '件　名', key: 'subject', lw: 2, span: 9 },
          { label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', jp: true, lw: 2, span: 9 }],
      ] },
      table,
    ],
  };
})();
