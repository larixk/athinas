(function() {
  'use strict';
  var numWalkers;

  var paletteSize = 2;
  var colorVariance = 15;
  var colorVarianceCount = 5;
  var paletteInterval = 24000;
  var opacity = 0.75;
  var monochrome = false;

  var growFromCenter = false;

  var walkersPerPixel = 1 / 20000;

  var palette;
  var backgroundColor;

  var canvas = document.querySelector('#canvas');

  var ctx = canvas.getContext('2d');

  var walkers = [];
  var survivors = [];

  function createPalette() {
    backgroundColor = 'rgba(245,245,245,1)';
    palette = [];
    palette.push('rgba(245,245,245,' + opacity + ')');

    for (var i = 0; i < paletteSize; i++) {
      var maxValue = 255;

      if (colorVariance > 1) {
        maxValue /= colorVariance;
      }

      var r = Math.floor(maxValue * Math.random());
      var g = Math.floor(maxValue * Math.random());
      var b = Math.floor(maxValue * Math.random());

      if (monochrome) {
        r = g = b;
      }

      for (var cv = 0; cv < colorVarianceCount; cv++) {
        var currentV = 1 + (colorVariance - 1) * (cv / colorVarianceCount);
        var currentR = Math.floor(r * currentV);
        var currentG = Math.floor(g * currentV);
        var currentB = Math.floor(b * currentV);
        palette.push('rgba(' + currentR + ',' + currentG + ',' + currentB + ', ' + opacity + ')');
      }
    }
  }

  function resize() {
    var size = Math.min(window.innerWidth, window.innerHeight) - 20;
    canvas.height = size;
    canvas.width = size;
    numWalkers = size * size * walkersPerPixel;

    var circleMargin = size / 16;

    ctx.beginPath();
    ctx.arc(
      size / 2,
      size / 2,
      size / 2 - circleMargin,
      0, 2 * Math.PI);
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
    var randomPos = !growFromCenter;

    var paletteIndex = Math.floor(Math.random() * palette.length);
    var color = palette[paletteIndex];
    var size = 5 + Math.pow(Math.random(), 3) * 30;

    if (paletteIndex === 0) {
      size *= 2;
    }
    if (mousedown) {
      size = 1;
    }

    var walker = {
      x: randomPos ? canvas.width * Math.random() : canvas.width * 0.5,
      y: randomPos ? canvas.height * Math.random() : canvas.height * 0.5,
      direction: Math.random() * Math.PI * 2,
      ddirection: (Math.random() - 0.5) / 2,
      color: color,
      size: size,
      dsize: 0.91 + 0.08 * Math.pow(Math.random(), 4),
      force: 0.5 + 0.5 * Math.random(),
      symmetrical: 1 + Math.random() * 4
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

    if (Math.random() < 0.1) {
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
      size, 0, 2 * Math.PI);
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
      if (Math.random() < 0.5) {
        createWalker(true);
        continue;
      }
      var walker = cloneWalker(walkers[Math.floor(Math.random() * walkers.length)]);
      if (!walker) {
        createWalker(true);
        continue;
      }
      walker.direction += Math.PI * 2 * (Math.random() - 0.5);
      walker.size *= Math.random();
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
    setInterval(createPalette, paletteInterval);
  }

  init();

  var mousedown;
  var mousecoords;
  window.addEventListener('mousedown', function() {
    mousedown = true;
  });
  window.addEventListener('mouseup', function() {
    mousedown = false;
  });
  window.addEventListener('mousemove', function(event) {
    mousecoords = {
      x: event.pageX,
      y: event.pageY
    };
  });
  window.addEventListener('resize', function() {
    resize();
  });
})();
