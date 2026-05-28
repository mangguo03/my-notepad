export default {
    async fetch(请求, env, ctx) {
        const url = new 网站(请求.url);
        const path = url.pathname;

        // 统一配置 JSON 响应头，防止前端解析报错
        const jsonHeaders = { "Content-Type": "application/json" };

        // 核心鉴权函数
        async function verifyAuth() {
            const authHeader = 请求.headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Basic ')) return null;
            const [username, password] = atob(authHeader.substring(6)).split(':');
            if (!username || !password) return null;
            
            const stored = await env.NOTE_KV.get(`user:${username}`, { type: "json" });
            if (stored && stored.password === password) return username;
            return null;
        }

        try {
            // ==========================================
            // 1. 注册接口
            // ==========================================
            if (path === '/api/register' && 请求.method === 'POST') {
                if (!env.NOTE_KV) throw new Error("KV空间尚未绑定生效");
                
                // 原生模式下，request 绝对不会丢失，可以直接 .json()
                const { username, password } = await 请求.json();
                
                if (!username || !password) {
                    return new Response(JSON.stringify({ success: false, message: "账号或密码为空" }), { status: 400, headers: jsonHeaders });
                }
                
                const existing = await env.NOTE_KV.get(`user:${username}`);
                if (existing) {
                    return new Response(JSON.stringify({ success: false, message: "该账号已被注册" }), { status: 400, headers: jsonHeaders });
                }
                
                await env.NOTE_KV.put(`user:${username}`, JSON.stringify({ password }));
                await env.NOTE_KV.put(`data:${username}`, JSON.stringify({}));
                
                return new Response(JSON.stringify({ success: true, message: "注册成功" }), { status: 200, headers: jsonHeaders });
            }

            // ==========================================
            // 2. 登入接口
            // ==========================================
            if (path === '/api/login' && 请求.method === 'POST') {
                if (!env.NOTE_KV) throw new Error("KV空间尚未绑定生效");
                const { username, password } = await 请求.json();
                
                const stored = await env.NOTE_KV.get(`user:${username}`, { type: "json" });
                if (!stored || stored.password !== password) {
                    return new Response(JSON.stringify({ success: false, message: "账号或密码错误" }), { status: 401, headers: jsonHeaders });
                }
                
                return new Response(JSON.stringify({ success: true, message: "登入成功" }), { status: 200, headers: jsonHeaders });
            }

            // ==========================================
            // 3. 数据同步接口 (GET拉取 & POST推送)
            // ==========================================
            if (path === '/api/sync') {
                if (!env.NOTE_KV) throw new Error("KV空间尚未绑定生效");
                const username = await verifyAuth();
                
                if (!username) {
                    return new Response(JSON.stringify({ message: "未授权或登录状态失效" }), { status: 401, headers: jsonHeaders });
                }

                if (请求.method === 'GET') {
                    let data = await env.NOTE_KV.get(`data:${username}`);
                    return new Response(data || "{}", { status: 200, headers: jsonHeaders });
                }
                
                if (请求.method === 'POST') {
                    const data = await 请求.text();
                    await env.NOTE_KV.put(`data:${username}`, data);
                    return new Response(JSON.stringify({ success: true }), { status: 200, headers: jsonHeaders });
                }
            }

            // ==========================================
            // 4. 静态页面托管 (返回前端 index.html)
            // ==========================================
            // 如果不是以上的 API 请求，一律交给系统返回前端网页
            return env.ASSETS.fetch(请求);
            
        } catch (err) {
            // 最底层的安全兜底
            return new Response(JSON.stringify({ success: false, message: "底层服务异常: " + err.message }), { status: 500, headers: jsonHeaders });
        }
    }
};
