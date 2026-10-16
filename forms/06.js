const LABEL_W = '31mm'; // 宛先・発行部署・事項の見出し列の幅（そろえる）
FORM_DEFS['06'] = {
  code: '般-06', title: '業務連絡書',
  selfStamp: '発行', stampDate: 'issued', // 本人欄（デート印）と、その日付に使う項目
  meta: [
    { label: '発行日', key: 'issued', type: 'date' },
    { label: '回答日', key: 'answered', type: 'date' },
  ],
  stampClass: 'stack', // 押印欄は上下2段（回送先／発行）
  stamps: [
    { label: '回送先', boxes: ['承認', '確認', '責任者'] },
    { label: '発行', boxes: ['確認', '確認', '発行'] },
  ],
  // 宛先・発行部署は上下2行で、下段の押印欄（発行者印）の左に置く
  // 見出し列は事項欄と同じ幅（LABEL_W）。宛先は個人名なので「様」を付ける
  headBlocks: [
    { type: 'grid', cols: 2, colWidths: [LABEL_W, null], rows: [
      [{ label: '宛　先', key: 'to', lw: 1, span: 2, unit: '様' }],
      [{ label: '発行部署', key: 'fromDept', lw: 1, span: 2 }],
    ] },
  ],
  blocks: [
    // 事項は2行書ける高さ
    { type: 'grid', cols: 2, colWidths: [LABEL_W, null], rows: [
      [{ label: '事　項', key: 'subject', type: 'textarea', lines: 2, lw: 1, span: 2 }],
    ] },
    { type: 'free', label: '内　容', key: 'body', lines: 18, grow: true },
    { type: 'free', label: '回　答', key: 'answer', lines: 6 },
  ],
};
