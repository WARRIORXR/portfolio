// Tanish Jaswal — portfolio (notebook edition)
// Deferred, dependency-free.
// Hero: typed greeting docks into the nav, then content rises line by
// line and the highlighter draws. Plus pixel cursor, badge popovers,
// keyboard shortcuts, nav state, GitHub heatmap, reveals, contact form.

(function () {
  "use strict";

  var doc = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Gate all JS-dependent hiding behind this class: without JS the page
  // renders fully visible and static.
  doc.classList.add("js");

  /* ---------- nav state & scroll progress ---------- */

  var nav = document.getElementById("site-nav");
  var progress = document.getElementById("progress");
  var queued = false;

  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle("is-stuck", y > 24);
    if (progress) {
      var max = doc.scrollHeight - window.innerHeight;
      progress.style.transform =
        "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    queued = false;
  }

  function requestScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(onScroll);
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScroll();

  /* ---------- active section ---------- */

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  if (links.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            var match = link.getAttribute("href") === "#" + entry.target.id;
            if (match) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").slice(1);
      var section = id && document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------- keyboard shortcuts (About / Skills / Work / Contact) ---------- */

  var SHORTCUTS = { a: "#about", s: "#skills", w: "#work", c: "#contact" };

  document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

    var target = event.target;
    if (
      target &&
      (target.closest("input, textarea, select") || target.isContentEditable)
    ) return;

    var id = SHORTCUTS[event.key.toLowerCase()];
    if (!id) return;

    var section = document.querySelector(id);
    if (section) {
      section.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  });

  /* ---------- hero intro: type, hold, dock ---------- */

  var GREETING = "Hi, I\u2019m Tanish.";
  var TYPE_START = 500; // ms before the first key
  var TYPE_SPEED = 75; // ms per character
  var TYPE_JITTER = 60; // random extra per key
  var TYPE_PAUSE = 200; // extra pause after "," and "."
  var TYPE_HOLD = 550; // rest before docking
  var DOCK_MS = 1100; // move into the nav

  var greeting = document.getElementById("greeting");
  var greetingText = greeting ? greeting.querySelector(".greeting-text") : null;
  var caret = greeting ? greeting.querySelector(".caret") : null;
  var brand = document.getElementById("brand");

  function dock() {
    doc.setAttribute("data-docked", "");
  }

  if (reduced || !greeting || !greetingText || !brand) {
    dock(); // static page: brand stays "Tanish Jaswal", content visible
  } else {
    runIntro();
  }

  function runIntro() {
    try {
      brand.setAttribute("aria-label", "Tanish Jaswal — home");
      setTimeout(typeStep, TYPE_START);
    } catch (err) {
      dock();
    }

    function typeStep() {
      var i = 0;

      function key() {
        greetingText.textContent = GREETING.slice(0, ++i);

        if (i < GREETING.length) {
          var wait = TYPE_SPEED + Math.random() * TYPE_JITTER;
          if (GREETING.charAt(i - 1) === "," || GREETING.charAt(i - 1) === ".") {
            wait += TYPE_PAUSE;
          }
          setTimeout(key, wait);
        } else {
          setTimeout(startDock, TYPE_HOLD);
        }
      }

      key();
    }

    function startDock() {
      var target = brand.getBoundingClientRect();
      var from = greetingText.getBoundingClientRect();

      // Move the greeting onto the brand slot and scale it down to the
      // brand's size; the caret bows out first.
      var dx = target.left - from.left;
      var dy = target.top + target.height / 2 - (from.top + from.height / 2);
      var scale = target.height / from.height;

      if (caret) caret.style.display = "none";

      var move = greetingText.animate(
        [
          { transform: "none" },
          {
            transform:
              "translate(" + dx + "px, " + dy + "px) scale(" + scale + ")"
          }
        ],
        { duration: DOCK_MS, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" }
      );

      move.addEventListener("finish", finishDock);
      move.addEventListener("cancel", finishDock);

      // Safety net: never leave the page without its nav.
      setTimeout(finishDock, DOCK_MS + 400);
    }

    function finishDock() {
      if (doc.hasAttribute("data-docked")) return;
      brand.textContent = GREETING;
      dock();
    }
  }

  /* ---------- badge popovers (hover / focus / tap) ---------- */

  var POP_EDGE = 12;

  Array.prototype.forEach.call(document.querySelectorAll(".badge"), function (badge) {
    var open = false;

    function shift() {
      var wrap = badge.closest(".badge-wrap") || badge;
      var pop = wrap.querySelector(".pop");
      if (!pop) return;

      var rect = pop.getBoundingClientRect();
      var current = parseFloat(badge.style.getPropertyValue("--pop-shift")) || 0;
      var delta =
        Math.max(0, POP_EDGE - rect.left) -
        Math.max(0, rect.right - (window.innerWidth - POP_EDGE));

      badge.style.setProperty("--pop-shift", current + delta + "px");
    }

    function show() {
      if (open) return;
      open = true;
      badge.setAttribute("aria-expanded", "true");
      shift();
    }

    function hide() {
      if (!open) return;
      open = false;
      badge.setAttribute("aria-expanded", "false");
    }

    badge.addEventListener("pointerenter", function (event) {
      if (event.pointerType === "mouse") show();
    });

    badge.addEventListener("pointerleave", function (event) {
      if (event.pointerType === "mouse") hide();
    });

    badge.addEventListener("focus", show);
    badge.addEventListener("blur", hide);

    badge.addEventListener("click", function (event) {
      // touch: tap toggles; mouse: hover already opened it
      if (event.pointerType !== "mouse" && event.detail !== 0) {
        if (open) hide();
        else show();
      }
    });
  });

  document.addEventListener("pointerdown", function (event) {
    Array.prototype.forEach.call(
      document.querySelectorAll('.badge[aria-expanded="true"]'),
      function (badge) {
        if (!badge.contains(event.target)) badge.setAttribute("aria-expanded", "false");
      }
    );
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    Array.prototype.forEach.call(
      document.querySelectorAll('.badge[aria-expanded="true"]'),
      function (badge) {
        badge.setAttribute("aria-expanded", "false");
        badge.focus();
      }
    );
  });

  /* ---------- pixel cursor (fine pointers, motion allowed) ---------- */

  // One 1×1 square per pixel, old-computer cursors.
  var ARROW = {
    hotspot: [0, 0],
    rows: [
      "X...........",
      "XX..........",
      "XOX.........",
      "XOOX........",
      "XOOOX.......",
      "XOOOOX......",
      "XOOOOOX.....",
      "XOOOOOOX....",
      "XOOOOOOOX...",
      "XOOOOOOOOX..",
      "XOOOOOOOOOX.",
      "XOOOOOOXXXXX",
      "XOOOXOOX....",
      "XOOXXOOX....",
      "XOX..XOOX...",
      "XX...XOOX...",
      "X.....XOOX..",
      "......XOOX..",
      ".......XX..."
    ]
  };

  var HAND = {
    hotspot: [5, 0],
    rows: [
      ".....XX.........",
      "....XOOX........",
      "....XOOX........",
      "....XOOX........",
      "....XOOX........",
      "....XOOXXX......",
      "....XOOXOOXXX...",
      "....XOOXOOXOOXX.",
      ".XX.XOOXOOXOOXOX",
      "XOOXXOOOOOOOOOOX",
      "XOOOOOOOOOOOOOOX",
      ".XOOOOOOOOOOOOOX",
      "..XOOOOOOOOOOOOX",
      "..XOOOOOOOOOOOX.",
      "...XOOOOOOOOOOX.",
      "...XOOOOOOOOOX..",
      "....XOOOOOOOOX..",
      "....XXXXXXXXXX.."
    ]
  };

  function drawSprite(sprite) {
    var ink = "";
    var fill = "";

    sprite.rows.forEach(function (row, y) {
      row.split("").forEach(function (cell, x) {
        if (cell === "X") ink += "M" + x + " " + y + "h1v1h-1z";
        else if (cell === "O") fill += "M" + x + " " + y + "h1v1h-1z";
      });
    });

    return {
      width: sprite.rows[0].length,
      height: sprite.rows.length,
      ink: ink,
      fill: fill,
      hx: sprite.hotspot[0],
      hy: sprite.hotspot[1]
    };
  }

  function initPixelCursor() {
    var wrap = document.querySelector(".px-cursor");
    if (!wrap) return;

    var PIXEL = 1.5;
    var sprites = { arrow: drawSprite(ARROW), hand: drawSprite(HAND) };
    var arts = Array.prototype.slice.call(wrap.querySelectorAll(".px-art"));

    arts.forEach(function (art) {
      var sprite = sprites[art.getAttribute("data-cursor")];
      if (!sprite) return;

      art.setAttribute("viewBox", "0 0 " + sprite.width + " " + sprite.height);
      art.setAttribute("width", sprite.width * PIXEL);
      art.setAttribute("height", sprite.height * PIXEL);
      art.style.position = "absolute";
      art.style.left = -sprite.hx * PIXEL + "px";
      art.style.top = -sprite.hy * PIXEL + "px";
      art.innerHTML =
        '<path d="' + sprite.ink + '" fill="currentColor"></path>' +
        '<path d="' + sprite.fill + '" fill="#f6f1e7"></path>';
    });

    doc.classList.add("px-on");

    var active = null;

    function setActive(kind) {
      if (active === kind) return;
      active = kind;
      arts.forEach(function (art) {
        if (art.getAttribute("data-cursor") === kind) {
          art.setAttribute("data-active", "");
        } else {
          art.removeAttribute("data-active");
        }
      });
    }

    setActive("arrow");

    var x = window.innerWidth / 2;
    var y = window.innerHeight / 2;
    var tx = x;
    var ty = y;

    window.addEventListener(
      "pointermove",
      function (event) {
        tx = event.clientX;
        ty = event.clientY;
        wrap.style.opacity = "1";
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", function () {
      wrap.style.opacity = "0";
    });

    document.addEventListener(
      "pointerover",
      function (event) {
        var interactive = event.target.closest(
          "a[href], button, [role='button'], summary, label"
        );
        setActive(interactive ? "hand" : "arrow");
      },
      { passive: true }
    );

    (function loop() {
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      wrap.style.transform = "translate(" + x + "px, " + y + "px)";
      requestAnimationFrame(loop);
    })();
  }

  if (!reduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    initPixelCursor();
  }

  /* ---------- GitHub contribution heatmap ----------
     Levels 0–4 are read from github.com/users/WARRIORXR/contributions,
     laid out as 53 weeks × 7 days starting 2025-11-23. */

  var START = "2025-11-23";
  var LEVELS =
  "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000010100000002112100112120000000120001211000001021000001001000001011202121112432020240000141000000000000000012100311..";

  function buildHeatmap() {
    var grid = document.getElementById("heatmap");
    if (!grid) return;

    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var start = new Date(START + "T00:00:00Z");
    var days = document.createElement("div");
    var main = document.createElement("div");
    var monthsEl = document.createElement("div");
    var weeks = document.createElement("div");
    var cells = document.createDocumentFragment();
    var monthCells = {};
    var lastMonth = -1;
    var count = 0;

    days.className = "heat-days";
    main.className = "heat-main";
    monthsEl.className = "heat-months";
    weeks.className = "heat-weeks";

    [["Mon", 2], ["Wed", 4], ["Fri", 6]].forEach(function (day) {
      var label = document.createElement("span");
      label.textContent = day[0];
      label.style.setProperty("--row", day[1]);
      days.appendChild(label);
    });

    for (var i = 0; i < LEVELS.length; i++) {
      var date = new Date(start.getTime() + i * 86400000);
      var level = LEVELS.charAt(i);
      var cell = document.createElement("i");

      if (level === ".") {
        cell.className = "heat-cell void";
      } else {
        cell.className = "heat-cell";
        cell.setAttribute("data-level", level);
        cell.title =
          date.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "UTC"
          }) + " · activity level " + level + "/4";
        count++;
      }

      cells.appendChild(cell);

      var m = date.getUTCMonth();
      if (m !== lastMonth && date.getUTCDate() <= 7) {
        lastMonth = m;
        monthCells[Math.floor(i / 7)] = MONTHS[m];
      }
    }

    weeks.appendChild(cells);

    for (var week in monthCells) {
      if (!Object.prototype.hasOwnProperty.call(monthCells, week)) continue;
      var label = document.createElement("span");
      label.style.setProperty("--col", Number(week) + 1);
      label.textContent = monthCells[week];
      monthsEl.appendChild(label);
    }

    main.appendChild(monthsEl);
    main.appendChild(weeks);
    grid.appendChild(days);
    grid.appendChild(main);

    grid.setAttribute(
      "aria-label",
      "Contribution heatmap: " + count + " days over the last year, shaded by activity level"
    );
  }

  buildHeatmap();

  /* ---------- scroll reveal + count-up ---------- */

  var revealTargets = document.querySelectorAll("[data-reveal]");
  var canReveal = !reduced && "IntersectionObserver" in window;

  // Stagger indices inside grouped layouts
  Array.prototype.forEach.call(
    document.querySelectorAll(".stats-grid, .activity-nums, .skills-grid, .pair"),
    function (group) {
      Array.prototype.forEach.call(
        group.querySelectorAll("[data-reveal]"),
        function (el, i) {
          el.style.setProperty("--i", i % 4);
        }
      );
    }
  );

  function finishCounts() {
    Array.prototype.forEach.call(document.querySelectorAll(".count"), function (node) {
      var end = parseInt(node.getAttribute("data-count"), 10);
      if (!isNaN(end)) node.textContent = end;
      node.dataset.counted = "1";
    });
  }

  if (canReveal && revealTargets.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");

          var nums = entry.target.querySelectorAll(".count");
          if (nums.length) countUp(nums);
          else if (entry.target.classList.contains("count")) {
            countUp([entry.target]);
          }

          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    Array.prototype.forEach.call(revealTargets, function (el) {
      revealObserver.observe(el);
    });
  } else {
    // No motion or no observer support: show everything settled.
    Array.prototype.forEach.call(revealTargets, function (el) {
      el.classList.add("in");
    });
    finishCounts();
  }

  function countUp(nodes) {
    Array.prototype.forEach.call(nodes, function (node) {
      var end = parseInt(node.getAttribute("data-count"), 10);
      if (isNaN(end) || node.dataset.counted) return;
      node.dataset.counted = "1";

      var startAt = performance.now();
      var dur = 900;

      function step(now) {
        var p = Math.min((now - startAt) / dur, 1);
        node.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    });
  }

  /* ---------- picture-rail gallery (projects) ----------
     Five framed prints hang from a rail: brush along it to light one,
     drag a frame aside, click to lift it and flip it for the label. */

  var PROJECTS = [
    {
      id: "movie-recommender",
      title: "Movie Recommendation System",
      year: "2026",
      aspect: 0.75,
      frame: "black",
      mat: true,
      drop: 0.04,
      tag: "Flask web app",
      desc: "Movie recommendation & information web app built with Python and Flask. Features ML-based recommendations served through a REST endpoint.",
      stack: ["Python", "Flask", "Scikit-learn", "Pandas"],
      href: "https://github.com/WARRIORXR",
      art: '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="400" fill="#f2e8d5"/><rect x="46" y="52" width="308" height="86" rx="6" fill="none" stroke="#2a241d" stroke-width="3"/><g fill="#2a241d"><rect x="60" y="62" width="12" height="10" rx="2"/><rect x="104" y="62" width="12" height="10" rx="2"/><rect x="148" y="62" width="12" height="10" rx="2"/><rect x="192" y="62" width="12" height="10" rx="2"/><rect x="236" y="62" width="12" height="10" rx="2"/><rect x="280" y="62" width="12" height="10" rx="2"/><rect x="324" y="62" width="12" height="10" rx="2"/><rect x="60" y="118" width="12" height="10" rx="2"/><rect x="104" y="118" width="12" height="10" rx="2"/><rect x="148" y="118" width="12" height="10" rx="2"/><rect x="192" y="118" width="12" height="10" rx="2"/><rect x="236" y="118" width="12" height="10" rx="2"/><rect x="280" y="118" width="12" height="10" rx="2"/><rect x="324" y="118" width="12" height="10" rx="2"/></g><path d="M64 96 L 132 96 L 132 116 L 64 116 Z" fill="none" stroke="#2a241d" stroke-width="2"/><path d="M156 96 L 236 96 L 236 116 L 156 116 Z" fill="none" stroke="#2a241d" stroke-width="2"/><path d="M258 96 L 338 96 L 338 116 L 258 116 Z" fill="none" stroke="#2a241d" stroke-width="2"/><path d="M204 210 L 216 244 L 252 244 L 224 266 L 234 300 L 204 280 L 174 300 L 184 266 L 156 244 L 192 244 Z" fill="#ffae21" opacity="0.75" stroke="#2a241d" stroke-width="2.5" stroke-linejoin="round"/><g fill="#2a241d"><path d="M128 330 l4 8 9 1 -6.5 6 1.6 9 -8.1 -4.4 -8.1 4.4 1.6 -9 -6.5 -6 9 -1 Z"/><path d="M196 330 l4 8 9 1 -6.5 6 1.6 9 -8.1 -4.4 -8.1 4.4 1.6 -9 -6.5 -6 9 -1 Z"/><path d="M264 330 l4 8 9 1 -6.5 6 1.6 9 -8.1 -4.4 -8.1 4.4 1.6 -9 -6.5 -6 9 -1 Z"/></g><path d="M96 366 C 170 360, 240 372, 306 362" fill="none" stroke="#2a241d" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/></svg>'
    },
    {
      id: "ml-practice",
      title: "ML Practice Portfolio",
      year: "2026",
      aspect: 4 / 3,
      frame: "white",
      mat: true,
      drop: 0.12,
      tag: "Scikit-learn",
      desc: "Comprehensive ML practice using Scikit-learn — KNN, decision trees, random forest, SVM and clustering, trained, compared and documented.",
      stack: ["Python", "Scikit-learn", "Jupyter"],
      href: "https://github.com/WARRIORXR",
      art: '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="400" fill="#f2e8d5"/><path d="M64 330 L 64 84 M 64 330 L 344 330" fill="none" stroke="#2a241d" stroke-width="2.5" stroke-linecap="round"/><path d="M64 236 C 130 210, 220 200, 300 128" fill="none" stroke="#2a241d" stroke-width="2.5" stroke-dasharray="7 7"/><g fill="#2a241d"><circle cx="96" cy="286" r="7"/><circle cx="118" cy="262" r="7"/><circle cx="92" cy="240" r="7"/><circle cx="140" cy="290" r="7"/><circle cx="124" cy="226" r="7"/><circle cx="164" cy="264" r="7"/><circle cx="104" cy="204" r="7"/></g><g fill="#cf5f4c"><circle cx="252" cy="140" r="7"/><circle cx="282" cy="168" r="7"/><circle cx="308" cy="128" r="7"/><circle cx="262" cy="196" r="7"/><circle cx="296" cy="208" r="7"/><circle cx="326" cy="176" r="7"/></g><circle cx="282" cy="168" r="16" fill="none" stroke="#ffae21" stroke-width="4" opacity="0.8"/><g fill="none" stroke="#2a241d" stroke-width="2.5" stroke-linecap="round"><path d="M320 66 L 320 30 M 320 66 L 296 96 M 320 66 L 344 96"/><circle cx="320" cy="26" r="9"/><circle cx="290" cy="100" r="9"/><circle cx="350" cy="100" r="9"/></g></svg>'
    },
    {
      id: "analytics-dashboards",
      title: "Analytics Dashboards",
      year: "2025",
      aspect: 0.75,
      frame: "oak",
      mat: false,
      drop: -0.02,
      tag: "Live charts",
      desc: "Live dashboards answering a question from a dataset: movie revenue against budget to show which films return their money, and spending trends by category and month.",
      stack: ["Python", "Pandas", "Matplotlib", "SQL"],
      href: "https://github.com/WARRIORXR",
      art: '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="400" fill="#f2e8d5"/><rect x="52" y="56" width="180" height="128" rx="6" fill="none" stroke="#2a241d" stroke-width="2.5"/><path d="M70 160 L 100 128 L 126 140 L 156 104 L 182 116 L 214 88" fill="none" stroke="#2a241d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><g fill="#2a241d"><circle cx="100" cy="128" r="4"/><circle cx="156" cy="104" r="4"/><circle cx="214" cy="88" r="4"/></g><rect x="258" y="56" width="92" height="128" rx="6" fill="none" stroke="#2a241d" stroke-width="2.5"/><path d="M304 92 A 30 30 0 1 1 282 100" fill="none" stroke="#2a241d" stroke-width="10" stroke-linecap="round"/><path d="M304 92 A 30 30 0 0 1 326 122" fill="none" stroke="#ffae21" stroke-width="10" stroke-linecap="round" opacity="0.85"/><g><rect x="66" y="292" width="34" height="54" fill="#2a241d" opacity="0.4"/><rect x="116" y="266" width="34" height="80" fill="#2a241d" opacity="0.6"/><rect x="166" y="306" width="34" height="40" fill="#2a241d" opacity="0.8"/><rect x="216" y="246" width="34" height="100" fill="#ffae21" opacity="0.85" stroke="#2a241d" stroke-width="2"/></g><path d="M56 346 L 262 346" fill="none" stroke="#2a241d" stroke-width="2.5" stroke-linecap="round"/><path d="M284 282 C 306 262, 328 286, 348 262" fill="none" stroke="#cf5f4c" stroke-width="3" stroke-linecap="round"/><path d="M284 316 C 306 300, 328 322, 348 298" fill="none" stroke="#2a241d" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/></svg>'
    },
    {
      id: "school-aqi-alert",
      title: "Air-Quality Alert System",
      year: "2025",
      aspect: 1,
      frame: "black",
      mat: true,
      drop: 0.16,
      tag: "AWS serverless",
      desc: "Serverless AWS pipeline that watches air quality and alerts schools when readings cross safe limits — a clear signal instead of a raw feed.",
      stack: ["AWS", "Serverless", "Python", "REST APIs"],
      href: "https://github.com/WARRIORXR/school-aqi-alert",
      art: '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="400" fill="#f2e8d5"/><path d="M118 156 C 96 156, 84 138, 94 120 C 88 96, 116 82, 136 92 C 148 68, 186 66, 200 90 C 224 74, 258 88, 254 114 C 278 118, 280 148, 258 156 Z" fill="#faf4e7" stroke="#2a241d" stroke-width="3.5" stroke-linejoin="round"/><path d="M200 196 L 200 236" fill="none" stroke="#2a241d" stroke-width="4" stroke-linecap="round"/><path d="M172 236 C 172 266, 228 266, 228 236 L 224 200 L 176 200 Z" fill="#ffae21" opacity="0.7" stroke="#2a241d" stroke-width="3" stroke-linejoin="round"/><circle cx="200" cy="286" r="7" fill="#2a241d"/><g fill="none" stroke="#cf5f4c" stroke-width="3.5" stroke-linecap="round"><path d="M300 176 A 52 52 0 0 1 322 210"/><path d="M312 152 A 84 84 0 0 1 344 208"/><path d="M324 128 A 118 118 0 0 1 366 206"/></g><path d="M84 300 C 100 288, 122 292, 128 310 C 116 322, 94 318, 84 300 Z" fill="none" stroke="#2a241d" stroke-width="3"/><path d="M84 300 C 98 306, 112 308, 126 310" fill="none" stroke="#2a241d" stroke-width="2" opacity="0.6"/><path d="M96 356 C 160 350, 240 360, 304 352" fill="none" stroke="#2a241d" stroke-width="2.5" stroke-linecap="round" opacity="0.5"/></svg>'
    },
    {
      id: "journaling-app",
      title: "Journaling App",
      year: "2025",
      aspect: 1.5,
      frame: "oak",
      mat: false,
      drop: 0.06,
      tag: "PostgreSQL backend",
      desc: "Real-time journaling app with a PostgreSQL backend: entries save as you write, sync across sessions and stay queryable.",
      stack: ["PostgreSQL", "Python", "Flask", "JavaScript"],
      href: "https://github.com/WARRIORXR",
      art: '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="400" fill="#f2e8d5"/><rect x="84" y="92" width="196" height="240" rx="4" fill="#faf4e7" stroke="#2a241d" stroke-width="3"/><g stroke="#cbc1b2" stroke-width="2"><path d="M104 140 L 262 140"/><path d="M104 176 L 262 176"/><path d="M104 212 L 262 212"/><path d="M104 248 L 262 248"/><path d="M104 284 L 262 284"/></g><g fill="none" stroke="#2a241d" stroke-width="2.5" stroke-linecap="round"><path d="M108 134 C 130 128, 154 138, 178 132"/><path d="M108 170 C 140 164, 172 174, 246 168"/><path d="M108 242 C 136 236, 168 246, 206 240"/></g><path d="M108 206 L 186 206" fill="none" stroke="#ffae21" stroke-width="7" opacity="0.6" stroke-linecap="round"/><path d="M252 122 L 306 296" fill="none" stroke="#2a241d" stroke-width="4" stroke-linecap="round"/><path d="M298 272 L 310 300 L 282 296 Z" fill="#2a241d"/><g fill="none" stroke="#cf5f4c" stroke-width="3.5" stroke-linecap="round"><path d="M318 96 A 26 26 0 0 1 352 118"/><path d="M356 136 A 26 26 0 0 1 322 114"/></g><path d="M352 112 l6 8 -11 1 Z" fill="#cf5f4c"/><ellipse cx="150" cy="356" rx="34" ry="12" fill="none" stroke="#2a241d" stroke-width="2.5"/><path d="M116 356 C 116 342, 184 342, 184 356 M 116 356 C 116 370, 184 370, 184 356" fill="none" stroke="#2a241d" stroke-width="2.5"/></svg>'
    }
  ];

  function initGallery() {
    var stage = document.querySelector("[data-stage]");
    var captionTitle = document.querySelector("[data-caption-title]");
    var captionSub = document.querySelector("[data-caption-sub]");
    var dotsBox = document.querySelector(".rail-dots");
    var dialog = document.getElementById("frame-dialog");
    if (!stage || !captionTitle || !dialog || !PROJECTS.length) return;

    var items = PROJECTS;
    var count = items.length;
    var CAPTION_DEFAULT = captionTitle.textContent;

    var clampN = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
    var DEG = 180 / Math.PI;

    /* shapes & layout (same math as the reference component) */
    items.forEach(function (item) {
      var aspect = clampN(item.aspect ?? 0.8, 0.4, 2.5);
      var mold = item.frame === "oak" ? 0.068 : item.frame === "white" ? 0.058 : 0.046;
      var mat = item.mat ? 0.11 : 0;
      var matB = item.mat ? 0.022 : 0;
      var iw = Math.sqrt(aspect);
      item._mold = mold;
      item._mat = mat;
      item._matB = matB;
      item._w = iw + 2 * (mold + mat);
      item._h = 1 / iw + 2 * (mold + mat) + matB;
    });

    var GAP = 0.3, BREATH = 0.1, MARGIN = 0.05, EDGE = 36;
    var LIFT_GROW = 1.12, LIFT_SCALE = 0.06, LIFT_Z = 26;
    var TILT_X = -6, SWING_MAX = 14, SWING_G = 3900, SWING_DAMP = 2.2;
    var SWING_COUPLING = 0.08, DRAG_COUPLING = 0.16, NEIGHBOUR_KICK = 12;

    function restTilt(i) { return ((((i * 37 + 11) % 7) - 3) * 0.5); }

    var width = 0, unit = 0, carousel = false;
    var railTop = 6, railT = 12, pivotY = 20, tops = [], stageH = 420;

    function layoutFor() {
      var shapes = items;
      var n = count;
      var sumW = 0, maxW = 0, maxH = 0;
      shapes.forEach(function (s) { sumW += s._w; maxW = Math.max(maxW, s._w); maxH = Math.max(maxH, s._h); });
      var fit = n ? (width - 2 * EDGE) / (sumW + Math.max(0, n - 1) * GAP + 2 * BREATH + maxW * (LIFT_GROW - 1)) : 120;
      carousel = fit < 84;
      unit = carousel ? clampN(width * 0.2, 92, 128) : Math.min(150, fit);
      railT = Math.round(clampN(unit * 0.11, 9, 16));
      railTop = 6;
      pivotY = railTop + railT + Math.round(unit * 0.045) + 2;
      var centre = pivotY + unit * 0.22 + maxH * unit / 2;
      tops = shapes.map(function (s, i) {
        var drop = clampN(items[i].drop ?? 0, -0.15, 0.6);
        return Math.round(Math.max(pivotY + unit * 0.08, centre - (s._h * unit) / 2 + drop * unit));
      });
      var bottom = pivotY;
      shapes.forEach(function (s, i) { bottom = Math.max(bottom, tops[i] + s._h * unit); });
      stageH = Math.round(bottom + 34);
    }

    /* sim state */
    var s = { x: [], vx: [], tx: [], sw: [], vsw: [], e: [], ve: [], te: [], drag: -1, grab: 0, free: 0, last: 0, raf: 0, hx: [], hv: [] };
    var refs = { hang: [], back: [], swing: [], slot: [], tilt: [], light: [], dim: [], shadow: [], wash: [] };
    var current = null;
    var playing = false, beat = 0, beatTimer = 0;

    /* DOM builders */
    function frameArtHTML(item, u, litValue) {
      var m = Math.max(2, item._mold * u);
      var mat = item._mat * u;
      var matB = item._matB * u;
      var above = clampN(u * 0.12, 9, 26);
      var hood = clampN(u * 0.05, 4, 12);
      var fixture = clampN(item._w * u * 0.46, 30, 190);
      return '<span class="moulding-strip t" style="--m:' + m + 'px"></span>' +
        '<span class="moulding-strip l" style="--m:' + m + 'px"></span>' +
        '<span class="moulding-strip r" style="--m:' + m + 'px"></span>' +
        '<span class="moulding-strip b" style="--m:' + m + 'px"></span>' +
        '<span class="mat-area" style="left:' + m + 'px;top:' + m + 'px;right:' + m + 'px;bottom:' + (m + matB) + 'px">' +
        '<span class="art-holder" style="left:' + mat + 'px;top:' + mat + 'px;right:' + mat + 'px;bottom:' + mat + 'px">' + item.art + "</span>" +
        "</span>" +
        '<span class="glass-glare"></span>' +
        '<span class="light-fixture" data-light style="top:' + (-above) + "px;bottom:0;opacity:" + (litValue ?? 0) + '">' +
        '<span class="light-hood" style="top:0;width:' + fixture + "px;height:" + hood + 'px"></span>' +
        '<span class="light-glow" style="top:' + hood * 0.6 + "px;width:" + fixture * 0.86 + "px;height:" + Math.max(2, hood * 0.45) + 'px"></span>' +
        '<span class="light-beam" style="top:' + (above - 1) + "px;height:" + m * 1.8 + 'px"></span>' +
        '<span class="light-wash" style="top:' + (above + m * 0.2) + "px;bottom:" + m + 'px"></span>' +
        "</span>" +
        '<span class="dim-overlay" data-dim></span>';
    }

    function hookHTML(x, w) {
      var plate = clampN(railT * 0.36, 3, 6);
      var height = pivotY - railTop + 6;
      return '<span class="hook" style="left:' + (x - plate) + "px;top:" + (railTop - 3) + "px;width:" + plate * 2 + "px;height:" + height + 'px">' +
        '<span class="hook-plate"></span><span class="hook-stem"></span>' +
        '<svg class="hook-curl" width="' + plate * 2 + '" height="7" viewBox="0 0 ' + plate * 2 + ' 7" aria-hidden="true"><path d="M' + plate * 0.62 + ",0 Q" + plate * 0.62 + ",6.2 " + plate + ",6.2 Q" + plate * 1.38 + ",6.2 " + plate * 1.38 + ',2.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        "</span>";
    }

    /* hang the frames */
    items.forEach(function (item, i) {
      var hang = document.createElement("div");
      hang.className = "hang";
      hang.dataset.index = i;
      stage.appendChild(hang);
      refs.hang[i] = hang;
    });

    function buildFrames() {
      refs.hang.forEach(function (hang, i) {
        var item = items[i];
        var w = item._w * unit;
        var h = item._h * unit;
        var top = tops[i];
        var ringY = top + h * 0.07;
        hang.style.width = w + "px";

        hang.innerHTML =
          '<span class="wash" data-wash style="left:' + -w * 0.5 + "px;width:" + w * 2 + "px;top:" + (top - h * 0.5) + "px;height:" + h * 1.75 + 'px"></span>' +
          '<span class="frame-shadow" style="left:0;top:' + top + "px;width:" + w + "px;height:" + h + 'px"><span class="frame-shadow-core"></span></span>' +
          hookHTML(w / 2, w) +
          '<span class="swing" data-swing style="width:' + w + "px;transform-origin:" + w / 2 + "px " + (pivotY + 1) + 'px">' +
          '<svg class="wires" width="' + Math.max(1, w) + '" height="' + Math.max(1, ringY) + '" aria-hidden="true">' +
          [w * 0.2, w * 0.8].map(function (rx) {
            return '<g><line x1="' + (w / 2 + 0.7) + '" y1="' + (pivotY + 1.8) + '" x2="' + (rx + 0.7) + '" y2="' + (ringY + 0.8) + '" stroke="black" stroke-opacity="0.14" stroke-width="1.4"/>' +
              '<line x1="' + w / 2 + '" y1="' + (pivotY + 1) + '" x2="' + rx + '" y2="' + ringY + '" stroke="currentColor" stroke-opacity="0.6" stroke-width="1"/>' +
              '<line x1="' + (w / 2 - 0.3) + '" y1="' + (pivotY + 1) + '" x2="' + (rx - 0.3) + '" y2="' + ringY + '" stroke="white" stroke-opacity="0.35" stroke-width="0.4"/></g>';
          }).join("") +
          "</svg>" +
          (item.tag
            ? '<span class="label-tag" data-label style="top:' + (top + h + 10) + 'px;right:0">' + (item.tag.startsWith("$") ? "" : '<span class="tag-dot" aria-hidden="true"></span>') + item.tag + "</span>"
            : "") +
          '<button type="button" class="frame-slot" data-frame="' + i + '" style="left:0;top:' + top + "px;width:" + w + "px;height:" + h + 'px" aria-label="' + item.title.replace(/"/g, "&quot;") + '" aria-pressed="false">' +
          '<span class="tilt" data-tilt style="left:0;top:0;width:' + w + "px;height:" + h + 'px">' +
          '<span class="frame-art fs-' + item.frame + '">' + frameArtHTML(item, unit, 0) + "</span>" +
          "</span>" +
          "</button>" +
          "</span>";

        refs.swing[i] = hang.querySelector("[data-swing]");
        refs.slot[i] = hang.querySelector("[data-frame]");
        refs.tilt[i] = hang.querySelector("[data-tilt]");
        refs.light[i] = hang.querySelector("[data-light]");
        refs.dim[i] = hang.querySelector("[data-dim]");
        refs.shadow[i] = hang.querySelector(".frame-shadow");
        refs.wash[i] = hang.querySelector("[data-wash]");

        refs.slot[i].tabIndex = i === focusIndex ? 0 : -1;
        refs.slot[i].addEventListener("focus", function () {
          focusIndex = i;
          if (pointer.id < 0) { stopPlaying(); choose(i); }
        });
        refs.slot[i].addEventListener("click", function (event) {
          if (event.detail === 0) { openFrame(i); return; } // keyboard
          if (pointer.kind === "mouse" && !pointer.moved) openFrame(i);
        });
      });
    }

    /* targets */
    function targetsFor(front, centreIndex) {
      var n = count;
      var feet = items.map(function (it, i) { return it._w * unit * (i === front ? LIFT_GROW : 1); });
      var gapAfter = function (a) { return unit * (GAP + (front !== null && (a === front || a + 1 === front) ? BREATH : 0)); };
      var xs = feet.map(function () { return 0; });
      if (carousel) {
        var c = clampN(front ?? centreIndex, 0, Math.max(0, n - 1));
        xs[c] = width / 2;
        for (var i = c + 1; i < n; i++) xs[i] = xs[i - 1] + (feet[i - 1] + feet[i]) / 2 + gapAfter(i - 1);
        for (var j = c - 1; j >= 0; j--) xs[j] = xs[j + 1] - (feet[j + 1] + feet[j]) / 2 - gapAfter(j);
        return xs;
      }
      var total = 0;
      for (var k = 0; k < n; k++) total += feet[k] + (k < n - 1 ? gapAfter(k) : 0);
      var cursor = (width - total) / 2;
      for (var m2 = 0; m2 < n; m2++) { xs[m2] = cursor + feet[m2] / 2; cursor += feet[m2] + gapAfter(m2); }
      return xs;
    }

    function pendulum(i) { return Math.max(30, tops[i] - pivotY + (items[i]._h * unit) / 2); }

    function reach(i) {
      var e = clampN(s.e[i] ?? 0, 0, 1);
      var half = (items[i]._w * unit * (1 + (LIFT_GROW - 1) * e)) / 2;
      var top = tops[i] - pivotY;
      var bottom = top + items[i]._h * unit;
      var r = (s.sw[i] ?? 0) / DEG;
      var c = Math.cos(r), sn = Math.sin(r);
      return [Math.min(-half * c - top * sn, -half * c - bottom * sn), Math.max(half * c - top * sn, half * c - bottom * sn)];
    }

    function resolveContacts() {
      for (var pass = 0; pass < 3; pass++) {
        for (var i = 0; i < count - 1; i++) {
          var overlap = (s.x[i] ?? 0) + reach(i)[1] - ((s.x[i + 1] ?? 0) + reach(i + 1)[0]) + MARGIN * unit;
          if (overlap <= 0) continue;
          if (i === s.drag) s.x[i + 1] += overlap;
          else if (i + 1 === s.drag) s.x[i] -= overlap;
          else { s.x[i] -= overlap / 2; s.x[i + 1] += overlap / 2; }
          if ((s.vx[i] ?? 0) > (s.vx[i + 1] ?? 0)) {
            var shared = ((s.vx[i] ?? 0) + (s.vx[i + 1] ?? 0)) / 2;
            if (i !== s.drag) s.vx[i] = shared;
            if (i + 1 !== s.drag) s.vx[i + 1] = shared;
          }
        }
      }
      if (!carousel && count > 0) {
        var lo = 6, hi = width - 6;
        var l0 = reach(0)[0];
        if ((s.x[0] ?? 0) + l0 < lo) { s.x[0] = lo - l0; s.vx[0] = Math.abs(s.vx[0] ?? 0) * 0.3; }
        for (var a = 0; a < count - 1; a++) {
          var min = (s.x[a] ?? 0) + reach(a)[1] - reach(a + 1)[0] + MARGIN * unit;
          if ((s.x[a + 1] ?? 0) < min) s.x[a + 1] = min;
        }
        var rn = reach(count - 1)[1];
        if ((s.x[count - 1] ?? 0) + rn > hi) { s.x[count - 1] = hi - rn; s.vx[count - 1] = -Math.abs(s.vx[count - 1] ?? 0) * 0.3; }
        for (var b = count - 2; b >= 0; b--) {
          var max = (s.x[b + 1] ?? 0) + reach(b + 1)[0] - reach(b)[1] - MARGIN * unit;
          if ((s.x[b] ?? 0) > max) s.x[b] = max;
        }
      }
    }

    function paint(i) {
      var item = items[i];
      var w = item._w * unit;
      var x = s.x[i] ?? 0;
      var theta = s.sw[i] ?? 0;
      var e = clampN(s.e[i] ?? 0, 0, 1.2);
      var lit = clampN(e, 0, 1);
      var hang = refs.hang[i];
      if (hang) hang.style.transform = "translate3d(" + (x - w / 2).toFixed(2) + "px,0,0)";
      var swing = refs.swing[i];
      if (swing) swing.style.transform = "rotate(" + theta.toFixed(3) + "deg)";
      var tilt = refs.tilt[i];
      if (tilt) tilt.style.transform = "perspective(1200px) translateZ(" + (LIFT_Z * e).toFixed(2) + "px) rotateX(" + (TILT_X * e).toFixed(3) + "deg) scale(" + (1 + LIFT_SCALE * e).toFixed(4) + ")";
      var light = refs.light[i];
      if (light) light.style.opacity = lit.toFixed(3);
      var wash = refs.wash[i];
      if (wash) wash.style.opacity = lit.toFixed(3);
      var shadow = refs.shadow[i];
      if (shadow) {
        shadow.style.transform = "translate3d(0," + (unit * 0.04 + 10 * e).toFixed(2) + "px,0) scale(" + (1 + 0.035 * e).toFixed(4) + "," + (1 + 0.07 * e).toFixed(4) + ")";
        shadow.style.opacity = (1 - 0.3 * lit).toFixed(3);
      }
      var others = 0;
      for (var k = 0; k < count; k++) if (k !== i) others = Math.max(others, s.e[k] ?? 0);
      var dim = refs.dim[i];
      if (dim) dim.style.opacity = (0.08 * clampN(others, 0, 1) * (1 - lit)).toFixed(4);
      var label = hang && hang.querySelector("[data-label]");
      if (label) label.classList.toggle("is-lit", lit > 0.5);
    }

    function step(now) {
      var dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 60;
      s.last = now;
      var sub = Math.max(3, Math.ceil(dt / 0.0115));
      var h = dt / sub;
      var restoring = now > s.free;
      for (var k = 0; k < sub; k++) {
        for (var i = 0; i < count; i++) {
          if (i !== s.drag) {
            var stiff = restoring ? 130 : 0;
            var damp = restoring ? 2 * Math.sqrt(130) * 0.86 : 3.2;
            var ax = -stiff * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) - damp * (s.vx[i] ?? 0);
            s.vx[i] = (s.vx[i] ?? 0) + ax * h;
            s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
          }
          var ae = -150 * ((s.e[i] ?? 0) - (s.te[i] ?? 0)) - 2 * Math.sqrt(150) * 0.78 * (s.ve[i] ?? 0);
          s.ve[i] = (s.ve[i] ?? 0) + ae * h;
          s.e[i] = (s.e[i] ?? 0) + (s.ve[i] ?? 0) * h;
          var rest = restTilt(i) * (1 - clampN(s.e[i] ?? 0, 0, 1));
          var as = -(SWING_G / pendulum(i)) * ((s.sw[i] ?? 0) - rest) - SWING_DAMP * (s.vsw[i] ?? 0);
          s.vsw[i] = (s.vsw[i] ?? 0) + as * h;
          s.sw[i] = clampN((s.sw[i] ?? 0) + (s.vsw[i] ?? 0) * h, -SWING_MAX, SWING_MAX);
        }
        resolveContacts();
      }
      var follow = 1 - Math.exp(-dt / 0.035);
      for (var j = 0; j < count; j++) {
        var x = s.x[j] ?? 0;
        var was = s.hv[j] ?? 0;
        var hv = was + ((x - (s.hx[j] ?? x)) / dt - was) * follow;
        s.hx[j] = x;
        s.hv[j] = hv;
        s.vsw[j] = (s.vsw[j] ?? 0) + clampN((hv - was) * (DEG / pendulum(j)) * (j === s.drag ? DRAG_COUPLING : SWING_COUPLING), -40, 40);
      }
      if (s.drag >= 0) s.vx[s.drag] = s.hv[s.drag] ?? 0;
      var busy = s.drag >= 0 || now < s.free;
      for (var m = 0; m < count; m++) {
        paint(m);
        var rest2 = restTilt(m) * (1 - clampN(s.e[m] ?? 0, 0, 1));
        if (
          Math.abs(s.vx[m] ?? 0) > 0.4 ||
          (restoring && Math.abs((s.x[m] ?? 0) - (s.tx[m] ?? 0)) > 0.25) ||
          Math.abs((s.e[m] ?? 0) - (s.te[m] ?? 0)) > 0.002 ||
          Math.abs(s.ve[m] ?? 0) > 0.01 ||
          Math.abs((s.sw[m] ?? 0) - rest2) > 0.02 ||
          Math.abs(s.vsw[m] ?? 0) > 0.05
        ) busy = true;
      }
      if (busy) s.raf = requestAnimationFrame(step);
      else {
        s.raf = 0;
        s.last = 0;
        for (var n = 0; n < count; n++) {
          if (restoring) s.x[n] = s.tx[n] ?? 0;
          s.hx[n] = s.x[n] ?? 0; s.hv[n] = 0;
          s.vx[n] = 0; s.e[n] = s.te[n] ?? 0; s.ve[n] = 0;
          s.sw[n] = restTilt(n) * (1 - (s.e[n] ?? 0)); s.vsw[n] = 0;
          paint(n);
        }
      }
    }

    function kick() {
      if (reduced) {
        for (var i = 0; i < count; i++) {
          s.x[i] = s.tx[i] ?? 0; s.vx[i] = 0; s.hx[i] = s.x[i] ?? 0; s.hv[i] = 0;
          s.e[i] = s.te[i] ?? 0; s.ve[i] = 0;
          s.sw[i] = restTilt(i) * (1 - (s.e[i] ?? 0)); s.vsw[i] = 0;
          paint(i);
        }
        return;
      }
      if (!s.raf) { s.last = 0; s.raf = requestAnimationFrame(step); }
    }

    function impulse(i, amount) {
      if (reduced || i < 0 || i >= count) return;
      s.vsw[i] = (s.vsw[i] ?? 0) + amount;
      kick();
    }

    /* caption + dots */
    function updateCaption() {
      if (current === null) {
        captionTitle.textContent = CAPTION_DEFAULT;
        captionSub.textContent = "";
        return;
      }
      var item = items[current];
      captionTitle.textContent = item.title;
      captionSub.textContent = item.year + (item.tag ? " · " + item.tag : "") + " · Lift to view";
    }

    function updateDots() {
      if (!dotsBox || !carousel) return;
      Array.prototype.forEach.call(dotsBox.children, function (dot, i) {
        if (i === (current ?? centreIndex())) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function centreIndex() { return Math.min(1, Math.max(0, count - 1)); }

    function applyTargets(fresh) {
      var xs = targetsFor(current, centreIndex());
      for (var i = 0; i < count; i++) {
        s.tx[i] = xs[i];
        s.te[i] = i === current ? 1 : 0;
        if (fresh || reduced) {
          s.x[i] = s.tx[i]; s.vx[i] = 0; s.hx[i] = s.x[i]; s.hv[i] = 0;
          s.e[i] = s.te[i]; s.ve[i] = 0;
          s.sw[i] = restTilt(i) * (1 - (s.e[i] ?? 0)); s.vsw[i] = 0;
        }
      }
      for (var j = 0; j < count; j++) paint(j);
      kick();
    }

    function choose(index) {
      if (index === current) return;
      var old = current;
      current = index;
      if (current !== null) {
        impulse(current - 1, NEIGHBOUR_KICK);
        impulse(current + 1, -NEIGHBOUR_KICK);
      }
      if (old !== null) { impulse(old - 1, -NEIGHBOUR_KICK * 0.5); impulse(old + 1, NEIGHBOUR_KICK * 0.5); }
      refs.slot.forEach(function (slot, i) {
        slot.setAttribute("aria-pressed", String(i === current));
        slot.tabIndex = i === (current ?? focusIndex) ? 0 : -1;
      });
      updateCaption();
      updateDots();
      applyTargets(false);
    }

    function stopPlaying() {
      playing = false;
      if (beatTimer) { clearTimeout(beatTimer); beatTimer = 0; }
    }

    /* autoplay: light the prints one by one until the visitor interacts */
    function play() {
      if (reduced || count === 0 || !width) return;
      playing = true;
      beat = performance.now() + 1100;
      beatTimer = setTimeout(function advance() {
        if (!playing) return;
        beat += 2600;
        var from = current ?? (carousel ? centreIndex() : 0);
        choose((from + 1) % count);
        beatTimer = setTimeout(advance, Math.max(0, beat - performance.now()));
      }, 1100);
    }

    /* pointer interaction */
    var pointer = { id: -1, index: -1, x: 0, y: 0, moved: false, kind: "", lastX: 0, lastT: 0, v: 0 };
    var focusIndex = 0;
    var openIndex = null;

    function nearest(clientX, clientY) {
      var box = stage.getBoundingClientRect();
      var x = clientX - box.left;
      var y = clientY - box.top;
      var best = null, distance = Infinity;
      for (var i = 0; i < count; i++) {
        var cx = s.x[i] ?? 0;
        var r = reach(i);
        var bottom = tops[i] + items[i]._h * unit + 30;
        if (x < cx + r[0] - 4 || x > cx + r[1] + 4 || y < railTop - 4 || y > bottom) continue;
        var d = Math.abs(x - cx);
        if (d < distance) { best = i; distance = d; }
      }
      return best;
    }

    stage.addEventListener("pointermove", function (event) {
      if (pointer.id === event.pointerId) {
        var dx = event.clientX - pointer.x;
        if (!pointer.moved && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(event.clientY - pointer.y)) {
          pointer.moved = true;
          stopPlaying();
          try { stage.setPointerCapture(event.pointerId); } catch (err) { /* pane quirk */ }
          if (!carousel && pointer.index >= 0) {
            s.drag = pointer.index;
            s.grab = event.clientX - stage.getBoundingClientRect().left - (s.x[pointer.index] ?? 0);
          }
        }
        if (pointer.moved) {
          var now = event.timeStamp || performance.now();
          var v = (event.clientX - pointer.lastX) / Math.max(1, now - pointer.lastT);
          pointer.v = pointer.v * 0.6 + v * 0.4;
          pointer.lastX = event.clientX;
          pointer.lastT = now;
          if (s.drag >= 0) {
            s.x[s.drag] = event.clientX - stage.getBoundingClientRect().left - s.grab;
            s.free = now + 900;
            kick();
          } else if (carousel) {
            var xs = targetsFor(current, centreIndex());
            for (var i = 0; i < count; i++) s.tx[i] = xs[i] + dx;
            kick();
          }
        }
        return;
      }
      if (event.pointerType !== "mouse" || carousel || openIndex !== null) return;
      var hit = nearest(event.clientX, event.clientY);
      if (hit !== null) { stopPlaying(); choose(hit); }
    });

    stage.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      stopPlaying();
      var hit = nearest(event.clientX, event.clientY);
      pointer = {
        id: event.pointerId, index: hit ?? -1, x: event.clientX, y: event.clientY,
        moved: false, kind: event.pointerType, lastX: event.clientX, lastT: event.timeStamp || performance.now(), v: 0
      };
    });

    function finishPointer(event, cancelled) {
      if (pointer.id !== event.pointerId) return;
      var wasMoved = pointer.moved;
      var kind = pointer.kind;
      var index = pointer.index;
      var dx = event.clientX - pointer.x;
      pointer.id = -1;
      try { if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId); } catch (err) { /* noop */ }
      if (s.drag >= 0) {
        var idle = (event.timeStamp || performance.now()) - pointer.lastT;
        s.vx[s.drag] = idle < 140 ? pointer.v * 1000 * (1 - idle / 140) : 0;
        s.drag = -1;
        s.free = performance.now() + 700;
        kick();
        return;
      }
      if (wasMoved && carousel) {
        var from = current ?? centreIndex();
        var stepD = Math.abs(dx) > 40 || Math.abs(pointer.v) > 0.45 ? (dx < 0 ? 1 : -1) : 0;
        var next = clampN(from + stepD, 0, count - 1);
        choose(next);
        return;
      }
      if (cancelled || wasMoved || index < 0) return;
      if (kind !== "mouse" && current !== index) { choose(index); return; }
      openFrame(index);
    }

    stage.addEventListener("pointerup", function (event) { finishPointer(event, false); });
    stage.addEventListener("pointercancel", function (event) { finishPointer(event, true); });

    stage.addEventListener("pointerleave", function (event) {
      if (event.pointerType !== "mouse" || pointer.id >= 0 || carousel) return;
      if (openIndex === null && !stage.contains(document.activeElement)) choose(null);
    });

    /* keyboard */
    stage.addEventListener("keydown", function (event) {
      var keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      stopPlaying();
      var from = current ?? focusIndex;
      var next = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : clampN(from + (event.key === "ArrowRight" ? 1 : -1), 0, count - 1);
      focusIndex = next;
      choose(next);
      refs.slot[next].focus({ preventScroll: true });
    });

    /* dots */
    if (dotsBox) {
      items.forEach(function (item, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", item.title);
        dot.addEventListener("click", function () { stopPlaying(); choose(i); });
        dotsBox.appendChild(dot);
      });
    }

    /* measure & build */
    function measure(fresh) {
      var next = stage.clientWidth;
      if (Math.abs(width - next) < 0.5 && !fresh) return;
      width = next;
      layoutFor();
      buildFrames();
      stage.style.height = stageH + "px";
      stage.dataset.mode = carousel ? "carousel" : "rail";
      if (dotsBox) dotsBox.hidden = !carousel || count < 2;
      applyTargets(true);
      updateDots();
    }

    measure(true);
    if ("ResizeObserver" in window) {
      var ro = new ResizeObserver(function () { measure(false); });
      ro.observe(stage);
    }
    window.addEventListener("resize", function () { measure(false); });

    /* first scene: a light brush along the rail */
    if (!reduced) {
      for (var bi = 0; bi < count; bi++) {
        (function (i) {
          setTimeout(function () { impulse(i, 18 - i * 1.2); }, 900 + i * 60);
        })(bi);
      }
    }
    play();

    /* ---------- lifted-frame dialog ---------- */
    var dialogBackdrop = dialog.querySelector(".dialog-backdrop");
    var dialogClose = dialog.querySelector(".dialog-close");
    var figureBox = dialog.querySelector("[data-dialog-figure]");
    var spinBox = dialog.querySelector("[data-dialog-spin]");
    var frontBox = dialog.querySelector("[data-dialog-front]");
    var backBox = dialog.querySelector("[data-dialog-back]");
    var infoBox = dialog.querySelector("[data-dialog-info]");
    var spin = { angle: 0, dragging: false, startX: 0, startAngle: 0 };
    var returnFocus = -1;


    function fitUnit(item) {
      var wide = window.innerWidth >= 768;
      var maxW = wide ? Math.min(520, window.innerWidth * 0.46) : window.innerWidth * 0.78;
      var maxH = wide ? Math.min(500, window.innerHeight * 0.64) : window.innerHeight * 0.4;
      return Math.max(80, Math.min(maxW / item._w, maxH / item._h));
    }

    function frameBackHTML(item, u) {
      var lines = item.stack.map(function (line) { return "<li>" + line + "</li>"; }).join("");
      return '<div class="back-kraft"><div class="back-inner">' +
        '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style="position:absolute;inset:0;opacity:0.5"><path d="M20,30 Q50,42 80,30" fill="none" stroke="rgba(31,27,22,0.4)" stroke-width="0.8"/></svg>' +
        '<div class="back-label">' +
        '<p class="eyebrow-mini">Project label</p>' +
        '<p class="label-title">' + item.title + "</p>" +
        "<p>" + item.year + "</p>" +
        '<ul class="label-lines" role="list">' + lines + "</ul>" +
        '<svg class="squiggle" viewBox="0 0 120 26" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M3,18 C10,4 14,4 13,14 C12,22 18,20 22,12 C25,6 27,8 26,15 C30,10 34,9 35,15 C37,21 43,6 48,9 C52,12 47,20 54,17 C60,14 63,7 66,12 C69,18 74,14 79,11 C84,8 88,16 94,13 C100,10 106,11 116,8"/></svg>' +
        "</div></div></div>";
    }

    function setSpin(angle, animate) {
      spin.angle = angle;
      spinBox.style.transition = animate && !reduced ? "transform 620ms cubic-bezier(0.22, 0.85, 0.3, 1)" : "none";
      spinBox.style.transform = "rotateY(" + angle + "deg)";
    }

    function turnTo(face) {
      var base = Math.round(spin.angle / 360) * 360;
      var target = base + (face === "back" ? 180 : 0);
      if (Math.abs(target - spin.angle) > 180) target -= 360 * Math.sign(target - spin.angle);
      setSpin(target, true);
      var backBtn = infoBox.querySelector('[data-flip="back"]');
      var frontBtn = infoBox.querySelector('[data-flip="front"]');
      if (frontBtn) frontBtn.setAttribute("aria-pressed", String(face === "front"));
      if (backBtn) backBtn.setAttribute("aria-pressed", String(face === "back"));
    }

    function openFrame(index) {
      if (openIndex !== null) return;
      stopPlaying();
      openIndex = index;
      returnFocus = index;
      var item = items[index];
      var u = fitUnit(item);
      var w = item._w * u;
      var h = item._h * u;

      figureBox.style.width = w + "px";
      figureBox.style.height = h + "px";
      frontBox.innerHTML = '<div class="frame-art fs-' + item.frame + '" style="position:absolute;inset:0">' + frameArtHTML(item, u, 0.85) + "</div>";
      backBox.innerHTML = frameBackHTML(item, u);
      infoBox.innerHTML =
        '<p class="dialog-index">' + String(index + 1).padStart(2, "0") + " / " + String(count).padStart(2, "0") + "</p>" +
        "<h3>" + item.title + "</h3>" +
        '<p class="dialog-year">' + item.year + (item.tag ? " · " + item.tag : "") + "</p>" +
        '<p class="dialog-desc">' + item.desc + "</p>" +
        '<ul class="dialog-chips" role="list">' + item.stack.map(function (chip) { return "<li>" + chip + "</li>"; }).join("") + "</ul>" +
        '<div class="flip-group" role="group" aria-label="Front or back of the frame">' +
        '<button type="button" data-flip="front" aria-pressed="true">Front</button>' +
        '<button type="button" data-flip="back" aria-pressed="false">Back</button>' +
        "</div>" +
        '<a class="btn btn-ink dialog-link" href="' + item.href + '" target="_blank" rel="noopener">Open on GitHub <span aria-hidden="true">&#8599;</span></a>';

      if (refs.hang[index]) refs.hang[index].style.visibility = "hidden";

      dialog.hidden = false;
      requestAnimationFrame(function () { dialog.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      setSpin(0, false);
      infoBox.querySelectorAll("[data-flip]").forEach(function (btn) {
        btn.addEventListener("click", function () { turnTo(btn.dataset.flip === "back" ? "back" : "front"); });
      });
      dialogClose.focus({ preventScroll: true });

      if (!reduced) {
        var slotRect = refs.slot[index].getBoundingClientRect();
        var to = figureBox.getBoundingClientRect();
        var scale = slotRect.width / to.width;
        var dx2 = slotRect.left + slotRect.width / 2 - (to.left + to.width / 2);
        var dy2 = slotRect.top + slotRect.height / 2 - (to.top + to.height / 2);
        var lift = Math.min(90, Math.abs(dy2) * 0.25 + 30);
        var anim = figureBox.animate(
          [
            { transform: "translate(" + dx2 + "px," + dy2 + "px) scale(" + scale + ")" },
            { transform: "translate(" + dx2 * 0.4 + "px," + (dy2 * 0.4 - lift) + "px) scale(" + ((scale + 1) / 2) * 1.03 + ")", offset: 0.5 },
            { transform: "none" }
          ],
          { duration: 680, easing: "cubic-bezier(.22,.85,.3,1)" }
        );
        anim.addEventListener("finish", function () { figureBox.style.transform = ""; });
      }
    }

    function closeFrame() {
      if (openIndex === null) return;
      var index = openIndex;
      openIndex = null;
      dialog.classList.remove("is-open");
      document.body.style.overflow = "";
      dialog.hidden = true;
      if (refs.hang[index]) {
        refs.hang[index].style.visibility = "";
        impulse(index, index % 2 ? 22 : -22);
      }
      if (returnFocus >= 0 && refs.slot[returnFocus]) refs.slot[returnFocus].focus({ preventScroll: true });
    }

    dialogClose.addEventListener("click", closeFrame);
    dialogBackdrop.addEventListener("click", closeFrame);

    document.addEventListener("keydown", function (event) {
      if (openIndex === null) return;
      if (event.key === "Escape") { event.preventDefault(); closeFrame(); }
      else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        var facing = ((spin.angle % 360) + 360) % 360;
        turnTo(facing > 90 && facing < 270 ? "front" : "back");
      }
    });

    /* drag the dialog frame to flip it */
    var spinArea = document.createElement("div");
    spinArea.className = "dialog-spin-area";
    figureBox.insertBefore(spinArea, spinBox);
    spinArea.addEventListener("pointerdown", function (event) {
      spin.dragging = true;
      spin.startX = event.clientX;
      spin.startAngle = spin.angle;
      spinArea.style.transition = "none";
      try { spinArea.setPointerCapture(event.pointerId); } catch (err) { /* noop */ }
    });
    spinArea.addEventListener("pointermove", function (event) {
      if (!spin.dragging) return;
      setSpin(clampN(spin.startAngle + (event.clientX - spin.startX) * 0.45, spin.startAngle - 220, spin.startAngle + 220), false);
    });
    spinArea.addEventListener("pointerup", function () {
      if (!spin.dragging) return;
      spin.dragging = false;
      var facing = ((spin.angle % 360) + 360) % 360;
      turnTo(facing > 90 && facing < 270 ? "back" : "front");
    });
    spinArea.addEventListener("pointercancel", function () { spin.dragging = false; });
  }

  initGallery();

  /* ---------- contact extras: dated head + subject quick-chips ---------- */

  Array.prototype.forEach.call(document.querySelectorAll("[data-letter-date]"), function (node) {
    var today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
    node.textContent = "\u2116 01 · " + today;
  });

  Array.prototype.forEach.call(document.querySelectorAll(".subject-chips button"), function (chip) {
    chip.addEventListener("click", function () {
      var input = document.getElementById("cf-subject");
      if (!input) return;
      input.value = chip.getAttribute("data-subject");

      Array.prototype.forEach.call(chip.parentElement.children, function (sibling) {
        if (sibling === chip) sibling.setAttribute("aria-pressed", "true");
        else sibling.removeAttribute("aria-pressed");
      });

      input.focus({ preventScroll: false });
      var status2 = document.getElementById("form-status");
      if (status2) status2.textContent = "Subject set — add a line and send.";
    });
  });

  /* ---------- contact form (composes a mailto) ---------- */

  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var subjectInput = document.getElementById("cf-subject");

  if (subjectInput) {
    subjectInput.addEventListener("input", function () {
      Array.prototype.forEach.call(
        document.querySelectorAll(".subject-chips button[aria-pressed]"),
        function (chip) { chip.removeAttribute("aria-pressed"); }
      );
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var subject = String(data.get("subject") || "").trim();
    var message = String(data.get("message") || "").trim();

    // the required fields are real: never open an empty mail
    var missing = [];
    Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (field) {
      var empty = !String(field.value || "").trim();
      field.setAttribute("aria-invalid", empty ? "true" : "false");
      if (empty) missing.push(field);
    });

    if (status) {
      if (missing.length) {
        var label = function (field) {
          var f = field.closest(".field");
          return f && f.querySelector("label")
            ? f.querySelector("label").textContent.toLowerCase()
            : "details";
        };
        status.textContent = missing.length === 1
          ? "Add your " + label(missing[0]) + " — then send."
          : "Add your name, email and message — then send.";
        missing[0].focus();
        return;
      }
    }

    var body = message + "\n\n— " + name + (email ? " (" + email + ")" : "");

    window.location.href =
      "mailto:tanishjaswal56@gmail.com" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    if (status) status.textContent = "Opening your mail app…";
  });

  // clear the invalid flag as soon as the field gets content
  Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (field) {
    field.addEventListener("input", function () {
      if (String(field.value || "").trim()) field.removeAttribute("aria-invalid");
    });
  });
})();
