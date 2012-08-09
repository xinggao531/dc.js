dc.geoChoroplethChart = function(parent, chartGroup) {
    var _chart = dc.colorChart(dc.baseChart({}));

    var _geoPath = d3.geo.path();

    var _geoJson;

    var _colorAccessor = function(value, maxValue) {
        if (isNaN(value)) value = 0;
        var colorsLength = _chart.colors().range().length;
        var denominator = maxValue / colorsLength;
        var colorValue = Math.min(colorsLength - 1, Math.round(value / denominator));
        return _chart.colors()(colorValue);
    };

    _chart.doRender = function() {
        _chart.resetSvg();

        var states = _chart.svg().append("g")
            .attr("class", "layer");

        states.selectAll("g." + _geoJson.name)
            .data(_geoJson.data)
            .enter()
            .append("g")
            .attr("class", _geoJson.name)
            .append("path")
            .attr("d", _geoPath)
            .append("title");

        plotData();
    };

    function plotData() {
        var maxValue = dc.utils.groupMax(_chart.group(), _chart.valueAccessor());
        var data = {};
        var groupAll = _chart.group().all();
        for (var i = 0; i < groupAll.length; ++i) {
            data[_chart.keyAccessor()(groupAll[i])] = _chart.valueAccessor()(groupAll[i]);
        }

        var regionG = _chart.svg()
            .selectAll("g." + _geoJson.name)
            .attr("class", function(d) {
                return _geoJson.name + " " + _geoJson.keyAccessor(d);
            });

        var paths = regionG
            .select("path")
            .attr("fill", function(d) {
                var currentFill = d3.select(this).attr("fill");
                if (currentFill)
                    return currentFill;
                return "white";
            });

        dc.transition(paths, _chart.transitionDuration()).attr("fill", function(d) {
            return _colorAccessor(data[_geoJson.keyAccessor(d)], maxValue);
        });

        if (_chart.renderTitle()) {
            regionG.selectAll("title").text(function(d) {
                var key = _geoJson.keyAccessor(d);
                var value = data[key];
                return _chart.title()({key: key, value: value});
            });
        }
    }

    _chart.doRedraw = function() {
        plotData();
    };

    _chart.overlayGeoJson = function(json, name, keyAccessor) {
        _geoJson = {name: name, data: json, keyAccessor: keyAccessor};
        return _chart;
    };

    return _chart.anchor(parent, chartGroup);
};
