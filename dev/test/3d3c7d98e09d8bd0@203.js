// https://observablehq.com/@rusosnith/wheres-that-2-trillion-going@203
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["cares@2.cst",new URL("./files/80d575502f856b88caa882f5732d83664d9feee8bd7c3ddab1817df00a728a9dcde0371e9f3fe304f76ef87014a177c9bacc26e6591376071368f3b8d2a4f7cd",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Where’s that $2 trillion going?

The [CARES Act](https://en.wikipedia.org/wiki/Coronavirus_Aid,_Relief,_and_Economic_Security_Act), signed into law on March 27, is the largest-ever economic stimulus package in the United States. Two trillion dollars equates to about $6,100 per person—but it’s not distributed equally to individuals. Data: [NPR, SevenandForty](https://www.reddit.com/r/dataisbeautiful/comments/fppc7v/oc_where_the_money_goes_in_the_us_senates_2t/flm9dg0/?utm_source=reddit&utm_medium=usertext&utm_name=dataisbeautiful&utm_content=t1_flmce6n)

Each dot <svg width="12" height="12" viewBox="-6 -6 12 12"><circle r="3"></circle></svg> below represents one billion dollars, rounded.`
)});
  main.variable(observer("chart")).define("chart", ["pack","data","d3","width","height","DOM","circle","autoBox"], function(pack,data,d3,width,height,DOM,circle,autoBox)
{
  const root = pack(data);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .style("font", "10px sans-serif")
      .style("overflow", "visible")
      .attr("text-anchor", "middle");

  const node = svg.append("g")
      .attr("pointer-events", "all")
    .selectAll("g")
    .data(root.descendants().slice(1))
    .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("path")
      .attr("id", d => (d.circleUid = DOM.uid("circle")).id)
      .attr("d", d => circle(d.r + 3))
      .attr("display", "none");

  node.append("circle")
      .attr("r", d => d.r)
      .attr("stroke", d => d.height > 1 ? "#ccc" : null)
      .attr("fill", d => d.children ? "none" : "currentColor")
      .attr("pointer-events", d => d.children ? "all" : "none");

  node.filter(d => d.children).append("text")
      .attr("fill", "#555")
    .append("textPath")
      .attr("xlink:href", d => d.circleUid.href)
      .attr("startOffset", "50%")
      .text(d => d.data.name);

  node.filter(d => d.height).append("title")
      .text(d => `${d.ancestors().slice(0, -1).map(d => d.data.name).reverse().join(", ").replace(/[¹²](?!$)/g, "")}
$${d.value.toLocaleString("en")} billion`);

  return svg.attr("viewBox", autoBox).node();
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`Notes:

1. Estimated based on bill text, committee, and administration numbers.
2. Allocation to be determined by the Secretary of the Treasury.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

## Appendix`
)});
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.cstParseRows(await FileAttachment("cares@2.cst").text(), ([name, value]) => ({name, ...(value === undefined ? undefined : {children: Array.from({length: Math.round(value)}, (_, i) => ({name: "", value: 1 /* Math.min(1, value - i) */ }))})}))
)});
  main.variable(observer("circle")).define("circle", ["d3"], function(d3){return(
d3.arc()
    .innerRadius(0)
    .outerRadius(d => d)
    .startAngle(-Math.PI)
    .endAngle(Math.PI)
)});
  main.variable(observer("pack")).define("pack", ["d3","width","height"], function(d3,width,height){return(
data => d3.pack()
    .size([width, height])
    .padding(d => d.height === 1 ? 4 : 20)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))
)});
  main.variable(observer("autoBox")).define("autoBox", function(){return(
function autoBox() {
  document.body.appendChild(this);
  const {x, y, width, height} = this.getBBox();
  document.body.removeChild(this);
  return [x, y, width, height];
}
)});
  main.variable(observer("width")).define("width", function(){return(
1024
)});
  main.variable(observer("height")).define("height", ["width"], function(width){return(
width
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5", "cstree@0.0")
)});
  return main;
}
