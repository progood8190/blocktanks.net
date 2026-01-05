// ==UserScript==
// @name         BlockTanks Index + JS Override (Stable)
// @namespace    https://blocktanks.net/
// @version      1.2
// @match        https://blocktanks.net/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    // ------------------------------
    // GitHub URLs
    // ------------------------------
    const INDEX_URL = 'https://raw.githubusercontent.com/progood8190/blocktanks.net/refs/heads/main/index';
    const MAP_URL = 'https://raw.githubusercontent.com/progood8190/blocktanks.net/refs/heads/main/map.js';
    const GRAPHICS_URL = 'https://raw.githubusercontent.com/progood8190/blocktanks.net/refs/heads/main/graphics.js';

    // ------------------------------
    // 1️⃣ Replace index HTML
    // ------------------------------
    GM_xmlhttpRequest({
        method: 'GET',
        url: INDEX_URL,
        onload(res) {
            document.open();
            document.write(res.responseText);
            document.close();
        }
    });

    // ------------------------------
    // 2️⃣ Preload / override JS files
    // ------------------------------
    function injectRemoteJS(url) {
        GM_xmlhttpRequest({
            method: 'GET',
            url,
            onload(res) {
                const s = document.createElement('script');
                s.textContent = res.responseText;
                document.head.appendChild(s);
            }
        });
    }

    // ------------------------------
    // Override dynamically added <script> tags
    // ------------------------------
    const originalAppendChild = Element.prototype.appendChild;
    Element.prototype.appendChild = function(node) {
        if (node.tagName === 'SCRIPT' && node.src) {
            if (node.src.includes('/js/map.js')) {
                injectRemoteJS(MAP_URL);
                return node;
            }
            if (node.src.includes('/js/graphics.js')) {
                injectRemoteJS(GRAPHICS_URL);
                return node;
            }
        }
        return originalAppendChild.call(this, node);
    };

    // ------------------------------
    // Override fetch() requests
    // ------------------------------
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
        const url = typeof input === 'string' ? input : input.url;

        if (url.includes('/js/map.js')) {
            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: MAP_URL,
                    onload(res) {
                        resolve(new Response(res.responseText, {
                            status: 200,
                            headers: { 'Content-Type': 'application/javascript' }
                        }));
                    }
                });
            });
        }

        if (url.includes('/js/graphics.js')) {
            return new Promise(resolve => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: GRAPHICS_URL,
                    onload(res) {
                        resolve(new Response(res.responseText, {
                            status: 200,
                            headers: { 'Content-Type': 'application/javascript' }
                        }));
                    }
                });
            });
        }

        return originalFetch(input, init);
    };

    // ------------------------------
    // Override XMLHttpRequest
    // ------------------------------
    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new OriginalXHR();
        const open = xhr.open;
        xhr.open = function(method, url, ...rest) {
            if (url.includes('/js/map.js')) url = MAP_URL;
            if (url.includes('/js/graphics.js')) url = GRAPHICS_URL;
            return open.call(this, method, url, ...rest);
        };
        return xhr;
    };

    // ------------------------------
    // 3️⃣ Optional: preload GitHub JS immediately
    // ------------------------------
    injectRemoteJS(MAP_URL);
    injectRemoteJS(GRAPHICS_URL);

})();
