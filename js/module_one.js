import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function bubblechart() {
    const topKeywords = ['All', 'Trump', 'President', 'Obama', 'Clinton', 'Hillary', 'White', 'State', 'News', 'Media', 'Police'];
    const otherKeywords = ['All', 'FBI', 'Intelligence', 'Press', 'Republican', 'Vote', 'Law', 'Donald', 'Gun', 'Muslim', 'Money', 'National'];

    d3.select("#keywordDropdown")
        .selectAll("option")
        .data(topKeywords)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    d3.select("#otherKeywordDropdown")
        .selectAll("option")
        .data(otherKeywords)
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

        const margin = { top: 40, right: 0, bottom: 30, left: 0 };
        const width = window.innerWidth - margin.left - margin.right;
        const height = 850 + margin.top - margin.bottom;
        const maxBubbleSize = 20;

    const svg = d3.select("#app_one")
        .append("svg")
        .attr("id", "bubble-chart")
        .attr("width", width)
        .attr("height", height);

    const dataURL = "../data/output_ModuleOne.json";

    fetch(dataURL)
        .then(response => response.json())
        .then(data => {
            data = data.filter((entry) => entry.tweet_num >= 150 && entry.tweet_num <= 800);
            const sizeScale = d3.scaleSqrt().domain([50, 500]).range([0, maxBubbleSize]);
            const colorScale = d3.scaleThreshold()
                .domain([200, 401, 601, 801])
                .range(["#000", "#2EB000", "gray", "#910361"]);

            const tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("padding", "10px")
                .style("background", "#fff")
                .style("border", "1px solid #ddd")
                .style("border-radius", "5px")
                .style("pointer-events", "none")
                .style("font-size", "12px");

            renderBubbles(data);

            d3.select("#keywordDropdown").on("change", function() {
                const selectedKeyword = d3.select(this).property("value").toLowerCase();
                updateBubbles(selectedKeyword);
                d3.select("#otherKeywordDropdown").property("disabled", selectedKeyword !== 'all');
            });

            d3.select("#otherKeywordDropdown").on("change", function() {
                const selectedKeyword = d3.select(this).property("value").toLowerCase();
                updateBubbles(selectedKeyword);
                d3.select("#keywordDropdown").property("disabled", selectedKeyword !== 'all');
            });

            function updateBubbles(selectedKeyword, dropdownBeingUsed) {
                svg.selectAll("circle")
                    .style("opacity", d => selectedKeyword === 'all' || d.title.toLowerCase().includes(selectedKeyword) ? 1 : 0.1);
                svg.selectAll("text.label")
                    .style("opacity", d => selectedKeyword === 'all' || d.title.toLowerCase().includes(selectedKeyword) ? 1 : 0);

                svg.selectAll("circle")
                    .on("mouseover", (event, d) => {
                        if (selectedKeyword === 'all' || d.title.toLowerCase().includes(selectedKeyword)) {
                            tooltip.html(`<span class="tooltip-key"><b>Story:</b></span> ${d.title}, <br><span class="tooltip-key"><b>Retweeted:</b></span> ${d.tweet_num}`)
                                .style("visibility", "visible")
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY - 10) + "px");
                        }
                    })
                    .on("mouseout", () => {
                        tooltip.style("visibility", "hidden");
                    });

                // if (selectedKeyword === 'all') {
                //     d3.select("#keywordDropdown").property("disabled", false);
                //     d3.select("#otherKeywordDropdown").property("disabled", false);
                // }

 // Dimming and disabling logic
 if (selectedKeyword !== 'all') {
  if (dropdownBeingUsed === "keywordDropdown") {
      d3.select("#otherKeywordDropdown").style("opacity", 0.25).property("disabled", true);
      d3.select("#keywordDropdown").style("opacity", 1).property("disabled", false);
  } else {
      d3.select("#keywordDropdown").style("opacity", 0.25).property("disabled", true);
      d3.select("#otherKeywordDropdown").style("opacity", 1).property("disabled", false);
  }
} else {
  d3.select("#keywordDropdown").style("opacity", 1).property("disabled", false);
  d3.select("#otherKeywordDropdown").style("opacity", 1).property("disabled", false);
}
}

d3.select("#keywordDropdown").on("change", function() {
const selectedKeyword = d3.select(this).property("value").toLowerCase();
updateBubbles(selectedKeyword, "keywordDropdown");
});

d3.select("#otherKeywordDropdown").on("change", function() {
const selectedKeyword = d3.select(this).property("value").toLowerCase();
updateBubbles(selectedKeyword, "otherKeywordDropdown");
});
  
            

            function renderBubbles(data) {
                svg.selectAll("*").remove();

                const bubbles = svg.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle")
                    .attr("r", d => sizeScale(d.tweet_num))
                    .style("fill", d => colorScale(d.tweet_num))
                    .on("mouseover", (event, d) => {
                        tooltip.html(`<span class="tooltip-key"><b>Story:</b></span> ${d.title}, <br><span class="tooltip-key"><b>Retweeted:</b></span> ${d.tweet_num}`)
                            .style("visibility", "visible")
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 10) + "px");
                    })
                    .on("mouseout", () => {
                        tooltip.style("visibility", "hidden");
                    });

                const labels = svg.selectAll("text.label")
                    .data(data)
                    .enter()
                    .append("text")
                    .attr("class", "label")
                    .text(d => d.tweet_num)
                    .attr("text-anchor", "middle")
                    .attr("dominant-baseline", "middle")
                    .style("fill", "white")
                    .style("font-size", d => `${sizeScale(d.tweet_num) / 2}px`);

                const simulation = d3.forceSimulation(data)
                    .force("charge", d3.forceManyBody().strength(10))
                    .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
                    .force("collision", d3.forceCollide().radius((d) => sizeScale(d.tweet_num) + 2).strength(0.5))
                    .on("tick", ticked);

                function ticked() {
                    bubbles.attr("cx", d => d.x).attr("cy", d => d.y);
                    labels.attr("x", d => d.x).attr("y", d => d.y);
                }
            }
        })
        .catch(error => console.error("Error loading data:", error));
}

export { bubblechart };
