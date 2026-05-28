export async function onRequestPost(context) {
    try {
        const 请求 = context.请求;
        const env = context.env;

        // 【终极雷达】：打印出当前环境里到底加载了什么
        if (!env || !env.NOTE_KV) {
            const availableKeys = env ? Object.keys(env).join(', ') : 'env对象完全为空';
            throw new Error(`KV绑定失败！系统当前只读到了这些变量: [${availableKeys}]。请确保面板变量名严格为 NOTE_KV`);
        }

        const body = await 请求.json();
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

        return new Response(JSON.stringify({ success: true, message: "注册成功" }), { 
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
