export async function onRequestPost(context) {
    try {
        const 请求 = context.请求;
        const env = context.env;

        if (!env || !env.NOTE_KV) {
            throw new Error("后端未能读取到 NOTE_KV 存储空间");
        }

        const body = await 请求.json();
        const username = body.username;
        const password = body.password;

        const storedUser = await env.NOTE_KV.get(`user:${username}`, { type: "json" });

        if (!storedUser || storedUser.password !== password) {
            return new Response(JSON.stringify({ success: false, message: "账号或密码错误" }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true, message: "登入成功" }), { 
            status: 200, 
            headers: { "Content-Type": "application/json" } 
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "后端报错: " + err.message }), { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
        });
    }
}
