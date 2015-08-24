var NUM_WALKERS = 50;

var palette = [];
for (var i = 0; i < 255; i++) {
  palette.push('rgba(' + i + ',' + i + ',' + i + ', 1)');
}

var canvas = document.querySelector('#canvas');

var ctx = canvas.getContext("2d");

var walkers = [];
var survivors = [];

init();

function resize() {
  canvas.height = window.innerHeight - 20;
  canvas.width = window.innerWidth - 20;

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function createWalker(randomPos) {
  var color = sample(palette);
  var walker = {
    x: randomPos ? canvas.width * Math.random() : canvas.width * 0.5,
    y: randomPos ? canvas.height * Math.random() : canvas.height * 0.5,
    direction: Math.random() * Math.PI * 2,
    ddirection: (Math.random() - 0.5) / 2,
    color: color,
    size: Math.pow(Math.random(), 10) * 5,
  };
  walkers.push(walker);
}

function walk(w) {
  w.speed = w.size;
  w.size *= 0.995;

  if (w.size <= 0.5) {
    return;
  }

  if (mousedown) {
    w.speed = 5;
  }

  if (Math.random() < 0.02) {
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
    x += (mousecoords.x) * 0.1;
    y += (mousecoords.y) * 0.1;
  }

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
}

function draw() {
  walkers.forEach(drawWalker);
}

function tick() {
  var TIMES_PER_FRAME = 10;
  for (var i = 0; i < TIMES_PER_FRAME; i++) {
    update();
    draw();
  }
  requestAnimationFrame(tick);
}

function init() {
  resize();
  for (var i = 0; i < NUM_WALKERS; i++) {
    createWalker();
  }
  tick();
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
