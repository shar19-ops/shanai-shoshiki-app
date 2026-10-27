// 本-安全-A0018 私有車使用許可願書（品質記録様式。元Excel：本-安全-A0018私有車使用許可願書.xls、A4縦1ページ）
// 一般書式の申請書（般-53）と同じ形：押印欄は右上（元は右下に横一列）、右端の申請者にデート印（本文の氏名の「印」はなし）
// 支店長は本部長・RE部長の欄を共用、工事長の欄は工事長だけ
(function () {
  const DOW = '日月火水木金土';
  // 使用期間（自・至）：年月日＋曜日＋時刻を1つの欄に
  const when = (p, head, tail) => ({ key: `${p}W`, type: 'inline', span: 20, parts: [
    head, { key: `${p}Date`, type: 'date', jp: true, w: 38 },
    { key: `${p}Dow`, type: 'calc', align: 'left', w: 10, calc: (n, v) => (v[`${p}Date`] ? `（${DOW[new Date(v[`${p}Date`] + 'T00:00').getDay()]}）` : '（　）') },
    { key: `${p}Time`, type: 'time', w: 24 }, tail] });

  FORM_DEFS['anzen-a0018'] = {
    code: '本-安全-A0018', title: '私有車使用許可願書',
    seitei: '10/04/01', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '申請者',
    meta: [{ label: '作成日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['総括安全|衛生管理者', '安全運転|管理者\n保管', '工事本部長|RE部長\n支店は支店長', '工事長', '申請者'] }],
    blocks: [
      { type: 'para', text: '総括安全衛生管理者　殿' },
      { type: 'para', text: '下記のとおり、私有車の使用許可を願い出ます。' },
      { type: 'grid', lw: 4, rowH: 11, rows: [
        [{ label: '部　署', key: 'dept', type: 'inline', span: 24, parts: [
          { key: 'honbu' }, '本部', { key: 'bu' }, '部', { key: 'ka' }, '課'] }],
        [{ label: '氏　名', key: 'name', span: 24 }],
        [{ label: '使用理由', key: 'reason', type: 'textarea', plain: true, h: 45, span: 24 }],
        [{ label: '使用期間', span: 4, rs: 2 }, when('from', '自', 'から')],
        [when('to', '至', 'まで')],
        [{ label: '行先き', key: 'dest', type: 'textarea', plain: true, h: 30, span: 24 }],
        // 予定走行距離は必ず記入（元の様式の注意書き）
        [{ label: '予定走行\n距離', key: 'kmW', type: 'inline', span: 24, req: true, parts: [
          // 1日・1ヶ月・距離の間を空ける（同じキーの選択肢を2つに分けて、間に空白を置く）
          '　', { key: 'kmUnit', type: 'radio', options: ['1日'] }, '　　　', { key: 'kmUnit', type: 'radio', options: ['1ヶ月'] },
          '　　　約　', { key: 'km', type: 'number', w: 30 }, '　km　　　（予定走行km数を必ず記入する事）'] }],
        [{ label: '使用車輌', span: 4, rs: 1 }, { label: '車　種', key: 'carType', lw: 3, span: 9 }, { label: '登録番号', key: 'carNo', lw: 3, span: 11 }],
      ] },
      { type: 'notes', items: [
        '※1. 私有車許可願いの事後承認は理由を問わず認めない。',
        '　2. 運転免許証の写しを添える事。',
        '　3. 車輌検査証の写しを添える事。',
        '　4. 車輌保険証の写し『任意保険（対人、対物等）』を添える事。',
        '　5. 使用に際しては安全運転に徹する事。（1ヶ月以上使用する場合は運転月報を月初めに提出する）',
      ] },
      { type: 'spacer' },
    ],
  };
})();
