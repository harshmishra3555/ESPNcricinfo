const fs=require('fs');
const xlsx=require('xlsx');
// let buffer=fs.readFileSync('./example.json');
// console.log(buffer);
// // for parsing buffer data in json format
// let data=JSON.parse(buffer);

// js reads js files using require too
let data=require('./example.json');
// console.log(`'''''''''''''''''''''''''''''`);
// console.log(data);
// // for adding another object in data in json format
// data.push(
//     {
//         "name":"Thor",
//         "last Name":"Rogers",
//         "isAvenger":true,
//         "friends":[
//             "Bruce","Peter","Natasha"
//         ],
//         "age":45,
//         "address":{
//             "city": "New York",
//             "state": "manhatten"
//         }
        
//     }
// );
// // parsing new data into json format
// data=JSON.stringify(data);
// fs.writeFileSync('example.json',data);



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








