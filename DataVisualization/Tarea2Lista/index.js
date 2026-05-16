const w = 1000;
const h = 300;

d3.select("body")
    .append("h1") // Append lo crea
    .text("Doping in Professional Bicycle Racing")
    .attr("id", "title")

const svg = d3.select('body') // e crea el SVG
            .append("svg")
            .attr("width", w)
            .attr("height", h)

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

fetch(url)
      .then(response => response.json())
      .then(data => {
        const rawValues = data;
        
        //const values = rawValues.map(d => [d["Year"], d["Seconds"]/60]);
        const values = rawValues.map(d => [
          d.Year,
          new Date(Date.UTC(1970, 0, 1, 0, Math.floor(d.Seconds / 60), d.Seconds % 60))
        ]);
        console.log(values);

        const padding = 40;
  
        // El eje x es un año
        const xScale = d3
          .scaleLinear()
          .domain([
            d3.min(values, d => d[0] - 1), // Tiene un borde extra para que los circulos no estén sobre el eje
            d3.max(values, d => d[0])
          ])
          .range([padding, w - padding]);
        // Desde el eje x, se parte padding más a la derecha
        // Termina también un poco antes de que termine el svg

        // El eje no es numerico
  
        const yScale = d3
          .scaleTime()
          .domain([new Date(d3.min(values, d => d[1]).getTime() - 10000), d3.max(values, d => d[1])])
          .range([h - padding, padding]); // Invertido para que el grafico parta de abajo
        // Empieza desde abajo un poco más arriba que la altura hacia abajo del svg
        // Termina un padding antes de tocar el techo del svg

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale).tickFormat(d3.utcFormat("%M:%S"));
  
        const tooltip = d3
          .select("body")
          .append("div") // Se crea un div y se le otorga styles
          .attr("id", "tooltip")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background", "white")
          .style("padding", "10px")
          .style("border", "1px solid black");
  
        svg.selectAll('circle')
            .data(values)
            .enter()
            .append('circle')
            .attr("class", "dot")
            .attr("data-xvalue", d => d[0])
            .attr("data-yvalue", d => {
              const minutes = d[1].getUTCMinutes();
              const seconds = d[1].getUTCSeconds();

              return `${minutes}:${seconds}`;
            })
            .attr("cx", (d, i) => { return xScale(d[0]);
            })
            .attr("cy", (d, i) => { return yScale(d[1]);
            })
            .attr("r", 5)
            .attr("fill", d => 
                  d[1].getUTCMinutes() < 38 ? "blue" : "red"
            ).on("mouseover", (event, d) => {
          
              const date = event.target.getAttribute("data-xvalue");

              tooltip
                .style("visibility", "visible")
                .attr("data-date", "date")
                .style("left", event.pageX + "px")
                .style("top", event.pageY - 40 + "px")
                .text(date);
            }).on("mouseout", () => {
              tooltip.style("visibility", "hidden");
          });
  
          const legend = svg
            .append("g")
            .attr("id", "legend");

          legend
            .append("text")
            .attr("x", 700)
            .attr("y", 200)
            .text("Blue: inferior than 38 minutes");
  
        d3.select("#legend")
          .append("text")
          .attr("x", 700)
          .attr("y", 220)
          .text("Red: superior than or equal to 38 minutes");
  
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
