var createShader = require("gl-shader");
var createTexture = require("gl-texture2d");
var Qimage = require("qimage");

var W = 205;
var H = 205;
var VERTEX = "attribute vec2 p; varying vec2 texCoord; void main(){ texCoord = (p+1.)/2.; gl_Position = vec4(p, 0.0, 1.0); }";
var FRAGMENT = "precision highp float; varying vec2 texCoord; uniform sampler2D tex; void main(){ gl_FragColor = texture2D(tex, texCoord); }";

function createWebGLCanvasAndDraw (textureInput, yflip) {
  var canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  var gl = canvas.getContext("webgl");
  var shader = createShader(gl, VERTEX, FRAGMENT);
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0, 1.0,
    -1.0, -1.0, 1.0,
    -1.0,  1.0, 1.0,
    -1.0,  1.0, 1.0]), gl.STATIC_DRAW);
  shader.bind();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  shader.attributes.p.pointer();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, yflip);
  var texture = createTexture(gl, textureInput);
  shader.uniforms.tex = texture.bind();
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  return canvas;
}

function createCanvas2DAndDraw (texture) {
  var canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(texture, 0, 0);
  return canvas;
}

function cell (dom) {
  var td = document.createElement("td");
  td.appendChild(dom);
  return td;
}

function rowHead (texture, text) {
  var head = cell(texture);
  head.style.position = "relative";
  var title = document.createElement("span");
  title.textContent = text;
  title.style.color = "#fff";
  title.style.position = "absolute";
  title.style.bottom = "10px";
  title.style.left = "0px";
  title.style.width = "100%";
  title.style.textAlign = "center";
  head.appendChild(title);
  return head;
}

Qimage("/image.png").then(function (img) {

  var textureSources = [
    { name: "HTML Image", obj: img },
    { name: "Canvas 2D", obj: createCanvas2DAndDraw(img) },
    { name: "WebGL Canvas", obj: createWebGLCanvasAndDraw(img) },
    { name: "WebGL Canvas Y Flipped", obj: createWebGLCanvasAndDraw(img, true) }
  ];

  var table = document.createElement("table");
  var cols = document.createElement("tr");
  cols.innerHTML = "<th>Texture Input</th><th>FlipY = false</th><th>FlipY = true</th>";
  table.appendChild(cols);

  textureSources.forEach(function (src) {
    var row = document.createElement("tr");
    row.appendChild(rowHead(src.obj, src.name));
    [ false, true ].forEach(function (yflip) {
      row.appendChild(cell(createWebGLCanvasAndDraw(src.obj, yflip)));
    });
    table.appendChild(row);
  });

  document.body.appendChild(table);

}).done();
