
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', async () => {

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        //1-first authorize the  data contract --> this is done in init
        //2- air line must fund the contract
        contract.fund((error, result)=>{
            console.log("airline funded");
            display2("air line funded 10 ethers");
              //register Flights
          contract.registerFlight("flight-123",(error, result)=>{
                display2("flight-123 registered");
                console.log("flight-123 registered");
             });

             contract.registerFlight("flight-456",(error, result)=>{
                display2("flight-456 registered");
                console.log("flight-456 registered");
             });
         });

         contract.registerEventListner((event)=>{
             let str="Event: "+event.event+" flight: "+event.returnValues.flight+" status: "+event.returnValues.status+" timestamp: "+event.returnValues.timestamp;
            console.log(str);
            display2(str);
         });
       
       
    

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('buy-insurance').addEventListener('click', () => {
            let flight = DOM.elid('flight-name').value;
            // Write transaction
            contract.buyInsurance(flight, (error, result) => {
                display2("Insurance bought for flight"+flight);
            });
        })

        DOM.elid('debit-insurance').addEventListener('click', () => {
            // Write transaction
            contract.Debit((error, result) => {
                display2("Debit amount of 0.5 ethers");
            });
        })


        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)    
            {
                console.log("respoinse",xmlHttp.responseText);
            }
               
        }
        xmlHttp.open("GET", "http://localhost:3000/api", true); // true for asynchronous 
      //  xmlHttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); 
       // xmlHttp.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:8000');
       xmlHttp.setRequestHeader('Accept', '*/*'); 
      //xmlHttp.withCredentials = true;  
        xmlHttp.setRequestHeader("Content-Type", "application/json");
        xmlHttp.send("");
    
    });
})();





function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}

function display2(log){
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h5(log));
    displayDiv.append(section);
}







