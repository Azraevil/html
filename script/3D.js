(function () {
    window.extend(
        {
            Coord: function (x, y, z) {
                this.x = x || 0;
                this.y = y || 0;
                this.z = z || 0;
            },

            Polygon: function (array) {
                this.length = 0;
                if (array) {
                    for (var i = 0; i < array.length; i++) {
                        this.push(array[i]);
                    }
                }
            },

            angle2radian: function (angle) {
                return angle * (Math.PI / 180);
            },

            radian2angle: function (radian) {
                return radian / (Math.PI / 180);
            },

            transform3d: function () {
                var func = arguments[0];
                var result = transform3d.fn[func].apply(this, arguments);

                if (this instanceof Matrix)
                    return this.multiplyTo(result);
                else
                    return result;
            }
        },
        true,
        function () {
            window.Vector = window.Coord;

            Matrix.prototype.extend({
                toCoord: function () {
                    var vector = this;
                    var x = vector.get(0, 0);
                    var y = vector.get(1, 0);
                    var z = vector.get(2, 0);
                    var i = vector.get(3, 0) || 1;
                    return new Coord(x / i, y / i, z / i);
                },
                transform3d: window.transform3d
            });

            Coord.prototype = {
                toMatrix: function (homogeneous) {
                    var str = this.x + '|' + this.y + '|' + this.z + (homogeneous ? '|1' : '');
                    return new Matrix(str);
                },

                transform: function (transformMatrix) {
                    return this.toMatrix(true).multiplyTo(transformMatrix).toCoord();
                },

                project: function (f, x0, y0) {
                    var p = new Matrix('1,0,0,0|0,1,0,0|0,0,0,0|0,0,' + -1 / f + ',1');
                    return this.toMatrix(true).multiplyTo(p).toCoord();
                }
            };

            Coord.extend({
                getVector: function (start, end) {
                    return new Vector(end.x - start.x, end.y - start.y, end.z - start.z);
                }
            });

            Vector.prototype.extend({
                norm: function () {
                    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
                },

                dot: function (vector) {
                    var v1 = this;
                    var v2 = vector;
                    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
                },

                cross: function (vector) {
                    var v1 = this;
                    var v2 = vector;
                    return new Vector(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
                },

                getAngle: function (vector) {
                    var v1 = this, v2 = vector;
                    var d = v1.dot(v2);
                    return Math.acos(d / (v1.norm() * v2.norm()));
                }
            });

            Polygon.prototype = [];
            Polygon.prototype.extend({
                visible: function (view) {
                    if (this.length < 3) throw new Error('A plane is determined by at least three points');
                    var vx = Coord.getVector(this[0], this[1]).cross(Coord.getVector(this[1], this[2]));
                    var vv = Coord.getVector(this[1], view);
                    var radian = vx.dot(vv) / vx.norm() / vv.norm();
                    return radian >= 0 && radian < 1;
                },

                draw: function () {
                    throw new Error('unimplemented exception');
                }
            });

            transform3d.fn = {
                translate: function () {
                    var x = arguments[1], y = arguments[2], z = arguments[3];
                    var T = new Matrix('1,0,0,' + x + '|0,1,0,' + y + '|0,0,1,' + z + '|0,0,0,1');
                    return T;
                },

                rotate: function () {
                    var axis = arguments[1], radian = arguments[2];
                    var sinr = Math.sin(radian), cosr = Math.cos(radian);
                    var R;
                    switch (axis) {
                        case 'x':
                            R = new Matrix('1,0,0,0|0,' + cosr + ',' + -sinr + ',0|0,' + sinr + ',' + cosr + ',0|0,0,0,1');
                            break;
                        case 'y':
                            R = new Matrix(cosr + ',0,' + sinr + ',0|0,1,0,0|' + -sinr + ',0,' + cosr + ',0|0,0,0,1');
                            break;
                        case 'z':
                            R = new Matrix(cosr + ',' + -sinr + ',0,0|' + sinr + ',' + cosr + ',0,0|0,0,1,0|0,0,0,1');
                            break;
                    }

                    return R == undefined ? Matrix.unit(4) : R;
                },

                rotateByAngle: function () {
                    var axis = arguments[1], angle = arguments[2];
                    return transform3d.fn.rotate(arguments[0], axis, angle2radian(angle));
                },

                scaling: function () {
                    var x = arguments[1], y = arguments[2], z = arguments[3];
                    if (y == undefined && z == undefined) y = z = x;
                    var S = new Matrix(x + ',0,0,0|0,' + y + ',0,0|0,0,' + z + ',0|0,0,0,1');
                    return S;
                }
            }
        });
})()