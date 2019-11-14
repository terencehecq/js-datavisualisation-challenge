/* 
// WRITE YOUR JAVASCRIPT BELOW THIS COMMENT 
Your name : Térence Hecq
Date :  12/11/19
Contact information : terencehecq@gmail.com
What does this script do ? 
Creating graphs from data with D3.
*/

// Your scripting goes here...


// ----- Function tu get data from tables ----- // 

const getDataFromHTMLTable = (CSSSelectorOfTheRows) => {
    let data = [];
    // getting the rows of the table and putting them into an Array
    let tableRows = d3.selectAll(CSSSelectorOfTheRows);
    tableRows = [...tableRows.nodes()];
    // Collect data by putting it into arrays
    let tableHeaders = [];
    let cellsOfHeaders = [...tableRows[0].cells];
    for(let h=0; h<cellsOfHeaders.length;h++){ // Récupérer les headers
        if(h>1){
            tableHeaders.push(cellsOfHeaders[h].innerHTML);
        }
    }

    for (let i = 1; i < tableRows.length; i++) {
        let cellsOfRow = [...tableRows[i].cells]; // getting all the cells of active row
        let countryData = [];
        
        for (let j = 1; j < cellsOfRow.length; j++) { // iterate on each cell
               // Next iterations to get the datas
            if(j > 1){
                if(cellsOfRow[j].innerText == ':'){
                    countryData.push(0)
                }else{
                    countryData.push(parseFloat((cellsOfRow[j].innerText).replace(',','.')));
                }
                
            }
        }
        data[i-1] = {}; 
        data[i-1].dates = tableHeaders;
        data[i-1].country = cellsOfRow[1].innerHTML;
        data[i-1].data = countryData;
    }
    return data;
}

let dataTableOne = getDataFromHTMLTable("#table1 > tbody > tr")
console.log(dataTableOne);

let dataTableTwo = getDataFromHTMLTable("#table2 tr")
console.log(dataTableTwo);



// ------ Beginning the graph ----- // 

let margin = {top: 20, right: 20, bottom: 50, left: 50};
let width = 900 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

function createGraph(countryToShow){

let svg1 = d3.select('#mw-content-text').insert('svg','#table1')
                                .attr('width', 900)
                                .attr('height', 600)
                                .style('background', '#eee')
                                .attr('id','svg1')

                                
const graph = svg1.append('g')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('transform', "translate(" + margin.left + ", " + margin.top + ")");
                                
graph.append('text')
     .attr('text-anchor','middle')
     .attr('x', width/2)
     .attr('y', 10)
     .style("font-weight", "bold")
     .style("font-size","3rem")
     .text(dataTableOne[countryToShow].country)

graph.append('text')
     .attr('text-anchor','middle')
     .attr('x', width/2)
     .attr('y', 40)
     .style("font-size","1.2rem")
     .text("Nombres (en milliers) de crimes enregistrés en fonction des années")
                                
                                
                                const groupeX = graph.append('g')
                                .attr('transform', `translate(0, ${height})`);
const groupeY = graph.append('g');


const x = d3.scaleBand()
            .domain(dataTableOne[countryToShow].dates)
            .range([0, width])
            .paddingInner(0.2)
            .paddingOuter(0.1)

const y = d3.scaleLinear()
            .domain([0, (Math.max(...dataTableOne[countryToShow].data)*1.2)])
            .range([height, 0]);


// X axis

const axeX = d3.axisBottom(x)

groupeX.call(axeX)
        .style('font-size', '14px')
        

groupeX.selectAll('text')
        .attr('transform', 'rotate(-30) translate(0,5)')
        .attr('text-anchor', 'end');


// Y axis

const axeY = d3.axisLeft(y)
                .ticks(20);

groupeY.call(axeY)
        .style('font-size', '13px');


  // Three function that change the tooltip when user hover / move / leave a cell
  function mouseOver(d, i) {
    d3.select(this)
      .style("opacity", 0.8)

    graph.append('text')
            .attr('id', `data${d}${i}`)
            .style('font-weight', 'bold')
            .style('font-size', '1.7rem')
            .attr('x', function(){return x(d)+7})
            .attr('y', this.y.animVal.value-15)
            .text(dataTableOne[countryToShow].data[i])
      
  }

  function mouseLeave(d, i) {
    d3.select(this)
      .style("opacity", 1);

    d3.select(`#data${d}${i}`).remove();
  }


// create rects

graph.selectAll("rect")
        .data(dataTableOne[countryToShow].data)
        .enter()
        .append('rect')
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)
        .attr('width', x.bandwidth())
        .attr('height', function(d){return height - y(d)})
        .attr('fill', 'teal')
        .attr('y', function(d){return y(d)})
        .data(dataTableOne[countryToShow].dates)
        .attr('x', function(d){return x(d)});


}
createGraph(0)




// ----- Dropdown to select country ----- // 


function change(){
    d3.select("#svg1").remove()
    createGraph(this.value)
}


let dropdown = d3.select('#mw-content-text').insert("select","#svg1")
                                            .attr('name','countries')
                                            .attr('id','selectCountry')
                                            .on('change', change)

// Creating options in select

dropdown.selectAll('option')
        .data(dataTableOne)
        .enter()
        .append('option')
        .attr('value',function(d,i){return i})
        .text(function(d){return d.country})

d3.select('#mw-content-text').insert('label',"#selectCountry")
                                .text("Choisissez un pays : ")
                                .style("margin-top","20px");

        
