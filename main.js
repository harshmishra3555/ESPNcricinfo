const url='https://www.espncricinfo.com/series/ipl-2020-21-1210595';
const request=require('request');
const cheerio=require('cheerio');
const path=require('path');
const fs=require('fs');
const iplPath=path.join(__dirname,'ipl');
const xlsx=require('xlsx');
request(url,(err,response,body)=>{
    if(err){
        console.log(err);
    }else{
        firsthandler(body);
    }
});
dirCreator(iplPath);
function firsthandler(html){
    let $=cheerio.load(html);
    let link=$('li.widget-items > a:nth-child(1)');
    let fullLink='https://www.espncricinfo.com'+($(link).attr('href'));
    request(fullLink,(err,response,body)=>{
        if(err){
            console.log(err);
        }else{
            secondhandler(body);
        }
    });
}
function secondhandler(html){
    let $=cheerio.load(html);
    let scorecard=$('a[data-hover="Scorecard"]');
    for(let i=0;i<scorecard.length;i++){
        let link=$(scorecard[i]).attr('href');
        link='https://www.espncricinfo.com'+link;
        // console.log(link);
        request(link,(err,response,body)=>{
            if(err){
                console.log(err);
            }else{
                thirdhandler(body);
            }
        });
    }
}

function thirdhandler(html){
    //Venue date 
    let $=cheerio.load(html);
    let data=$('div.header-info div div.description');
    data=$(data).text();
    data=data.split(',');
    let venue=data[1].trim();
    let date=data[2].trim();
    console.log(venue);
    console.log(date);
    let team=$('div.name-detail a.name-link p.name');
    let team1=$(team[0]).text().trim();
    let team2=$(team[1]).text().trim();
    // result 
    let result=$('div.status-text:nth-child(2) > span:nth-child(1)');
    result=$(result).text();
    console.log(result);
    let innings=$('div.card.content-block.match-scorecard-table .Collapsible');
    for(let i=0;i<innings.length;i++){
        // self
        let self=$(innings[i]).find('h5');
        self=$(self).text();
        self=self.split('INNINGS');
        self=self[0].trim();
        // opponent
        let opponent;
        if(self==team1){
            opponent=team2;
        }else{
            opponent=team1;
        }
        // name runs balls fours sixes sr
        let batsman=$(innings[i]).find('.Collapsible__contentInner div table.table.batsman tbody tr');
        for(let i=0;i<batsman.length;i++){
            let data=$(batsman[i]).find('td');
            if(data.length==8){
                let name=$(data[0]).text();
                let runs=$(data[2]).text();
                let balls=$(data[3]).text();
                let fours=$(data[5]).text();
                let sixes=$(data[6]).text();
                let sr=$(data[7]).text();
                // console.log(`${name} play for ${self} against ${opponent} score ${runs} in ${balls} with ${fours} fours and ${sixes} sixes with strike rate of ${sr}`);
                processPlayer(venue,date,result,self,opponent,name,runs,balls,fours,sixes,sr);
            }
        }   
    }
}

function dirCreator(filePath){
    if(fs.existsSync(filePath)==false){
        fs.mkdirSync(filePath);
    }
}

// ipl dir --> team name dir --> player name.xlsx

function processPlayer(venue,date,result,self,opponent,name,runs,balls,fours,sixes,sr){
    let teamPath=path.join(__dirname,'ipl',self);
    dirCreator(teamPath);
    let filePath=path.join(teamPath,name+'.xlsx');
    let content=excelReader(filePath,name);
    content.push({
        "VENUE":venue,
        "DATE":date,
        "RESULT":result,
        "PLAYING TEAM":self,
        "OPPONENT TEAM":opponent,
        "PLAYER NAME":name,
        "RUNS":runs,
        "BALLS":balls,
        "FOURS":fours,
        "SIXES":sixes,
        "STRIKE RATE":sr
    });
    excelWriter(filePath,content,name);
}   

// // wb-> filePath, ws -> name, json data 
// // new worksheet 
function excelWriter(filePath, jsondata, sheetName) {
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(jsondata);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}
// // json data -> excel format convert
// // -> newwb , ws , sheet name
// // filePath
// read 
//  workbook get
function excelReader(filePath, sheetName) {
    if (fs.existsSync(filePath) == false) {
        return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;

}
// sheet
// sheet data get
