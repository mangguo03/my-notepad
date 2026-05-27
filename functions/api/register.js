export async function onRequestPost(context) {
    try {
        const { 请求, env } = context;
        
        // 1. 拦截未绑定 KV 的致命错误
        if (!env.MY_KV) {
            return new Response(JSON.stringify({ success: false, message: '后端诊断: 找不到 MY_KV 数据库绑定，请检查 Cloudflare 设置' }), { status: 400 });
        }

        const body = await 请求.json();
        const { username, password } = body;

        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, message: '账号或密码不能为空' }), { status: 400 });
        }

        // 2. 检查是否重复注册
        const existingUser = await env.MY_KV.get(`user:${username}`);
        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: '该账号已被注册，请直接登入' }), { status: 400 });
        }

        // 3. 注册写入
        const initialData = { password: password, data: {} };
        await env.MY_KV.put(`user:${username}`, JSON.stringify(initialData));

        return new Response(JSON.stringify({ success: true, message: '注册成功' }), { status: 200 });

    } catch (error) {
        // 4. 捕捉所有未知崩溃并原样传给前端
        return new Response(JSON.stringify({ success: false, message: '代码崩溃详请: ' + error.message }), { status: 400 });
    }
}
