var colorize = function () {
    $('#result,#graph').html('');
    var raw = $('#sequence').val();
    var func = $('#is_function').is(':checked');
    var other = $('#is_other').is(':checked');
    window.location.hash = [encodeURIComponent(raw), func, other].join('/');

    var input = raw.match(/[+-]*\d+/gi).map(Number);
    if (input.length == 0) return;

    if (!other)
        input.push(42);

    var answer = solve(input, func);
    if (!other)
        input.pop();

    showResult(input, answer);
    plotGraph(input, answer);

    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
};

var plotGraph = function(input, answer, toFind) {
    var fn = makeFunction(answer);
    var data = [];
    var points = [];
    for(var i=0; i<=input.length+2; i+=0.1) {
        data.push([i, fn(i).toNumber()]);
    }
    for(var i=1; i<=input.length+1; i++) {
        points.push([i, fn(i).toNumber(), fn(i)]);
    }
    var options = {
        zoom: { interactive: true },
        pan: { interactive: true }
    };

    var p = $.plot($("#graph"), [data, {data:points, points:{show:true}}], options);

    $.each(p.getData()[1].data, function(i, el){
        var o = p.pointOffset({x: el[0], y: el[1]});
        $('<div class="data-point-label">$' + el[2].toMJString(false) + '$</div>').css( {
            position: 'absolute',
            left: o.left + 5,
            top: o.top + 10,
            display: 'none'
        }).appendTo(p.getPlaceholder()).fadeIn('slow');
    });
};

var showResult = function(input, answer) {
    var results = $('#result');
    var inputText = [];
    for(var i=0; i<input.length; i++) {
        inputText.push('$S_{' + (i+1)+'}='+input[i]+'$');
    }

    results.html('');
    results.append($('<p>').text('Given:'));
    results.append($('<p>').text(inputText.join(', ')));

    results.append($('<p>').text('we can define $S_n$:'));
    var equation = '$S_n=';
    var first = true;
    for(var i=answer.length-1; i>=0; i--) {
        if (answer[i].isZero()) continue;

        if (!first || answer[i].isNegative()) {
            equation += answer[i].isNegative() ? '-' : '+';
        }
        equation += answer[i].abs().toMJString(i>0) + ' ' + (i>0 ? i>1 ? ('n^{' + i + '}') : 'n': '');
        first = false;
    }
    equation += '$';
    results.append($('<p class="equation">').text(equation));

    results.append($('<p>').text('so the next term of the sequence is actually:'));

    var fn = makeFunction(answer);
    results.append($('<p>').text('$S_{' + (input.length+1) + '} = ' + fn(input.length+1).toMJString() + '$'));

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
        if (val1) {
            el1.click();
        }
        if (val2) {
            el2.click();
        }
        colorize();
    }
};

$(function () {
    $('#sequence').on('input', colorize).on('keydown', function (e) {
        if (e.ctrlKey && e.keyCode == 13) {
            colorize();
            e.preventDefault();
        }
    }).prop('disabled', false);
    $('#is_function,#is_other').on('change', colorize)
    $(window).on('hashchange', function () {
        triggerHash(false);
    });
    triggerHash(true);
});
