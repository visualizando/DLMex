


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

    var estadosCodeInv = {
      'MEX-2717':'Aguascalientes',
      'MEX-2706':'Baja California',
      'MEX-2707':'Baja California Sur',
      'MEX-2722':'Campeche',
      'MEX-2735':'Chiapas',
      'MEX-2709':'Chihuahua',
      'MEX-2727':'Ciudad De México',
      'MEX-2708':'Coahuila',
      'MEX-2718':'Colima',
      'MEX-2710':'Durango',
      'MEX-2728':'Guanajuato',
      'MEX-2729':'Guerrero',
      'MEX-2730':'Hidalgo',
      'MEX-2719':'Jalisco',
      'MEX-2731':'Estado De México',
      'MEX-2720':'Michoacán',
      'MEX-2732':'Morelos',
      'MEX-2721':'Nayarit',
      'MEX-2714':'Nuevo León',
      'MEX-2723':'Oaxaca',
      'MEX-2724':'Puebla',
      'MEX-2733':'Querétaro',
      'MEX-2736':'Quintana Roo',
      'MEX-2715':'San Luis Potosí',
      'MEX-2711':'Sinaloa',
      'MEX-2712':'Sonora',
      'MEX-2725':'Tabasco',
      'MEX-2716':'Tamaulipas',
      'MEX-2726':'Tlaxcala',
      'MEX-2734':'Veracruz',
      'MEX-2737':'Yucatán',
      'MEX-2713':'Zacatecas'
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
    var diputados, senadores, senadoTooltipClicked;

    var padding = 1;
    
    var height = 700, width=1000;
    var distanceLimit = 30;
    
    var partidosLista =["MORENA","PAN","PRI","PT","MC","PES","PVEM","PRD","SG"];

    var urlBuscador = "mx.legisladores.directoriolegislativo.org/Home/Diputado/ID";

    var colorScale = d3.scaleOrdinal()
        .domain(partidosLista)
        .range(partidosLista);
        
    
    
    var angleScale = d3.scaleOrdinal()
          .range([1/9,2/9,3/9,4/9,5/9,6/9,7/9,8/9,1]);
        angleScale.domain = partidosLista;
    


  // CARGA DE DATOS


      var promises = [
        d3.json("data/mexico.topo.json"),
        d3.csv("data/congreso.csv"),
        d3.xml("data/Senado_Mapa_Mexico.svg"),
        d3.csv("data/comisiones.csv"),
        d3.csv("data/organigramas.csv"),
        d3.csv("data/organigramas-descripcion.csv"),
      ]
      Promise.all(promises).then(function(data){
        ready(data)
      });
    
    

    

  //---------- FUNCTION READY----------
    function ready (results){        
        var personas = d3.nest() // acá las personas en csv
                          .key(function (d) { return d.camara; })
                          .object(results[1]);

            diputados = personas["diputados"];
            senadores = personas["senadores"];
        
        dibujaDiputados(diputados,results[0]);
        dibujaSenado(senadores,results[2]);
        dibujaComisiones(results[3]);
        dibujaOrganigramas(results[4],results[5]); // data de organigramas, descripciones
 

}

function dibujaDiputados(diputados,mapaJSON) {
  
    // Define the div for the tooltip
    let tooltipDiputados = d3.select("#tooltipDiputados")
    .style("right", "50px")
    .style("top", height * 0.2 + "px")
    ;

  
  var svg = d3.select("div#mapaDiputados")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 " + width + " " + height)
          .classed("svg-content", true);


    
    // --------- MAPA


    
    var mapTopoJson = mapaJSON; // acá esta el mapa

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

        var nodes = diputados.map(function(d, i) {
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
    
                   for (var i = 0; i < 150; ++i) simulation.tick(); // evalua la simulacion
                       ticked(); //actualiza posiciones.
                    
    
                    var circles = nodos.append('circle')
                        .attr('r', (d) => d.radius)
                        //.attr('class','circulos')
                        .attr("class", d => "circulos "+ d.partido)
                        //.attr('fill', (d) => colorScale(d.partido))
                    
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
                                tooltipDiputados.transition()    
                                    .duration(200)    
                                    .style("opacity", .9);    
    
                                    tooltipDiputados.select("#title").html(d.data.nombre);
                                    tooltipDiputados.select("#estado").html("Estado:&nbsp;<b>"+d.data.estado+"</b>");
                                    tooltipDiputados.select("#distrito").html("Distrito:&nbsp;<b>"+d.data.distrito+"</b>");
                                    tooltipDiputados.select("#partido").html("Partido:&nbsp;<b>"+d.data.partido+"</b>");
                                    tooltipDiputados.select("#link").attr("href",urlBuscador + d.data.id);
    
                                d3.selectAll(".circulos").filter(function(e){return e.id != d.data.id})
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
                                  tooltipDiputados.transition()
                                  .duration(200)
                                  .style("opacity", 0);    
    
                                }
                              })          
                              .on("mousemove", function (d) { // HOVER SECTION
                                d3.selectAll(".circulos")
                                      .classed("hovered", false);
                                
                                d3.selectAll(".estadoVector")
                                      .classed("hovered", false);
                                      
                                if (getDistance(d3.mouse(this), [d.data.x, d.data.y]) < distanceLimit) {
                                         d3.selectAll(".circulos")
                                                .filter(function (e) { return e.id == d.data.id })
                                                      .classed("hovered", true); 
                                        
                                         d3.select(".estadoVector#"+ estadosCode[d.data.estado])
                                                      .classed("hovered", true); 
                                }
                              })
                            
                            ;
    
                    cell.append("path").attr("d", function(d) {
                      if(d) return "M" + d.join("L") + "Z"; });

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
    
    
        
    /// LEYENDAS
    
    var leyenda = svg.append("g")
        .attr("class", "leyenda")
        .attr("transform", "translate("+(width-80)+", 20)");

        leyenda.append("g").attr("class", "legendSize");
        leyenda.append("g")
         .attr("transform", "translate(0, 50)")
         .attr("class", "legendOrdinal");

    var leyendaSenado = d3.select("#mapaSenadoMexico").append("g")
        .attr("class", "leyenda")
        .attr("transform", "translate("+800+", 20)");
    
        leyendaSenado.append("g").attr("class", "legendSize");
        leyendaSenado.append("g")
         .attr("transform", "translate(0, 50) scale(1.1)")
         .attr("class", "legendOrdinal");
      
      
    
    var legendOrdinal = d3.legendColor()
      .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
      .shapePadding(6)
        .labelOffset(10)
       .title("Partido")
        .orient('vertical')
        .useClass(true)
      .scale(colorScale);
    
    svg.select(".legendOrdinal")
      .call(legendOrdinal);
    
      d3.select("#mapaSenadoMexico").select(".legendOrdinal")
      .call(legendOrdinal);
    
    
    
    var circle = d3.arc() // define el circulo para los puntos que no tineen estado
    .innerRadius(0)
    .outerRadius(d => d)
    .startAngle(-Math.PI)
    .endAngle(Math.PI);
    
    
    } // fin de dibujadiputados;






    function dibujaSenado(senadores,svgXML) { // FUNCION PARA DIBUJAR LAS BANCAS DE SENADORES;

      d3.select("#mapaSenado").node().append(svgXML.documentElement);                          

      let tooltipSenado = d3.select("#tooltipSenado")
      .style("right", "50px")
      .style("top", height * 0.2 + "px");

      
      senadores = d3.nest()
                    .key(function (d) {return d.Entidad; })
                          .entries(senadores);
          
      var mapaSenadoSVG = d3.select("#mapaSenadoMexico");

          mapaSenadoSVG.style("max-width","650px");
          var bancas = mapaSenadoSVG.selectAll(".banca");
                                      
          senadores.forEach(d=>{
             var este = mapaSenadoSVG.select("g#"+estadosCode[d.key]); // selecciona cada group de Estado
                 este.selectAll("polygon").data(d.values);  // le carga la data de sus tres bancas
                 este.on("mouseenter", function(e) {
                    if(!senadoTooltipClicked){
                      d3.selectAll(".borde").style("opacity",0.5);
                      d3.select("#o"+estadosCode[d.key]).classed("apaga",true);
                      tooltipSenado.select("#mayoria").html("(Mayoría:&nbsp;<b>"+getMayoria(d.values.map(e=>e.partido))+"</b>)"); // actualiza la mayoria en el tooltip
                    }
                  })
                .on("mouseleave", function(e) {
                    if(!senadoTooltipClicked){
                      d3.selectAll(".borde").style("opacity",1);
                      d3.select("#o"+estadosCode[d.key]).classed("apaga",false);
                    }
                  })
                  ;
             
             mapaSenadoSVG.select("#o"+estadosCode[d.key]) // pone los estados enteros del color de la mayoria
                    .attr("class", "borde " + getMayoria(d.values.map(e=>e.partido)));

                    

                    
          })

          bancas.each(function(d) { // colorea cada banca 
            this.classList.add(d.partido);
          });
      

          bancas.on("mouseover", function(d) {
            if(!senadoTooltipClicked){
                            d3.select(this)
                                          .attr("stroke-width", "3px")
                                          .attr('stroke','#222')
                                          .raise();
                                    
                                    tooltipSenado.transition()    
                                          .duration(100)    
                                          .style("opacity", .9);    
                                          
                                    tooltipSenado.select("#title").html(d.nombre);
                                    tooltipSenado.select("#partido").html("Partido:&nbsp;<b>"+d.partido+"</b>");
                                    tooltipSenado.select("#estado").html("Estado:&nbsp;<b>"+d.Entidad+"</b>");
                                    tooltipSenado.select("#link").attr("href",urlBuscador + "legislador/"+ d.id);

                                    
            }
                                  })
                .on("mouseout", function(d) {
                  if(!senadoTooltipClicked){
                              tooltipSenado.transition()    
                                  .duration(100)    
                                  .style("opacity", 0); 
                                    d3.select(this)
                                            .attr("stroke-width", "0px");
                            }
                          })
                  /* .on("click", function(d) {
                    if(senadoTooltipClicked != d.id){
                      senadoTooltipClicked =d.id;
                      tooltipSenado.select("#title").html(d.nombre);
                                    tooltipSenado.select("#partido").html("Partido:&nbsp;<b>"+d.partido+"</b>");
                                    tooltipSenado.select("#estado").html("Estado:&nbsp;<b>"+d.Entidad+"</b>");
                                    tooltipSenado.select("#link").attr("href",urlBuscador + "legislador/"+ d.id);
                    } 
                    

                            })
      */
                                    
                    ;
       
} /// FIN dibujasenado
    
  


function dibujaComisiones(data) {


          var circle = d3.arc()
            .innerRadius(0)
            .outerRadius(d => d)
            .startAngle(-Math.PI)
            .endAngle(Math.PI);

            var actualTitle;

          var height = width = 900;



          var pack = d3.pack()
            .size([width - 2, width - 2])
            .padding(function(d) {
            if (d.depth == 1 ) return 5;
            if (d.depth == 0 ) return 17;
          });

          var nest = d3.nest()
                .key(function(d) { return d.Camara; })
                .key(function(d) { return d.Comisiones; })
                .entries(data);


        dibujaComision(nest[0].values, "#comisionesDipus");

        dibujaComision(nest[1].values, "#comisionesSenado");

  

        function dibujaComision(data, divId){


                    var root = d3.hierarchy({values: data}, function(d) {return d.values; })
                      .sum(function(d) {
                        switch(d["Posición"]){
                            case 'Integrante':
                              return 100;
                            case 'Presidente':
                              return 500;
                            case 'Secretario/a':
                              return 250;
                            }
                      })
                      .sort(function(a, b) { 
                        return b.value - a.value; 
                      })
                      ;
                  pack(root);
                
                
                
                    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                    // Start drawing

                    const node = d3.select(divId).append("svg")
                      .attr("preserveAspectRatio", "xMinYMin meet")
                      .attr("viewBox", "0 0 900 900")
                      .classed("svg-content", true)
                      .append("g").attr("id","#main")
                        .attr("pointer-events", "all")
                        .selectAll("g")
                        .data(root.descendants().filter(d=>d.depth==1))
                        .enter().append("g").attr("class","comision")
                        .attr("transform", function(d) { 
                                return "translate(" + d.x + "," + d.y + ")"; })
                        // .on("mouseenter", hovered(true))
                        // .on("mouseleave", hovered(false))
                        .attr("id", function(d) {
                            return camelize(d.data.key);
                              });
                
                
                          
                                
                    node.append("circle")
                        .attr("r",d=>d.r)
                        .attr("class", "padre")
                        //.attr("pointer-events", d => d.children ? "all" : "none")
                        .classed("hovered",d => d.children ? false : true)
                        .on("mousemove", hovered()); // esto es para actualizar el titulo en el tipsy
                        ;
                
                
                  var childs = node.append("g").selectAll("circle")
                        .data(d=>d.children).enter()
                        .append("circle")
                        .attr("r",d=>d.r)
                        .attr("cy",d=>d.y-d.parent.y)
                        .attr("cx",d=>d.x-d.parent.x)
                        .attr("class", d => d.height==1 ? d.data.key + " child" : "p"+d.data.id + " " + d.data.partido + " child")
                        .on("mousemove", hovered()); // esto es para actualizar el titulo en el tipsy
                      
                
                        const leaf = node.filter(d => d.depth ===1);
                
                
                        leaf.append("text")
                            //.attr("clip-path", d => d.clipUid)
                          .selectAll("tspan")
                          .data(d=> { 
                            v = d.data.key.split(/(?<=(^|\s)[^\s]{3,})\s+/g).filter(el=> {
                                                                              return el.trim() != "";
                                                                            });
                            return v;
                          })
                          .join("tspan")
                            .attr("x", 0)
                            .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.8}em`)
                            .text(d => d);
                
                            var div = d3.select("body").append("div")
                                      .attr("class", "tooltip")
                                      .style("opacity", 1e-6);
                
                          function hovered() {
                                        return function(d) {
                                          if(d.data.nombre)
                                            { 
                                              d3.select("#actualtitle").style("display","block")
                                              .html("<b>" + d.data.nombre + " "+d.data.apellido + "</b><br>" +d.data["Posición"] )
                                            } else{
                                            d3.select("#actualtitle").style("display","none");
                                          }
                                          d3.selectAll('.child').classed("seleccionado",false);
                                          d3.selectAll('.p'+d.data.id).classed("seleccionado",true);
                                            }
                                        }
                
                

                } // end dibujacomision

                $('.comision').tipsy({ 
                  gravity: 'n', 
                  html: true, 
                  opacity: 1, 
                  title: function() {
                    var d = this.__data__;
                    var texto  = '<span id=actualtitle></span><b style="font-size:13px">'+d.data.key+'</b>';
                    if(d.depth==1) texto += "<br>Integrantes: " + d.children.length ;
                    return texto;        }
                });



}




function dibujaOrganigramas(data, descripciones) {


        d3.select("#organiMenu").selectAll("a").on("click",function (p) {
          var selected = d3.select(this).select("span").html();
          d3.select("#organigramas").selectAll(".column").classed("organiHidden",true);
          d3.select("#organigramas").selectAll("."+selected).classed("organiHidden",false);
          d3.select("#organiMenu").selectAll(".is-active").classed("is-active",false);
          d3.select("#organiMenu").select("#"+selected).classed("is-active",true)
        })

        /// FALTA HACER QUE CARGUE LOS DEL SENADO

        var nested = d3.nest()
                       .key(function(d) { return d.Camara; })
                       .key(function(d) { return d.Seccion; })
                       .entries(data);
    
                       var organi = d3.select("#organigramas");


                       function creaOrganigramas(camaraSelected, isVisible) {
                                var subitems = organi.append("div").attr("class","columns is-multiline is-centered").selectAll("div")
                                      .data(nested.filter(d=>d.key == camaraSelected)[0].values)
                                      .enter()
                                      .append("div").attr("class","column is-half-desktop is-half-tablet is-fullwidth-mobile " + camaraSelected + " " +isVisible)
                                      .append("article").attr("class","message is-dark");
                                  
                                subitems.append("div").attr("class","message-header").append("p")
                                      .html(d=>d.key);

                                var messageBody = subitems.append("div").attr("class","message-body");
                                
                                    messageBody.append("p").attr("class","is-size-7 orgaDesc")
                                      .html(d=>descripciones.filter(e=>{return e.camara ==camaraSelected && e.seccion==d.key})[0].descripcion);

                                var table = messageBody.append("div").attr("class","tags");
                                    
                                    
                                table.selectAll("span").data(d=>d.values).enter()
                                          .append("span")
                                          .attr("class",d=>{return d.nivel==1?'tag is-primary is-light':'tag'})
                                          .html(e=>e.titular);
                                    
                              }

                          creaOrganigramas("Diputados","");
                          creaOrganigramas("Senado","organiHidden")

 
}



 // -------------************ ZONA DE FUNCIONES****************------------


    function getMayoria(lista) { // De una lista de 3 bancas devuelve la mayoría o "SG" si no hay mayoría
      lista.sort();
      if(lista[0] != lista[1] && lista[1] != lista[2]){
        return "SG";
      }else if (lista[0]==lista[1]) {
        return lista[0];
      }else{
        return lista[2];
      }
  }


  
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


    
function getUnique(arr) {
  var a = [], b = [], prev;

  arr.sort();
  for ( var i = 0; i < arr.length; i++ ) {
      if ( arr[i] !== prev ) {
          a.push(arr[i]);
          b.push(1);
      } else {
          b[b.length-1]++;
      }
      prev = arr[i];
  }

  return [a, b];
}



function camelize(str) {
if(str) return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
  if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
  return index == 0 ? match.toLowerCase() : match.toUpperCase();
});
}



 