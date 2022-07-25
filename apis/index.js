const axios = require("axios");
const { name } = require("ejs");
const fs = require('fs')
const path = require('path')

const makeupApi = axios.create({
    baseURL: "http://makeup-api.herokuapp.com/api/v1"
})

const forExApi = axios.create({
    baseURL: "https://api.exchangerate.host",

})

const valid = (val) => {
    if (val === "" || val === undefined || val === null) {
        return false;
    }
    return true;
}

const getBrandList = async () => {
    console.log("Fetch static data");
    const response = await makeupApi.get(`/products.json`);
    const staticData = { uniqueBrands: [...new Set(response.data.map(each => each.brand))].filter((x) => x !== null), uniqueProductTypes: [...new Set(response.data.map(each => each.product_type))].filter((x) => x !== null) };
    // save it in json file
    fs.writeFile('./staticData.json', JSON.stringify(staticData), () => {
        console.log('fetch unique brands and product types are DONE')
    })

}



const getMakeupApi = async (currency, brand, sortBy, productType) => {
    const response = await makeupApi.get('/products.json', (valid(brand) && !valid(productType)) ? { params: { brand: brand } } : (!valid(brand) && valid(productType)) ? { params: { product_type: productType } } : (valid(brand) && valid(productType)) ? { params: { brand: brand, product_type: productType } } : {});
    const rate = await getForExApi(currency);
    const filterNonZeroPrice = (val) => val.price !== 0;
    const nonZeroPriceProducts = response.data.map(each => ({ ...each, price: (each.price * rate) })).filter(filterNonZeroPrice);
    (sortBy === "low to high") ? nonZeroPriceProducts.sort((a, b) => a.price - b.price) : (sortBy === "high to low") ? nonZeroPriceProducts.sort((a, b) => b.price - a.price) : nonZeroPriceProducts;
    const data = nonZeroPriceProducts.map(each => ({ ...each, price: `${currency} ${(each.price).toFixed(2)}` }));
    return data;
}

const getForExApi = async (currency) => {
    if (!currency) return 1;
    const response = await forExApi.get(`/convert?from=USD&to=${currency}`);
    return response.data.info.rate;
}

module.exports = { getMakeupApi, getForExApi, valid, getBrandList, makeupApi };