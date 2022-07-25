const express = require("express");
const { getMakeupApi, valid, getStaticData } = require("./apis");
const bodyParser = require("body-parser");
const port = 3000;
const path = require("path");
const staticData = require('./staticData.json');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }))

//set up path to import file
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));

//default value
let selectedCurrency = "USD";
let selectedBrand;
let selectedProductType;
let selectedSortBy;


//GET: http://localhost:3000/
app.get("/", async (req, res) => {
    const data = await getMakeupApi(selectedCurrency, selectedBrand, selectedSortBy, selectedProductType);
    res.render("index", { title: "Home", originUrl: '/', data: data, selectedCurrency, selectedBrand, selectedSortBy, selectedProductType, productList: staticData.uniqueProductTypes, brandList: staticData.uniqueBrands });
})

//GET: http://localhost:3000/brand/brandname
app.get("/brand/:brandName", async (req, res) => {
    const data = await getMakeupApi(selectedCurrency, req.params.brandName, selectedSortBy, selectedProductType);
    res.render("brand", { title: req.params.brandName, originUrl: `/brand/${req.params.brandName}`, data, selectedCurrency, selectedBrand, selectedSortBy, selectedProductType, productList: staticData.uniqueProductTypes, brandList: staticData.uniqueBrands })
})


//GET: http://localhost:3000/productType/producttypename
app.get("/productType/:productType", async (req, res) => {
    const data = await getMakeupApi(selectedCurrency, selectedBrand, selectedSortBy, req.params.productType);
    // const response = await makeupApi.get('/products.json', { params: { product_type: req.params.productType } });
    res.render("productType", { title: req.params.productType, originUrl: `/productType/${req.params.productType}`, data, selectedCurrency, selectedBrand, selectedSortBy, selectedProductType, productList: staticData.uniqueProductTypes, brandList: staticData.uniqueBrands })
})


//POST: http://localhost:3000/filter
app.post("/filter", async (req, res) => {
    console.log("🚀 ~ file: index.js ~ line 38 ~ app.post ~ req", req.body);
    ({ selectedBrand, selectedCurrency, selectedSortBy, selectedProductType } = req.body);

    if (!valid(selectedCurrency)) {
        selectedCurrency = undefined
    }
    res.redirect(req.body.target_url);
})

//POST: http://localhost:3000/reset
app.post("/reset", async (req, res) => {
    selectedCurrency = "USD";
    selectedBrand = undefined;
    selectedSortBy = undefined;
    selectedProductType = undefined;
    // res.redirect("/");
    res.redirect(req.body.target_url);

})


// This function will grab static data such as all brand names and all product type from makeup api
// if there is no staticData.json in the root dir, then only you need the following function.
// getStaticData();


app.listen(port, () => {
    console.log(`listening on ${port}`);
})