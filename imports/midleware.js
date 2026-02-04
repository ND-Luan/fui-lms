
/*
    FETCHPROMISE OPTIONS
====================

fetchPromise(url, params, options)

CACHE OPTIONS
-------------
cache: true/false
  - Bật/tắt cache
  - Mặc định: true
  - Ví dụ: cache: false

cacheTTL: number (milliseconds)
  - Thời gian sống của cache
  - Mặc định: 300000 (5 phút)
  - Ví dụ: cacheTTL: 10 * 60 * 1000

useStaleCacheOnError: true/false
  - Dùng cache cũ khi API lỗi
  - Mặc định: true
  - Ví dụ: useStaleCacheOnError: false

showStaleWarning: true/false
  - Hiện warning khi dùng cache cũ
  - Mặc định: true
  - Ví dụ: showStaleWarning: false

cacheDelay: true/false
  - Delay nhỏ khi dùng cache để hiện loading
  - Mặc định: true
  - Ví dụ: cacheDelay: false

cacheDelayMs: number (milliseconds)
  - Thời gian delay
  - Mặc định: 100
  - Ví dụ: cacheDelayMs: 300


LOADING OPTIONS
---------------
loadingText: string
  - Text hiển thị khi loading
  - Mặc định: "Đang xử lý..."
  - Ví dụ: loadingText: "Đang tải lên..."


ERROR OPTIONS
-------------
suppressError: true/false
  - Không hiện error dialog
  - Mặc định: false
  - Ví dụ: suppressError: true


VÍ DỤ SỬ DỤNG
=============

1. Tắt cache hoàn toàn
   fetchPromise('api/users', {}, { cache: false })

2. Cache 10 phút, không delay
   fetchPromise('api/products', {}, { 
       cacheTTL: 10 * 60 * 1000,
       cacheDelay: false
   })

3. Không hiện error dialog
   fetchPromise('api/delete', {}, { suppressError: true })

4. Không dùng stale cache khi lỗi
   fetchPromise('api/critical', {}, { useStaleCacheOnError: false })

5. Custom loading text
   fetchPromise('api/upload', {}, { 
       loadingText: 'Đang tải lên...',
       cache: false
   })

6. Retry không cache, không warning
   fetchPromise('api/retry', {}, { 
       cache: false,
       showStaleWarning: false
   })

7. Cache lâu + delay lâu hơn
   fetchPromise('api/static', {}, { 
       cacheTTL: 30 * 60 * 1000,
       cacheDelayMs: 300
   })


BẢNG TỔNG KẾT
=============
Option                  | Type    | Default         | Mô tả
------------------------|---------|-----------------|---------------------------
cache                   | boolean | true            | Bật/tắt cache
cacheTTL                | number  | 300000          | Thời gian sống cache (ms)
useStaleCacheOnError    | boolean | true            | Dùng cache cũ khi lỗi
showStaleWarning        | boolean | true            | Hiện warning stale data
cacheDelay              | boolean | true            | Delay khi dùng cache
cacheDelayMs            | number  | 100             | Thời gian delay (ms)
loadingText             | string  | "Đang xử lý..." | Text hiển thị loading
suppressError           | boolean | false           | Ẩn error dialog
*/

/*****************************************
* STATE MANAGEMENT
*****************************************/
let loadingState = {
    count: 0,
    text: 'Đang xử lý...',
    hideTimeout: null, // ← THÊM
    get loading() {
        return this.count > 0;
    }
}
let errorState = {
    ui: {
        visible: false,
        message: '',
        show(msg) {
            this.message = msg;
            this.visible = true;
        },
        hide() {
            this.visible = false;
            this.message = '';
        }
    },

    api: {
        visible: false,
        message: '',
        code: null,
        status: null,
        show(msg, code = null, status = null) {
            this.message = msg;
            this.code = code;
            this.status = status;
            this.visible = true;
        },
        hide() {
            this.visible = false;
            setTimeout(() => {
                this.message = '';
                this.code = null;
                this.status = null;
            }, 100)

        }
    }
}

let staleDataState = {
    visible: false,
    retryCallback: null,

    show(retryCallback) {
        this.visible = true;
        this.retryCallback = retryCallback;
    },

    hide() {
        this.visible = false;
        this.retryCallback = null;
    }
}
/*****************************************
 * API CACHE
 *****************************************/
const apiCache = {
    store: new Map(),
    staleStore: new Map(), // ← Lưu cache đã hết hạn

    createKey(url, params) {
        return `${url}::${JSON.stringify(params)}`;
    },

    set(url, params, data, ttl = 5 * 60 * 1000) {
        const key = this.createKey(url, params);
        const expiry = Date.now() + ttl;

        this.store.set(key, { data, expiry });

        console.log(`💾 Cache saved: ${key} (TTL: ${ttl}ms)`);
    },

    get(url, params) {
        const key = this.createKey(url, params);
        const cached = this.store.get(key);

        if (!cached) {
            console.log(`❌ Cache miss: ${key}`);
            return null;
        }

        // Kiểm tra hết hạn
        if (Date.now() > cached.expiry) {
            console.log(`⏰ Cache expired: ${key}`);

            // ← LÀM MỚI: Chuyển sang staleStore thay vì xóa
            this.staleStore.set(key, cached);
            this.store.delete(key);

            return null;
        }

        console.log(`✅ Cache hit: ${key}`);
        return cached.data;
    },

    // ← THÊM MỚI: Lấy cache cũ (kể cả đã hết hạn)
    getStale(url, params) {
        const key = this.createKey(url, params);

        // Thử lấy từ staleStore
        const stale = this.staleStore.get(key);

        if (stale) {
            console.log(`🕰️ Stale cache found: ${key}`);
            return stale.data;
        }

        return null;
    },

    invalidate(urlPattern) {
        if (!urlPattern) {
            this.store.clear();
            this.staleStore.clear(); // ← Xóa cả stale cache
            console.log('🗑️ All cache cleared');
            return;
        }

        for (const key of this.store.keys()) {
            if (key.startsWith(urlPattern)) {
                this.store.delete(key);
                console.log(`🗑️ Cache invalidated: ${key}`);
            }
        }

        for (const key of this.staleStore.keys()) {
            if (key.startsWith(urlPattern)) {
                this.staleStore.delete(key);
            }
        }
    },

    info() {
        console.group('📊 Cache Info');
        console.log('Fresh entries:', this.store.size);
        console.log('Stale entries:', this.staleStore.size);

        console.log('\n🟢 Fresh Cache:');
        for (const [key, value] of this.store.entries()) {
            const ttl = value.expiry - Date.now();
            console.log(`  ${key} → expires in ${Math.round(ttl / 1000)}s`);
        }

        console.log('\n🟡 Stale Cache:');
        for (const [key, value] of this.staleStore.entries()) {
            const ago = Date.now() - value.expiry;
            console.log(`  ${key} → expired ${Math.round(ago / 1000)}s ago`);
        }

        console.groupEnd();
    }
};

/*****************************************
 * MIDDLEWARES
 *****************************************/

/*****************************************
 * CACHE MIDDLEWARE (với fallback)
 *****************************************/
async function cacheMiddleware(ctx, next) {
    const cacheEnabled = ctx.options?.cache !== false;
    const forceRefresh = ctx.options?.forceRefresh === true; // ← THÊM dòng này
    const cacheTTL = ctx.options?.cacheTTL || 5 * 60 * 1000;
    const useStaleCacheOnError = ctx.options?.useStaleCacheOnError !== false;
    const showStaleWarning = ctx.options?.showStaleWarning !== false;
    const cacheDelay = ctx.options?.cacheDelay !== false;
    const cacheDelayMs = ctx.options?.cacheDelayMs || 100;

    if (!cacheEnabled) {
        console.log('⚠️ Cache disabled for this request');
        return await next();
    }

    // ← SỬA: Bỏ qua cache nếu forceRefresh
    if (!forceRefresh) {
        const cached = apiCache.get(ctx.url, ctx.params);

        if (cached) {
            if (cacheDelay) {
                await new Promise(resolve => setTimeout(resolve, cacheDelayMs));
            }

            ctx.response = cached;
            ctx.fromCache = true;
            return;
        }
    } else {
        console.log('🔄 Force refresh - bypassing cache');
    }

    const staleCache = apiCache.getStale(ctx.url, ctx.params);

    try {
        await next();

        if (ctx.response) {
            // ← Luôn lưu cache mới (cả khi forceRefresh)
            apiCache.set(ctx.url, ctx.params, ctx.response, cacheTTL);

            if (staleDataState.visible) {
                staleDataState.hide();
            }
        }
    } catch (err) {
        if (useStaleCacheOnError && staleCache) {
            console.warn('⚠️ API failed, using stale cache:', err.message);

            if (cacheDelay) {
                await new Promise(resolve => setTimeout(resolve, cacheDelayMs));
            }

            ctx.response = staleCache;
            ctx.fromCache = true;
            ctx.isStale = true;

            if (showStaleWarning) {
                staleDataState.show(() => {
                    return fetchPromise(ctx.url, ctx.params, {
                        cache: false,
                        showStaleWarning: false
                    });
                });
            }

            return;
        }

        throw err;
    }
}

// Loading middleware - Chỉ hiển thị loading khi không phải từ cache
// ← CẬP NHẬT loadingMiddleware để hỗ trợ skip
async function loadingMiddleware(ctx, next) {
    // ← THÊM: Skip loading nếu được đánh dấu
    if (ctx.options?._skipLoading) {
        return await next();
    }

    loadingState.count++;
    loadingState.text = ctx.options?.loadingText || 'Đang xử lý...';

    try {
        await next();
    } finally {
        loadingState.count--;
    }
}
// Error middleware - Bắt và hiển thị lỗi
async function errorMiddleware(ctx, next) {
    try {
        await next();
    } catch (err) {
        console.error('❌ API Error:', err);

        // ← Kiểm tra option suppressError
        const suppressError = ctx.options?.suppressError === true;

        if (!suppressError) {
            // Hiển thị error dialog (mặc định)
            errorState.api.show(
                err.message || 'Có lỗi xảy ra',
                err.code || null,
                err.status || null
            );
        }

        // Đánh dấu đã log
        err.__handledByMiddleware = !suppressError;

        throw err; // Vẫn throw để component có thể catch
    }
}

/*****************************************
 * API LOGGING
 *****************************************/
function apiLog(type, title, payload = null, extra = {}) {
    const icons = {
        request: '📤',
        response: '📥',
        error: '❌',
        cache: '💾'
    };

    const colors = {
        request: 'background:#409eff;color:white',
        response: 'background:#67c23a;color:white',
        error: 'background:#f56c6c;color:white',
        cache: 'background:#e6a23c;color:white'
    };

    const time = new Date().toLocaleTimeString();
    const duration = extra.ms ? ` • ${extra.ms}ms` : '';
    const cacheTag = extra.fromCache ? ' [CACHED]' : '';

    console.groupCollapsed(
        `%c ${icons[type]} API %c ${title}${cacheTag} %c ${time}${duration}`,
        `${colors[type]};padding:2px 6px;border-radius:3px;font-weight:bold`,
        'font-weight:bold',
        'color:#999'
    );

    if (payload !== null) {
        console.log(payload);
    }

    console.groupEnd();
}

/*****************************************
 * FETCH MIDDLEWARE
 *****************************************/
async function fetchMiddleware(ctx) {
    const start = performance.now();
    apiLog('request', ctx.url, ctx.params);

    try {
        const res = await fetch(
            vueData.v_Set.apiDomain + '/' + ctx.url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': $awt
                },
                body: JSON.stringify(ctx.params)
            }
        );

        if (!res.ok) {
            const resJson = await res.json()
            const err = new Error(`${resJson?.Message ?? ''}`);
            err.code = res.status;
            err.status = res.status;
            err.__logged = true;

            apiLog(
                'error',
                ctx.url,
                { status: res.status, statusText: res.statusText },
                { ms: Math.round(performance.now() - start) }
            );

            throw err;
        }

        const data = await res.json();

        if (data.success === false) {
            const err = new Error(data.message || 'Backend error');
            err.code = data.code;
            err.__logged = true;

            apiLog(
                'error',
                ctx.url,
                data,
                { ms: Math.round(performance.now() - start) }
            );

            throw err;
        }

        apiLog(
            'response',
            ctx.url,
            data,
            { ms: Math.round(performance.now() - start) }
        );
        if (data?.data) {
            ctx.response = data?.data;
        } else {
            ctx.response = data
        }


    } catch (err) {
        // Network error (fetch throw)
        if (!err.__logged) {
            err.__logged = true;
            apiLog(
                'error',
                ctx.url,
                err,
                { ms: Math.round(performance.now() - start) }
            );
        }
        throw err;
    }
}

/*****************************************
 * COMPOSE MIDDLEWARE
 *****************************************/
function compose(middlewares) {
    return function (ctx) {
        let index = -1;

        function dispatch(i) {
            if (i <= index) return Promise.reject('next() called twice');
            index = i;
            const fn = middlewares[i];
            if (!fn) return Promise.resolve();
            return Promise.resolve(fn(ctx, () => dispatch(i + 1)));
        }

        return dispatch(0);
    };
}

const runMiddlewares = compose([
    loadingMiddleware,    // ← CHẠY ĐẦU TIÊN (luôn luôn)
    cacheMiddleware,      // ← Kiểm tra cache 
    errorMiddleware,      // ← Bắt error
    fetchMiddleware       // ← Thực hiện API call
]);

/*****************************************
 * FETCH PROMISE (API UTIL)
 *****************************************/
function fetchPromise(url, params = {}, options = {}) {
    const ctx = { url, params, options };
    return runMiddlewares(ctx).then(() => ctx.response);
}
async function fetchBatchPromise(apiCalls, options = {}) {
    const enableBatchCache = options.batchCache !== false;
    const batchCacheTTL = options.batchCacheTTL || 5 * 60 * 1000;
    const forceRefresh = options.forceRefresh === true; // ← THÊM

    // Tạo batch cache key
    if (enableBatchCache && !forceRefresh) { // ← THÊM: Bỏ qua cache nếu forceRefresh
        const batchKey = apiCalls.map(c =>
            `${c.url}::${JSON.stringify(c.params || {})}`
        ).join('||');

        // ← KIỂM TRA: Tất cả API đều có cache riêng không?
        const individualCaches = apiCalls.map(call => {
            const { url, params = {} } = call;
            return apiCache.get(url, params);
        });

        const allCached = individualCaches.every(c => c !== null);

        if (allCached) {
            console.log('💾 All APIs cached individually!');

            // Delay nhỏ
            if (options.cacheDelay !== false) {
                loadingState.count++;
                loadingState.text = options.loadingText || 'Đang xử lý...';
                await new Promise(r => setTimeout(r, options.cacheDelayMs || 100));
                loadingState.count--;
            }

            return individualCaches;
        }

        // Kiểm tra batch cache
        const batchCached = apiCache.get('__batch__', { key: batchKey });
        if (batchCached) {
            console.log('💾 Batch cache hit!');

            if (options.cacheDelay !== false) {
                loadingState.count++;
                loadingState.text = options.loadingText || 'Đang xử lý...';
                await new Promise(r => setTimeout(r, options.cacheDelayMs || 100));
                loadingState.count--;
            }

            return batchCached;
        }
    } else if (forceRefresh) { // ← THÊM: Log khi force refresh
        console.log('🔄 Force refresh batch - bypassing cache');
    }

    // Gọi API
    loadingState.count++;
    loadingState.text = options.loadingText || 'Đang xử lý...';

    try {
        const results = await Promise.all(
            apiCalls.map(call => {
                const { url, params = {}, opts = {} } = call;
                return fetchPromise(url, params, {
                    ...opts,
                    _skipLoading: true,
                    forceRefresh: forceRefresh // ← THÊM: Truyền forceRefresh xuống từng API
                });
            })
        );

        // ← Luôn lưu batch cache mới (cả khi forceRefresh)
        if (enableBatchCache) {
            const batchKey = apiCalls.map(c =>
                `${c.url}::${JSON.stringify(c.params || {})}`
            ).join('||');

            apiCache.set('__batch__', { key: batchKey }, results, batchCacheTTL);
        }

        return results;
    } finally {
        loadingState.count--;
    }
}
/*****************************************
 * INITIALIZATION
 *****************************************/
document.addEventListener('DOMContentLoaded', (event) => {
    loadingState = reactive(loadingState);
    errorState = reactive(errorState);
    staleDataState = reactive(staleDataState);

    window.loadingState = loadingState;
    window.errorState = errorState;
    window.staleDataState = staleDataState;
    window.apiCache = apiCache;
    window.fetchBatchPromise = fetchBatchPromise; // ← THÊM export
});