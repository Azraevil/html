(function () {
    window.extend(
        {
            Matrix: function (arr) {
                this.value = [];
                if (arr != undefined) {
                    if (typeof arr === 'string') {
                        var rows = arr.replace(/\s/g, '').split(/[;|]/g);
                        for (var i = 0; i < rows.length; i++) {
                            var cols = rows[i].split(',');
                            this.value[i] = [];
                            for (var j = 0; j < cols.length; j++) {
                                this.value[i][j] = Number(cols[j]);
                            }
                        }
                    } else if (arr instanceof Array) {
                        this.value = arr;
                    }
                }


            }
        },
        true,
        function () {
            Matrix.unit = function (n) {
                n = n || 1;
                var k = 0;
                var m = new Matrix();
                for (var i = 0; i < n; i++) {
                    m.value[i] = [];
                    for (var j = 0; j < n; j++) {
                        m.value[i][j] = (j == k ? 1 : 0);
                    }
                    k++;
                }
                return m;
            }

            Matrix.prototype = {
                size: function () {
                    var val = this.value || [];
                    return { i: val.length, j: (val.length ? val[0].length : 0) };
                },

                get: function (i, j) {
                    var val = this.value;
                    if (i == undefined || typeof j !== 'number' || !(typeof i === 'string' || typeof i === 'number')) throw new Error('arguments error');
                    if (typeof i === 'string') {
                        if (i == 'i') {
                            return val[j];
                        } else if (i == 'j') {
                            var col = [];
                            for (var n = 0; n < val.length ; n++) col[n] = val[n][j];
                            return col;
                        }
                    } else {
                        var result = val[i][j];
                        return result ? result : 0;
                    }
                },

                rank: function () {
                    var s = this.size();
                    return Math.min(s.i, s.j);
                },

                multiply: function (multiplier, skipVerify) {
                    var m1 = this;
                    var m2 = multiplier;
                    var size1 = m1.size();
                    var size2 = m2.size();
                    var result = [];
                    if (skipVerify || size1.j != size2.i) throw new Error('multiplier`s row number does not match');

                    for (var i = 0; i < size1.i ; i++) {
                        result[i] = [];
                        for (var j = 0; j < size2.j ; j++) {
                            if (result[i][j] == undefined)
                                result[i][j] = 0;
                            for (var k = 0; k < size1.j ; k++) {
                                result[i][j] += m1.get(i, k) * m2.get(k, j);
                            }
                        }
                    }

                    return new Matrix(result);
                },

                multiplyTo: function (multiplier, verify) {
                    return multiplier.multiply(this, verify);
                }
            };
        }
    );
})()