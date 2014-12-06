var Frac = function(a, b) {
    this.a = a;
    this.b = b;
};

var gcd = function(a, b) {
    a = Math.floor(a);
    b = Math.floor(b);
    while(b) {
        var c = a%b;
        a = b;
        b = c;
    }
    return a;
}

Frac.prototype.simplify = function() {
    if (this.isZero()) return new Frac(0, 1);
    var g = gcd(this.a, this.b);
    if ((g<0) != (this.b<0)) g*=-1;
    return new Frac(this.a/g, this.b/g);
}

Frac.prototype.add = function(that) {
    return new Frac(this.a*that.b+that.a*this.b, this.b*that.b).simplify();
}

Frac.prototype.neg = function() {
    return new Frac(-this.a, this.b);
}

Frac.prototype.sub = function(that) {
    return this.add(that.neg());
}

Frac.prototype.mul = function(that) {
    return new Frac(this.a*that.a, this.b*that.b).simplify();
}

Frac.prototype.inv = function() {
    return new Frac(this.b, this.a);
}

Frac.prototype.div = function(that) {
    return this.mul(that.inv());
}

Frac.prototype.abs = function(that) {
    return new Frac(Math.abs(this.a), Math.abs(this.b));
}


Frac.prototype.isZero = function() {
    return Math.abs(this.a) < 1e-6;
}

Frac.prototype.isInt = function() {
    return Math.abs(this.b-1) < 1e-6;
}

Frac.prototype.isNegative = function() {
    return this.a < -1e-6;
}

Frac.prototype.toString = function() {
    if (this.isInt()) return this.a+'';
    return this.a + '/' + this.b;
}

Frac.prototype.toMJString = function(removeOne) {
    if (this.isInt()) return (this.a != 1 || !removeOne ? this.a+'' : '');
    return '\\frac{' + this.a + '}{' + this.b + '}';
}


var solve = function(sequence) {
    var V = [];
    var n = sequence.length;
    for(var i=0; i<n; i++) {
        var line = [];
        for(var j=0; j<n; j++) {
            line.push(new Frac(Math.pow(i+1, j), 1));
        }
        line.push(new Frac(sequence[i], 1));
        V.push(line);
    }
    solveMatrix(V);
    return V.map(function(v){return v[n];});
};

var solveMatrix = function(V) {
    var m = V.length, n=m+1;
    for(var k=0; k<m; k++) {
        for(var i=k+1; i<m; i++) {
            var pivot = V[i][k].div(V[k][k]);
            for(var j=k; j<n; j++) {
                V[i][j] = V[i][j].sub(pivot.mul(V[k][j]));
            }
        }
    }
    for(var i=m-1; i>=0; i--) {
        var pivot = V[i][i];
        if (pivot.isZero()) break;

        for(var j=i; j<n; j++) {
            V[i][j] = V[i][j].div(pivot);
        }

        for(var j=i+1; j<n-1; j++) {
            V[i][n-1] = V[i][n-1].sub(V[i][j].mul(V[j][n-1]));
            V[i][j] = new Frac(0, 1);
        }
    }
}
