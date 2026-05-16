const w = 1000;
const h = 300;

d3.select("body")
    .append("h1") // Append lo crea
    .text("United States GDP")
    .attr("id", "title")

const svg = d3.select('body') // e crea el SVG
            .append("svg")
            .attr("width", w)
            .attr("height", h)

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

fetch(url)
      .then(response => response.json())
      .then(data => {
        const rawValues = data.data;
        const values = rawValues.map(d => [
                    new Date(d[0]), d[1]]);
        console.log(values);

        const padding = 40;
  
        // El eje x es una fecha
        const xScale = d3
          .scaleTime()
          .domain([
            d3.min(values, d => d[0]),
            d3.max(values, d => d[0])
          ])
          .range([padding, w - padding]);
        // Desde el eje x, se parte padding más a la derecha
        // Termina también un poco antes de que termine el svg

        // El eje es numerico
        const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(values, d => d[1])])
          .range([h - padding, padding]); // Invertido para que el grafico parta de abajo
        // Empieza desde abajo un poco más arriba que la altura hacia abajo del svg
        // Termina un padding antes de tocar el techo del svg
  
        const tooltip = d3
          .select("body")
          .append("div") // Se crea un div y se le otorga styles
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background", "white")
          .style("padding", "10px")
          .style("border", "1px solid black")
  
        svg
          .selectAll('rect')
          .data(values)
          .enter()
          .append('rect')
          .attr("class", "bar")
          .attr("data-date", d => d[0].toISOString().split("T")[0])
          .attr("data-gdp", d => d[1])
          .attr("fill", "lightblue")
          .attr("x", d => xScale(d[0])) // se ubica horizontalmente según fecha
          .attr("y", d => yScale(d[1])) // valor gdp los ubica verticalmente
          .attr("width", 3) // ancho de cada rectángulo
          .attr("height", d => h - padding - yScale(d[1])) // Altura
          // h - padding es el techo. yScale tiene la correspondencia invertida de y
  
          // el elemento tooltip ya creado se configura según qué rectángulo toca
          .on("mouseover", (event, d) => {
          
            const date = event.target.getAttribute("data-date");
            const val = event.target.getAttribute("data-gdp");
          
            tooltip
              .style("visibility", "visible")
              .attr("data-date", date)
              .style("left", event.pageX + "px")
              .style("top", event.pageY - 40 + "px")
              .text(`${val}(${date})`);
          })
          // el elemento se esconde cuando deja de tocar un rectángulo
          .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
          });

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg
          .append('g')
          .attr('id', 'x-axis')
          .attr('transform', `translate(0, ${h - padding})`)
          .call(xAxis);

        svg
          .append('g')
          .attr('id', 'y-axis')
          .attr('transform', `translate(${padding}, 0)`)
          .call(yAxis);
 
 })
