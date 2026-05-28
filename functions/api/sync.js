// 核心鉴权函数
async function verifyAuth(请求, env) {
    const authHeader = 请求.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) return null;
    
    const b64 = authHeader.substring(6);
    const decoded = atob(b64);
    const [username, password] = decoded.split(':');
    
    if (!username || !password) return null;
    
    const storedUser = await env.NOTE_KV.get(`user:${username}`, { type: "json" });
    if (storedUser && storedUser.password === password) {
        return username;
    }
    return null;
}

// 获取云端数据 (拉取)
export async function onRequestGet(context) {
    const { 请求, env } = context;
    const username = await verifyAuth(请求, env);
    
    if (!username) {
        return new Response(JSON.stringify({ message: "未授权" }), { status: 401 });
    }

    let data = await env.NOTE_KV.get(`data:${username}`);
    if (!data) data = "{}";

    return new Response(data, {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}

// 保存数据到云端 (推送)
export async function onRequestPost(context) {
    const { 请求, env } = context;
    const username = await verifyAuth(请求, env);
    
    if (!username) {
        return new Response(JSON.stringify({ message: "未授权" }), { status: 401 });
    }

    const data = await 请求.text();
    await env.NOTE_KV.put(`data:${username}`, data);

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}
