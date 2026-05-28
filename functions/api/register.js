// 智能环境提取器
function extractEnv(arg1, arg2) {
    if (arg1 && arg1.请求) return { req: arg1.请求, env: arg1.env }; // 标准 Pages 环境
    return { req: arg1, env: arg2 }; // 原生 Worker 环境或异常传参
}

async function handleRequest(req, env) {
    try {
        if (!req) throw new Error("未能捕获到请求对象(Request)");
        if (!env || !env.NOTE_KV) throw new Error("尚未绑定 NOTE_KV，请前往 CF 后台设置");

        const body = await req.json();
        const username = body.username;
        const password = body.password;

        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, message: "账号或密码不能为空" }), { status: 400 });
        }

        const existing = await env.NOTE_KV.get(`user:${username}`);
        if (existing) {
            return new Response(JSON.stringify({ success: false, message: "该账号已被注册" }), { status: 400 });
        }

        await env.NOTE_KV.put(`user:${username}`, JSON.stringify({ password }));
        await env.NOTE_KV.put(`data:${username}`, JSON.stringify({}));

        return new Response(JSON.stringify({ success: true, message: "注册成功" }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "后端拦截异常: " + err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}

// 兼容一：Pages Functions 路由调用
export async function onRequestPost(arg1, arg2) {
    const { req, env } = extractEnv(arg1, arg2);
    return await handleRequest(req, env);
}

// 兼容二：原生 Worker 或 _worker.js 模式调用
export default {
    async fetch(请求, env, ctx) {
        return await handleRequest(请求, env); //
    }
}
