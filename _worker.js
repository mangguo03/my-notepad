export default {
    async fetch(request, env, ctx) {
        // 开启最强保护网
        try {
            const url = new URL(request.url);
            const path = url.pathname;
            const jsonHeaders = { "Content-Type": "application/json" };

            // 鉴权辅助函数
            async function verifyAuth() {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader || !authHeader.startsWith('Basic ')) return null;
                const base64str = authHeader.substring(6);
                const decoded = atob(base64str);
                const [username, password] = decoded.split(':');
                if (!username || !password) return null;
                
                const stored = await env.NOTE_KV.get(`user:${username}`, { type: "json" });
                if (stored && stored.password === password) return username;
                return null;
            }

            // ==========================
            // 1. API: 注册账号
            // ==========================
            if (path === '/api/register' && request.method === 'POST') {
                if (!env.NOTE_KV) throw new Error("严重错误：后台尚未绑定 NOTE_KV 存储！");
                
                // 改用 text() 读取，避免系统内置的 json() 解析引发隐性 Bug
                const bodyText = await request.text();
                const body = JSON.parse(bodyText);
                const username = body.username;
                const password = body.password;

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

            // ==========================
            // 2. API: 登入账号
            // ==========================
            if (path === '/api/login' && request.method === 'POST') {
                if (!env.NOTE_KV) throw new Error("严重错误：后台尚未绑定 NOTE_KV 存储！");
                const bodyText = await request.text();
                const body = JSON.parse(bodyText);
                
                const stored = await env.NOTE_KV.get(`user:${body.username}`, { type: "json" });
                if (!stored || stored.password !== body.password) {
                    return new Response(JSON.stringify({ success: false, message: "账号或密码错误" }), { status: 401, headers: jsonHeaders });
                }
                return new Response(JSON.stringify({ success: true, message: "登入成功" }), { status: 200, headers: jsonHeaders });
            }

            // ==========================
            // 3. API: 云端数据同步
            // ==========================
            if (path === '/api/sync') {
                if (!env.NOTE_KV) throw new Error("严重错误：后台尚未绑定 NOTE_KV 存储！");
                const username = await verifyAuth();
                if (!username) return new Response(JSON.stringify({ message: "未授权" }), { status: 401, headers: jsonHeaders });

                if (request.method === 'GET') {
                    let data = await env.NOTE_KV.get(`data:${username}`);
                    return new Response(data || "{}", { status: 200, headers: jsonHeaders });
                }
                
                if (request.method === 'POST') {
                    const data = await request.text();
                    await env.NOTE_KV.put(`data:${username}`, data);
                    return new Response(JSON.stringify({ success: true }), { status: 200, headers: jsonHeaders });
                }
            }

            // ==========================
            // 4. 静态网页托管 (输出 index.html)
            // ==========================
            if (!env.ASSETS) {
                throw new Error("云端组件丢失：ASSETS 对象不存在，无法渲染 index.html。");
            }
            
            // 这里的 await 非常关键，防止报错穿透导致 1101 Error
            const assetResponse = await env.ASSETS.fetch(request);
            
            // 重点排查：如果 Cloudflare 找不到你的前端文件
            if (assetResponse.status === 404 && path === '/') {
                throw new Error("404 错误：系统找不到 index.html。请检查 index.html 和 _worker.js 是否都在代码仓库的最外层根目录！");
            }
            
            return assetResponse;

        } catch (err) {
            // 最强兜底：如果不幸报错，直接在网页上打出纯文本日志，绝不遮掩！
            return new Response(`🚨 网页崩溃日志 🚨\n\n错误信息: ${err.message}\n\n堆栈跟踪:\n${err.stack}`, { 
                status: 500, 
                headers: { "Content-Type": "text/plain;charset=UTF-8" } 
            });
        }
    }
};
