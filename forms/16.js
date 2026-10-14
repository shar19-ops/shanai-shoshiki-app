// 設計依頼登録メモ
(function () {
  const C = CODES;
  // 必須記入項目（元Excelの色塗り欄）
  const REQ = new Set(['01','02','03','04','05','06','15','16','20','21']);
  const it = (no, label, key, o = {}) => ({ label: `${no}. ${label}`, key, span: 12, req: REQ.has(no), ...o });
  const code = (no, label, key, span = 12) => [
    { label: `${no}. ${label}`, key: key + 'Cd', placeholder: 'コード', span: Math.round(span * 0.6), req: REQ.has(no) },
    { key: key + 'Name', placeholder: '名称', span: span - Math.round(span * 0.6) },
  ];
  const KIJUN = ['00：通常', '01：建設省', '02：文部省', '03：住都公団', '04：東京都', '99：その他'];

  FORM_DEFS['16'] = {
    code: '般-16', title: '設計依頼登録メモ',
    meta: [{ label: '依頼日', key: 'date', type: 'date' }],
    stamps: [{ boxes: ['確認', '確認', '発行者'] }, { boxes: ['登録済検印'], width: 18 }],
    blocks: [
      { type: 'grid', dense: true, lalign: 'left', lw: 5, rows: [
        [{ label: '営業事業所', key: 'office', type: 'select', options: LISTS.officeCodes, span: 8 },
          { label: '見積物件コード', key: 'mitsuCd', span: 8, lw: 4 }, { label: '関連物件コード', key: 'relCd', span: 8, lw: 4 }],
        [{ label: '関連物件名称', key: 'relName', span: 24 }],
        [{ text: '※見積物件コードは物件情報登録済みの場合のみ。関連物件コードは増築・改修・隣接物件（物件情報登録済の場合は記入しない）。', note: true }],
        '■ 物件情報',
        [it('01', '物件名称', 'name', { span: 24, placeholder: '30文字以内', maxlength: 30 })],
        [it('02', '物件略称(ｶﾀｶﾅ)', 'kana', { span: 24, placeholder: '30文字以内', maxlength: 30 })],
        [it('03', '予想工期', 'kFrom', { type: 'date', span: 12 }), { label: '〜', key: 'kTo', type: 'date', span: 12, lw: 1 }],
        [...code('04', '施工地区', 'area'), it('05', '工事場所', 'place', { placeholder: '漢字・30文字以内' })],
        [...code('06', '積算引合先', 'hikiai'), it('07', '設計引合先窓口', 'madoguchi', { placeholder: '部署・氏名等' })],
        [...code('08', '建設会社', 'kensetsu'), ...code('09', '設計事務所', 'sekkei')],
        [...code('10', '施主', 'seshu'), ...code('11', '予想契約先', 'keiyaku')],
        [it('12', '建物用途', 'youto', { suggest: C.youto }), it('13', '主要構造', 'kozo', { suggest: C.kozo })],
        [{ label: '　　階数', span: 5 }, { label: '地上', key: 'fUp', unit: '階', lw: 2, span: 6 }, { label: '地下', key: 'fDown', unit: '階', lw: 2, span: 6 }, { label: '塔屋', key: 'fPh', unit: '階', lw: 2, span: 7 }],
        [{ label: '　　棟数', key: 'tou', unit: '棟', span: 7 }, { label: '住宅戸数', key: 'ko', unit: '戸', lw: 3, span: 6 }, { label: '室数', key: 'shitsu', unit: '室', lw: 2, span: 5 }, { label: '病床数', key: 'byosho', unit: '床', lw: 3, span: 6 }],
        [{ label: '　　延床面積', key: 'menseki', type: 'number', unit: '㎡', span: 12 }, { label: '施工路長', key: 'rocho', type: 'number', unit: '㎞', span: 12 }],
        [it('14', '総工費', 'sokohi', { type: 'money', unit: '円' }), it('15', '予想電気工事費', 'denkihi', { type: 'money', unit: '円' })],
        [it('16', '設備工事識別', 'setsubi', { type: 'select', options: C.setsubi }), it('17', '建築工事識別', 'kenchiku', { type: 'select', options: C.kenchiku })],
        [it('18', '官庁・民間識別', 'kanmin', { type: 'select', options: C.kanmin }), it('19', '物件状況識別', 'bukken', { suggest: C.bukken })],
        [...code('20', '営業担当者', 'eigyo'), it('21', '予想受注月度', 'juchuM', { type: 'ym' })],
        [it('22', '備考（物件説明）', 'biko1', { span: 24, placeholder: '上段・30文字以内', maxlength: 30 })],
        [{ label: '', key: 'biko2', span: 24, placeholder: '下段・30文字以内', maxlength: 30 }],
        '■ 設計条件',
        [it('23', '確認図提出日時', 'kakuninD', { type: 'date', span: 9 }), { key: 'kakuninT', type: 'time', span: 3 }, it('24', '実施図提出日時', 'jisshiD', { type: 'date', span: 9 }), { key: 'jisshiT', type: 'time', span: 3 }],
        [it('25', '第1回打合日時', 'uchi1D', { type: 'date', span: 9 }), { key: 'uchi1T', type: 'time', span: 3 },
          { label: '26. 定例打合日時', key: 'teireiDow', type: 'select', options: ['日', '月', '火', '水', '木', '金', '土'], prefix: '毎週', unit: '曜日', span: 9 }, { key: 'teireiT', type: 'time', span: 3 }],
        [it('27', '基準仕様', 'kijun', { suggest: KIJUN, placeholder: 'その他は6文字以内' }), { span: 12 }],
        [{ label: '28. 指定メーカー', key: 'maker1', prefix: '①', span: 12 }, { key: 'maker2', prefix: '②', span: 12 }],
        [{ label: '', key: 'maker3', prefix: '③', span: 12 }, { key: 'maker4', prefix: '④', span: 12 }],
        [{ label: '29. 提出書類', key: 'shorui', type: 'checks', span: 24, options: ['1：設計計算書', '2：諸官庁事前協議書', '3：打合議事録', '9：その他'] }],
        [{ label: '30. 諸官庁等打合', key: 'kancho', type: 'checks', span: 24, options: ['1：現地調査', '2：電力会社', '3：NTT', '4：消防署', '5：建築指導課', '9：その他'] }],
        [it('31', '設計条件', 'joken', { span: 24, placeholder: '30文字以内', maxlength: 30 })],
        [{ label: '　　特記事項', key: 'tokki', span: 24, placeholder: '30文字以内', maxlength: 30 }],
      ] },
      { type: 'notes', items: [
        '(注1) コード欄はコード・文字・数字を記入。名称欄は名称を記入、または候補から選択。',
        '(注2) 色付きの欄は必須記入項目。但し、15，21は物件情報登録済みの場合は記入しない。',
        '(注3) 直属上長に内容確認後、登録する事。',
      ] },
      { type: 'spacer' },
    ],
  };
})();
