const express = require('express');
const bodyParser=require('body-parser');
const app = express();
const port = 3000;
var fs = require("fs");

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GET All tickets

app.get("/rest/list/", function(req, res) {
    fs.readFile("tickets.txt", (err, data) => {
        if (err) {
            if (err.code === "ENOENT") { 
                //Error No Entry
                //if file doesn't exist we throw an error 
                res.status(404).send("File with Tickets does not exist!");
            } else {
                console.error(err);
                res.status(500).send("Server error!");
            }
            return;
        } else {
            console.log("GET all tickets was successful!\n");
        }

        //creating javascript object - array tickets
        const tickets = JSON.parse(data.toString('utf8'));
        //sending response - all tickets
        res.json(tickets);
      });
});

// GET ticket by id

app.get('/rest/ticket/:id', function(req, res) {
    //JSON.parse treats id as a number thus we have to treat it as a number in input
    const inputId = Number(req.params.id);
    console.log("Looking for: " + inputId);

    fs.readFile("tickets.txt", (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                //ENOENT = Error No Entry
                //if file doesn't exist we throw an error 
                res.status(404).send("File with Tickets does not exist!");
            } else {
                console.error(err);
                res.status(500).send("Server error!");
            }
            return;
        } else {
            console.log("GET all tickets was successful!\n");
        }

        const tickets = JSON.parse(data.toString('utf8'));
        //we search for ticket who's id matches the inputId
        const ticket = tickets.find((ticket) => ticket.id === inputId);

        //if ticket is not found it will be undefined
        if (!ticket) {
            res.status(404).send("Ticket does not exist!");
        } else {
            console.log("Ticket exists!")
            //sending response - ticket
            res.json(ticket);
        }
    });
});

// A POST request

app.post('/rest/ticket/', function(req, res) {
    const newTicket = req.body;

    //fields needed in the body
    const ticketInfo = ['id', 'created_at', 'updated_at', 'type', 'subject', 'description', 'priority', 
                        'status', 'recipient', 'submitter', 'assignee_id', 'follower_ids', 'tags'];
    //checking how many fields are missing
    const missingTicketInfo = ticketInfo.filter(field => !(field in newTicket));

    //if more than 0 are missing then throw an error
    if (missingTicketInfo.length > 0) {
        return res.status(400).json({ 
            error: `Incomplete ticket info!\n Missing fields: ${missingTicketInfo.join(', ')}`});
    }

    //adding the new ticket
    fs.readFile("tickets.txt", (err, data) => {
        if (err) {
            if (err.code === "ENOENT") { //Error No Entry
                //if file doesn't exist we throw an error 
                res.status(404).send("File with Tickets does not exist!");
            } else {
                console.error(err);
                res.status(500).send("Server error!");
            }
            return;
        } else {
            console.log("GET all tickets was successful!\n");
        }

        //creating javascript object - array tickets
        const tickets = JSON.parse(data.toString('utf8'));

        //Adding the new ticket to the array
        tickets.push(newTicket)

        //Saving the ticket in the file
        fs.writeFile("tickets.txt", JSON.stringify(tickets, null, 2), (err) => {
            if (err) {
            return res.status(500).json({ 
                error: "Error writing to file!"});
            } else {
                console.log("Ticket added!")
                res.status(201).json(newTicket);
            }
        });
    });
});
