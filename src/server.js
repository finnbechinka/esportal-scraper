async function get_live_matches() {
  res = await fetch("https://esportal.com/api/live_games/list?_=1677021440843&region_id=0", {
    credentials: "include",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0",
      Accept: "*/*",
      "Accept-Language": "en-US,de;q=0.7,en;q=0.3",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
    },
    referrer: "https://esportal.com/en/matchmaking",
    method: "GET",
    mode: "cors",
  });
  body = await res.json();
  console.log(body);
  return res;
}

// get_live_matches();

// const { PrometheusDriver } = require("prometheus-query");

// const prom = new PrometheusDriver({
//   endpoint: "http://192.168.2.2:9090",
//   baseURL: "/api/v1/", // default value
// });

// const q =
//   'avg_over_time(speedtest_jitter_miliseconds{instance="192.168.2.2:9101",job="raspi-speedtest"}[24y])';
// async function haha() {
//   prom
//     .instantQuery(q)
//     .then((res) => {
//       const series = res.result;
//       series.forEach((serie) => {
//         console.log("Serie:", serie.metric.toString());
//         console.log("Time:", serie.value.time);
//         console.log("Value:", serie.value.value);
//       });
//     })
//     .catch(console.error("wtf"));
// }

// haha();
