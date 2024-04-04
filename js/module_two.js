import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const dataURL = "./data/output_ModuleTwo.json"; 

async function barchart() {
    const margin = { top: 0, right: 200, bottom: 120, left: 200 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = 800;

    const svg = d3.select("#app_two")
        .insert("svg")
        .attr("id", "bar-chart")
        // .style("background-color", "rgba(255, 255, 255, 0.05)")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        const colorScale = d3.scaleOrdinal()
        .domain(["Category1", "Category2", "Category3"]) // Replace with actual categories
        .range(["#red", "#yellow", "#green"]);       // Replace with actual colors
    



        

    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("text-align", "left")
        .style("padding", "8px")
        .style("background", "white")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none");



    fetch(dataURL)
    .then((response) => response.json())
    .then((data) => {
        // Group and stack data by month and year
        const groupedByMonthYear = {};
        data.forEach(entry => {
            const monthYear = entry.published_date.slice(0, 7); // "YYYY-MM"
            const monthLabel = entry.month_label + ' ' + monthYear.slice(0, 4); // Assuming 'month_label' is in each entry
            if (!groupedByMonthYear[monthYear]) {
                groupedByMonthYear[monthYear] = {
                    entries: [],
                    monthLabel: monthLabel
                };
            }
            groupedByMonthYear[monthYear].entries.push(entry);
        });

        // Calculate max fb_engagement for y-scale
        // const maxFbEngagement = d3.max(data, d => d.fb_engagement);
        const maxFbEngagement = d3.max(data, d => d.fb_engagement) * 1.05; // 5% buffer


        // Scales
        const xScale = d3.scaleBand()
            .domain(Object.keys(groupedByMonthYear).map(monthYear => groupedByMonthYear[monthYear].monthLabel))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, maxFbEngagement *3.1])
            .range([height, 0]);

        // Draw stacked bars for each month and year
        Object.entries(groupedByMonthYear).forEach(([_, { entries, monthLabel }]) => {
            let yOffset = 0;
            entries.forEach(entry => {
                const barHeight = yScale(0) - yScale(entry.fb_engagement);
                svg.append("rect")
                    .attr("x", xScale(monthLabel))
                    .attr("y", height - yOffset - barHeight)
                    .attr("width", xScale.bandwidth())
                    .attr("height", barHeight)
                    .attr("fill", () => {
                        if (entry.fb_engagement < 2000) {
                            return "#2EB000";
                        } else if (entry.fb_engagement > 2001) {
                            return "#222";
                        } else {
                            return "black";
                        }
                    })
                    .on("mouseover", (event) => {
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", 0.9);
                        tooltip.html(`<b>Title:</b> ${entry.title}<br><b>FB Engagement:</b> ${entry.fb_engagement}`)
                            .style("left", (event.pageX) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
                yOffset += barHeight;
            });
        });
            // Axes
            svg.append("g")
                .attr("class", "xaxis") // Add this class
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(xScale));

            svg.append("g")
                .attr("class", "yaxis") // Add this class
                .call(d3.axisLeft(yScale));

            // Y-axis label
            svg.append("text")
                .attr("class", "y_axis_label")
                .attr("transform", "rotate(-90)")
                .attr("fill", "#222")
                .attr("y", 100 - margin.left)
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("FB Engagement");
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
        });
}

export { barchart };
