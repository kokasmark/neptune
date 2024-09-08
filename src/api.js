
let cache = {};
async function callApi(route, r, doc = false) {

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Cookie", `.ASPXAUTH=; ASP.NET_SessionId=wldswpdksw1fhs2kbgfkqdw0`);

  const raw = JSON.stringify(r);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  if(!cache[route]){
    console.log(`${route} from neptun`)
    try {
      const response = await fetch(`${route}`, requestOptions);
      var newCache = {json: [], doc: []}
      
      if (!doc) {
        newCache.json = await response.json();
        const result = newCache.json;
        cache[route] = newCache;
        return result;
      } else {
        newCache.doc = await response.text();
        const result =newCache.doc;
        cache[route] = newCache;
        return result;
      }
      
    } catch (error) {
      console.log(error);
    };
  }else{
    console.log(`${route} from cache`)
    if (!doc) {
      return cache[route].json;
    } else {
      return cache[route].doc;
    }
  }
}

export default callApi;