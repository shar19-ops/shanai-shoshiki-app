// 本-安全-A0005 幹線ケーブル通線作業チェックリスト（品質記録様式。元Excel：本-安全-A0005幹線ｹｰﾌﾞﾙ通線作業ﾁｪｯｸﾘｽﾄ.xlsx、A4縦1ページ）
// 表の形・決まった文章は元のまま、見た目はほかの品質記録様式に合わせる。押印欄はなし（ユーザー指定）
// 作業所長サイン：クリックで、上の作業所長の苗字と押した日のデート印（もう一度クリックで消す）
(function () {
  const PLAN = '幹線ケーブル\n通線作業\n施工計画書';
  const CHECK = '幹線ケーブル\n通線作業\nチェックリスト';
  const WATCH = '通線作業中は、随時（最低でも、午前中、昼前後、午後の3回）作業場所を監視し、作業（特にケーブルの仮支持方法）が「幹線ケーブル通線作業施工計画書」の通りに実施されているか、危険な状態で作業していないかを測定する。';
  const DANGER = '危険な状態を発見した場合は、作業を中断しているか。作業方法、手順を修正し、作業を再開しているか。';
  // 1行＝プロセス1つ。t 時期・w 実施者・i インプット・o アウトプットは [文字, 行数]（省略は上の行の続き）
  //   i の time は確認時間（時刻の入力欄）
  const ROWS = [
    { t: ['作業\n1月前', 2], w: ['職長\n作業所員', 1], i: ['実施工程表\n施工図', 1], o: ['幹線ケーブル\n通線作業\n施工計画（案）', 1],
      p: '人員配置、作業分担、作業内容、ケーブルの仮支持方法、作業指示方法、合図の方法、使用資機材、使用機械工具、服装、保護具等を計画。' },
    { w: ['作業所長\n作業所員\n職長', 1], i: ['幹線ケーブル\n通線作業\n施工計画（案）', 1], o: [PLAN, 1],
      p: '人員配置、作業分担、作業内容、ケーブルの仮支持方法、作業指示方法、合図の方法、使用資機材、使用機械工具、服装、保護具等について審査、承認する。' },
    { t: ['作業\n前日', 4], w: ['作業所長', 1], i: ['送出し教育\n終了書', 1], o: ['新規入場者教育\n実施記録', 1],
      p: '幹線通線のための新規入場者がある場合は、新規入場者教育を実施してあるか。' },
    { w: ['作業所長\n作業所員', 3], i: [PLAN, 3], o: [CHECK, 3], p: '必要な資機材は、準備されているか。' },
    { p: '必要な機械工具は、準備されているか。' },
    { p: '作業場所は、危険な状態でないか。' },
    { t: ['作業\n当日', 3], w: ['作業所長\n作業所員', 3], i: ['朝礼、TBM、KYT', 3], o: ['月度労務出面\n管理表', 1],
      p: '人員及び健康状態を確認して、問題はないか。' },
    { o: ['TBM、KYT\n実施記録', 2], p: '「幹線ケーブル通線作業施工計画書」を配布し、人員配置、作業分担、作業内容、ケーブルの仮支持方法、作業指示方法、合図の方法、使用資機材、使用機械工具等について作業員全員に周知したか。' },
    { p: '服装、保護帽、安全帯、安全靴、手袋等を確認して、問題はないか。' },
    { t: ['作業中', 6], w: ['作業所長\n作業所員', 6], i: ['午前\n確認時間', 2, 'am'], o: [CHECK, 7], p: WATCH },
    { p: DANGER },
    { i: ['昼前後\n確認時間', 2, 'noon'], p: WATCH },
    { p: DANGER },
    { i: ['午後\n確認時間', 2, 'pm'], p: WATCH },
    { p: DANGER },
    { t: ['作業\n修了後', 2], w: ['職長', 1], i: ['', 1], p: '資機材、工具等を片付け、清掃を行う。' },
    { w: ['作業所長\n作業所員', 1], i: ['', 1], o: ['月度労務出面\n管理表', 1], p: '作業員の健康状態が異常ないことを確認する。' },
  ];

  const lines = (h, s) => String(s).split('\n').flatMap((x, i) => (i ? [h('br'), x] : [x]));
  const surname = (s) => String(s || '').trim().split(/[\s　]+/)[0];

  const render = ({ h, field, values, setVal }) => {
    const signs = [];
    const tb = h('tbody', null, h('tr', null,
      ...['時期', '実施者', 'インプット', 'プ　ロ　セ　ス', 'アウトプット'].map((t) => h('th', null, t)),
      h('th', null, '作業所長', h('br'), 'サイン'), h('th', null, '備　考')));
    ROWS.forEach((r, n) => {
      const tr = h('tr', { class: r.t ? 'q5-grp' : null });
      if (r.t) tr.append(h('td', { class: 'lbl q5-t', rowspan: r.t[1] }, ...lines(h, r.t[0])));
      if (r.w) tr.append(h('td', { class: 'q5-c', rowspan: r.w[1] }, ...lines(h, r.w[0])));
      if (r.i) tr.append(h('td', { class: 'q5-c' + (r.i[2] ? ' q5-time' : ''), rowspan: r.i[1] }, ...lines(h, r.i[0]),
        r.i[2] ? h('div', { class: 'q5-tf' }, field({ key: `time_${r.i[2]}`, type: 'time' })) : null));
      tr.append(h('td', { class: 'q5-p' }, r.p));
      if (r.o) tr.append(h('td', { class: 'q5-o', rowspan: r.o[1] }, ...lines(h, r.o[0])));
      // 作業所長サイン：押した日付を保存し、作業所長の苗字でデート印を表示
      const k = `sign${n + 1}`;
      const cell = h('td', { class: 'q5-sign', title: 'クリックで作業所長のサイン（もう一度クリックで消す）', onclick: () => {
        if (values[k]) { if (confirm('このサインを消しますか？')) setVal(k, ''); return; }
        if (!surname(values.shocho)) { alert('先に上の「作業所長」に名前を入れてください。'); return; }
        const d = new Date();
        setVal(k, `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      } });
      signs.push([cell, k]);
      tr.append(cell, h('td', { class: 'q5-note' }, field({ key: `note${n + 1}`, type: 'textarea', plain: true, lines: 1 })));
      tb.append(tr);
    });
    // サインの表示を値に合わせる（作業所長の名前を変えたときも）
    const sync = field({ key: 'signSync', type: 'calc', calc: (num, v) => {
      signs.forEach(([cell, k]) => {
        const iso = v[k];
        const [y, m, d] = String(iso || '').split('-').map(Number);
        cell.innerHTML = iso && surname(v.shocho) ? DateStamp.svg({ name: surname(v.shocho), date: { year: y, month: m, day: d }, color: 'black' }) : '';
      });
      return '';
    } });
    sync.style.display = 'none';
    return h('div', null, sync,
      h('div', { class: 'q5-hint no-print' }, '※ 作業所長サインの欄をクリックすると、上の作業所長の苗字と押した日のデート印が付きます（印刷されない案内です）。'),
      h('table', { class: 'grid dense q5' },
      h('colgroup', null, ...[11, 17, 24, null, 24, 15, 20].map((w) => h('col', { style: w ? `width:${w}mm` : null }))),
      tb));
  };

  FORM_DEFS['anzen-a0005'] = {
    code: '本-安全-A0005', title: '幹線ケーブル通線作業チェックリスト',
    seitei: '04/05/20', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    meta: [{ label: '施工日', key: 'date', type: 'date' }],
    stamps: [], // 押印欄なし（作業所長が行ごとにサイン）
    blocks: [
      { type: 'grid', lw: 3, rowH: 7, dense: true, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, span: 8 }, { label: '件　名', key: 'subject', span: 16 }],
        [{ label: '作業所長', key: 'shocho', lw: 3, span: 12 }, { span: 12 }],
      ] },
      { type: 'custom', render },
      { type: 'notes', items: [
        '※1　本票は、幹線ケーブル通線作業に際して、「幹線ケーブル通線作業施工計画書」及び「幹線ケーブル通線作業標準(本-安全-00001)」に基づき、作業所長がプロセスの進捗状況を随時確認し、記録する。',
        '　2　本票は、作業所長が保管し、工事部長（支店次長）は、現場巡回検査時に実施状況の確認をする。',
      ] },
    ],
  };
})();
