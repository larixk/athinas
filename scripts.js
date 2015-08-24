var NUM_WALKERS = 50;

var canvas = document.querySelector('#canvas');

function resize() {
  canvas.height = window.innerHeight - 20;
  canvas.width = window.innerWidth - 20;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
var ctx = canvas.getContext("2d");

resize();

var walkers = [];
var survivors = [];

var whiteline;

function createWhiteline() {
  console.log("WHITE LINES");
  whiteline = {
    x: canvas.width,
    y: Math.random() * canvas.height,
    dx: -Math.random() * 4,
    dy: (Math.random() - 0.5) * 2,
    size: 20,
    color: 'white'
  };
}
// createWhiteline();

function createWalker(randomPos) {
  randomPos = true;
  var color = sample(palette);
  var walker = {
    x: randomPos ? canvas.width * Math.random() : canvas.width * 0.5,
    y: randomPos ? canvas.height * Math.random() : canvas.height * 0.5,
    direction: Math.random() * Math.PI * 2,
    ddirection: (Math.random() - 0.5) / 2,
    // maxddirection: Math.random() / 10,
    color: color,
    speed: Math.random() * 10,
    size: Math.pow(Math.random(), 10) * 5,
    dsize: 0
  };
  walkers.push(walker);
}

function walk(w) {
  // w.dsize += (Math.random() - 0.5);
  // w.dsize = Math.max(-0.1, Math.min(0.1, w.dsize));
  // w.size += w.dsize;
  // w.size = Math.max(0, Math.min(10, w.size));

  // w.size =  4* (1 - Math.abs(0.5 - (w.x / canvas.width)) * 2);

  w.speed = w.size;
  w.size *= 0.995;

  if (w.size <= 0.5) {
    return;
  }

  if (mousedown) {
    w.speed = 5;
  }
  // w.ddirection += (Math.random() - 0.5) * 0.05;
  // w.ddirection = Math.max(-w.maxddirection, Math.min(w.maxddirection, w.ddirection));
  //
  if (Math.random() < 0.02) {
    // w.ddirection = (Math.random() - 0.5) / 2;
    w.ddirection = -w.ddirection;
  }
  w.direction += w.ddirection;

  var dx = Math.cos(w.direction) * w.speed;
  var dy = Math.sin(w.direction) * w.speed;

  w.x += dx;
  w.y += dy;

  survivors.push(w);
}

function drawWalker(w) {
  ctx.fillStyle = w.color;
  var halfWidth = canvas.width / 2;
  var halfHeight = canvas.height / 2;
  var x = w.x,
    y = w.y;

  if (mousecoords) {
    x += (mousecoords.x) * 0.5;
    y += (mousecoords.y) * 0.5;
  }

  // ctx.beginPath();
  // ctx.arc(halfWidth - x, halfHeight - y, w.size, 0, 2 * Math.PI);
  // ctx.fill();
  // ctx.arc(halfWidth + x - w.size, halfHeight - y, w.size, 0, 2 * Math.PI);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.arc(halfWidth - x, halfHeight + y - w.size, w.size, 0, 2 * Math.PI);
  // ctx.fill();
  // ctx.beginPath();
  // ctx.arc(halfWidth + x - w.size, halfHeight + y - w.size, w.size, 0, 2 * Math.PI);
  // ctx.fill();

  ctx.beginPath();
  ctx.arc(
    x,
    y,
    w.size, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    x,
    canvas.height - y - w.size,
    w.size, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    canvas.width - x - w.size,
    y,
    w.size, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    canvas.width - x - w.size,
    canvas.height - y - w.size,
    w.size, 0, 2 * Math.PI);
  ctx.fill();

}

function update() {
  survivors = [];
  walkers.forEach(walk);

  var casualties = walkers.length - survivors.length;
  walkers = survivors;

  for (var i = 0; i < casualties; i++) {
    createWalker(true);
  }

  // updateWhiteline();
}

function updateWhiteline() {
  whiteline.x += whiteline.dx;
  whiteline.y += whiteline.dy;

  if (whiteline.x < 0 || whiteline.x > canvas.width) {
    createWhiteline();
    return;
  }
  if (whiteline.y < 0 || whiteline.y > canvas.height) {
    createWhiteline();
    return;
  }
}

function drawWhiteline() {
  drawWalker(whiteline);
}

function draw() {
  walkers.forEach(drawWalker);
  // drawWhiteline();
}

function tick() {
  // canvas.width = canvas.width;
  // ctx.fillStyle = 'rgba(255,255,255,0.1)';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  var TIMES_PER_FRAME = 10;
  for (var i = 0; i < TIMES_PER_FRAME; i++) {
    update();
    draw();
  }
  requestAnimationFrame(tick);
}

function init() {
  for (var i = 0; i < NUM_WALKERS; i++) {
    createWalker();
  }
  tick();
}

init();

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
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
