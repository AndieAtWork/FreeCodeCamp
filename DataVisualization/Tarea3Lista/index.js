const w = 1000;
const h = 500;
const leyendSpace = 100;

var months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];
//months.reverse();

d3.select("body")
    .append("h1") // Append lo crea
    .text("Monthly Global Land-Surface Temperature")
    .attr("id", "title")

d3.select("body")
    .append("div") // Append lo crea
    .text("1753 - 2015: base temperature 8.6°C")
    .attr("id", "description")

const svg = d3.select('body') // e crea el SVG
            .append("svg")
            .attr("width", w)
            .attr("height", h + leyendSpace)

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

fetch(url)
      .then(response => response.json())
      .then(data => {
        const rawValues = data;
  
        const baseTemperature = rawValues["baseTemperature"];
        const values = rawValues["monthlyVariance"];
        console.log(values);

        const padding = 60;
  
        // El eje x es un año
        const xScale = d3
          .scaleLinear()
          .domain([
            d3.min(values, d => d.year),
            d3.max(values, d => d.year)
          ])
          .range([padding, w - padding]);
        // Desde el eje x, se parte padding más a la derecha
        // Termina también un poco antes de que termine el svg
  
        const yScale = d3
          .scaleLinear()
          .domain([0, 13])
          .range([padding, h - padding]); 
          // Esta vez los valores no están invertidos porque los meses ya lo están

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale).tickValues(d3.range(1, 13)).tickFormat(d => months[d - 1]);
  
        const cellWidth = (w - 2 * padding) / (d3.max(values, d => d.year) - d3.min(values, d => d.year) + 1);
        const cellHeight = (h - 2 * padding) / 12;
        // (w - 2 * padding) ancho efectivo del heatmap, y eso se divide por la cantidad de valores
        // Lo mismo para la altura
  
        svg
          .append('g')
          .attr('id', 'x-axis')
          .attr('transform', `translate(0, ${h - padding - cellHeight / 2 + 3})`)
          .call(xAxis);

        svg
          .append('g')
          .attr('id', 'y-axis')
          .attr('transform', `translate(${padding}, 0)`)
          .call(yAxis);
  
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
        .attr("fill", d => {
          var val = baseTemperature + d.variance;
          if (val < 3.9){
            return "#5776af";
          }else if (val < 5){
            return "#86accd";
          }else if (val < 6.1){
            return "#b8d8e7";
          }else if (val < 7.2){
            return "#e0eef3";
          }else if (val < 8.3){
            return "#fefec6";
          }else if (val < 9.5){
            return "#f6e09b";
          }else if (val < 10.6){
            return "#ecb16f";
          }else if (val < 11.7){
            return "#dc754f";
          }else{
            return "#bf4232";
          }
        })
        .attr("class", "cell")
        .attr("data-month", d => {return months[d.month - 1]})
        .attr("data-year", d => { return d.year})
        .attr("data-temp", d =>{
          var val = baseTemperature + d.variance;
          return val;
        })
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month) - cellHeight / 2)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
         // el elemento tooltip ya creado se configura según qué rectángulo toca
        .on("mouseover", (event, d) => {
          const year = event.target.getAttribute("data-year");
          const month = event.target.getAttribute("data-month");
          const temperature = event.target.getAttribute("data-temp");

          tooltip
            .style("visibility", "visible")
            .style("left", event.pageX + "px")
            .style("top", event.pageY - 40 + "px")
            .text(`${year}-${month}: ${temperature}°C`);
        })
        // el elemento se esconde cuando deja de tocar un rectángulo
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
  
        // LEYENDA
        // Valores de Fill para los rectangulos
        const legendColors = [
          "#5776af",
          "#86accd",
          "#b8d8e7",
          "#e0eef3",
          "#fefec6",
          "#f6e09b",
          "#ecb16f",
          "#dc754f",
          "#bf4232"
        ];

        // Data específica para cada rectángulo del gráfico
        const legendValues = [2.8, 3.9, 5.0, 6.1, 7.2, 8.3, 9.5, 10.6, 11.7, 12.8];

        // Tamaño de la leyenda
        const legendWidth = 650; 
        const legendHeight = 30;
        // Posición de la leyenda
        const legendX = padding;
        const legendY = h;

        // La escala empieza y termina en valores exactos
        const legendScale = d3
          .scaleLinear()
          .domain([2.8, 12.8])
          .range([0, legendWidth]); // Ancho total de la leyenda

        // Se crea solo el eje x con la escala creada y los valores especificos
        const legendAxis = d3
          .axisBottom(legendScale)
          .tickValues(legendValues)
          .tickFormat(d3.format(".1f")); // Acepta 1 decimal

        // Se crea el eje
        const legend = svg
          .append("g")
          .attr("id", "legend")
          .attr("transform", `translate(${legendX}, ${legendY})`);

         // Se crean los rectánculos
        legend
          .selectAll("rect")
          .data(legendColors) // La data que se pasa son los colores
          .enter()
          .append("rect")
          .attr("x", (d, i) => i * (legendWidth / legendColors.length))
          // Divide el largo en el número de colores de la leyenda 
          // para fijar la posición
          .attr("y", 0) // Altura 0 respecto a la leyenda
          .attr("width", legendWidth / legendColors.length)
          .attr("height", legendHeight)
          .attr("fill", d => d)
          .attr("stroke", "black");

        // A la leyenda se le agrega los números del eje
        // Notese que el transform es diferente
        // Esto se crea a partir de la leyenda, desde el x inicial hasta la altura hacia abajo de los rectangulos
        legend
          .append("g")
          .attr("transform", `translate(0, ${legendHeight})`)
          .call(legendAxis);
 });