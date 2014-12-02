(function () {
    window.extend({
        getCanvas: function (selector) {
            selector = selector || 'canvas';
            element = Az(selector).get();
            if (element.getContext)
                return element.getContext('2d');
        },

        Star: function (x, y, z, r, m) {
            this.coord = new Coord(x, y, z);
            this.radius = r || 1;
            this.mass = m || 1;
        },

        Galaxy: [].extend({
            add: function (star) {
                this.push(star);
            },
            sortStar: function () {
                return this.sort(function (s1, s2) { return s1.coord.z - s2.coord.z; });
            },
            pause: true,
        }),

        Offset: { x: 0, y: 0, z: 0 },

        Rotate: { a: 0, b: 0 },

        Scaling: 1,

        ViewDistance: 800,

        TransformMatrix: null,

        MouseButton: -1,

        MousePoint: { x: 0, y: 0 }
    });

    Star.prototype = {
        draw: function () {
            var p = this.coord//.project(ViewDistance);

            var color = this.mass.toString(16);
            while (color.length < 6) color = '0' + color;
            canvas.lineWidth = 1.0;
            canvas.fillStyle = '#' + color;

            canvas.beginPath();
            canvas.arc(p.x, p.y, this.radius, 0, Math.PI * 2);
            canvas.fill();
        }
    };


    var canvas = getCanvas();
    var canvasDom = Az('canvas').get();
    canvas.translate(canvasDom.width / 2, canvasDom.height / 2);

    //canvasDom.addEventListener('mousedown', function () {
    //    MousePoint.x = event.x, MousePoint.y = event.y, MouseButton = event.button;
    //    canvasDom.addEventListener('mousemove', move);
    //});
    //canvasDom.addEventListener('mouseup', function () {
    //    canvasDom.removeEventListener('mousemove', move);
    //    MouseButton = -1;
    //});
    //canvasDom.onmousewheel = function () { move(); return false; };
    canvasDom.oncontextmenu = function () { return false; };

    var move = function () {
        if (event.wheelDelta) {
            Offset.z += event.wheelDelta / 120 * 10;
        } else {
            var offset = { x: event.x - MousePoint.x, y: event.y - MousePoint.y };
            if (MouseButton == 0)
                Offset.x += offset.x, Offset.y += offset.y;
            else
                Rotate.b += offset.x, Rotate.a += offset.y;
        }

        drawWorld(true);
        monitor();

        if (!event.wheelDelta)
            MousePoint.x = event.x, MousePoint.y = event.y;
    }

    var monitor = function () {
        var offset = { x: event.x - MousePoint.x, y: event.y - MousePoint.y };
        var console = Az('div');
        console.html('mButton' + MouseButton + ': ' + (event.offsetX - canvasDom.width / 2) + ',' + (Math.round(event.offsetY) - canvasDom.height / 2) + '<br />');
        console.html(console.html() + 'offset: ' + offset.x + ',' + offset.y + '<br />');
        console.html(console.html() + 'rotate: ' + Rotate.a + ',' + Rotate.b + '<br />');
        console.html(console.html() + 'wheelDelta: ' + event.wheelDelta + '<br />');
    }

    var drawWorld = function (transform) {
        TransformMatrix = transform3d('scaling', Scaling)
                          .transform3d('translate', Offset.x, Offset.y, Offset.z)
                          .transform3d('rotateByAngle', 'x', Rotate.a)
                          .transform3d('rotateByAngle', 'y', Rotate.b)
        var view = new Coord(0, 0, ViewDistance);

        clearCanvas();
        Az.each(window.Galaxy, function (s) {
            var star = s.clone();
            star.coord = s.coord.transform(TransformMatrix);
            star.draw();
        });
    }

    function clearCanvas() {
        canvas.clearRect(-canvasDom.width / 2, -canvasDom.height / 2, canvasDom.width, canvasDom.height);
    }

    var systemsGo = function () {
        if (!window.Galaxy.pause) {
            Az.each(window.Galaxy, function (star) {
                Az.each(window.Galaxy, function (other) {
                    if (star != other) {
                        var dis = Coord.getVector(star.coord, other.coord).norm();
                    }
                });
            });
        }

        drawWorld(false);
    }

    var s1 = new Star(100, 100, 100, 30, 1000); window.Galaxy.add(s1);
    var s2 = new Star(50, -200, -100, 45, 100); window.Galaxy.add(s2);

    setInterval(systemsGo, 100);
})()