const w = 1000;
const h = 500;
const leyendaSpace = 220; // Para darle espacio a la leyenda debajo del mapa

const padding = 60;

d3.select("body")
    .append("h1") // Append lo crea
    .text("Box office Revenue")
    .attr("id", "title")

d3.select("body")
    .append("div") // Append lo crea
    .text("Box office revenue separated by categories")
    .attr("id", "description")
    .style("margin-bottom", "20px")

const svg = d3.select('body') // se crea el SVG
            .append("svg")
            .attr("width", w)
            .attr("height", h + leyendaSpace)

const tooltip = d3
          .select("body")
          .append("div") // Se crea un div y se le otorga styles
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background", "white")
          .style("padding", "10px")
          .style("border", "1px solid black")

const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

const categories = [
        "Action",
        "Drama",
        "Adventure",
        "Family",
        "Animation",
        "Comedy",
        "Biography"
      ];
const categoriesColors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2"
      ];

fetch(url)
  .then(response => response.json()) 
  .then(data => {
    const rawValues = data;
    //console.log(data);
  
    const colorScale = d3
      .scaleOrdinal()
      // scale ordinal es para parejas de elementos en cierto orden
      // Acá empareja las categorías con un color
      .domain(categories)
      .range(categoriesColors);
  
    const root = d3
      .hierarchy(data)
      .sum(d => d.value);

    d3.treemap()
      .size([w, h])
      (root);

    svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("class", "tile")
  
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
  
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .attr("fill", d => colorScale(d.data.category))
      .attr("stroke", "white")
      .attr("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
          const name = event.target.getAttribute("data-name");
          const category = event.target.getAttribute("data-category");
          const revenue = event.target.getAttribute("data-value");

          tooltip
            .style("visibility", "visible")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 40 + "px")
            .html(`
              Movie: ${name}<br>
              Category: ${category}<br>
              Revenue: ${revenue} USD
            `)
       })
       // el elemento se esconde cuando deja de tocar un rectángulo
       .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
       });
    
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${padding}, 550)`);
  
    legend
      .selectAll("rect")
      .data(categories)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 25) // caida de una categoria a otra
      .attr("width", 15) // Son cuadrados
      .attr("height", 15)
      .attr("fill", (d, i) => categoriesColors[i]);
  
    legend
      .selectAll("text")
      .data(categories)
      .enter()
      .append("text")
      .attr("x", 22)
      .attr("y", (d, i) => i * 25 + 13) // El +13 ajusta el texto para alinearlo
      .text(d => d); // las categorías ya vienen con nombre
  
});