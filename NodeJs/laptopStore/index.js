const fs = require('fs');
const http = require('http');
const url = require('url');

const josn = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
const laptopData = JSON.parse(josn);

const server = http.createServer((req, res) => {
    const pathName = url.parse(req.url, true).pathname;
    const id = url.parse(req.url, true).query.id;

    //Products overview
    if (pathName === '/products' || pathName === '/') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        fs.readFile(`${__dirname}/templates/template-overview.html`, 'utf-8', (err, data) => {
            let overviewOutPut = data;
            fs.readFile(`${__dirname}/templates/template-card.html`, 'utf-8', (err, data) => {
                const cardsOutPut = laptopData.map(el => replaceTemplate(data, el)).join('');
                overviewOutPut = overviewOutPut.replace('{%CARDS%}', cardsOutPut)
                res.end(overviewOutPut);
            });
        });
    }

    //Laptop detail
    else if (pathName === '/laptop' && id < laptopData.length) {
        res.writeHead(200, { 'Content-type': 'text/html' });

        fs.readFile(`${__dirname}/templates/template-laptop.html`, 'utf-8', (err, data) => {
            const laptop = laptopData[id];
            const output = replaceTemplate(data, laptop);
            res.end(output);
        });
    }

    //images
    else if ((/\.(jpg|jpeg|png|gif)$/i).test(pathName)) {
        fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
            res.writeHead(200, { 'Content-type': 'image/jpg' });
            res.end(data);
        });
    }
    else {
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.end('URL was not found on the server');
    }
});

server.listen(8080, '127.0.0.1', () => {
    console.log('listening for the server on port 8080');
});


function replaceTemplate(orignalHtml, laptop) {
    let outPut = orignalHtml.replace(/{%PRODUCTNAME%}/g, laptop.productName);
    outPut = outPut.replace(/{%IMAGE%}/g, laptop.image);
    outPut = outPut.replace(/{%SCREEN%}/g, laptop.screen);
    outPut = outPut.replace(/{%CPU%}/g, laptop.cpu);
    outPut = outPut.replace(/{%STORAGE%}/g, laptop.storage);
    outPut = outPut.replace(/{%RAM%}/g, laptop.ram);
    outPut = outPut.replace(/{%DESCRIPTION%}/g, laptop.description);
    outPut = outPut.replace(/{%PRICE%}/g, laptop.price);
    outPut = outPut.replace(/{%ID%}/g, laptop.id);
    return outPut;
}