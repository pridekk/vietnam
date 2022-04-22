import express from "express";
import moment from "moment";
import { getMarketData }from "./investment/stock.js"
const app = express();

app.get("/investment/stocks/:exchangeCode/:code", async (req, res) => {

  let params = req.params
  let startedAt = req.query.startedAt || moment().subtract(30, 'days').format(("YYYY-MM-DD"))
  let endAt = req.query.endAt || moment().format(("YYYY-MM-DD"))
  let marketData = await getMarketData(params.exchangeCode, params.code, startedAt, endAt)
  res.json(marketData)
});

const port = process.env.SERVER_PORT || 3001;
app.listen(port, () => {
  console.log(`Server on ${port} Port`);
});