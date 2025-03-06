// // app/api/proxy/route.ts - New file
// import { NextRequest, NextResponse } from "next/server";
// // Optional: Import an HTML parser
// import { JSDOM } from "jsdom";

// const VIDSRC_BASE = process.env.NEXT_STREAM_BASE_URL;

// // List of common ad domains to block
// const AD_DOMAINS = [
//     'doubleclick.net',
//     'googlesyndication.com',
//     'adservice',
//     'analytics',
//     'tracker',
//     'clickaine',
//     'popcash',
//     'popads',
//     'adskeeper',
//     'propellerads',
// ];

// export async function GET(request: NextRequest) {
//     try {
//         // Get parameters
//         const searchParams = request.nextUrl.searchParams;
//         const type = searchParams.get("type") as "movie" | "series";
//         const id = searchParams.get("id");
//         const season = searchParams.get("season");
//         const episode = searchParams.get("episode");

//         if (!type || !id) {
//             return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
//         }

//         // Build the original source URL
//         const sourceUrl = type === "movie"
//             ? `${VIDSRC_BASE}/embed/movie/${id}`
//             : `${VIDSRC_BASE}/embed/tv/${id}/${season || 1}/${episode || 1}`;

//         // Fetch content from vidsrc
//         const response = await fetch(sourceUrl);

//         if (!response.ok) {
//             return NextResponse.json(
//                 { error: "Failed to fetch video content" },
//                 { status: 500 }
//             );
//         }

//         // Get content as text
//         const html = await response.text();

//         // OPTION 1: Enhanced Regex Cleaning
//         let cleanedHtml = html
//             // Block window popups
//             .replace(/window\.open/g, 'void')
//             .replace(/window\.location/g, 'void')

//             // Block script-based ads
//             .replace(/<script[^>]*?(ad|pop|promot|track|analytics|click|ban|sponsor)[^>]*?>[\s\S]*?<\/script>/gi, '')

//             // Block known ad domains
//             .replace(new RegExp(`(https?:\\/\\/[^"']*?(${AD_DOMAINS.join('|')})[^"']*)`, 'gi'), '')

//             // Block iframe-based ads
//             .replace(/<iframe[^>]*?(ad|pop|promot|track|banner|sponsor|click)[^>]*?>[\s\S]*?<\/iframe>/gi, '')

//             // Block iframes from ad domains
//             .replace(new RegExp(`<iframe[^>]*?src=["'](https?:\\/\\/[^"']*?(${AD_DOMAINS.join('|')})[^"']*)["'][^>]*?>`, 'gi'), '')

//             // Block div containers with ad classes
//             .replace(/<div[^>]*?(^|\s)(ad-|ads-|advertisement|banner|pop|promot)[^>]*?>[\s\S]*?<\/div>/gi, '')

//             // Remove onclick handlers
//             .replace(/onclick="[^"]*"/gi, '')

//             // Block setTimeout (often used for delayed ads)
//             .replace(/setTimeout\s*\(/g, 'void(');


//         // OPTION 2: HTML Parser Approach (requires JSDOM)
//         // Uncomment and install JSDOM if you want to use this approach

//         const dom = new JSDOM(html);
//         const document = dom.window.document;

//         // Remove all ad scripts
//         document.querySelectorAll("script").forEach(script => {
//             const scriptContent = script.textContent || "";
//             const scriptSrc = script.getAttribute("src") || "";

//             // Check if script is ad-related
//             if (
//                 scriptContent.match(/(ad|pop|promot|track)/i) ||
//                 scriptSrc.match(/(ad|pop|promot|track)/i) ||
//                 AD_DOMAINS.some(domain => scriptSrc.includes(domain))
//             ) {
//                 script.remove();
//             }
//         });

//         // Remove ad iframes
//         document.querySelectorAll("iframe").forEach(iframe => {
//             const src = iframe.getAttribute("src") || "";
//             if (
//                 src.match(/(ad|pop|promot|track)/i) ||
//                 AD_DOMAINS.some(domain => src.includes(domain))
//             ) {
//                 iframe.remove();
//             }
//         });

//         // Clean up div containers
//         document.querySelectorAll("div").forEach(div => {
//             const className = div.className || "";
//             const id = div.id || "";

//             if (
//                 className.match(/(ad|ads|banner|pop|promot)/i) ||
//                 id.match(/(ad|ads|banner|pop|promot)/i)
//             ) {
//                 div.remove();
//             }
//         });

//         // Fix iframe size issues:

//         // 1. Add viewport meta tag if missing
//         let hasViewport = false;
//         document.querySelectorAll('meta').forEach(meta => {
//             if (meta.getAttribute('name') === 'viewport') {
//                 hasViewport = true;
//             }
//         });

//         if (!hasViewport) {
//             const head = document.querySelector('head');
//             if (head) {
//                 const viewport = document.createElement('meta');
//                 viewport.setAttribute('name', 'viewport');
//                 viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
//                 head.appendChild(viewport);
//             }
//         }

//         // 2. Add style to ensure iframe is full size
//         const style = document.createElement('style');
//         style.textContent = `
//             html, body { 
//                 width: 100% !important; 
//                 height: 100% !important; 
//                 margin: 0 !important; 
//                 padding: 0 !important; 
//                 overflow: hidden !important;
//             }
//             iframe {
//                 width: 100% !important;
//                 height: 100% !important;
//                 position: absolute !important;
//                 top: 0 !important;
//                 left: 0 !important;
//                 border: none !important;
//             }
//             .video-container, .player-container {
//                 width: 100% !important;
//                 height: 100% !important;
//                 position: absolute !important;
//                 top: 0 !important;
//                 left: 0 !important;
//             }
//         `;

//         const head = document.querySelector('head');
//         if (head) {
//             head.appendChild(style);
//         }

//         // Add these additional security measures to your proxy:

//         // 1. More aggressive popup blocking
//         document.querySelectorAll('script').forEach(script => {
//             const content = script.textContent || '';

//             // Replace any window.open variations
//             if (content.includes('window.open') ||
//                 content.includes('window.location') ||
//                 content.includes('document.location') ||
//                 content.includes('.href') ||
//                 content.includes('accurstscaur.shop') ||  // Block the specific domain
//                 content.includes('whitebit.com')) {      // Block the redirect target

//                 script.textContent = script.textContent?.replace(
//                     /(window|document|location|self|top|parent)\.(open|location|href|replace|assign)/g,
//                     'void'
//                 ) ?? null;
//             }
//         });

//         // 2. Add global script to prevent redirects
//         const blockScript = document.createElement('script');
//         blockScript.textContent = `
//             (function() {
//                 // Block all window.open calls
//                 window.open = function() { return null; };
                
//                 // Block location changes
//                 Object.defineProperty(window, 'location', {
//                 set: function() { return false; }
//                 });
                
//                 // Block href changes on links
//                 document.addEventListener('click', function(e) {
//                 if (e.target.tagName === 'A' || e.target.closest('a')) {
//                     e.preventDefault();
//                     e.stopPropagation();
//                     return false;
//                 }
//                 }, true);
                
//                 // Block common ad event bindings
//                 const originalAddEventListener = EventTarget.prototype.addEventListener;
//                 EventTarget.prototype.addEventListener = function(type, listener, options) {
//                 if (type === 'click' || type === 'mousedown' || type === 'mouseup') {
//                     // Don't add the listener
//                     return;
//                 }
//                 return originalAddEventListener.call(this, type, listener, options);
//                 };
                
//                 // Block iframe navigation
//                 setInterval(() => {
//                 document.querySelectorAll('iframe').forEach(iframe => {
//                     if (iframe.src && (
//                     iframe.src.includes('accurstscaur.shop') || 
//                     iframe.src.includes('whitebit.com')
//                     )) {
//                     iframe.src = 'about:blank';
//                     }
//                 });
//                 }, 1000);
//             })();
//         `;

//         // Add this script to the head
//         document.head.insertBefore(blockScript, document.head.firstChild);

//         // 3. Block suspicious domains by URL patterns
//         const suspiciousDomains = [
//             'accurstscaur.shop',
//             'edgedeliverynetwork',
//             'whitebit.com',
//             'iRJCyipMT',
//             'nortb_fallback',
//             // Add more patterns from the URL you provided
//         ];

//         // Block all scripts, links, and iframes with these domains
//         suspiciousDomains.forEach(domain => {
//             document.querySelectorAll(`a[href*="${domain}"], script[src*="${domain}"], iframe[src*="${domain}"]`).forEach(el => {
//                 if (el.tagName === 'A') {
//                     (el as HTMLAnchorElement).href = 'javascript:void(0)';
//                     (el as HTMLAnchorElement).target = '';
//                     (el as HTMLElement).onclick = (e) => e.preventDefault();
//                 } else {
//                     el.remove();
//                 }
//             });
//         });

//         // Get cleaned HTML
//         cleanedHtml = dom.serialize();


//         // Return the cleaned HTML
//         return new NextResponse(cleanedHtml, {
//             headers: {
//                 'Content-Type': 'text/html; charset=utf-8',
//                 'X-Frame-Options': 'SAMEORIGIN',
//                 'Content-Security-Policy': "default-src * 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; frame-src *;",
//             }
//         });
//     } catch (error) {
//         console.error("Proxy error:", error);
//         return NextResponse.json(
//             { error: "Failed to process video content" },
//             { status: 500 }
//         );
//     }
// }