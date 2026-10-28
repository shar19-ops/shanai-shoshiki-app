// 本-品質-A0014 検査／試験依頼書・検査／試験通知書（品質記録様式。元Excel：本ー品質ーA0014 検査／試験依頼書・検査／試験通知書.xlsx、A4縦1ページ）
// 上が依頼書（作業所長が発行）、下が通知書（品質保証部長／支店工事部長が発行）。押印欄は元の様式と同じく、それぞれの表の右下に置く
// 押印欄の見出しの下に日付（空欄なら「/　　/」）、押印部に「発　行」を薄く印字。作業所長にデート印
// 検査/試験 種別・設計種別は番号を○で囲む代わりにクリックで選ぶ
(function () {
  // 日付と開始・終了の時刻（「年　月　日　：　～　：」の欄）
  const when = (p) => ({ type: 'inline', parts: [
    { key: `${p}D`, type: 'date', jp: true, w: 42 }, { key: `${p}T1`, type: 'time', w: 22 }, '～', { key: `${p}T2`, type: 'time', w: 22 },
  ] });
  const secTitle = (t) => ({ type: 'para', text: t, style: 'text-align:center;font-size:14pt;font-weight:bold;letter-spacing:.2em;margin:2mm 0 2.5mm' });
  const stampBox = (box) => ({ type: 'stamps', groups: [{ boxes: [box], dates: true }] });

  FORM_DEFS['hin-a0014'] = {
    code: '本-品質-A0014', title: '検査／試験依頼書・通知書',
    seitei: '99/01/04', kaitei: '26/11/17', // フッター：制定日は元の様式のまま、最終改訂日はユーザー指定
    selfStamp: '作業所長',
    meta: [{ label: '依頼日', key: 'iraibi', type: 'date', jp: true }],
    stamps: [], // 押印欄は依頼書・通知書の表の中（元の様式どおり）
    blocks: [
      secTitle('検査/試験 依頼書'),
      // 上の表と、押印欄の左の表を隙間なくつなぐ（見出しの列は同じ幅）
      { type: 'col', fit: true, gap: 0, items: [
      { type: 'grid', cols: 2, colWidths: ['31mm', null], lw: 1, rowH: 7, rows: [
        [{ label: '工　番', key: 'koban', maxlength: 12, span: 2 }],
        [{ label: '件　名', key: 'subject', span: 2 }],
        [{ label: '所 在 地', key: 'shozaichi', span: 2 }],
        [{ label: '作業所TEL', key: 'tel', type: 'tel', span: 2 }],
        [{ label: '検査/試験 種別', key: 'shubetsu', type: 'radio', vertical: true, options: ['1.　中間自主検査', '2.　竣工自主検査', '3.　高圧受変電設備 試験'], span: 2 }],
      ] },
      { type: 'row', gap: 0, align: 'flex-end', items: [
        { w: 89, type: 'grid', cols: 3, colWidths: ['31mm', '17mm', null], rowH: 6.6, rows: [
          [{ label: '実施希望日', rs: 3, span: 1 }, { label: '第1希望', lw: 1, span: 2, ...when('kibo1'), key: 'kibo1' }],
          [{ label: '第2希望', lw: 1, span: 2, ...when('kibo2'), key: 'kibo2' }],
          [{ label: '第3希望', lw: 1, span: 2, ...when('kibo3'), key: 'kibo3' }],
          [{ label: '設計種別', key: 'sekkei', type: 'radio', vertical: true, options: ['1.　自社設計', '2.　他社設計'], lw: 1, span: 3 }],
        ] },
        { ...stampBox('作業所長\n発　行') },
      ] },
      ] },
      { type: 'notes', items: [
        '1.　作業所長は、実施希望日を工事部長及び工事長と打合せの上、依頼すること。',
        '2.　検査/試験 種別は、いずれかを選ぶこと。',
        '3.　高圧受変電設備の試験を依頼する場合は、試験実施日の1ヶ月前に依頼すること。',
        '4.　高圧受変電設備の試験を依頼する場合は、「需要区域図」及び「単線結線図」を添付すること。',
      ] },
      { type: 'spacer' },
      secTitle('検査/試験 通知書'),
      { type: 'para', style: 'margin:0 0 1mm;line-height:1.6', text: '下記の通り検査/試験を実施します。\nなお、検査時に以下の文書･記録を確認します。作業所長は、すぐに確認できるように準備をしておいて下さい。\n　①　施工計画書\n　②　すべての受入検査記録\n　③　すべての工程内検査記録' },
      { type: 'para', text: '記', style: 'text-align:center;margin:0 0 1mm' },
      { type: 'row', gap: 0, align: 'flex-end', items: [
        { w: 89, type: 'grid', cols: 3, colWidths: ['31mm', '40mm', null], lw: 1, rowH: 7, rows: [
          [{ label: '検査/試験 日時', span: 3, ...when('kensa'), key: 'kensa' }],
          [{ label: '検査チーム\n（試験班）', rs: 2, span: 1 }, { label: '検査員チーフ（試験班長）', key: 'chief', span: 2 }],
          [{ label: '検査員（試験班員）', key: 'kensain', type: 'textarea', h: 21, span: 2 }],
        ] },
        { ...stampBox('品質保証部長|支店工事部長\n発　行') },
      ] },
      { type: 'notes', items: [
        '1.　品質保証部長は、本通知書を工事本部長、工事部長、工事長、検査員（試験班員）及び作業所長に配付する。',
        '2.　品質保証部長又は支店工事部長は、本通知書を工事本部長、支店長、工事部長、工事長、検査員及び作業所長に配付する。',
      ] },
    ],
  };
})();
