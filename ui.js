var colorize = function () {
    $('#status').show();
    $('#status-text').text('Solving')

    $('#result,#graph').html('');
    var raw = $('#sequence').val();
    var func = $('#is_function').is(':checked');
    var other = $('#is_other').is(':checked');
    window.location.hash = [encodeURIComponent(raw), func, other].join('/');

    var numbers = raw.match(/[+-]*\d+/gi);
    if (_.isEmpty(numbers)) {
        $('#status').hide();
        return;
    }

    numbers = numbers.map(Number);

    var input = [];
    var toFind;
    if (func) {
        for(var i=0; i+1<numbers.length; i+=2)
            input.push([numbers[i], numbers[i+1]])
        toFind = numbers.length%2==1?_.last(numbers):_.chain(input).pluck(0).max().value()+1;
    } else {
        for(var i=0; i<numbers.length; i++)
            input.push([i+1, numbers[i]])
        toFind = numbers.length+1;
    }

    if (!other)
        input.push([toFind, 42]);

    var answer = solve(input);
    if (!other)
        input.pop();

    showResult(input, answer, toFind, func);
    plotGraph(input, answer, toFind);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub], function () {
        $('#status').hide();
    });
};

var colorize2 = _.debounce(colorize, 500);
var colorize3 = function () {
    $('#status').show();
    $('#status-text').text('Debouncing')
    colorize2();
};

var plotGraph = function(input, answer, toFind) {
    var fn = makeFunction(answer);
    var plot = function(fromX, toX, fromY, toY) {
        var data = [];
        var points = [];
        var step = (toX - fromX)/300;
        for(var i=fromX; i<=toX; i+=step) {
            data.push([i, fn(i).toNumber()]);
        }
        for(var i=0; i<input.length; i++) {
            var value = input[i][0];
            if (value<fromX || value>toX) continue;
            var result = fn(value);
            points.push([value, result.toNumber(), result]);
        }
        if (toFind>=fromX && toFind<=toX) {
            var result = fn(toFind);
            points.push([toFind, result.toNumber(), result]);
        }

        var options = {
            xaxis: { min: fromX, max: toX },
            yaxis: { min: fromY, max: toY }
        };

        var p = $.plot($("#graph"), [data, {data:points, points:{show:true}}], options);
        $.each(p.getData()[1].data, function(i, el){
            var o = p.pointOffset({x: el[0], y: el[1]});
            $('<div class="data-point-label">$' + el[2].toMJString(false) + '$</div>').css( {
                position: 'absolute',
                left: o.left + 5,
                top: o.top + 10,
                display: 'none'
            }).appendTo(p.getPlaceholder()).show();
        });
    };

    var pluckedX = _.chain(input).pluck(0).concat([toFind]);
    var pluckedY = _.chain(input).pluck(1).concat([fn(toFind).toNumber()]);
    var minX = pluckedY.min().value(), maxX = pluckedY.max().value()+1;

    plot(pluckedX.min().value()-1, pluckedX.max().value()+1,
         minX - (maxX-minX)/2, maxX + (maxX-minX)/2);
};

var showResult = function(input, answer, toFind, func) {
    var makeName = function(value) {
        if (func)
            return 'f('+value+')';
        else
            return 'S_{'+value+'}';
    }

    var results = $('#result');
    var inputText = [];
    for(var i=0; i<input.length; i++) {
        inputText.push('$' + makeName(input[i][0])+ '=' + input[i][1]+'$');
    }

    results.html('');
    results.append($('<p>').text('Given:'));
    results.append($('<p>').text(inputText.join(' ; ')));

    results.append($('<p>').text('we can define $' + makeName('n') + '$ as:'));
    var equation = '$' + makeName('n') + '=';
    var first = true;
    for(var i=answer.length-1; i>=0; i--) {
        if (answer[i].isZero()) continue;

        if (!first || answer[i].isNegative()) {
            equation += answer[i].isNegative() ? '-' : '+';
        }
        equation += answer[i].abs().toMJString(i>0) + ' ' + (i>0 ? i>1 ? ('n^{' + i + '}') : 'n': '');
        first = false;
    }
    if (first)
        equation += '0';
    equation += '$';
    results.append($('<p class="equation">').text(equation));

    if (func)
        results.append($('<p>').text('so the desired function value is actually:'));
    else
        results.append($('<p>').text('so the next term of the sequence is actually:'));

    var fn = makeFunction(answer);
    results.append($('<p class="next-term">').text('$' + makeName(toFind) + ' = ' + fn(toFind).toMJString() + '$'));

};

var triggerHash = function (first) {
    var hash = window.location.hash;
    if (hash.match(/^#/)) hash = hash.substr(1);
    var args = hash.split('/');
    args[0] = decodeURIComponent(args[0]);
    if (first && !hash) {
        args[0] = args[0] || '1 2 3 4';
    }
    var el0 = $('#sequence');
    var el1 = $('#is_function');
    var el2 = $('#is_other');
    var val1 = (args[1] || 'false') === 'true';
    var val2 = (args[2] || 'false') === 'true';

    if (first || el0.val() != args[0]) {
        el0.val(args[0]);
        el1.attr('checked', val1);
        el2.attr('checked', val2);
        colorize();
    }
};

$(function () {
    $('#sequence').on('input', colorize3).on('keydown', function (e) {
        if (e.keyCode == 13) {
            colorize();
            e.preventDefault();
        }
    }).prop('disabled', false);
    $('#is_function,#is_other').on('change', colorize3)
    $(window).on('hashchange', function () {
        triggerHash(false);
    });
    triggerHash(true);
});
