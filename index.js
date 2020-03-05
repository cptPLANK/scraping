const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
////////// NUR HIER EINTRAGEN ///////////////////////////////////////////

let suchWort = 'aerzte'; // <---- Suchwort ///////////////////////////////
let ort = 'soest';      // <---- Ort ////////////////////////////////////

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////

let url = `https://www.dasoertliche.de/?zvo_ok=0&choose=true&page=0&context=0&action=43&buc=675&topKw=0&form_name=search_nat&kw=${suchWort}&ci=${ort}`;
let arr = [];
let notLastPage = true;

const getData = async () => {
    let pageData = await axios.get(url);
    let $ = cheerio.load(pageData.data);
    $('.counter').each((el) => {
        let startEl = '#entry_' + (el + 1);
        let pullData = {
            name: $(startEl + ' > div.left.oe_hit > h2 > a > span').text(),
            anschrift: $(startEl + ' > div.left.oe_hit > address').text()
                .replace(/\n/g, '')
                .replace(/\t/g, ''),
            email: $(startEl + ' > div.left.oe_hit > a.hitlnk_mail').text(),
            web: $(startEl + ' > div.left.oe_hit > a.hitlnk_url_incog > span').text(),
            tel: $(startEl + ' > div.right > span:nth-child(1)').text(),
            fax: $(startEl + ' > div.right > span:nth-child(4)').text()
        };
        arr.push(pullData);
    });
    let paginationPath = '#myIframe > div.paging > span:last-of-type > a';
    $(paginationPath).attr('title') === 'zur nächsten Seite' ? notLastPage = true : notLastPage = false;
    url = $(paginationPath).attr('href');
};

(
    async () => {
        while (notLastPage) {
            await getData();
        }
        let json = JSON.stringify(arr);
        fs.writeFile(`${__dirname}/${suchWort}-${ort}-liste.json`, json, err => {
            if (err) throw err;
            console.log('File saved!');
        });
    }
)();



