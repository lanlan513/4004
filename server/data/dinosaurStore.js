// 恐龙资产仓库（内存存储，重启后恢复种子数据，后续可替换为数据库）
import { ASSET_PREFIX, sizeTierOf } from './dinoConstants.js';

// 种子档案：体长 lengthM（米）、体重 weightT（吨）
const seed = [
  {
    name: '霸王龙',
    latin: 'Tyrannosaurus rex',
    era: '白垩纪晚期',
    category: '兽脚类',
    diet: '肉食',
    dangerLevel: 5,
    lengthM: 12.3,
    weightT: 8.4,
    healthStatus: '健康',
    status: '展区开放',
    habitat: '熔岩峡谷区',
    description: '陆地上最凶猛的掠食者，咬合力可达 6 吨，是公园的头号明星。',
  },
  {
    name: '迅猛龙',
    latin: 'Velociraptor mongoliensis',
    era: '白垩纪晚期',
    category: '兽脚类',
    diet: '肉食',
    dangerLevel: 4,
    lengthM: 2.0,
    weightT: 0.015,
    healthStatus: '健康',
    status: '展区开放',
    habitat: '密林围场',
    description: '智商极高的群体猎手，擅长围猎战术，观光车请勿开窗。',
  },
  {
    name: '腕龙',
    latin: 'Brachiosaurus altithorax',
    era: '侏罗纪晚期',
    category: '蜥脚类',
    diet: '植食',
    dangerLevel: 1,
    lengthM: 25,
    weightT: 50,
    healthStatus: '健康',
    status: '展区开放',
    habitat: '湖滨草原区',
    description: '温和的长颈巨人，每天吞食 400 公斤植物，是亲子观光的最爱。',
  },
  {
    name: '三角龙',
    latin: 'Triceratops horridus',
    era: '白垩纪晚期',
    category: '角龙类',
    diet: '植食',
    dangerLevel: 2,
    lengthM: 9,
    weightT: 6,
    healthStatus: '观察',
    status: '医疗观察',
    habitat: '蕨类平原',
    description: '头戴三只巨角的重装骑士，发怒时可顶翻观光车。',
  },
  {
    name: '剑龙',
    latin: 'Stegosaurus stenops',
    era: '侏罗纪晚期',
    category: '剑龙类',
    diet: '植食',
    dangerLevel: 2,
    lengthM: 9,
    weightT: 5,
    healthStatus: '健康',
    status: '展区开放',
    habitat: '蕨类平原',
    description: '背部排列着骨板，尾端长有四根尖刺，大脑只有核桃大小。',
  },
  {
    name: '棘龙',
    latin: 'Spinosaurus aegyptiacus',
    era: '白垩纪早期',
    category: '兽脚类',
    diet: '肉食',
    dangerLevel: 5,
    lengthM: 15,
    weightT: 7.4,
    healthStatus: '健康',
    status: '轮换休整',
    habitat: '潮汐潟湖',
    description: '背上张着巨型帆冠的渔夫，是已知唯一半水生的大型兽脚类恐龙。',
  },
  {
    name: '副栉龙',
    latin: 'Parasaurolophus walkeri',
    era: '白垩纪晚期',
    category: '鸟脚类',
    diet: '植食',
    dangerLevel: 1,
    lengthM: 10,
    weightT: 2.5,
    healthStatus: '治疗中',
    status: '医疗观察',
    habitat: '蕨类平原',
    description: '头后拖着一米多长的中空冠饰，能吹奏出低沉悠远的鸣响。',
  },
  {
    name: '甲龙',
    latin: 'Ankylosaurus magniventris',
    era: '白垩纪晚期',
    category: '甲龙类',
    diet: '植食',
    dangerLevel: 3,
    lengthM: 8,
    weightT: 6,
    healthStatus: '健康',
    status: '展区开放',
    habitat: '蕨类平原',
    description: '身披骨质甲胄的活坦克，尾锤一击可砸碎掠食者的腿骨。',
  },
  {
    name: '双脊龙',
    latin: 'Dilophosaurus wetherilli',
    era: '侏罗纪早期',
    category: '兽脚类',
    diet: '肉食',
    dangerLevel: 3,
    lengthM: 6,
    weightT: 0.4,
    healthStatus: '隔离',
    status: '隔离检疫',
    habitat: '检疫隔离区',
    description: '头顶一对半月形骨冠，颈部褶边展开时极具威慑力。',
  },
  {
    name: '肿头龙',
    latin: 'Pachycephalosaurus wyomingensis',
    era: '白垩纪晚期',
    category: '肿头龙类',
    diet: '植食',
    dangerLevel: 2,
    lengthM: 4.5,
    weightT: 0.45,
    healthStatus: '健康',
    status: '展区开放',
    habitat: '红土丘陵',
    description: '头顶厚达 25 厘米的骨穹，雄性格斗时以时速 30 公里对撞。',
  },
  {
    name: '迷惑龙',
    latin: 'Apatosaurus ajax',
    era: '侏罗纪晚期',
    category: '蜥脚类',
    diet: '植食',
    dangerLevel: 1,
    lengthM: 23,
    weightT: 23,
    healthStatus: '观察',
    status: '展区开放',
    habitat: '湖滨草原区',
    description: '鞭状长尾甩动可产生超音速音爆，请勿靠近其身后 10 米范围。',
  },
  {
    name: '无齿翼龙',
    latin: 'Pteranodon longiceps',
    era: '白垩纪晚期',
    category: '翼龙类',
    diet: '肉食',
    dangerLevel: 4,
    lengthM: 6,
    weightT: 0.035,
    healthStatus: '健康',
    status: '展区开放',
    habitat: '海岸鸟笼穹顶',
    description: '翼展超过 7 米的空中滑翔机，捕鱼时以时速 40 公里俯冲入水。',
  },
];

function buildSeed() {
  const now = new Date().toISOString();
  return seed.map((item, index) => {
    const id = index + 1;
    return {
      id,
      code: `${ASSET_PREFIX}-${String(id).padStart(3, '0')}`,
      ...item,
      sizeTier: sizeTierOf(item.lengthM),
      createdAt: now,
      updatedAt: now,
    };
  });
}

// 内存仓库（导出访问器，避免外部直接改写数组）
let dinosaurs = buildSeed();
let seq = dinosaurs.length;

export function listAll() {
  return dinosaurs.map((d) => ({ ...d }));
}

export function findById(id) {
  const found = dinosaurs.find((d) => d.id === id);
  return found ? { ...found } : null;
}

export function createDino(input) {
  seq += 1;
  const now = new Date().toISOString();
  const dino = {
    id: seq,
    code: `${ASSET_PREFIX}-${String(seq).padStart(3, '0')}`,
    ...input,
    sizeTier: sizeTierOf(input.lengthM),
    createdAt: now,
    updatedAt: now,
  };
  dinosaurs.push(dino);
  return { ...dino };
}

export function updateDino(id, patch) {
  const index = dinosaurs.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const current = dinosaurs[index];
  const merged = { ...current, ...patch };
  const updated = {
    ...merged,
    id: current.id,
    code: current.code,
    createdAt: current.createdAt,
    sizeTier: sizeTierOf(merged.lengthM),
    updatedAt: new Date().toISOString(),
  };
  dinosaurs[index] = updated;
  return { ...updated };
}

export function removeDino(id) {
  const index = dinosaurs.findIndex((d) => d.id === id);
  if (index === -1) return false;
  dinosaurs.splice(index, 1);
  return true;
}

export function nextAssetCode() {
  return `${ASSET_PREFIX}-${String(seq + 1).padStart(3, '0')}`;
}
