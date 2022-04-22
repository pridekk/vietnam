import { MongoClient } from "mongodb";

const uri =
  "mongodb://root:example@localhost:27017"

const client = new MongoClient(uri)


// 종목 데이터 추가 예제
async function update() {
  try {
    await client.connect()
    const database = client.db('investment')
    const stocks = database.collection('stocks')

    const filter = { "code": "005930", "exchange_code": "KRX" }

    const addMarketData = {
      $push: {
        'market_data': {"date": "2022-04-23","open":67200,"high":67800,"low":66600,"close":67000}
      }
    }
    const result = await stocks.updateOne(filter, addMarketData, {upsert:true})
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    )

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
}

// 종목 데이터 가져오기
export async function getMarketData(exchange_code, code, startedAt, endAt) {
  let stock = {}
  try{
    await client.connect()
    const database = client.db('investment')
    const stocks = database.collection('stocks')

    const query = { "code": code, "exchange_code": exchange_code}

    stock = await stocks.findOne(query, {
      projection: {
        _id: 1,
        code: 1,
        exchange_code: 1 ,
        market_data: {
          $filter: {
            input: '$market_data',
            as: 'market',
            cond: {
              $and: [
                { $gte: ['$$market.date', startedAt] },
                { $lte: ['$$market.date', endAt] }
              ]
            }
          }
        }
      }
    })

    stock.market_data.sort( (a,b) => {
      if(a.date > b.date)
        return -1
      return 1
    })

  } finally {
    // Ensures that the client will close when you finish/error
    await client.close()
  }
  console.log(stock)
  return stock
}

// run().catch(console.dir)
// update().catch(console.dir)
// getMarketData('KRX', '005930').catch(console.dir)
