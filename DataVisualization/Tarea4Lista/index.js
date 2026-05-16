
const w = 1000;
const h = 500;
const leyendaSpace = 200; // Para darle espacio a la leyenda debajo del mapa

const padding = 60;

const leyendaColores = [
  "#e5eadf",
  "#c5d8ba",
  "#a5c995",
  "#85ba70",
  "#68a85d",
  "#4f8f4c",
  "#3b7437"
]
const leyendaValues = [
  3,
  12,
  21,
  30,
  39,
  48,
  57,
  66
]

d3.select("body")
    .append("h1") // Append lo crea
    .text("United States Educational Attainment")
    .attr("id", "title")

d3.select("body")
    .append("div") // Append lo crea
    .text("Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)")
    .attr("id", "description")
    .style("margin-bottom", "20px")

const svg = d3.select('body') // se crea el SVG
            .append("svg")
            .attr("width", w)
            .attr("height", h + leyendaSpace)

const urlEducation = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const urlPoligons = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

// Se hace una promesa que obtiene ambos valores y los guarda en las variables dadas
Promise.all([
  fetch(urlEducation).then(res => res.json()),
  fetch(urlPoligons).then(res => res.json())
]).then(([educationData, countyData]) => {
  
  console.log(educationData);

  const counties = topojson.feature(
    countyData,
    countyData.objects.counties
  ).features;

  const path = d3.geoPath();
  
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
    .selectAll("path")
    .data(counties)
    .enter()
    .append("path")
    .attr("d", path) // Hasta este punto solo se crea el mapa, más abajo se ingresa la información de educacion
    .attr("class", "county")
    .attr("data-fips", d => {
      var education = educationData.find(e => e.fips === d.id);
      return education.fips;
    })
    .attr("data-education", d => {
      var education = educationData.find(e => e.fips === d.id);
      return education.bachelorsOrHigher;
    })
    .attr("location", d => {
      var education = educationData.find(e => e.fips === d.id);
      return education.area_name + " (" + education.state + ")";
    })
    .attr("fill", d => {
      var education = educationData.find(e => e.fips === d.id).bachelorsOrHigher;
      if (education < 3){
         return "#e5eadf";
      }else if (education < 12){
         return "#c5d8ba";
      }else if (education < 21){
        return "#a5c995";
      }else if (education < 30){
        return "#85ba70";
      }else if (education < 39){
        return "#68a85d";
      }else if (education < 48){
        return "#4f8f4c";
      }else if (education < 57){
        return "#3b7437";
      }else if (education <= 66){
        return "#2e672d";
      }
    }).on("mouseover", (event, d) => {
      const education = event.target.getAttribute("data-education");
      const location = event.target.getAttribute("location");
      tooltip
        .style("visibility", "visible")
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 40 + "px")
        .text(`${location}: ${education} `);
    })
    // el elemento se esconde cuando deja de tocar un rectángulo
      .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });
  
    // Tamaño de la leyenda
    const legendWidth = 650; 
    const legendHeight = 30;
    // Posición de la leyenda
    const legendX = padding;
    const legendY = h + 150; // Un poco más abajo de donde termina el mapa, pero antes de terminar el svg

    // La escala empieza y termina en valores exactos
    const legendScale = d3
    .scaleLinear()
    .domain([3, 66])
    .range([0, legendWidth]); // Ancho total de la leyenda

    // Se crea solo el eje x con la escala creada y los valores especificos
    const legendAxis = d3
    .axisBottom(legendScale)
    .tickValues(leyendaValues)
    .tickFormat(d => d + "%");

    // Se crea el eje en la posición correcta
    const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${legendX}, ${legendY})`);

    // Se crean los rectánculos de la leyenda
    legend
      .selectAll("rect")
      .data(leyendaColores) // Notese que hay un color menos que numeros leyendaValues
      .enter()
      .append("rect")
      .attr("x", (d, i) => legendScale(leyendaValues[i])) // Se ajusta a el tamaño/proporcion de la leyenda
      .attr("y", 0) // Altura 0 respecto a la leyenda
      .attr("width", (d, i) => legendScale(leyendaValues[i + 1]) - legendScale(leyendaValues[i]))
      // El ancho corresponde a la diferencia entre los dos valores
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

