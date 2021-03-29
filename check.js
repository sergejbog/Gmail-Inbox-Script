const {google} = require('googleapis');
var base64 = require('js-base64').Base64;
const cheerio = require('cheerio');
var open = require('open');
const fs = require('fs');
var Mailparser = require('mailparser').MailParser;

class Check {

    //auth is the constructor parameter.
    constructor(auth){
        this.me = 'me';
        this.gmail = google.gmail({version: 'v1', auth});
        this.auth = auth;
    }

    //Returns the mails in the user's inbox.
    checkInbox(response) {
        if(response.nextPageToken) {
            this.gmail.users.messages.list({
                userId: this.me,
                pageToken: response.nextPageToken
            }, (err, res) => {
                if(!err){
                    console.log(res.data);
                    this.checkInbox(res.data);
                }
                else{
                    throw err;
                }
            });
        }
    }

    firstPage() {
        this.gmail.users.messages.list({
            userId: this.me
        }, (err, res) => {
            if(!err){
                console.log(res.data);
                res.data.messages.forEach(message => {
                    this.getMail(message.id);
                })
                // this.checkInbox(res.data);
            }
            else{
                console.log(err);
            }
        });
    }

    //getMail function retrieves the mail body and parses it for useful content.
    //In our case it will parse for all the links in the mail.
    getMail(msgId){
        
        //This api call will fetch the mailbody.
        this.gmail.users.messages.get({
            'userId': this.me,
            'id': msgId
        }, (err, res) => {
            if(!err){
                console.log(res);
                if(res.data.payload.parts) {
                    let part = res.data.payload.parts.filter(function(part) {
                        return part.mimeType == 'text/html';
                    });
                    if(!part.length == 0) {
                        let html = base64.decode(part[0].body.data);
                    
                        fs.writeFile(`html/${msgId}.html`, html, err => {
                            if(err) throw err;
                        });
                    }
                    
                } else {
                    let part = res.data.payload.body.data;
                    let html = base64.decode(part);
                    fs.writeFile(`html/${msgId}.html`, html, err => {
                        if(err) throw err;
                    });
                }
            }
        });
    }

}

module.exports = Check;