// 入札結果報告書（色付き＝必須記入項目。番号は原本どおり）
(function () {
  const C = CODES;
  const it = (no, label, key, o = {}) => ({ label: `${no}. ${label}`, key, span: 12, req: true, ...o });
  const code = (no, label, key, span = 12) => [
    { label: `${no}. ${label}`, key: key + 'Cd', placeholder: 'コード', span: Math.round(span * 0.6), req: true },
    { key: key + 'Name', placeholder: '名称', span: span - Math.round(span * 0.6) },
  ];

  FORM_DEFS['48'] = {
    code: '般-48', title: '入札結果報告書',
    selfStamp: '発行者', // 本人欄（デート印を押す欄）
    meta: [{ label: '報告日', key: 'date', type: 'date' }],
    bottomStamps: ['登録済検印'], // 下部（フッターの上）に置く押印欄
    stamps: [{ boxes: ['社長', '本店長', '確認', '確認', '発行者'] }],
    blocks: [
      { type: 'grid', dense: true, lalign: 'left', lw: 5, rows: [
        [{ label: '営業事業所', key: 'office', type: 'select', options: LISTS.officeCodes, span: 10 }, { label: '見積コード', key: 'mitsuCd', span: 14, lw: 4, placeholder: '物件情報登録済みの場合のみ記入' }],
        [it('01', '物件名称', 'name', { span: 24, placeholder: '30文字以内', maxlength: 30 })],
        [it('02', '物件略称(ｶﾀｶﾅ)', 'kana', { span: 24, placeholder: '30文字以内', maxlength: 30 })],
        [it('03', '予想工期', 'kFrom', { type: 'date' }), { label: '〜', key: 'kTo', type: 'date', span: 12, lw: 1 }],
        [...code('04', '施工地区', 'area'), it('05', '工事場所', 'place', { placeholder: '漢字・30文字以内' })],
        [...code('06', '施主', 'seshu'), ...code('07', '設計事務所', 'sekkei')],
        [...code('08', '建設会社', 'kensetsu'), it('09', '請負形態', 'ukeoi', { type: 'select', options: ['単体', 'JV'], span: 6 }),
          { label: 'S', key: 'jvS', unit: '％', lw: 1, span: 3 }, { label: 'P', key: 'jvP', unit: '％', lw: 1, span: 3 }],
        [it('10', '設備工事識別', 'setsubi', { type: 'select', options: C.setsubi }), it('11', '建物用途', 'youto', { suggest: C.youto })],
        [it('12', '主要構造', 'kozo', { suggest: C.kozo }), { label: '地上', key: 'fUp', unit: '階', lw: 2, span: 4 }, { label: '地下', key: 'fDown', unit: '階', lw: 2, span: 4 }, { label: '塔屋', key: 'fPh', unit: '階', lw: 2, span: 4 }],
        [{ label: '　　棟数', key: 'tou', unit: '棟', span: 7 }, { label: '住宅戸数', key: 'ko', unit: '戸', lw: 3, span: 6 }, { label: '室数', key: 'shitsu', unit: '室', lw: 2, span: 5 }, { label: '病床数', key: 'byosho', unit: '床', lw: 3, span: 6 }],
        [{ label: '　　延床面積', key: 'menseki', type: 'number', unit: '㎡', span: 12 }, { label: '施工路長', key: 'rocho', type: 'number', unit: '㎞', span: 12 }],
        [it('13', '備考（物件説明）', 'biko', { span: 24, placeholder: '漢字・30文字以内', maxlength: 30 })],
        '■ 入札結果',
        [...code('14', '発注先', 'hachu'), it('15', '入札日時', 'nyuD', { type: 'date', span: 9 }), { key: 'nyuT', type: 'time', span: 3 }],
        [it('15', '入札回数', 'kaisu', { unit: '回', span: 6, lw: 4 }), { label: '16. 入札業者数', key: 'gyoshaSu', unit: '社', span: 6, lw: 4, req: true }, it('16', '開札日時', 'kaiD', { type: 'date', span: 9 }), { key: 'kaiT', type: 'time', span: 3 }],
        [...code('17', '落札業者', 'rakusatsu'), { span: 12 }],
      ] },
      {
        type: 'table', key: 'b', rows: 15, rowH: 6, title: '18. 入札業者・入札金額',
        columns: [
          { label: 'No', key: 'no', w: 5, rowNo: true },
          { label: '入札業者コード', key: 'code', w: 17 },
          { label: '入札業者', key: 'name', w: 17 },
          { label: '第1回\n入札金額', key: 'a1', w: 17, type: 'money' },
          { label: '第2回\n入札金額', key: 'a2', w: 17, type: 'money' },
          { label: '第3回\n入札金額', key: 'a3', w: 17, type: 'money' },
          { label: '合否', key: 'result', w: 10, type: 'select', options: ['落札', '失格'], align: 'center' },
        ],
      },
      { type: 'notes', items: ['（＊注1）コード欄はコード、文字、または数字を記入。名称欄は名称を記入。選別は候補より選定。　（＊注2）色付きの欄は必須記入項目。'] },
    ],
  };
})();
