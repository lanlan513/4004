// 恐龙对比的统一数据结构
// ------------------------------------------------------------------
// 所有维度（体型 / 食性 / 时代 / 速度 / 危险等级）都由一份字段配置
// COMPARE_FIELDS 描述，buildComparison 依据配置统一取值、格式化、
// 排序并标注极值。新增维度或新增恐龙都不需要编写任何“按恐龙种类
// 判断”的分支逻辑：
//   - getValue(dino)   统一从档案中取原始值（字符串/数字/对象）
//   - format(value)    统一渲染成展示文本
//   - compare / order  供“谁更突出”排序使用
//   - 极值标注由 buildComparison 依据 compare 自动计算

// 年代由远及近的顺序，用于时代先后比较（与服务端 ERAS 顺序一致）
export const ERA_ORDER = [
  '三叠纪晚期',
  '侏罗纪早期',
  '侏罗纪晚期',
  '白垩纪早期',
  '白垩纪晚期',
];

// 危险等级 1-5 的统一文案（兜底，组件中也有同名样式表）
export const DANGER_LABELS = {
  1: '低危',
  2: '警戒',
  3: '高危',
  4: '极危',
  5: '致命',
};

// 各对比维度的统一配置
export const COMPARE_FIELDS = [
  {
    key: 'size',
    label: '体型',
    icon: 'ruler',
    // 复合值：体长/体重/分档，主排序依据为体长
    getValue: (dino) => ({
      lengthM: dino.lengthM,
      weightT: dino.weightT,
      sizeTier: dino.sizeTier,
    }),
    format: (value) => `${value.sizeTier} · ${value.lengthM} 米`,
    sub: (value, dino) => `体重 ${dino.weightT < 0.1 ? `${Math.round(dino.weightT * 1000)} 千克` : `${dino.weightT} 吨`}`,
    compare: (a, b) => b.lengthM - a.lengthM, // 体长越长越靠前
    highlight: 'largest',
    highlightText: '体长最长',
  },
  {
    key: 'diet',
    label: '食性',
    icon: 'diet',
    getValue: (dino) => dino.diet,
    format: (value) => value,
    // 文本维度无数值高低，仅展示不标注极值
    comparable: false,
  },
  {
    key: 'era',
    label: '生存时代',
    icon: 'clock',
    getValue: (dino) => dino.era,
    format: (value) => value,
    // 时代索引越大越“晚近”
    compare: (a, b) => ERA_ORDER.indexOf(b) - ERA_ORDER.indexOf(a),
    highlight: 'latest',
    highlightText: '时代最晚近',
  },
  {
    key: 'speed',
    label: '速度',
    icon: 'gauge',
    getValue: (dino) => dino.speedKmh,
    format: (value) => `${value} 公里/小时`,
    compare: (a, b) => b - a, // 速度越快越靠前
    highlight: 'fastest',
    highlightText: '速度最快',
  },
  {
    key: 'danger',
    label: '危险等级',
    icon: 'shield',
    getValue: (dino) => dino.dangerLevel,
    format: (value) => `${DANGER_LABELS[value] ?? '未知'} · ${value}`,
    compare: (a, b) => b - a, // 危险系数越高越靠前
    highlight: 'mostDangerous',
    highlightText: '最危险',
    renderPips: true,
  },
];

// 根据配置取出每只恐龙在某一维度的原始值
function rankValues(dinosaurs, field) {
  return dinosaurs
    .map((dino) => ({ dino, value: field.getValue(dino) }))
    .sort((a, b) => field.compare(a.value, b.value));
}

/**
 * 依据 COMPARE_FIELDS 统一生成对比表数据。
 * @param {Array} dinosaurs 2~3 只完整恐龙档案
 * @returns {{ columns, rows, summary }}
 *   columns：参与对比的恐龙（保持传入顺序）
 *   rows：每个维度一行，含每只恐龙的展示值与是否为极值
 *   summary：每个维度的极值标注（供页头摘要徽标使用）
 */
export function buildComparison(dinosaurs) {
  const columns = dinosaurs.map((dino) => ({ id: dino.id, dino }));

  const rows = COMPARE_FIELDS.map((field) => {
    const cells = columns.map(({ id, dino }) => ({
      id,
      value: field.getValue(dino),
      text: field.format(field.getValue(dino)),
      sub: field.sub ? field.sub(field.getValue(dino), dino) : '',
      isBest: false,
      pips: field.renderPips ? field.getValue(dino) : null,
    }));

    let winnerIds = [];
    if (field.compare && dinosaurs.length >= 2) {
      const ranked = rankValues(dinosaurs, field);
      // 只要组内存在差异就标注极值；与第一名并列的全部高亮
      const [first, last] = [ranked[0], ranked[ranked.length - 1]];
      if (first && field.compare(first.value, last.value) !== 0) {
        winnerIds = ranked
          .filter((item) => field.compare(item.value, first.value) === 0)
          .map((item) => item.dino.id);
      }
    }

    return {
      key: field.key,
      label: field.label,
      icon: field.icon,
      cells: cells.map((cell) => ({ ...cell, isBest: winnerIds.includes(cell.id) })),
    };
  });

  const summary = rows
    .map((row) => {
      const field = COMPARE_FIELDS.find((f) => f.key === row.key);
      const winners = row.cells.filter((c) => c.isBest);
      return winners.length
        ? {
            key: row.key,
            label: field.highlightText,
            dinoIds: winners.map((c) => c.id),
          }
        : null;
    })
    .filter(Boolean);

  return { columns, rows, summary };
}

// 纯数据模块：取值 / 格式化 / 极值计算规则统一在此声明，
// 具体的可视化（如危险点数）由页面层负责渲染。
