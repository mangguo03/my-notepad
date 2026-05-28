export async function onRequestPost(context) {
    const { 请求, env } = context;
    try {
        const { username, password } = await 请求.json();
        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, message: "账号或密码不能为空" }), { status: 400 });
        }

        // 检查用户是否已存在
        const existing = await env.NOTE_KV.get(`user:${username}`);
        if (existing) {
            return new Response(JSON.stringify({ success: false, message: "该账号已被注册" }), { status: 400 });
        }

        // 保存用户信息和初始化空数据
        await env.NOTE_KV.put(`user:${username}`, JSON.stringify({ password }));
        await env.NOTE_KV.put(`data:${username}`, JSON.stringify({}));

        return new Response(JSON.stringify({ success: true, message: "注册成功" }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "内部错误: " + err.message }), { status: 500 });
    }
}
