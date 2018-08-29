		(function () {
		    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		    window.requestAnimationFrame = requestAnimationFrame;
		})();


		var canvas = document.getElementById("canvas"),
		    shapeCan = document.createElement("canvas"),
		    ctx = canvas.getContext("2d"),
		    sCtx = shapeCan.getContext("2d"),
		    width = window.innerWidth,
		    height = document.body.offsetHeight,
		    vanishPointY = height / 2,
		    vanishPointX = width / 2,
		    focalLength = 300,
		    angle = 0,
		    angleY = 0,
		    angleX = 0,
		    angleZ = 0,
		    mouseX = 0,
		    mouseY = 0;

		var settings = {
		    MouseRotation: false,
		    ClockColor: {
		        r: 0,
		        g: 0,
		        b: 0
		    }
		}


		canvas.width = width;
		canvas.height = height;

		shapeCan.width = 200;
		shapeCan.height = 100;
		sCtx.font = '3em Arial';

		/*
		 *	Controls the emitter
		 */
		function Emitter() {
		    this.particles = [];
		    this.shapeParts = [];

		    this.x = 1;
		    this.y = 1;
		    this.z = 1;

		    this.getShape();

		    this.startTime = new Date().getTime();
		    this.checkInterval = 200;
		}

		Emitter.prototype.update = function () {
		    var partLen = this.particles.length;

		    if (settings.MouseRotation) {
		        angleX = (mouseY - vanishPointY) * 0.01;
		        angleY = (mouseX - vanishPointX) * 0.01;
		    } else {
		        angleY = Math.sin(angle += 0.01);
		        angleX = Math.sin(angle);
		        angleZ = Math.sin(angle);
		    }

		    // z-sorting 
		    this.particles.sort(function (a, b) {
		        return b.z - a.z;
		    });

		    for (var i = 0; i < partLen; i++) {
		        var particle = this.particles[i];
		        if (particle) {
		            particle.update();
		        }
		    }

		}

		Emitter.prototype.getShape = function () {
		    var d = new Date(),
		        hour = d.getHours() % 12,
		        min = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes(),
		        sec = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();


		    sCtx.clearRect(0, 0, shapeCan.width, shapeCan.height);
		    sCtx.fillText(hour + ":" + min + ":" + sec, 0, 30);

		    var imageData = sCtx.getImageData(0, 0, shapeCan.width, shapeCan.height).data;

		    for (var i = 0; i < imageData.length; i += 4) {
		        var x = i / 4 % shapeCan.width,
		            y = (i / 4 - x) / shapeCan.width,
		            index = i;

		        if (imageData[i + 3] > 0) {
		            for (var p = 0; p < 4; p++) {
		                if (!this.shapeParts[index + p]) {
		                    var particle = new Particle({
		                        x: ((x * 2)) - 200,
		                        y: ((y * 2)) - 100,
		                        z: 10
		                    });
		                    this.shapeParts[index + p] = particle;
		                    this.particles[index + p] = particle;
		                }
		            }
		        } else {
		            for (var p = 0; p < 4; p++) {
		                if (this.shapeParts[index + p]) {
		                    this.shapeParts[index + p].explode();
		                    this.shapeParts[index + p] = undefined;
		                }
		            }
		        }
		    }
		}

		Emitter.prototype.render = function () {
		    if (new Date().getTime() > this.startTime + this.checkInterval) {
		        this.startTime = new Date().getTime();
		        this.getShape();
		    }

		    var imgData = ctx.createImageData(width, height),
		        data = imgData.data,
		        partLen = this.particles.length;

		    for (var i = 0; i < partLen; i++) {
		        var particle = this.particles[i];
		        if (particle && particle.render && particle.xPos < width && particle.xPos > 0 && particle.yPos > 0 && particle.yPos < height) {
		            for (var w = 0; w < particle.size; w++) {
		                for (var h = 0; h < particle.size; h++) {
		                    if (particle.xPos + w < width && particle.xPos + w > 0 && particle.yPos + h > 0 && particle.yPos + h < height) {
		                        pData = (~~ (particle.xPos + w) + (~~ (particle.yPos + h) * width)) * 4;
		                        data[pData] = settings.ClockColor.r;
		                        data[pData + 1] = settings.ClockColor.g;
		                        data[pData + 2] = settings.ClockColor.b;
		                        data[pData + 3] = particle.color[3];
		                    }
		                }
		            }
		        } else if (particle && !particle.render) {
		            this.particles[i] = undefined;
		            delete particle;
		        }
		    }

		    ctx.putImageData(imgData, 0, 0);
		}


		/*
		 *	Controls the individual particles
		 */
		function Particle(options) {
		    options = options || {};

		    this.maxDist = 1000;

		    this.x = options.x || (Math.random() * 10) - 5;
		    this.y = options.y || (Math.random() * 10) - 5;
		    this.z = options.z || (Math.random() * 10) - 5;

		    this.startX = this.x;
		    this.startY = this.y;
		    this.startZ = this.z;

		    this.xPos = 0;
		    this.yPos = 0;

		    this.angle = 0;

		    this.vx = 0;
		    this.vy = 0;
		    this.vz = 0;

		    this.color = [0, 0, 0, 255]
		    this.render = true;
		    this.scaler = 2;
		}

		Particle.prototype.explode = function () {
		    this.vx = (Math.random() * 30) - 15;
		    this.vy = (Math.random() * 30) - 15;
		    this.vz = (Math.random() * 30) - 15;
		}

		Particle.prototype.rotate = function () {
		    var x = this.startX * Math.cos(angleZ) - this.startY * Math.sin(angleZ),
		        y = this.startY * Math.cos(angleZ) + this.startX * Math.sin(angleZ);

		    this.x = x;
		    this.y = y;

		    x = this.startX * Math.cos(angleY) - this.startZ * Math.sin(angleY);
		    var z = this.startZ * Math.cos(angleY) + this.startX * Math.sin(angleY);

		    this.x = x;
		    this.z = z;

		    y = this.startY * Math.cos(angleX) - this.startZ * Math.sin(angleX);
		    z = this.startZ * Math.cos(angleX) + this.startY * Math.sin(angleX);

		    this.y = y;
		    this.z = z;
		}

		Particle.prototype.update = function () {
		    this.x = (this.startX += this.vx);
		    this.y = (this.startY += this.vy);
		    this.z = (this.startZ -= this.vz);

		    this.rotate();

		    this.render = false;

		    if (this.z > -focalLength) {
		        var scale = focalLength / (focalLength + this.z);

		        this.size = scale * this.scaler;
		        this.xPos = vanishPointX + this.x * scale;
		        this.yPos = vanishPointY + this.y * scale;

		        var dx = this.startX - this.x,
		            dy = this.startY - this.y,
		            dz = this.startZ - this.z,
		            dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

		        if (dist < this.maxDist) {
		            this.render = true;
		        }

		    }
		}

		function render() {
		    emitter.update();
		    emitter.render();
		    requestAnimationFrame(render);
		}

		var emitter = new Emitter();
		render();

		var gui = new dat.GUI();
		gui.add(settings, 'MouseRotation');
		gui.addColor(settings, 'ClockColor');

		document.body.addEventListener("mousemove", function (e) {
		    mouseX = e.clientX;
		    mouseY = e.clientY;
		});

		window.onresize = function () {
		    height = canvas.height = document.body.offsetHeight;
		    width = canvas.width = document.body.offsetWidth;
		    vanishPointY = height / 2;
		    vanishPointX = width / 2;
		};