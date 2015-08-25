var NUM_WALKERS = 50;
var TIMES_PER_FRAME = 4;

var palette = [];
for (var i = 0; i < 3; i++) {
  var r = Math.floor(235 * Math.random());
  var g = Math.floor(235 * Math.random());
  var b = Math.floor(235 * Math.random());
  palette.push('rgba(' + r + ',' + g + ',' + b + ', ' + 1 + ')');
  // palette.push('rgba(' + g + ',' + b + ',' + r + ', ' + 1 + ')');
  // palette.push('rgba(' + b + ',' + r + ',' + g + ', ' + 1 + ')');
  palette.push('rgba(' + (r + 20) + ',' + (g + 20) + ',' + (b + 20) + ', ' + 1 + ')');
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
    size: 5 + Math.pow(Math.random(), 10) * 20,
    dsize: 0.97 + 0.025 * Math.random()
  };
  walkers.push(walker);
}

function walk(w) {
  w.size *= w.dsize;

  if (w.size <= 0.5) {
    return;
  }
  w.speed = w.size / 2;

  if (mousedown) {
    w.size *= 1.05;
    w.size = Math.min(w.size, 10);
  }

  if (Math.random() < 0.1) {
    w.ddirection = -w.ddirection;
  }

  var ddirection = w.ddirection

  if (mousecoords) {
    ddirection *= 1 * (1 - Math.abs(mousecoords.x / (canvas.width / 2) - 1));
    w.speed *= 0.25 + 0.75 * (1 - Math.abs(mousecoords.y / (canvas.height / 2) - 1));
    // w.y += (mousecoords.y) * 0.001;
    //
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

function drawWalker(w) {
  ctx.fillStyle = w.color;
  var x = w.x,
    y = w.y;

  ctx.beginPath();
  ctx.arc(
    x,
    y,
    w.size, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    x,
    canvas.height - y,
    w.size, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    canvas.width - x,
    y,
    w.size, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    canvas.width - x,
    canvas.height - y,
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
  for (var i = 0; i < TIMES_PER_FRAME; i++) {
    update();
    draw();
  }
  requestAnimationFrame(tick);
}

function init() {
  resize();
  for (var i = 0; i < NUM_WALKERS; i++) {
    createWalker(true);
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
