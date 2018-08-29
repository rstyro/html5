var canvas;
var context;
var width;
var height;
var quads = [];
var displacementVec;

window.onload = function()
{
	canvas = document.getElementById('canvas');
  canvas.style.width = window.innerWidth + "px";
  setTimeout(function() {
  canvas.style.height = window.innerHeight + "px";
}, 0);
  
	context = canvas.getContext('2d');
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;
displacementVec = vec2d.create(0.02, 0.02);

generateTriangles();
  
	loop();
};

function generateTriangles()
{
	var length = 32 - 1;
	var i = length;

	for(i; i > -1; --i)
	{
		var obj = quad.create(width >> 1, (i / length) * (height >> 1) + (height >> 2), Math.sin((i / length) * (Math.PI)) * (width >> 3));
		quads.push(obj);
	}
}

function loop()
{
	updateTriangles();
	renderTriangles();

	requestAnimationFrame(loop);
}

function updateTriangles()
{
	var i = quads.length - 1;

	for(i; i > -1; --i)
	{
		var quad = quads[i];
		quad.update();
	}
}

function renderTriangles()
{
	context.lineWidth = 1;
	context.fillStyle = '#352B4E';
	context.strokeStyle = '#33C1B5';
	context.globalAlpha = 0.15;
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.globalAlpha = 1;
	context.fillStyle = '#FAFFD9';

	var i = quads.length - 1;
	var j;

	for(i; i > -1; --i)
	{
		var quad = quads[i];
		j = quad.getPoints().length - 1;

		for(j; j > -1; --j)
		{
			var p1 = quad.getPoints()[j];
			var p2 = (j > 0) ? quad.getPoints()[j - 1] : quad.getPoints()[quad.getPoints().length - 1];

			context.beginPath();
			context.moveTo(quad.getPos().getX() + Math.cos(p1.getAngle().getX()) * p1.getSize(), quad.getPos().getY() + Math.sin(p1.getAngle().getY()) * p1.getSize());
			context.lineTo(quad.getPos().getX() + Math.cos(p2.getAngle().getX()) * p2.getSize(), quad.getPos().getY() + Math.sin(p2.getAngle().getY()) * p2.getSize());
			context.arc(quad.getPos().getX() + Math.cos(p1.getAngle().getX()) * p1.getSize(), quad.getPos().getY() + Math.sin(p1.getAngle().getY()) * p1.getSize(), 4, 0, Math.PI * 2);
			context.fill();
			context.stroke();
			context.closePath();
		}
	}
	
	
	
}

//vec2d definition:

var vec2d =
{
	_x: 1,
	_y: 0,

	create: function(x, y)
	{
		var obj = Object.create(this);
		obj.setX(x);
		obj.setY(y);

		return obj;
	},

	getX: function()
	{
		return this._x;
	},

	setX: function(value)
	{
		this._x = value;
	},

	getY: function()
	{
		return this._y;
	},

	setY: function(value)
	{
		this._y = value;
	},

	setXY: function(x, y)
	{
		this._x = x;
		this._y = y;
	},

	getLength: function()
	{
		return Math.sqrt(this._x * this._x + this._y * this._y);
	},

	setLength: function(length)
	{
		var angle = this.getAngle();
		this._x = Math.cos(angle) * length;
		this._y = Math.sin(angle) * length;
	},

	getAngle: function()
	{
		return Math.atan2(this._y, this._x);
	},

	setAngle: function(angle)
	{
		var length = this.getLength();
		this._x = Math.cos(angle) * length;
		this._y = Math.sin(angle) * length;
	},

	add: function(vector)
	{
		this._x += vector.getX();
		this._y += vector.getY();
	},

	substract: function(vector)
	{
		this._x -= vector.getX();
		this._y -= vector.getY();
	},

	multiply: function(value)
	{
		this._x *= value;
		this._y *= value;
	},

	divide: function(value)
	{
		this._x *= value;
		this._y *= value;
	}
};

//quad definition:

var quad =
{
	_pos: null,
	_size: null,
	_points: null,

	create: function(x, y, size)
	{
		var obj = Object.create(this);
		obj.setPos(vec2d.create(x, y));
		obj.setSize(size);
		obj.setPoints
		(
			[
				point.create(size, 0, 0),
				point.create(size, Math.PI / 2, Math.PI / 2),
				point.create(size, Math.PI, Math.PI),
				point.create(size, Math.PI * 1.5, Math.PI * 1.5)
			]
		);

		return obj;
	},

	update: function()
	{
		var i = this._points.length - 1;

		for(i; i > -1; --i)
		{
			var point = this._points[i];
			point.update();
		}
	},

	getPos: function()
	{
		return this._pos;
	},

	setPos: function(vector)
	{
		this._pos = vector;
	},

	getSize: function()
	{
		return this._size;
	},

	setSize: function(size)
	{
		this._size = size;
	},

	getPoints: function()
	{
		return this._points;
	},

	setPoints: function(points)
	{
		this._points = points;
	}
};

//point definition:

var point =
{
	_pos: null,
	_size: null,
	_angle: null,

	create: function(size, angleX, angleY)
	{
		var obj = Object.create(this);
		obj.setPos(vec2d.create(0, 0));
		obj.setSize(size);
		obj.setAngle(vec2d.create(angleX, angleY));
		obj.getAngle().add(vec2d.create(size / 200, size / 200));

		return obj;
	},

	update: function()
	{
		this.getAngle().add(displacementVec);
	},

	getPos: function()
	{
		return this._pos;
	},

	setPos: function(vector)
	{
		this._pos = vector;
	},

	getSize: function()
	{
		return this._size;
	},

	setSize: function(size)
	{
		this._size = size;
	},

	getAngle: function()
	{
		return this._angle;
	},

	setAngle: function(angle)
	{
		this._angle = angle;
	},
};