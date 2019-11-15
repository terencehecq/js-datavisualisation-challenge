/* 
// WRITE YOUR JAVASCRIPT BELOW THIS COMMENT 
Your name : Térence Hecq
Date :  12/11/19
Contact information : terencehecq@gmail.com
What does this script do ? 
Creating graphs from data with D3.
*/

// Your scripting goes here...



// ----- Function to get data from tables ----- // 

const getData = (CSSSelectorOfTheRows) => {
    let data = [];
    // getting the rows of the table and putting them into an Array
    let tableRows = d3.selectAll(CSSSelectorOfTheRows);
    tableRows = [...tableRows.nodes()];
    // Collect data by putting it into arrays
    let tableHeaders = [];
    let cellsOfHeaders = [...tableRows[0].cells];
    for(let h=0; h<cellsOfHeaders.length;h++){ // Get the headers
        if(h>1){
            tableHeaders.push(cellsOfHeaders[h].innerHTML);
        }
    }

    for (let i = 1; i < tableRows.length; i++) { // Iterate on each row
        let cellsOfRow = [...tableRows[i].cells]; // Getting all the cells of current row
        let countryData = [];
        
        for (let j = 1; j < cellsOfRow.length; j++) { // iterate on each cell of the current row
            
            if(j > 1){ // If there's no data, replace by 0
                if(cellsOfRow[j].innerText == ':'){
                    countryData.push(0)
                }else{ // push data in array
                    countryData.push(parseFloat((cellsOfRow[j].innerText).replace(',','.')));
                }
                
            }
        }
        // Creating an object with datas for each country and put it into data array
        data[i-1] = {}; 
        data[i-1].dates = tableHeaders;
        data[i-1].country = cellsOfRow[1].innerHTML;
        data[i-1].data = countryData;
    }
    return data;
}



// ----- Get the datas using the function ----- //

let dataOne = getData("#table1 > tbody > tr")
console.log(dataOne);

let dataTwo = getData("#table2 tr")
console.log(dataTwo);



// ----- Function to create the 1st graph ----- //

function createGraph(countryToShow){

    let margin = {top: 20, right: 20, bottom: 50, left: 50};
    let width = 900 - margin.left - margin.right;
    let height = 600 - margin.top - margin.bottom;

    // Create SVG
    let svg1 = d3.select('#mw-content-text').insert('svg','#table1')
                                            .attr('width', 900)
                                            .attr('height', 600)
                                            .style('background', '#eee')
                                            .attr('id','svg1')

    // Create graph zone in SVG                             
    const graph = svg1.append('g')
                        .attr('width', width)
                        .attr('height', height)
                        .attr('transform', "translate(" + margin.left + ", " + margin.top + ")");

    // Setting the country as title
    graph.append('text')
            .attr('text-anchor','middle')
            .attr('x', width/2)
            .attr('y', 10)
            .style("font-weight", "bold")
            .style("font-size","3rem")
            .text(dataOne[countryToShow].country)

    // Setting the legend
    graph.append('text')
            .attr('text-anchor','middle')
            .attr('x', width/2)
            .attr('y', 40)
            .style("font-size","1.2rem")
            .text("Nombres (en milliers) de crimes enregistrés en fonction des années")
                                    
    // Crate groups for the both axis and placing them
    const groupeX = graph.append('g')
                         .attr('transform', `translate(0, ${height})`);

    const groupeY = graph.append('g');

    // Scaling axis
    const x = d3.scaleBand()
                .domain(dataOne[countryToShow].dates)
                .range([0, width])
                .paddingInner(0.2)
                .paddingOuter(0.1)

    const y = d3.scaleLinear()
                .domain([0, (Math.max(...dataOne[countryToShow].data)*1.2)])
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



    // ----- Functions to display data on hover ----- //

    function mouseOver(d, i) {
        d3.select(this)
        .style("opacity", 0.8)

        graph.append('text')
                .attr('id', `data${d}${i}`) // setting id to remove it on mouse leave
                .style('font-weight', 'bold')
                .style('font-size', '1.7rem')
                .attr('text-anchor','middle')
                .attr('x', function(){return (x(d)+x.bandwidth()/2)}) // X position
                .attr('y', this.y.animVal.value-15) // Y position
                .text(dataOne[countryToShow].data[i]) // Data to display
    }

    function mouseLeave(d, i) {
        d3.select(this)
          .style("opacity", 1);

        d3.select(`#data${d}${i}`)
          .remove();
    }


    // Creating rects

    graph.selectAll("rect") // There's none but that's the way
            .data(dataOne[countryToShow].data)
            .enter() // Select data not used yet
            .append('rect') // For each enter(), create a rect
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
            .attr('width', x.bandwidth()) // .bandwith() devides the space into the number of rects
            .attr('height', function(d){return height - y(d)}) 
            .attr('fill', 'teal')
            .attr('y', function(d){return y(d)})
            .data(dataOne[countryToShow].dates)
            .attr('x', function(d){return x(d)});

}
createGraph(0)



// ----- Dropdown to select country ----- // 

// Function to generate new graph
function change(){
    d3.select("#svg1").remove()
    createGraph(this.value)
}

// Creating the dropdown at the right place
let dropdown = d3.select('#mw-content-text').insert("select","#svg1")
                                            .attr('name','countries')
                                            .attr('id','selectCountry')
                                            .on('change', change)


// Creating options in the dropdown from data
dropdown.selectAll('option')
        .data(dataOne)
        .enter()
        .append('option')
        .attr('value',function(d,i){return i})
        .text(function(d){return d.country})

// Insert a label before the dropdown
d3.select('#mw-content-text').insert('label',"#selectCountry")
                                .text("Choisissez un pays : ")
                                .style("margin-top","20px");

 
                                





// ----- Function to create the 2nd graph ----- //

function createGraph2(dateToShow){

    let margin = {top: 20, right: 20, bottom: 160, left: 50};
    let width = 900 - margin.left - margin.right;
    let height = 650 - margin.top - margin.bottom;
    let countries = [];
    dataTwo.forEach(data => countries.push(data.country));
    

    // Create SVG
    let svg2 = d3.select('#mw-content-text').insert('svg','#table2')
                                            .attr('width', 900)
                                            .attr('height', 600)
                                            .style('background', '#eee')
                                            .attr('id','svg2');

    // Create graph zone in SVG                             
    const graph2 = svg2.append('g')
                        .attr('width', width)
                        .attr('height', height)
                        .attr('transform', "translate(" + margin.left + ", " + margin.top + ")");

    // Setting the country as title
    graph2.append('text')
            .attr('text-anchor','middle')
            .attr('x', width/2)
            .attr('y', 10)
            .style("font-weight", "bold")
            .style("font-size","3rem")
            .text(dataTwo[0].dates[dateToShow])

    // Setting the legend
    graph2.append('text')
            .attr('text-anchor','middle')
            .attr('x', width/2)
            .attr('y', 40)
            .style("font-size","1.2rem")
            .text("Moyenne de la population carcérale (pour 100.000 hab)")
                                    
    // Crate groups for the both axis and placing them
    const groupeX2 = graph2.append('g')
                            .attr('transform', `translate(0, ${height})`);

    const groupeY2 = graph2.append('g');

    // Scaling axis
    const x2 = d3.scaleBand()
                .domain(countries)
                .range([0, width])
                .paddingInner(0.2)
                .paddingOuter(0.1)

                

    const y2 = d3.scaleLinear()
                .domain([0, 350])
                .range([height, 0]);

    // X axis
    const axeX2 = d3.axisBottom(x2);

    groupeX2.call(axeX2)
            .style('font-size', '13px')
            

    groupeX2.selectAll('text')
            .attr('transform', 'rotate(-45) translate(-10,0)')
            .attr('text-anchor', 'end');


    // Y axis
    const axeY2 = d3.axisLeft(y2)
                    .ticks(10);

    groupeY2.call(axeY2)
            .style('font-size', '13px'); 



    // ----- Functions to display data on hover ----- //

    function mouseOver(d, i) {
        d3.select(this)
            .style("opacity", 0.8)

        graph2.append('text')
                .attr('id', `data${i}`) // setting id to remove it on mouse leave
                .style('font-weight', 'bold')
                .attr("text-anchor", 'middle')
                .style('font-size', '1.3rem')
                .attr('x', function(){return (x2(d)+x2.bandwidth()/2)}) // X position (used bandwidth()/2 to center
                .attr('y', this.y.animVal.value-5) // Y position
                .text(dataTwo[i].data[dateToShow]) // Date to display
                // console.log()
    }

    function mouseLeave(d, i) {
        d3.select(this)
          .style("opacity", 1);

        d3.select(`#data${i}`)
          .remove();
    }


    // Creating rects
   

    graph2.selectAll("rect") // There's none but that's the way
            .data(dataTwo)
            .enter() // Select data not used yet
            .append('rect') // For each enter(), create a rect
            .on("mouseover", mouseOver)
            .on("mouseleave", mouseLeave)
            .attr('width', x2.bandwidth()) // .bandwith() devides the space into the number of rects
            .attr('height', function(d){return height - y2(d.data[dateToShow])}) 
            .attr('fill', 'teal')
            .attr('y', function(d){return y2(d.data[dateToShow])})
            .data(countries)
            .attr('x', function(d){return x2(d)});

}
createGraph2(0)


// ----- Dropdown to select year ----- // 

// Function to generate new graph
function change2(){
    d3.select("#svg2").remove()
    createGraph2(this.value)
}

// Creating the dropdown at the right place
let dropdown2 = d3.select('#mw-content-text').insert("select","#svg2")
                                            .attr('name','years')
                                            .attr('id','selectYear')
                                            .on('change', change2)


// Creating options in the dropdown from data
dropdown2.selectAll('option')
        .data(dataTwo[0].dates)
        .enter()
        .append('option')
        .attr('value',function(d,i){return i})
        .text(function(d){return d})

// Insert a label before the dropdown
d3.select('#mw-content-text').insert('label',"#selectYear")
                                .text("Choisissez une année : ")
                                .style("margin-top","20px");