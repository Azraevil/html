(function () {
    window.extend({
        getCanvas: function (selector) {
            selector = selector || 'canvas';
            element = Az(selector).get();
            if (element.getContext)
                return element.getContext('2d');
        },

        Offset: { x: 0, y: 0, z: 0 },

        Rotate: { a: 0, b: 0 },

        Scaling: 1,

        ViewDistance: 800,

        TransformMatrix: null,

        World: [],

        Movement: { f: false, b: false, l: false, r: false },

        MouseButton: -1,

        MousePoint: { x: -1, y: -1 },

        MouseOffset: { x: 0, y: 0 }
    });


    var canvas = getCanvas();
    var canvasDom = Az('canvas').get();
    canvas.translate(canvasDom.width / 2, canvasDom.height / 2);

    document.addEventListener('keydown', function () {
        handleKey(true);
    });
    document.addEventListener('keyup', function () {
        handleKey(false);
    });
    canvasDom.addEventListener('mousemove', function () {
        if (MousePoint.x < 0 || MousePoint.y < 0)
            MousePoint.x = event.offsetX, MousePoint.y = event.offsetY;
        MouseButton = event.button;

        MouseOffset.x = event.offsetX <= 0 ? -Number.MAX_VALUE : (event.offsetX >= canvasDom.width ? Number.MAX_VALUE : event.offsetX - MousePoint.x);
        MouseOffset.y = event.offsetY <= 0 ? -Number.MAX_VALUE : (event.offsetY >= canvasDom.height ? Number.MAX_VALUE : event.offsetY - MousePoint.y);

        MousePoint.x = event.offsetX, MousePoint.y = event.offsetY;

    });
    canvasDom.addEventListener('mouseout', function () {
        MousePoint.x = -1, MousePoint.y = -1;
    });
    canvasDom.oncontextmenu = function () { return false; };

    var handleKey = function (down) {
        switch (event.keyCode) {
            case 65: Movement.l = down; break; // A
            case 68: Movement.r = down; break; // D
            case 83: Movement.b = down; break; // S
            case 87: Movement.f = down; break; // W
        }
    }

    var move = function () {
        var step = 5;
        if (Movement.f) Offset.z += step;
        if (Movement.b) Offset.z -= step;
        if (Movement.l) Offset.x += step;
        if (Movement.r) Offset.x -= step;

        var radian = 1, sensity = 2;
        var signX = MouseOffset.x >= 0 ? 1 : -1, signY = MouseOffset.y >= 0 ? 1 : -1;
        Rotate.b += (Math.abs(MouseOffset.x) > sensity ? sensity * signX : MouseOffset.x) * radian;
        Rotate.a -= (Math.abs(MouseOffset.y) > sensity ? sensity * signY : MouseOffset.y) * radian;
        if (Math.abs(MouseOffset.x) !== Number.MAX_VALUE) MouseOffset.x = 0;
        if (Math.abs(MouseOffset.y) !== Number.MAX_VALUE) MouseOffset.y = 0;
        Az('div').html(Rotate.b + ',' + Rotate.a + '||||' + MouseOffset.x + ',' + MouseOffset.y);

        drawWorld();
    }

    Polygon.prototype.draw = function () {
        shape2d = this;

        canvas.lineWidth = 1.0;
        canvas.strokeStyle = "#000";

        canvas.beginPath();
        end = shape2d[shape2d.length - 1].project(ViewDistance);
        canvas.moveTo(end.x, end.y);

        Az.each(shape2d, function (coord) {
            var p = coord.project(ViewDistance);//投影
            canvas.lineTo(p.x, p.y);
        });

        canvas.stroke();
    }

    var drawWorld = function () {
        TransformMatrix = transform3d('scaling', Scaling)
                          .transform3d('translate', Offset.x, Offset.y, Offset.z)
                          .transform3d('translate', -Offset.x, -Offset.y, -Offset.z - ViewDistance)
                          .transform3d('rotateByAngle', 'x', Rotate.a)
                          .transform3d('rotateByAngle', 'y', Rotate.b)
                          .transform3d('translate', Offset.x, Offset.y, Offset.z + ViewDistance)
        var view = new Coord(0, 0, ViewDistance);

        clearCanvas();
        Az.each(World, function (polygon) {
            var shape = new Polygon();
            Az.each(polygon, function (coord) {
                shape.push(coord.transform(TransformMatrix));
            });
            shape.visible(view) && shape.draw();
        });
    }

    function clearCanvas() {
        canvas.clearRect(-canvasDom.width / 2, -canvasDom.height / 2, canvasDom.width, canvasDom.height);
    }

    var trans0 = transform3d('translate', -50, -50, -50);
    var p1 = new Polygon([
        new Coord(0, 0, 0).transform(trans0),
        new Coord(0, 100, 0).transform(trans0),
        new Coord(100, 100, 0).transform(trans0),
        new Coord(100, 0, 0).transform(trans0)
    ]);
    var p2 = new Polygon([
        new Coord(0, 0, 0).transform(trans0),
        new Coord(0, 0, 100).transform(trans0),
        new Coord(0, 100, 100).transform(trans0),
        new Coord(0, 100, 0).transform(trans0)
    ]);
    var p3 = new Polygon([
        new Coord(0, 0, 0).transform(trans0),
        new Coord(100, 0, 0).transform(trans0),
        new Coord(100, 0, 100).transform(trans0),
        new Coord(0, 0, 100).transform(trans0)
    ]);
    var p4 = new Polygon([
        new Coord(100, 0, 0).transform(trans0),
        new Coord(100, 100, 0).transform(trans0),
        new Coord(100, 100, 100).transform(trans0),
        new Coord(100, 0, 100).transform(trans0)
    ]);
    var p5 = new Polygon([
        new Coord(0, 100, 0).transform(trans0),
        new Coord(0, 100, 100).transform(trans0),
        new Coord(100, 100, 100).transform(trans0),
        new Coord(100, 100, 0).transform(trans0)
    ]);
    var p6 = new Polygon([
        new Coord(0, 0, 100).transform(trans0),
        new Coord(100, 0, 100).transform(trans0),
        new Coord(100, 100, 100).transform(trans0),
        new Coord(0, 100, 100).transform(trans0)
    ]);

    window.World = [p1, p2, p3, p4, p5, p6];
    //window.World = [p1, p2];

    setInterval(move, 100);
})()