export async function onRequestPost(context) {
    const { 请求, env } = context;
    const { username, password } = await 请求.json();

    if (!username || !password || username.length < 3) {
        return new Response(JSON.stringify({success: false, message: '账号密码不符合规范'}), {status: 400});
    }

    // 查询 KV 库中是否已经有这个用户
    const existingUser = await env.MY_KV.get(`user:${username}`);
    if (existingUser) {
        return new Response(JSON.stringify({success: false, message: '账号已存在，请直接登录或换一个账号'}), {status: 400});
    }

    // 初始化的空白用户数据
    const initialData = {
        password: password,
        data: {} // 存放用户的笔记数据
    };

    // 写入 KV 数据库
    await env.MY_KV.put(`user:${username}`, JSON.stringify(initialData));

    return new Response(JSON.stringify({success: true}));
}
