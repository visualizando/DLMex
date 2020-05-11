


    var estadosCode = {
    'Aguascalientes':'MEX-2717',
    'Baja California':'MEX-2706',
    'Baja California Sur':'MEX-2707',
    'Campeche':'MEX-2722',
    'Chiapas':'MEX-2735',
    'Chihuahua':'MEX-2709',
    'Ciudad De México':'MEX-2727',
    'Coahuila':'MEX-2708',
    'Colima':'MEX-2718',
    'Durango':'MEX-2710',
    'Guanajuato':'MEX-2728',
    'Guerrero':'MEX-2729',
    'Hidalgo':'MEX-2730',
    'Jalisco':'MEX-2719',
    'Estado De México':'MEX-2731',
    'Michoacán':'MEX-2720',
    'Morelos':'MEX-2732',
    'Nayarit':'MEX-2721',
    'Nuevo León':'MEX-2714',
    'Oaxaca':'MEX-2723',
    'Puebla':'MEX-2724',
    'Querétaro':'MEX-2733',
    'Quintana Roo':'MEX-2736',
    'San Luis Potosí':'MEX-2715',
    'Sinaloa':'MEX-2711',
    'Sonora':'MEX-2712',
    'Tabasco':'MEX-2725',
    'Tamaulipas':'MEX-2716',
    'Tlaxcala':'MEX-2726',
    'Veracruz':'MEX-2734',
    'Yucatán':'MEX-2737',
    'Zacatecas':'MEX-2713'
    };
    
    var circunscripciones={
    'I Circunscripción':[-114,23],
    'II Circunscripción':[-96,28],
    'III Circunscripción':[-90,23],
    'IV Circunscripción':[-104,16],
    'V Circunscripción':[-109,19],
    'Representación Proporcional':[-109,19],
    'Ciudad De México':[-94,21]
    }
    
  
    var gruposAparteDef=[ // ACA DEFINO QUE GRUPOS VAN APARTE
    'I Circunscripción',
    'II Circunscripción',
    'III Circunscripción',
    'IV Circunscripción',
    'V Circunscripción',
    'Ciudad De México'
    ];




    var path = d3.geoPath();
    
    var proyeccionMapa = d3.geoMercator()
                    ;
    
    var padding = 1;
    
    var height = 900, width=1000;
    var distanceLimit = 30;
    
    var colorScale = d3.scaleOrdinal()
        .range(["#97191E","#282770","#F62128","#DF3A01","#FD7631","#634878","#008246","#F7EC47","gray"])
        .domain(["MORENA","PAN","PRI","PT","MC","PES","PVEM","PRD","SG"]);
    
    
    
    var angleScale = d3.scaleOrdinal()
          .range([1/9,2/9,3/9,4/9,5/9,6/9,7/9,8/9,1]);
        angleScale.domain = colorScale.domain;
        
      var promises = [
        d3.json("data/mexico.topo.json"),
        d3.csv("data/congreso.csv")
      ]
    
      Promise.all(promises).then(function(data){
        ready(data)
      });
    
    
    // Define the div for the tooltip
    let div = d3.select("#tooltip")
    .style("opacity",0)
    .style("left", width*0.7 + "px")
    .style("top", height * 0.2 + "px")
    ;
    
    var svg = d3.select("#mapaDiputados")
                .attr("height",height)
                .attr("width",width);
    
    
    function ready (results){
        var mapTopoJson = results[0]; // acá esta el mapa
        

        var personas = d3.nest() // acá las personas en csv
                          .key(function (d) { return d.camara; })
                          .object(results[1]);

                          personas = personas["diputados"]
    
    // --------- MAPA
        var mapa = topojson.feature(mapTopoJson, mapTopoJson.objects.mexico);  
    
          proyeccionMapa.fitWidth(width, mapa)
          path.projection(proyeccionMapa);
    
            svg.append("g")
                .attr("class", "states")
              .selectAll("path")
              .data(mapa.features)
              .enter().append("path")
              .attr("class","estadoVector")
              .attr("fill","rgba(0,0,0,0.1")
                .attr("d", path)
                .attr("id",function(d){ return d.properties.adm1_code})
                ;
    
            var centroids = {}; // tomo los centroides de cada estado.
            mapa.features.map(function (feature){
                centroids[feature.properties.adm1_code] = path.centroid(feature);
              });
    
    
    
    // --------- BUBBLES

        var nodes = personas.map(function(d, i) {
            var centroide;
              if (d.Entidad =="Ciudad De México"){
                centroide = proyeccionMapa(circunscripciones["Ciudad De México"]);
              } else if (d.tipo !="circunscripcion"){
                centroide = [centroids[estadosCode[d.Entidad]][0],centroids[estadosCode[d.Entidad]][1]];
              } else {
                centroide = proyeccionMapa(circunscripciones[d.Entidad]);
              }
    
           
            return {
              id: d.idDirectorio,
              nombre: d.nombre,
              estado: d.Entidad,
              partido: d.partido,
              genero: d.genero,
              radius: 5,
              r: 5,
              tipo: d.tipo,
              distrito: d.distrito,
              centroide:  centroide,
              x: centroide[0]+15*Math.cos(angleScale(d.partido)*Math.PI*2),
              y: centroide[1]+15*Math.sin(angleScale(d.partido)*Math.PI*2),
            }
          });
    
          
          
            var nodos = svg.append('g').attr("id","bubbles")
                  .datum(nodes)
                  .selectAll('.nodes')
                  .data(d => d)
                  .enter()
                  .append('g')
                  .attr('id',(d) =>d.id)
                  .attr("transform",function(d){ return "translate(" + d.x + "," + d.y +")"})
                ;
    
                       
    
                var simulation = d3.forceSimulation(nodes)
                    .force('charge', d3.forceManyBody().strength(0.3))
                    .force('x', d3.forceX().x(function (d) {return d.centroide[0]}).strength(0.06))
                    .force('y', d3.forceY().y(function (d) {return d.centroide[1]}).strength(0.06))
                    .force('collision', d3.forceCollide().radius(function (d) {return d.radius + padding}).strength(0.2))
                    .alphaDecay(0.07)
                    //.on('tick', ticked);
                   .stop();
    
      
      d3.timeout(function() {
    
                   for (var i = 0; i < 170; ++i) simulation.tick(); // evalua la simulacion
                       ticked(); //actualiza posiciones.
                    
    
                    var circles = nodos.append('circle')
                        .attr('r', (d) => d.radius)
                        .attr('class','circulos')
                        .attr('fill', (d) => colorScale(d.partido))
                    
                        ;
    
                    // --------- voronoi zone
    
                    var cell = svg.append("g")
                          .attr("class", "cells")
                        .selectAll("g").data(d3.voronoi()
                            .extent([[0, 0], [width, height]])
                            .x(function(d) { return d.x; })
                            .y(function(d) { return d.y; })
                          .polygons(nodes)).enter().append("g")
    
    
                        // add tooltips to each circle
                            .on("click", function(d) {
                              d3.selectAll(".circulos")
                                              .classed("unselected", false)
                                              .classed("selected", false);  
    
                                d3.selectAll(".estadoVector")
                                    .transition()    
                                    .duration(200)    
                                    .style("fill", "rgba(0,0,0,0.1")
    
    
                              if(getDistance(d3.mouse(this), [d.data.x, d.data.y])<distanceLimit){
                                div.transition()    
                                    .duration(200)    
                                    .style("opacity", .9);    
    
                                    div.select("#title").html(d.data.nombre);
                                    div.select("#estado").html("Estado:&nbsp;<b>"+d.data.estado+"</b>");
                                    div.select("#distrito").html("Distrito:&nbsp;<b>"+d.data.distrito+"</b>");
                                    div.select("#partido").html("Partido:&nbsp;<b>"+d.data.partido+"</b>");
    
                                d3.selectAll(".circulos").filter(function(e){
                                  return e.id != d.data.id})
                                              .classed("unselected", true); 
    
                                d3.selectAll(".circulos").filter(function(e){return e.id == d.data.id})
                                              .classed("selected", true); 
    
                                d3.selectAll(".estadoVector").filter(function(e){
                                  if(e.hasOwnProperty('properties')){
                                        if(estadosCode[d.data.estado] == e.properties.adm1_code) return 1}
                                      })
                                    .transition()    
                                    .duration(100)    
                                    .style("fill", "rgba(0,0,0,0.3")
                                }else{
                                  div.transition()
                                  .duration(200)
                                  .style("opacity", 0);    
    
                                }
                              })          
                              .on("mousemove", function (d) {
                                d3.selectAll(".circulos")
                                .classed("hovered", false);
                                if (getDistance(d3.mouse(this), [d.data.x, d.data.y]) < distanceLimit) {
                                d3.selectAll(".circulos").filter(function (e) { 
                                  return e.id == d.data.id })
                                            .classed("hovered", true); 
                                }
                              })
                            
                            ;
    
                    cell.append("path")
                          .attr("d", function(d) { return "M" + d.join("L") + "Z"; });

                          var circunscripcionesCircles = [];
                          gruposAparteDef.forEach(function(d, i) { 
                            circunscripcionesCircles.push([d3.packEnclose(circles.data().filter(function(d){return d.estado == gruposAparteDef[i]})),d])

                          });

                          var gruposAparteCirculos = svg.append("g").attr("id","gruposAparte")
                            .selectAll("g")
                            .data(circunscripcionesCircles)
                            .enter()
                            .append("g")
                            .attr("transform",function(d){ return "translate(" + d[0].x + "," + d[0].y +")"});


                          gruposAparteCirculos.append("circle")
                            .attr("class", "enclosingCircle")
                            .attr("r", function(d) {
                              return d[0].r*1.1 ;
                            });

                          gruposAparteCirculos.append("path")
                            .attr("id", function(d,i){
                              return "circPath"+i;
                            })
                            .attr("d", d => circle(d[0].r + 10))
                            .attr("display", "none");

                          gruposAparteCirculos.append("text")
                            .attr("fill", "#555")
                          .append("textPath")
                            .attr("xlink:href",  function(d,i){
                              return "#circPath"+i;
                            })
                            .attr("startOffset", "50%")
                            .text(d=>d[1]);
    
           });  //--- END TIMEOUT
    
      function ticked() {
              nodos.attr("transform", function(d){ 
                return "translate(" + d.x + "," + d.y +")"});
      }
    
    
    var linearSize = d3.scaleLinear().domain([0,10]).range([10, 30]);
    
    
    
    /// LEYENDAS
    
    var leyenda = svg.append("g")
        .attr("class", "leyenda")
      
      .attr("transform", "translate("+(width-80)+", 40)");
    
      leyenda.append("g").attr("class", "legendSize");
    
    
      leyenda.append("g")
        .attr("transform", "translate(0, 80)")
      .attr("class", "legendOrdinal");
      
    
    var legendOrdinal = d3.legendColor()
      .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
      .shapePadding(6)
        .labelOffset(10)
       .title("Partido")
        .orient('vertical')
      .scale(colorScale);
    
    svg.select(".legendOrdinal")
      .call(legendOrdinal);
    
    
    function trimArray(arr)
    {
        for(i=0;i<arr.length;i++)
        {
            arr[i] = arr[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }
        return arr;
    }
    
    function getDistance(point1, point2) {
        var xs = 0;
        var ys = 0;
    
        xs = point2[0] - point1[0];
        xs = xs * xs;
    
        ys = point2[1] - point1[1];
        ys = ys * ys;
    
        return Math.sqrt(xs + ys);
      }
    
    var circle = d3.arc()
    .innerRadius(0)
    .outerRadius(d => d)
    .startAngle(-Math.PI)
    .endAngle(Math.PI);
    
    
    } // fin de Ready;
    
    
    
    
    

    