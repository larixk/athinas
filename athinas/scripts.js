(function() {
  'use strict';

  var PALETTE_SIZE = 2;
  var COLOR_VARIANCE = 15;
  var COLOR_VARIANCE_COUNT = 5;
  var PALETTE_INTERVAL = 24000;
  var BRUSH_OPACITY = 0.75;
  var MONOCHROME = false;

  var GROW_FROM_CENTER = false;

  var WALKERS_PER_PIXEL = 1 / 20000;

  var palette;
  var backgroundColor;

  var canvas = document.querySelector('#canvas');
  var ctx = canvas.getContext('2d');
  var needsResizing = true;

  var scale = window.devicePixelRatio || 1;

  var numWalkers;
  var walkers = [];
  var survivors = [];

  var floor = Math.floor;
  var rand = Math.random;
  var TWO_PI = Math.PI * 2;

  function createPalette() {
    backgroundColor = 'rgba(245,245,245,1)';
    palette = [];
    palette.push('rgba(245,245,245,' + BRUSH_OPACITY + ')');

    for (var i = 0; i < PALETTE_SIZE; i++) {
      var maxValue = 255;

      if (COLOR_VARIANCE > 1) {
        maxValue /= COLOR_VARIANCE;
      }

      var r = floor(maxValue * rand());
      var g = floor(maxValue * rand());
      var b = floor(maxValue * rand());

      if (MONOCHROME) {
        r = g = b;
      }

      for (var cv = 0; cv < COLOR_VARIANCE_COUNT; cv++) {
        var currentV = 1 + (COLOR_VARIANCE - 1) * (cv / COLOR_VARIANCE_COUNT);
        var currentR = floor(r * currentV);
        var currentG = floor(g * currentV);
        var currentB = floor(b * currentV);
        palette.push('rgba(' + currentR + ',' + currentG + ',' + currentB + ', ' + BRUSH_OPACITY + ')');
      }
    }
  }

  function resize() {
    needsResizing = false;

    var hasCircle = window.innerWidth > 640;
    var size;
    if (hasCircle) {
      size = Math.min(window.innerWidth, window.innerHeight) - 20;
      size *= scale;
      canvas.height = size;
      canvas.width = size;
      canvas.style.width = size / scale + 'px';
      canvas.style.height = size / scale + 'px';
    } else {
      canvas.width = window.innerWidth * scale - 20;
      canvas.height = window.innerHeight * scale - 20;
    }

    numWalkers = canvas.height * canvas.width * WALKERS_PER_PIXEL;

    if (!hasCircle) {
      return;
    }

    var circleMargin = Math.max(40, size / 16);

    ctx.beginPath();
    ctx.arc(
      size / 2,
      size / 2,
      size / 2 - circleMargin,
      0, TWO_PI);
    ctx.clip();

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
  }

  function cloneWalker(walker) {
    if (!walker) {
      return;
    }
    var newWalker = JSON.parse(JSON.stringify(walker));
    walkers.push(newWalker);
    return newWalker;
  }

  function createWalker() {
    var randomPos = !GROW_FROM_CENTER;

    var paletteIndex = floor(rand() * palette.length);
    var color = palette[paletteIndex];
    var size = 5 + Math.pow(rand(), 3) * 30;

    if (paletteIndex === 0) {
      size *= 2;
    }
    if (mousedown) {
      size = 1;
    }

    var walker = {
      x: randomPos ? canvas.width * rand() : canvas.width * 0.5,
      y: randomPos ? canvas.height * rand() : canvas.height * 0.5,
      direction: rand() * TWO_PI,
      ddirection: (rand() - 0.5) / 2,
      color: color,
      size: size,
      dsize: 0.91 + 0.08 * Math.pow(rand(), 4),
      force: 0.5 + 0.5 * rand(),
      symmetrical: 1 + rand() * 4
    };
    walkers.push(walker);
  }

  function walk(w) {
    w.size *= w.dsize;

    if (w.size <= 0.5) {
      return;
    }
    w.speed = 1 + w.size / 2;
    w.speed *= w.force;

    if (mousedown) {
      w.size *= 1.5;
      w.size = Math.min(w.size, 10);
    }

    if (rand() < 0.1) {
      w.ddirection = -w.ddirection;
    }

    var ddirection = w.ddirection;

    if (mousecoords) {
      ddirection *= 1 * (1 - Math.abs(mousecoords.x / (window.innerWidth / 2) - 1));
    }

    w.direction += ddirection;

    var dx = Math.cos(w.direction) * w.speed;
    var dy = Math.sin(w.direction) * w.speed;

    w.x += dx;
    w.y += dy;

    if (w.x < 0 || w.x > canvas.width) {
      return;
    }
    if (w.y < 0 || w.y > canvas.height) {
      return;
    }

    survivors.push(w);
  }

  function drawCircle(x, y, size) {
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      size, 0, TWO_PI);
    ctx.fill();
  }

  function drawWalker(w) {
    ctx.fillStyle = w.color;
    var x = w.x;
    var y = w.y;
    drawCircle(x, y, w.size);

    if (w.symmetrical < 1) {
      return;
    }
    drawCircle(canvas.width - x, y, w.size);

    if (w.symmetrical < 2) {
      return;
    }

    drawCircle(x, canvas.height - y, w.size);
    drawCircle(canvas.width - x, canvas.height - y, w.size);
  }

  function update() {
    survivors = [];
    walkers.forEach(walk);

    var casualties = numWalkers - survivors.length;
    walkers = survivors;

    for (var i = 0; i < casualties; i++) {
      if (rand() < 0.5) {
        createWalker(true);
        continue;
      }
      var walker = cloneWalker(walkers[floor(rand() * walkers.length)]);
      if (!walker) {
        createWalker(true);
        continue;
      }
      walker.direction += TWO_PI * (rand() - 0.5);
      walker.size *= rand();
    }
  }

  function draw() {
    walkers.forEach(drawWalker);
  }

  function postProcess() {
    var fade = mousecoords ? (3 * (-0.75 + 1 * (1 - Math.abs(mousecoords.y / (window.innerHeight / 2) - 1)))) : 0;

    if (fade > 0) {
      ctx.fillStyle = 'rgba(245,245,245, ' + fade + ')';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function tick() {
    if (needsResizing) {
      resize();
    }
    update();
    draw();

    postProcess();

    requestAnimationFrame(tick);
  }

  function init() {
    createPalette();
    resize();
    for (var i = 0; i < numWalkers; i++) {
      createWalker(true);
    }
    tick();
    setInterval(createPalette, PALETTE_INTERVAL);
  }

  init();

  var mousedown;
  var mousecoords;
  var addEventListener = window.addEventListener;
  addEventListener('mousedown', function() {
    mousedown = true;
  });
  addEventListener('mouseup', function() {
    mousedown = false;
  });
  addEventListener('mousemove', function(event) {
    mousecoords = {
      x: event.pageX,
      y: event.pageY
    };
  });
  addEventListener('resize', function() {
    needsResizing = true;
  });
})();
