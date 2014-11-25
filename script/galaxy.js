(function () {
    window.extend({
        getCanvas: function (selector) {
            selector = selector || 'canvas';
            element = Az(selector).get();
            if (element.getContext)
                return element.getContext('2d');
        },

        Star: function () {
            this.coord = new Coord();
            this.radius = this.mass = 0;
        },

        Galaxy: [].extend({
            add: function (star) {
                this.push(star);

            },
            pause: true,
        }),

        Offset: { x: 0, y: 0 },

        Rotate: { a: 0, b: 0 },

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
    });

    canvasDom.oncontextmenu = function () { return false; };

    var move = function () {
        var offset = { x: event.x - MousePoint.x, y: event.y - MousePoint.y };
        if (MouseButton == 0)
            Offset.x += offset.x, Offset.y += offset.y;
        else
            Rotate.b += offset.x, Rotate.a += offset.y;

        //debugger;
        TransformMatrix = transform3d('scaling', 1, 1, 1)
                          .transform3d('translate', Offset.x, Offset.y, 0)
                          .transform3d('rotateByAngle', 'x', Rotate.a)
                          .transform3d('rotateByAngle', 'y', Rotate.b)

        clearCanvas();
        Az.each(World, function (polygon) {
            var shape = new Polygon();
            Az.each(polygon, function (coord) {
                shape.push(coord.transform(TransformMatrix));
            });
            shape.draw();
        });

        //console
        var console = Az('div');
        console.html(MouseButton + ':' + (event.offsetX - canvasDom.width / 2) + ',' + (Math.round(event.offsetY) - canvasDom.height / 2) + '<br />');
        console.html(console.html() + offset.x + ',' + offset.y + '<br />');
        console.html(console.html() + Rotate.a + ',' + Rotate.b + '<br />');
        console.html(console.html() + Math.round(Math.sin(Rotate.a / 180 * Math.PI) * 100) + ',' + Math.round(Math.sin(Rotate.b / 180 * Math.PI) * 100) + '<br />');

        MousePoint.x = event.x, MousePoint.y = event.y;
    }

    Polygon.prototype.draw = function () {
        shape2d = this;

        canvas.lineWidth = 2.0;
        canvas.strokeStyle = "#000";

        canvas.beginPath();
        end = shape2d[shape2d.length - 1];
        canvas.moveTo(end.x, end.y);

        Az.each(shape2d, function (coord) {
            var p = coord//.project(100, 100, 100);//投影
            canvas.lineTo(p.x, p.y);
        });

        canvas.stroke();
    }

    function clearCanvas() {
        canvas.clearRect(-512, -384, 1024, 768);
    }


    var p1 = new Polygon([
        new Coord(0, 0, 0),
        new Coord(100, 0, 0),
        new Coord(100, 100, 0),
        new Coord(0, 100, 0)

    ]);
    var p2 = new Polygon([
        new Coord(0, 0, 0),
        new Coord(0, 100, 0),
        new Coord(0, 100, 100),
        new Coord(0, 0, 100)
    ]);
    var p3 = new Polygon([
        new Coord(0, 0, 0),
        new Coord(0, 0, 100),
        new Coord(100, 0, 100),
        new Coord(100, 0, 0)
    ]);
    var p4 = new Polygon([
        new Coord(100, 0, 0),
        new Coord(100, 0, 100),
        new Coord(100, 100, 100),
        new Coord(100, 100, 0)
    ]);
    var p5 = new Polygon([
        new Coord(0, 100, 0),
        new Coord(0, 100, 100),
        new Coord(100, 100, 100),
        new Coord(100, 100, 0)
    ]);
    window.World = [p1, p2, p3, p4, p5];

    Az.each(World, function (polygon) {
        polygon.draw();
    });
})()