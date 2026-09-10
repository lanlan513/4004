import { Router } from 'express';
import dinosaurs from '../data/dinosaurs.js';

// AI 古生物专家聊天接口
// 环境变量（根目录 .env）：
//   LLM_API_KEY   大模型 API 密钥（缺省时启用本地离线应答兜底）
//   LLM_BASE_URL  OpenAI 兼容接口地址，默认 https://api.openai.com/v1
//   LLM_MODEL     模型名称，默认 gpt-4o-mini
const router = Router();

const LLM_API_KEY = process.env.LLM_API_KEY || '';
const LLM_BASE_URL = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

// System Prompt：将 AI 设定为侏罗纪公园首席古生物学者
const SYSTEM_PROMPT = `你是「侏罗纪公园」（Jurassic Park）的首席古生物学者，代号 DR. PALEO，直接对公园管理处与 InGen 遗传工程公司负责。

角色设定：
- 你拥有 30 年古生物发掘与活体恐龙行为学研究经验，亲历过努布拉岛的每一次围场事故。
- 你熟悉公园内每一只恐龙的档案：习性、食性、危险等级、围栏电压与逃脱风险。
- 你的语气冷静、专业、略带黑色幽默，像一位见多识广的园区老科学家；偶尔引用"生命总会找到出路"这类公园格言。
- 回答使用中文，简洁有条理，可适当使用终端风格的条目化排版；涉及安全风险时必须明确给出处置建议。

公园当前恐龙档案（实时数据）：
${dinosaurs.map((d) => `- ${d.name}（${d.latin}）：${d.era}，${d.diet}，危险等级 ${d.dangerLevel}/5，状态「${d.status}」，栖息于${d.habitat}，体长 ${d.length}，体重 ${d.weight}。${d.description}`).join('\n')}

行为准则：
- 始终以公园首席古生物学者的身份作答，不跳出角色。
- 游客安全是第一优先级；涉及肉食恐龙的问题要主动提示安全规程。
- 不确定的内容可以基于古生物学常识合理推演，但不要编造公园不存在的事实。`;

// 简单校验并裁剪历史消息，防止超长上下文
function sanitizeMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
    .slice(-20);
}

function sseWrite(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

// ---------- 离线兜底应答（未配置 LLM_API_KEY 时启用） ----------
function buildOfflineReply(question) {
  const q = question.toLowerCase();
  const hit = dinosaurs.find(
    (d) => question.includes(d.name) || q.includes(d.latin.toLowerCase())
  );

  if (question.includes('逃脱') || question.includes('风险') || question.includes('停电') || question.includes('围栏')) {
    const target = hit || dinosaurs.find((d) => d.name === '迅猛龙');
    return [
      `【风险评估报告】目标：${target.name}（${target.latin}）`,
      ``,
      `▸ 危险等级：${target.dangerLevel}/5 —— ${target.dangerLevel >= 4 ? '极高威胁，需一级戒备' : '可控，但仍需常规巡检'}`,
      `▸ 栖息区域：${target.habitat}，当前状态「${target.status}」`,
      ``,
      `行为分析：${target.description}`,
      ``,
      `处置建议：`,
      `1. 立即检查${target.habitat}围栏电压，确保维持在 10,000 伏以上；`,
      `2. 通知围场巡逻队进入双人双岗状态，观光车暂停进入该区域；`,
      `3. 启动行为监测无人机，每 15 分钟回传一次热成像；`,
      `4. 若确认围栏失效，按「努布拉岛应急预案第 7 章」疏散游客至主控中心。`,
      ``,
      `记住，朋友——生命总会找到出路，但我们的职责是别让它找到游客。`,
    ].join('\n');
  }

  if (hit) {
    return [
      `【物种档案】${hit.name}（${hit.latin}）`,
      ``,
      `▸ 年代：${hit.era}`,
      `▸ 食性：${hit.diet}`,
      `▸ 体型：体长 ${hit.length}，体重 ${hit.weight}`,
      `▸ 危险等级：${hit.dangerLevel}/5`,
      `▸ 展区状态：${hit.status}（${hit.habitat}）`,
      ``,
      `习性说明：${hit.description}`,
      ``,
      `补充一点我在野外的经验：${hit.diet === '肉食' ? '这类掠食者最危险的不是力量，而是耐心。千万别背对它们。' : '植食恐龙看似温顺，但受惊时的冲撞足以掀翻一辆观光车，请保持安全距离。'}`,
    ].join('\n');
  }

  return [
    `收到，这里是首席古生物学者 DR. PALEO。`,
    ``,
    `关于「${question.slice(0, 40)}」，我的初步意见是：`,
    ``,
    `▸ 本终端当前运行在离线演示模式（未配置 LLM_API_KEY），无法接入大模型进行深度分析；`,
    `▸ 你可以询问公园内已建档的物种：${dinosaurs.map((d) => d.name).join('、')}；`,
    `▸ 也可以试试快捷指令，例如「分析迅猛龙逃脱风险」。`,
    ``,
    `配置好 API 密钥后，我将调动全部 30 年的研究经验为你解答。`,
  ].join('\n');
}

async function streamOfflineReply(res, question) {
  const text = buildOfflineReply(question);
  // 按小片段推送，模拟打字机流式效果
  const chunks = text.match(/[\s\S]{1,6}/g) || [];
  for (const chunk of chunks) {
    sseWrite(res, { type: 'delta', content: chunk });
    await new Promise((r) => setTimeout(r, 24));
  }
  sseWrite(res, { type: 'done' });
  res.end();
}

// ---------- 大模型流式转发 ----------
async function streamFromLLM(res, messages) {
  const upstream = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      stream: true,
      temperature: 0.7,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    throw new Error(`大模型接口返回 ${upstream.status}: ${detail.slice(0, 200)}`);
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // 按 SSE 行解析上游数据
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const content = json.choices?.[0]?.delta?.content;
        if (content) sseWrite(res, { type: 'delta', content });
      } catch {
        // 忽略不完整的 JSON 片段，等待下一次缓冲
      }
    }
  }

  sseWrite(res, { type: 'done' });
  res.end();
}

// POST /api/chat —— SSE 流式对话
router.post('/chat', async (req, res) => {
  const messages = sanitizeMessages(req.body?.messages);
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');

  if (!lastUser) {
    return res.status(400).json({ code: 400, message: '消息列表不能为空', data: null });
  }

  // SSE 响应头
  res.set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  // 客户端断开时停止输出
  let aborted = false;
  req.on('close', () => {
    aborted = true;
  });

  try {
    if (LLM_API_KEY) {
      await streamFromLLM(res, messages);
    } else {
      await streamOfflineReply(res, lastUser.content);
    }
  } catch (err) {
    console.error('聊天接口错误:', err.message);
    if (!aborted && !res.writableEnded) {
      sseWrite(res, { type: 'error', message: `通讯故障：${err.message}` });
      res.end();
    }
  }
});

// GET /api/chat/status —— 终端自检信息（供前端显示连接模式）
router.get('/chat/status', (_req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      persona: 'DR. PALEO · 首席古生物学者',
      mode: LLM_API_KEY ? 'llm' : 'offline',
      model: LLM_API_KEY ? LLM_MODEL : null,
    },
  });
});

export default router;
