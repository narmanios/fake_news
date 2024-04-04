import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function scatterplot() {
    const dataURL = "../data/output_ModuleFive.json";

    // Set the dimensions of the canvas / graph
    const margin = { top: 30, right: 20, bottom: 60, left: 60 },
        width = 1100 - margin.left - margin.right,
        height = 570 - margin.top - margin.bottom;

    const color = d3.scaleOrdinal()
        .domain(["FALSE", "REAL"]) // Assuming domain_type values are "FALSE" and "TRUE"
        .range(["#D247BC", "pink"]); // Red for FALSE, green for TRUE

        const legendData = [
            { label: "False", color: "#D247BC" },
            { label: "Real", color: "pink" }
        ];

         

    // Set up the SVG container
    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initialize scales
    let x = d3.scaleLinear().range([0, width]).domain([0, 100]);
    let y = d3.scaleLinear().range([height, 0]).domain([0, 100]);

   // Initialize axes with classes
    const xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "x-axis"); // Class for the x-axis

    const yAxis = svg.append("g")
    .attr("class", "y-axis"); // Class for the y-axis

    // Add axis labels
    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 5})`)
        .attr("class", "axislabel")
        .attr("y", 0)
        .attr("x", 10 - margin.left) // Adjusted y-offset
        .style("text-anchor", "middle")
        .style("margin-top", "20px")
        .text("Tweets per Fake Article");

        svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("class", "axislabel")
        .attr("y", -60) // Adjusted y-offset
        .attr("x", 10 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Tweets per Real Article");
    

    // Tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        // .style("border", "1px solid #000")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none");

    // Load and process the data
    const data = await d3.json(dataURL);
    // Convert string values to numbers
    data.forEach(d => {
        d.x = +d.tweets_per_fake_article;
        d.y = +d.tweets_per_real_article;
        d.color = color(d.domain_type); // Assign color based on domain_type
    });

    // Add the scatterplot points
    const circles = svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "scatter-dot") // Class for the dots
        .attr("r", 5)
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .style("fill", d => d.color); // Use the assigned color

    // Update plot function
    function updatePlot() {
        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));
        circles.attr("cx", d => x(d.x)).attr("cy", d => y(d.y));
    }

    // Event listeners for sliders
    d3.select("#x-range").on("change", function() {
        const value = +this.value;
        x.domain([0, value]);
        updatePlot();
    });

    d3.select("#y-range").on("change", function() {
        const value = +this.value;
        y.domain([0, value]);
        updatePlot();
    });


// Create a legend group
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width - 80}, 0)`); // Position the legend

// Add legend items
legend.selectAll("rect")
  .data(legendData)
  .enter().append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 25) // Space the items vertically
    .attr("width", 20)
    .attr("height", 20)
    .attr("rx", 4) 
    .attr("ry", 4)    
    .style("fill", d => d.color);

legend.selectAll("text")
  .data(legendData)
  .enter().append("text")
    .attr("x", 30) // Offset text to the right of the rectangles
    .attr("y", (d, i) => i * 25 + 12) // Vertically align text with rectangles
    .text(d => d.label)
    .style("font-size", "15px")
    .attr("alignment-baseline","middle");




    // Tooltip interactions
    circles.on("mouseover", (event, d) => {
        tooltip.html(`
            <strong>Domain:</strong> ${d.source_domain}<br>
            <strong>Fake Articles:</strong> ${d.fake_articles}<br>
            <strong>Real Articles:</strong> ${d.real_articles}<br>
            <strong>Fake Tweets:</strong> ${d.fake_tweets}<br>
            <strong>Real Tweets:</strong> ${d.real_tweets}<br>
            <strong>Total Articles:</strong> ${d.articles}<br>
            <strong>Total Tweets:</strong> ${d.tweets}<br>
            <strong>Tweets/Fake Article:</strong> ${d.tweets_per_fake_article}<br>
            <strong>Tweets/Real Article:</strong> ${d.tweets_per_real_article}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .style("visibility", "visible");
    })
    .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
    });

    // Initial plot
    updatePlot();
}

export { scatterplot };
