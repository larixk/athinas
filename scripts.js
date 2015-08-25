var NUM_WALKERS = 80;
var TIMES_PER_FRAME = 1;

var paletteSize = 2;
var colorVariance = 30;
var colorVarianceCount = 12;
var paletteInterval = 9000;
var opacity = 0.8;
var monochrome = false;

var growFromCenter = false;

var walkersPerPixel = 1 / 10000;

var circleMargin = 125;
var LIFE_MARGIN = 0;

var palette, backgroundColor;

var canvas = document.querySelector('#canvas');

var ctx = canvas.getContext("2d");

var walkers = [];
var survivors = [];

init();

function resize() {
  canvas.height = window.innerHeight - 20;
  canvas.width = window.innerWidth - 20;
  NUM_WALKERS = canvas.width * canvas.height * walkersPerPixel;

  ctx.beginPath();
  ctx.arc(
    canvas.width / 2,
    canvas.height / 2,
    (Math.min(canvas.height, canvas.width) / 2) - circleMargin, 0, 2 * Math.PI);
  ctx.clip();

  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function createPalette() {
  backgroundColor = "#eee";
  palette = [];
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
      var currentVariance = 1 + (colorVariance - 1) * (cv / colorVarianceCount);
      palette.push('rgba(' + Math.floor(r * currentVariance) + ',' + Math.floor(g * currentVariance) + ',' + Math.floor(b * currentVariance) + ', ' + opacity + ')');
    }
  }
}

function createWalker(randomPos) {
  randomPos = !growFromCenter;
  var color = sample(palette);
  var walker = {
    x: randomPos ? canvas.width * Math.random() : canvas.width * 0.5,
    y: randomPos ? canvas.height * Math.random() : canvas.height * 0.5,
    direction: Math.random() * Math.PI * 2,
    ddirection: (Math.random() - 0.5) / 2,
    color: color,
    size: 3 + Math.pow(Math.random(), 3) * 20,
    dsize: 0.91 + 0.08 * Math.pow(Math.random(), 4),
    force: 0.5 + 0.5 * Math.random(),
    symmetrical: 2
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
    w.size *= 1.05;
    w.size = Math.min(w.size, 10);
  }

  if (Math.random() < 0.1) {
    w.ddirection = -w.ddirection;
  }

  var ddirection = w.ddirection;

  if (mousecoords) {
    ddirection *= 1 * (1 - Math.abs(mousecoords.x / (canvas.width / 2) - 1));
  }

  w.direction += ddirection;

  var dx = Math.cos(w.direction) * w.speed;
  var dy = Math.sin(w.direction) * w.speed;

  w.x += dx;
  w.y += dy;

  if (w.x < -LIFE_MARGIN || w.x > canvas.width + LIFE_MARGIN) {
    return;
  }
  if (w.y < -LIFE_MARGIN || w.y > canvas.height + LIFE_MARGIN) {
    return;
  }

  survivors.push(w);
}

function drawWalker(w) {
  function drawCircle(x,y,size) {
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      size, 0, 2 * Math.PI);
    ctx.fill();

  }
  ctx.fillStyle = w.color;
  var x = w.x,
    y = w.y;
  drawCircle(x,y,w.size);

  if (w.symmetrical < 1) {
    return;
  }
  drawCircle(canvas.width - x,y,w.size);
  if (w.symmetrical < 2) {
    return;
  }

  drawCircle(x,canvas.height - y,w.size);
  drawCircle(canvas.width - x,canvas.height - y,w.size);

}

function update() {
  survivors = [];
  walkers.forEach(walk);

  var casualties = walkers.length - survivors.length;
  walkers = survivors;

  for (var i = 0; i < casualties; i++) {
    createWalker(true);
  }
}

function draw() {
  walkers.forEach(drawWalker);
}

function postProcess() {
  var scale = 0;
  var rotate = 0;
  var translateY = 0;
  var fade = mousecoords ? (3* (-0.75 + 1 * (1 - Math.abs(mousecoords.y / (canvas.height / 2) - 1)))) : 0;

  if (fade > 0) {
    ctx.fillStyle = 'rgba(245,245,245, ' + fade + ')';
    ctx.fillRect(0,0, canvas.width, canvas.height);
  }

  if (scale === 0 && rotate === 0 & translateY === 0) {
    return;
  }
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotate);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  ctx.drawImage(canvas, -0.5 * scale, -0.5 * scale + translateY,canvas.width + scale,canvas.height + scale);
  ctx.restore();
}

function tick() {
  for (var i = 0; i < TIMES_PER_FRAME; i++) {
    update();
    draw();
  }

  postProcess();

  requestAnimationFrame(tick);
}

function init() {
  createPalette();
  resize();
  for (var i = 0; i < NUM_WALKERS; i++) {
    createWalker(true);
  }
  tick();
  setInterval(createPalette, paletteInterval);
}


function sample(array) {
  var index = Math.floor(Math.random() * array.length);
  return array[index];
}

var mousedown, mousecoords;
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
window.addEventListener('resize', function(event) {
  resize();
});


// var mask = document.querySelector("#mask");
// mask.width = canvas.width;
// mask.height = canvas.height;
// var maskCtx = mask.getContext("2d");

//     maskCtx.beginPath();
//     maskCtx.arc(
//       0,
//       0,
//       canvas.width, 0, 2 * Math.PI);
//     maskCtx.fill();
