// worker.js
import * as Comlink from "comlink"

/* self.onmessage = function (e) {
  console.log(e.data)
  fetchCoins()
}
 */

const funcs = {
  async fetchCoins() {
    const date = new Date();
    const rand = Math.round((Math.random(1,9) * 1000000));

    const res = await fetch('https://api.coingecko.com/api/v3/search/trending');
    const { coins } = await res.json();
  
    const formattedCoins = coins.map((coin) => ({
      name: coin.item.name,
      price: coin.item.price_btc,
      logo: coin.item.large
    }))

    return { formattedCoins, date, rand }
  }
}


Comlink.expose(funcs)
