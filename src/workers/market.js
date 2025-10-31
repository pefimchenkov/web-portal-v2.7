// market worker 
import * as Comlink from "comlink"


const funcs = {
  async fetchMarket(baseUrl, peer) {

    const res = await fetch(baseUrl + '/' + peer);
    const { data } = await res.json();

    /* const formattedCoins = coins.map((coin) => ({
      name: coin.item.name,
      price: coin.item.price_btc,
      logo: coin.item.large
    })) */

    return data
  }
}


Comlink.expose(funcs)
