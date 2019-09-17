// make global var to pass data around (there is probably a safer way to do this)
var GBBData;

// load JSON data
// console.log('app start')
d3.json("static/data/samples.json").then((BBData) => {
    // console.log("fetched")

    // for data access outside this function
    GBBData = BBData;

    // populate select dropdown
    var selectbbut = d3.select('#selDataset')
        .classed("custom-select", true);

    var options = selectbbut
        .selectAll('option')
        .data(BBData.names)
        .enter()
        .append('option')
        .text(function (d) { return d; });

});

// populate dashboard when id is selected listen for change on dropdown
function optionChanged(bbID) {
    // console.log(bbID);
    // console.log(GBBData)

    // grab metadata section corresponding to id selected via filter
    var filteredbyparams = GBBData.metadata.filter(function (belly) {
        if ((parseInt(belly.id) === parseInt(bbID))) {
            return belly;
        }
    });

    filteredbyparams.forEach((belly) => {
        // console.log(belly);

        // Create and populate table with meta data of selected ID
        var DemoInfo = d3.select('#sample-metadata');
        DemoInfo.selectAll("table").remove();

        var table_bb = DemoInfo
            .append('table')
            .classed("table table-hover table-striped", true);

        var table_h_bb = table_bb
            .append('tbody');

        // Loop through object to get key value pairs to display as meta data
        Object.entries(belly).forEach(([key, value]) => {
            var bb_row = table_h_bb.append("tr");
            var bb_cell = bb_row.append("td").text(key.toUpperCase());
            var bb_cell = bb_row.append("td").text(value);
        });

    });

    // grab samples section corresponding to id selected via filter
    filteredbyparams2 = GBBData.samples.filter(function (bellys) {
        if ((parseInt(bellys.id) === parseInt(bbID))) {
            return bellys;
        }
    });

    filteredbyparams2.forEach((bellys) => {
        // console.log(bellys.sample_values);
        // console.log(bellys.otu_ids);
        // console.log(bellys.otu_labels.slice(0, 10));

 

        // data is sorted, but what if its not
        var bsv = bellys.sample_values;
        var boid = bellys.otu_ids;
        var bol = bellys.otu_labels;

        // combine the arrays for sorting
        var list = [];
        for (var j = 0; j < boid.length; j++)
            list.push({ 'bsv': bsv[j], 'boid': boid[j], 'bol': bol[j] });
        
        // console.log(list);
        // sort descending by sample value
        list.sort(function(a, b) {
            return ((a.bsv > b.bsv) ? -1 : ((a.bsv == bsv.name) ? 0 : 1));
        });

        // console.log(list);

        // put sorted data back
        for (var k = 0; k < list.length; k++) {
            bsv[k] = list[k].bsv;
            boid[k] = `id:${list[k].boid.toString()}`;
            bol[k] = list[k].bol;
        }

        // clean up labels for hover text, replace ; with <br>
        var bol = bol.slice(0, 10);

        for (var i = 0; i < bol.length; i++) {
            bol[i] = bol[i].replace(/;/g, '<br>');
        }
        console.log(`x:bsv-${bsv.slice(0, 10)}`);
        console.log(`y:boid-${boid.slice(0, 10)}`);
        // create bar chart
        var trace = {
            type: 'bar',
            marker: {
                color: 'rgb(139,0,139)'
            },
            x: bsv.slice(0, 10), 
            y: boid.slice(0, 10),
            transforms: [{
                type: 'sort',
                target: 'x',
                order: 'descending'
              }],
            hovertext: bol,
            orientation: 'h'
        };


        var data = [trace];
        var layout = {
            title: 'Top 10 OTUs Found in Sample',
            xaxis: {
                title: {
                    text: 'OTUs Found',
                    font: {
                        size: 18,
                        color: '#7f7f7f'
                    }
                },
            },
            yaxis: {
                title: {
                    text: 'OTU ID',
                    font: {
                        size: 18,
                        color: '#7f7f7f'
                    }
                }
            }
        };

        Plotly.newPlot('bar', data, layout);

        // bubble chart
        var bubble_color = bellys.otu_ids;
        bubble_color = bubble_color.map(function (val) { return val; });

        var trace1 = {
            x: bellys.otu_ids,
            y: bellys.sample_values,
            mode: 'markers',
            marker: {
                size: bellys.sample_values,
                color: bubble_color,
                colorscale: "Portland"
            }
        };

        var data = [trace1];

        var layout = {
            title: 'Belly Button Biodiversity',
        };

        Plotly.newPlot('bubble', data, layout);

        // variable to collect wash frequency
        var wfreq;

        // wash frequency is collected from metadata
        filteredbyparams.forEach((belly) => {
            wfreq = parseInt(belly.wfreq);

            // NaN or null to 0
            wfreq = wfreq || 0;
            // console.log(`wash freq: ${wfreq}`);
        });

        // Create gauge chart, no idea how to make a needle indicator other than maybe a custom svg
        var data = [
            {
                value: wfreq,
                title: `${wfreq} Belly Button Washes per Week`,
                type: "indicator",
                mode: "gauge+number",
                gauge: {
                    axis: { range: [null, 9], tickwidth: 1, tickcolor: "darkblue" },
                    bar: { color: "purple" }, bgcolor: "white", borderwidth: 2, bordercolor: "gray",
                    steps: [{ range: [0, 4.5], color: 'lightgray' }, {
                        range: [4.5, 10], color: 'darkgray'
                    }], threshold: { line: { color: "orchid", width: 4 }, thickness: 0.75, value: wfreq }
                }
            }
        ];

        var layout = {};

        Plotly.newPlot('gauge', data, layout);

    });



}



