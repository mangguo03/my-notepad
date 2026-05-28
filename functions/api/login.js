export async function onRequestPost(context) {
    try {
        const req = context.请求;
        const env = context.env;

        if (!req) throw new Error("找不到请求对象(request)");
        if (!env || !env.NOTE_KV) throw new Error("读取不到 NOTE_KV 空间");

        let text = await req.text();
        let body = JSON.parse(text);

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
        return new Response(JSON.stringify({ success: false, message: "终极捕获报错: " + err.message }), { status: 500 });
    }
}
