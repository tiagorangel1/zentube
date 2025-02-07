// ==UserScript==
// @name         ZenTube
// @namespace    zentube
// @copyright    AGPL-3.0
// @version      0.1.0
// @description  Clean YouTube comments from hate, spam, harassment and trolls.
// @author       Tiago Rangel
// @match        *://youtube.com/*
// @match        *://www.youtube.com/*
// @include      *://www.youtube.com/**
// @include      *://youtube.com/**
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @sandbox      DOM
// @updateURL    https://github.com/tiagorangel1/zentube/raw/refs/heads/main/src/userscript.user.js
// @downloadURL  https://github.com/tiagorangel1/zentube/raw/refs/heads/main/src/userscript.user.js
// @connect      raw.githubusercontent.com
// ==/UserScript==

(async function () {
  const API_ENDPOINT = "https://raw.githubusercontent.com/tiagorangel1/zentube/refs/heads/main/dist/filters/";
  let filtersCache = JSON.parse(GM_getValue('filters', '{ "cached": false }'));

  const updateFilters = async () => {
    const [comments, users] = await Promise.all([
      (async function () {
        return JSON.parse((await GM.xmlHttpRequest({ url: `${API_ENDPOINT}comments.json` })).responseText)
      })(),
      (async function () {
        return (await GM.xmlHttpRequest({ url: `${API_ENDPOINT}users.txt` })).responseText.split("\n")
      })(),
    ])

    const data = {
      cached: true,
      comments,
      users
    };

    GM_setValue("filters", JSON.stringify(data));
    filtersCache = data;
  }

  if (!filtersCache.cached) {
    await updateFilters();
  } else {
    try {
      updateFilters();
    } catch { }
  }

  if (window.trustedTypes && window.trustedTypes.createPolicy) {
    window.trustedTypes.createPolicy('default', {
      createHTML: (string, sink) => string
    });
  }

  setInterval(function () {
    const comments = [...document.querySelectorAll("ytd-comment-view-model")].map((comment) => {
      return {
        element: comment,
        author: comment.querySelector("h3 #author-text span").innerText.replace("@", "").trim(),
        body: comment.querySelector("#content-text").innerText,
        openMenuBtn: comment.querySelector("#action-menu ytd-menu-renderer:has(yt-icon-button#button.dropdown-trigger.ytd-menu-renderer"),
        link: comment.querySelector("#header-author #published-time-text a.yt-simple-endpoint.style-scope.ytd-comment-view-model").href,
        removed: false
      }
    });

    if (!comments) { return };

    comments.forEach(comment => {
      const { author, body } = comment;

      if (comment.removed) { return }

      if (comment.element.getAttribute("data-zentube-parsed")) { return }

      comment.openMenuBtn.addEventListener("click", function () {
        const contextMenu = document.querySelector("tp-yt-iron-dropdown #contentWrapper ytd-menu-popup-renderer tp-yt-paper-listbox");
        if (!contextMenu) { return };

        if (contextMenu.querySelector("[data-zentube-report-btn]")) {
          contextMenu.querySelector("[data-zentube-report-btn]").remove();
        };

        const newEl = document.createElement("button");
        newEl.setAttribute("role", "option");
        newEl.setAttribute("data-zentube-report-btn", "true");

        newEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m13.18 4 .24 1.2.16.8H19v7h-5.18l-.24-1.2-.16-.8H6V4zM14 3H5v18h1v-9h6.6l.4 2h7V5h-5.6z" fill="currentColor"/><path d="M9.188 9.7V8.013H7.5V6.888h1.688V5.2h1.124v1.688H12v1.125h-1.687V9.7z" fill="currentColor"/></svg> <span style="font-weight: 300;margin-left:16px;font-family:'Roboto','Arial',sans-serif">ZenTube</span><style>
        
        [data-zentube-report-btn]:hover { background-color: var(--yt-spec-10-percent-layer)!important; }
        [data-zentube-report-btn]:active { opacity: .7; }

        </style>`
        newEl.style = `display: flex;align-items: center;background-color: transparent;color: inherit;border: none;padding: 0 12px 0 16px;cursor:pointer;height:36px;width:100%`;

        contextMenu.appendChild(newEl);

        newEl.addEventListener("click", function () {
          window.open(`https://zentube.glitch.me/report.html?link=${encodeURIComponent(comment.link)}&author=${encodeURIComponent(comment.author)}&body=${encodeURIComponent(comment.body)}`, "_blank");
        });
      });

      comment.element.setAttribute("data-zentube-parsed", "true");

      filtersCache.comments.forEach(filter => {
        if (body.toLowerCase().includes(filter.text.toLowerCase())) {
          comment.element.remove();
          comment.removed = true;
        }
      });

      filtersCache.users.forEach(filter => {
        if (author === filter) {
          comment.element.remove();
          comment.removed = true;
        }
      });
    });
  }, 20)
})();