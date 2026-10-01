// Cloudflare Pages Function — 全球紀錄 API
// 路由：/api/stats（檔案路徑 functions/api/stats.js 會自動對應到這個路徑，不需要額外設定）
//
// 需要在 Cloudflare 專案的 Settings > Functions > KV namespace bindings
// 綁定一個 KV namespace，變數名稱務必是 NEUROLINK_STATS（詳見 README_部署步驟.md）。

const KEY = "global-stats";

async function loadStats(env) {
  const raw = await env.NEUROLINK_STATS.get(KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // 資料損毀時，退回預設值而不是整個 API 掛掉
    }
  }
  return { totalVisits: 0, bestFullCharge: 0, bestChaseSurvived: 0, chaseSum: 0, chaseCount: 0 };
}

async function saveStats(env, stats) {
  await env.NEUROLINK_STATS.put(KEY, JSON.stringify(stats));
}

function publicView(stats) {
  return {
    totalVisits: stats.totalVisits || 0,
    bestFullCharge: stats.bestFullCharge || 0,
    bestChaseSurvived: stats.bestChaseSurvived || 0,
    avgChaseDistance: stats.chaseCount > 0 ? Math.round((stats.chaseSum / stats.chaseCount) * 10) / 10 : 0
  };
}

export async function onRequestGet({ env }) {
  const stats = await loadStats(env);
  return new Response(JSON.stringify(publicView(stats)), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const stats = await loadStats(env);

  switch (body.action) {
    case "visit":
      stats.totalVisits = (stats.totalVisits || 0) + 1;
      break;
    case "fullCharge": {
      const v = Number(body.value) || 0;
      stats.bestFullCharge = Math.max(stats.bestFullCharge || 0, v);
      break;
    }
    case "chase": {
      const v = Number(body.value) || 0;
      stats.bestChaseSurvived = Math.max(stats.bestChaseSurvived || 0, v);
      stats.chaseSum = (stats.chaseSum || 0) + v;
      stats.chaseCount = (stats.chaseCount || 0) + 1;
      break;
    }
    default:
      return new Response(JSON.stringify({ error: "unknown action" }), {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" }
      });
  }

  await saveStats(env, stats);

  return new Response(JSON.stringify(publicView(stats)), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
