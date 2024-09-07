function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }
  
  // Function to make API calls
  async function callApi(route,r, doc=false) {
    
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

try {
  const response = await fetch(route, requestOptions);
  if(!doc){
  const result = await response.json();
  return result;
  }else{
    const result = await response.text();
  return result;
  }
} catch (error) {
  return error;
};
  }
  
  export default callApi;