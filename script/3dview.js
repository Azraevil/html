(function () {
    window.extend({
        getCanvas: function (selector) {
            selector = selector || 'canvas';
            element = Az(selector).get();
            if (element.getContext)
                return element.getContext('2d');
        },

        Offset: { x: 0, y: 0 },

        Rotate: { a: 0, b: 0 },

        Scaling: 1,

        ViewDistance: 500,

        TransformMatrix: null,

        World: [],

        MouseButton: -1,

        MousePoint: { x: 0, y: 0 },
    });


    var canvas = getCanvas();
    var canvasDom = Az('canvas').get();
    canvas.translate(canvasDom.width / 2, canvasDom.height / 2);

    canvasDom.addEventListener('mousedown', function () {
        MousePoint.x = event.x, MousePoint.y = event.y, MouseButton = event.button;
        canvasDom.addEventListener('mousemove', move);
    });
    canvasDom.addEventListener('mouseup', function () {
        canvasDom.removeEventListener('mousemove', move);
        MouseButton = -1;
    });
    canvasDom.onmousewheel = function () { move(); return false; };
    canvasDom.oncontextmenu = function () { return false; };

    var move = function () {
        if (event.wheelDelta) {
            Scaling += event.wheelDelta / 120 * 0.1;
            Scaling = Scaling > 0 ? Scaling : 0;
        } else {
            var offset = { x: event.x - MousePoint.x, y: event.y - MousePoint.y };
            if (MouseButton == 0)
                Offset.x += offset.x, Offset.y += offset.y;
            else
                Rotate.b += offset.x, Rotate.a += offset.y;
        }

        drawWorld();
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
                          .transform3d('rotateByAngle', 'x', Rotate.a)
                          .transform3d('rotateByAngle', 'y', Rotate.b)
                          .transform3d('translate', Offset.x, Offset.y, 0)
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

    Az.each(World, function (polygon) {
        polygon.visible(new Coord(0, 0, ViewDistance)) && polygon.draw();
    });
})()