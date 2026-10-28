// 本-工務-A0069 竣工報告書（品質記録様式。元Excel：本-工務-A0069竣工報告書.xlsx、A4縦1ページ）
// 押印欄は右上（元は下部に横一列）、右端の作成者にデート印。支店長は工事本部長/RE部長の欄を共用、工事長の欄は工事長だけ
// 表は48分割で、どの行も見出し5列・区切りを16列目と32列目にそろえる（本-営業-A0004 と同じ）
(function () {
  const EVAL = ['品質管理・技術力について', '原価管理・粗利益について', '工程管理について', '安全管理・無事故無災害について',
    '労務管理について', '営業の協力度について', '購買の協力度について', '協力工事班の協力度について'];
  // 利益率＝（契約金額−原価）÷契約金額、小数点第1位まで（第2位以下は切り捨て。本-営業-A0004 の粗利と同じ）
  const rate = (n) => (n('keiyaku') ? (Math.trunc(Math.round((n('keiyaku') - n('genka')) / n('keiyaku') * 1e6) / 1e4 * 10) / 10).toFixed(1) : '');

  FORM_DEFS['komu-a0069'] = {
    code: '本-工務-A0069', title: '竣工報告書',
    seitei: '96/10/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作成者',
    meta: [],
    stamps: [{ boxes: ['社長', '本店長', '工事本部長|RE部長\n支店は支店長', '工事長', '工事管理課', '作成者'] }],
    blocks: [
      { type: 'grid', cols: 48, lw: 5, rowH: 6.2, dense: true, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, span: 16 }, { label: '件　名', key: 'subject', span: 32 }],
        [{ label: '竣工年月日', key: 'shunko', type: 'date', span: 16 }, { label: '建物名', key: 'tatemono', span: 16 }, { label: '建物用途', key: 'yoto', span: 16 }],
        [{ label: '所在地', key: 'addr', span: 16 }, { label: 'TEL', key: 'tel', type: 'tel', span: 16 }, { label: '連絡担当者', key: 'renraku', span: 16 }],
        [{ label: '部　署', key: 'dept', span: 16 }, { label: '工事担当者', key: 'tanto', span: 16 }, { label: '協力会社', key: 'kyoryoku', span: 16 }],
        [{ label: '契約先', key: 'keiyakusaki', span: 16 }, { label: '建築会社', key: 'kenchiku', span: 16 }, { label: '現場所長', key: 'shocho', span: 16 }],
        // 関係者連絡先
        [{ label: '関　係　者　連　絡　先', span: 48 }],
        [{ label: '', span: 5 }, { label: '名　称', span: 11 }, { label: '所　在　地', span: 16 }, { label: 'TEL', span: 8 }, { label: '担当者', span: 8 }],
        ...[['seshu', '施　主'], ['kanri', '管理会社'], ['sekkei', '設計事務所']].map(([p, label]) => [
          { label, span: 5 }, { key: `${p}Name`, span: 11 }, { key: `${p}Addr`, span: 16 }, { key: `${p}Tel`, type: 'tel', span: 8 }, { key: `${p}Tanto`, span: 8 }]),
        // 自己評価：A〜Dから1つ。右はフリースペース
        [{ label: 'この現場についての自己評価（A：良い、B：やや良い、C：やや悪い、D：悪い）', lalign: 'left', span: 32 }, { label: 'フリースペース', span: 16 }],
        ...EVAL.map((t, i) => [
          { text: `${i + 1}．${t}`, span: 22 },
          { key: `eval${i + 1}`, type: 'radio', options: ['A', 'B', 'C', 'D'], nowrap: true, span: 10 },
          ...(i === 0 ? [{ key: 'evalFree', type: 'textarea', plain: true, span: 16, rs: EVAL.length }] : [])]),
        // 金額は100億円単位まで（本-営業-A0004 と同じ幅）
        [{ label: '契約金額', key: 'keiyaku', type: 'money', unit: '円', span: 16 }, { label: '原　価', key: 'genka', type: 'money', unit: '円', span: 16 },
          { label: '利　益', key: 'rieki', type: 'calc', unit: '%', calc: rate, span: 16 }],
      ] },
      { type: 'free', label: 'この現場を竣工してのコメント（感想、うまくいった点、反省点など）', key: 'comment', lines: 3, grow: true }, // 残りの高さいっぱい
      { type: 'grid', cols: 48, lw: 5, rowH: 6.2, dense: true, rows: [
        [{ label: '竣工図\nの提出日', key: 'zumen', type: 'date', span: 16 }, { label: '予想される追加工事と金額', key: 'tsuika', lw: 11, span: 32 }],
        [{ label: 'この現場の関係者からの次の物件の情報', lalign: 'left', span: 48 }],
        [{ label: '施主から', key: 'nextSeshu', lw: 7, span: 48 }],
        [{ label: '設計事務所から', key: 'nextSekkei', lw: 7, span: 48 }],
        [{ label: '建築会社から', key: 'nextKenchiku', lw: 7, span: 48 }],
      ] },
      { type: 'free', label: '所属長の所見', key: 'shoken', lines: 3 },
      { type: 'notes', items: ['※ 完成工事原価計算書に添付して回送すること。　　保管：工事本部'] },
    ],
  };
})();
