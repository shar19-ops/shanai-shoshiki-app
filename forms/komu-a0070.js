// 本-工務-A0070 月度施工管理月報（品質記録様式。元Excel：本-工務-A0070月度施工管理月報.xlsx、A4縦1ページ）
// 施工管理月報タブレット入力アプリ（monthly-report-app）とは切り離した、Y-Format の紙用の様式（ユーザー指定）
// 毎月つぎ足して使うので、JSONファイルに保存・読み込み（fileIO）。「翌月分を作る」で今月の評価を前月の欄へ移し、月ごとの欄を空にする
// 押印欄は右上（元は下部）、右端の工事担当（発行）にデート印。支店長は工事本部長/RE部長の欄を共用、工事長の欄は工事長だけ
(function () {
  const EVAL = ['施工図の作成状況について', '品質管理・技術力について', '原価管理・粗利益について', '工程管理について',
    '安全管理・無事故無災害について', '労務管理について', '営業の協力度について', '購買の協力度について', '協力工事班の協力度について'];
  const ABCD = ['A', 'B', 'C', 'D'];
  const FIRE = ['自火報', '誘導灯', '非常\nコンセント', '変電', '発電']; // 消防の届出（残り4列は項目名を書ける）
  // 翌月分を作るときに空にする欄（月ごとに書く内容）
  const MONTHLY = ['jokyo', 'mondai', 'shijiTanto', 'shijiKobai'];

  const rollMonth = ({ h, values, setVal, rebuild, newFile }) => h('div', { class: 'no-print a70-roll' },
    h('button', { type: 'button', onclick: () => {
      if (!confirm('翌月分を作ります。\n・今月の自己評価を「前月」の欄へ移し、今月の評価を空にします\n・現場の状況、現状の問題点、指示事項を空にします\n・月度を1か月進めます\n（工番・件名などはそのまま。保存は新しいファイルになります）')) return;
      EVAL.forEach((_, i) => { setVal(`prev${i + 1}`, values[`eval${i + 1}`] || ''); setVal(`eval${i + 1}`, ''); });
      MONTHLY.forEach((k) => setVal(k, ''));
      if (/^\d{4}-\d{2}$/.test(values.ym || '')) {
        const [y, m] = values.ym.split('-').map(Number);
        const d = new Date(y, m, 1); // 翌月
        setVal('ym', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
      newFile();
      rebuild();
    } }, '翌月分を作る'),
    h('span', null, '先月のファイルを開いてから押すと、評価を前月の欄へ移して今月分を書き始められます。'));

  FORM_DEFS['komu-a0070'] = {
    code: '本-工務-A0070', title: '月度施工管理月報',
    seitei: '97/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '工事担当',
    sheetClass: 'tight-gap', // 項目が多いので、欄と欄の間を詰めて1ページに
    fileIO: true,
    meta: [{ label: '月　度', key: 'ym', type: 'ym' }],
    stamps: [{ boxes: ['社長', '本店長', '工事本部長|RE部長\n支店は支店長', '工事長\n指示', '工事担当\n発行'] }],
    blocks: [
      { type: 'custom', render: rollMonth },
      // 48分割。どの行も見出し5列・区切りを16列目と32列目にそろえる（本-営業-A0004 と同じ）
      { type: 'grid', cols: 48, lw: 5, rowH: 5, dense: true, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, span: 16 }, { label: '件　名', key: 'subject', span: 32 }],
        [{ label: '所在地', key: 'addr', span: 16 }, { label: '現場TEL', key: 'tel', type: 'tel', span: 16 }, { label: '契約先', key: 'keiyakusaki', span: 16 }],
        [{ label: '契約金額', key: 'keiyaku', type: 'money', unit: '円', span: 16 }, { label: '出来高', key: 'dekidaka', type: 'number', unit: '%', span: 16 },
          { label: '建築会社', key: 'kenchiku', span: 16 }],
        [{ label: '部　署', key: 'dept', span: 16 }, { label: '現場代理人', key: 'dairinin', span: 16 }, { label: '設計事務所', key: 'sekkei', span: 16 }],
        [{ label: '監理技術者・主任技術者', key: 'gijutsusha', lw: 10, span: 32 }, { label: '施　主', key: 'seshu', span: 16 }],
        [{ label: '現場係員', key: 'kakari', span: 32 }, { label: '概　要', key: 'gaiyo', span: 16 }],
        [{ label: '工　期', key: 'kFrom', key2: 'kTo', type: 'daterange', span: 32 },
          { label: '実行予算に対する\n現在の原価の率', key: 'genkaRitsu', type: 'number', unit: '%', lw: 9, span: 16 }],
        [{ label: '工事班', key: 'kojihan', span: 48 }],
      ] },
      // 中間での自己評価：今月（A〜D）・前月・コメント
      { type: 'grid', cols: 48, rowH: 4.6, dense: true, rows: [
        [{ label: '中間での自己評価（A：良い、B：やや良い、C：やや悪い、D：悪い）', lalign: 'left', span: 32 }, { label: '前月', span: 4 }, { label: 'コメント', span: 12 }],
        ...EVAL.map((t, i) => [
          { text: `${i + 1}．${t}`, span: 20 },
          { key: `eval${i + 1}`, type: 'radio', options: ABCD, nowrap: true, span: 12 },
          { key: `prev${i + 1}`, type: 'select', options: ABCD, align: 'center', span: 4 },
          ...(i === 0 ? [{ key: 'evalComment', type: 'textarea', plain: true, span: 12, rs: EVAL.length }] : [])]),
      ] },
      // 提出状況（工事部長確認）：月ごとにクリックで〇
      { type: 'grid', cols: 48, rowH: 4.6, dense: true, rows: [
        [{ label: '提出状況\n工事部長確認', span: 12, rs: 2 }, ...Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}月`, span: 3 }))],
        Array.from({ length: 12 }, (_, i) => ({ key: `kakunin${i + 1}`, type: 'mark', span: 3 })),
      ] },
      { type: 'free', label: '現場の状況', key: 'jokyo', lines: 2 },
      // 届出書類提出状況
      { type: 'grid', cols: 48, rowH: 4.6, dense: true, title: '届出書類提出状況', rows: [
        [{ text: '提出前は予定日を記入する。提出後は〇を記入する。電力会社は受付番号を記入する。提出月は写しを添付すること。', note: true, span: 48 }],
        [{ label: '', span: 8 }, { label: '高　圧', span: 14 }, { label: '低　圧', span: 13 }, { label: '太陽光連系', span: 13 }],
        [{ label: '電力会社\n申込番号記入', span: 8, rs: 2 }, { key: 'hv', span: 14, rs: 2, align: 'center' },
          { key: 'lvP', prefix: '電力', span: 13 }, { key: 'pvP', prefix: '電力', span: 13 }],
        [{ key: 'lvL', prefix: '電灯', span: 13 }, { key: 'pvL', prefix: '電灯', span: 13 }],
        [{ label: '', span: 8 }, ...FIRE.map((t) => ({ label: t, span: 3 })),
          ...[6, 7, 8, 9].map((n) => ({ key: `fireHead${n}`, align: 'center', span: 3 })),
          { label: '', span: 5 }, { label: '主任\n技術者', span: 4 }, { label: '保安\n規程', span: 4 }],
        ...[['plan', '消防計画届'], ['set', '消防設置届']].map(([p, label], r) => [
          { label, span: 8 }, ...Array.from({ length: 9 }, (_, i) => ({ key: `fire_${p}${i + 1}`, align: 'center', span: 3 })),
          ...(r === 0 ? [{ label: '産業保安\n監督部', span: 5, rs: 2 }] : []),
          { key: `hoan_${p}1`, align: 'center', span: 4 }, { key: `hoan_${p}2`, align: 'center', span: 4 }]),
        [{ text: '消防設備と産業保安監督部について、該当する項目がない場合は、空欄に記入すること。', note: true, span: 48 }],
      ] },
      { type: 'free', label: '現状の問題点', key: 'mondai', lines: 2 },
      // 工事長・支店長の指示事項（担当者へ／購買・営業本部へ）
      { type: 'row', gap: 0, items: [
        { type: 'free', label: '工事長・支店長の指示事項（担当者へ）', key: 'shijiTanto', lines: 2, grow: true },
        { type: 'free', label: '（購買・営業本部へ）', key: 'shijiKobai', lines: 2, grow: true },
      ] },
      { type: 'notes', items: ['※1 本月報は施工中、毎月1日に提出すること。　2 竣工時は竣工報告書を提出のこと。　　保管：工事本部、支店工事部門'] },
    ],
  };
})();
