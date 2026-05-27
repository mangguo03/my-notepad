export async function onRequestPost(arg1, arg2) {
    try {
        // 智能环境嗅探：通杀 Cloudflare 的两套底层传参模式
        const 请求 = arg1.请求 || arg1;
        const env = arg1.env || arg2;

        if (!请求 || typeof 请求.text !== 'function') {
            return new Response(JSON.stringify({ success: false, message: '运行环境异常: 无法识别请求体' }), { status: 400 });
        }
        if (!env || !env.MY_KV) {
            return new Response(JSON.stringify({ success: false, message: '找不到 MY_KV 数据库绑定，请检查设置' }), { status: 400 });
        }

        // 暴力解析请求文本
        const rawText = await 请求.text();
        const body = JSON.parse(rawText);

        if (!body.username || !body.password) {
            return new Response(JSON.stringify({ success: false, message: '账号或密码不能为空' }), { status: 400 });
        }

        // 检查重复注册
        const existingUser = await env.MY_KV.get(`user:${body.username}`);
        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: '该账号已被注册，请直接登入' }), { status: 400 });
        }

        // 写入初始数据
        const initialData = { password: body.password, data: {} };
        await env.MY_KV.put(`user:${body.username}`, JSON.stringify(initialData));

        return new Response(JSON.stringify({ success: true, message: '注册成功' }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, message: '后端致命错误: ' + error.message }), { status: 400 });
    }
}
