export async function onRequestPost(context) {
    const { 请求, env } = context;
    try {
        const { username, password } = await 请求.json();
        const storedUser = await env.NOTE_KV.get(`user:${username}`, { type: "json" });

        if (!storedUser || storedUser.password !== password) {
            return new Response(JSON.stringify({ success: false, message: "账号或密码错误" }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true, message: "登入成功" }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "服务器内部错误" }), { status: 500 });
    }
}
