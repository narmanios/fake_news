import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function heatmap() {
    const data = await d3.json("/data/output_ModuleThree.json");
    const sourcesToKeep = new Set(["Facebook posts", "Donald Trump", "Viral image", "Bloggers", "Tweets", "Hillary Clinton", "Marco Rubio"]);
    const labelsToGroup = new Set(["full-flop", "half-flip", "no-flip"]);

    // Initialize counts
    const counts = {};
    sourcesToKeep.forEach(source => counts[source] = {});
    counts["Individuals"] = {};

    // Process data, rename 'Other' to 'Individuals', and group certain labels
    const allLabels = new Set();
    data.forEach(d => {
        const source = sourcesToKeep.has(d.Source) ? d.Source : "Individuals";
        const label = labelsToGroup.has(d.Label) ? "Other" : d.Label;
        allLabels.add(label);

        if (!counts[source]) {
            counts[source] = {};
        }
        counts[source][label] = (counts[source][label] || 0) + 1;
    });

    // Define your custom order for the sources (rows)
    const customSourceOrder = ["Individuals", "Facebook posts", "Donald Trump", "Viral image", "Bloggers", "Tweets", "Hillary Clinton", "Marco Rubio"];
    const labelOrder = ["FALSE", "pants-fire", "barely-true", "half-true", "mostly-true", "TRUE", "Other"];

        // Define custom label order, moving 'Barley True' and 'True' to the end
        // const specialLabels = ['Barely True', 'True']; // Labels to move to the end
        // const labelOrder = Array.from(allLabels).filter(label => !specialLabels.includes(label)).concat(specialLabels);
    
        // Calculate totals for each label
        const totalCounts = {};
        labelOrder.forEach(label => {
            totalCounts[label] = Object.values(counts).reduce((sum, sourceCounts) => sum + (sourceCounts[label] || 0), 0);
        });


    const maxValue = d3.max(Object.values(counts), d => d3.max(Object.values(d)));
    const colorScale = d3.scaleLinear().domain([0, maxValue]).range(["#FEC1F4", "#D247BC"]);

    // Create the table and adjust its sizing
    const table = d3.select("#app_three")
                    .insert("table")
                    .classed("my-table", true)
                    .style("margin", "auto")
                    .style("width", "1000px")
                    .style("height", "500px");

    const thead = table.append("thead");
    const tbody = table.append("tbody");

    // Append and style the header row based on custom label order
    thead.append("tr")
         .selectAll("th")
         .data([""].concat(labelOrder))
         .enter()
         .append("th")
         .text(d => d)
         .style("padding", "10px")
         .style("font-size", "16px")
         .style("width", "60px"); 

    // Create and style the rows for each source based on custom source order
    const rows = tbody.selectAll("tr")
                      .data(customSourceOrder)
                      .enter()
                      .append("tr")
                      .style("height", "50px");

    rows.each(function(source) {
        d3.select(this).selectAll("td")
          .data(["source"].concat(labelOrder))
          .enter()
          .append("td")
          .attr("style", function(d) {
              if (d === "source") {
                  return "font-weight: bold; padding: 10px;";
              } else {
                  const count = counts[source] && counts[source][d] ? counts[source][d] : 0;
                  return `background-color: ${colorScale(count)}; padding: 10px;`;
              }
          })
          .text(function(d) {
              if (d === "source") {
                  return source;
              } else {
                  return counts[source] && counts[source][d] ? counts[source][d] : 0;
              }
          });
    });

    // Add a total row
    const totalRow = tbody.append("tr")
                          .style("height", "50px")
                          .classed("total-row", true);

    totalRow.selectAll("td")
            .data(["Sum of all Stories"].concat(labelOrder))
            .enter()
            .append("td")
            .attr("style", function(d) {
                if (d === "Sum of all Stories") {
                    return "font-weight: bold; padding: 10px; color: #000";
                } else {
                    const count = totalCounts[d];
                    return "background-color: #fff; padding: 10px; color: #000"; // Example gray color
                }
            })
            .text(d => d === "Sum of all Stories" ? d : totalCounts[d]);
}

export { heatmap };
