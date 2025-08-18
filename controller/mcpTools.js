

import axios from 'axios';

export async function getWeatherData({ param, token }) {
  const url = "https://api.weatherapi.com/v1/current.json";
  const keys = Object.keys(param);
  
   let parameter = param[keys]
  try {
    const response = await axios.get(url, {
      params: { key: "150a7f51eca54bb7a95130038221706", q: parameter }, // Passing query parameter
      headers: {
        "Content-Type": "application/json",
       // "Authorization": token,//"Bearer 00DOz00000AARBq!AQEAQIRTI_Fc2PBOIOaf8K5qqDaaqPM6yqQXISMtItFDIhF0hGtMN.zVt3fOSsgL1_kbqIJxm39GwhXa6agoXTIXExT8KaKO",
       // "Cookie": "BrowserId=_GI-41WKEfCaMen0_EwcMg; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1"
      }
    });

    return {
      content: [
        { type: "text", text: JSON.stringify(response.data, null, 2) }
      ]
    };

  } catch (error) {
    console.error("Error fetching weather data:", error.message);

    return {
      content: [
        { type: "text", text: `Failed to fetch weather data!\nError: ${error.message}` }
      ]
    };
  }
 
}

///////////////////////////////////////////////////////////////////////////////
export async function genericSalesforceCall({ params, channelName, token }) {
  
  // console.log(`token -=-=- ${token}`);
  const endpoint = `https://flow-power-5118-dev-ed.scratch.my.salesforce.com/services/apexrest/lwapic/lws/${channelName}`;
params['type'] = "E"
  try {
    const response = await axios.get(endpoint, {
      params, // These are the dynamic query params
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      }
    });
    return {
      content: [
        { type: "text", text: response.data }
      ]
    };

  } catch (error) {
    console.error(`Error calling Salesforce channel ${channelName}:`, error.message);
    return {
      content: [
        { type: "text", text: `Error calling Salesforce channel "${channelName}": ${error.message}` }
      ]
    };
  }
}


////////////////////////////////////////////////////////////////////////////////////

 // Salesforce record Query
  export async function getSalesforceRecord({ objectName, token }) {
  const url = "https://flow-power-5118-dev-ed.scratch.my.salesforce.com/services/apexrest/lwapic/lws/etl/Get_Salesforce_Record";

  try {
    const response = await axios.get(url, {
      params: {
        type: "E",
        fields: "Name",
        object: objectName || "Account"
      },
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,//"Bearer 00DOz00000AARBq!AQEAQIRTI_Fc2PBOIOaf8K5qqDaaqPM6yqQXISMtItFDIhF0hGtMN.zVt3fOSsgL1_kbqIJxm39GwhXa6agoXTIXExT8KaKO",
        "Cookie": "BrowserId=_GI-41WKEfCaMen0_EwcMg; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1"
      }
    });

    return {
      content: [
        { type: "text", text: JSON.stringify(response.data, null, 2) }
      ]
    };

  } catch (error) {
    console.error("Error fetching Salesforce record:", error.message);
    return {
      content: [
        { type: "text", text: `Failed to fetch Salesforce records!\nError: ${error.message}` }
      ]
    };
  }
}

  //Create Account Record
 export async function createSalesforceAccountRecord({ name }) {
  const endpoint = "https://flow-power-5118-dev-ed.scratch.my.salesforce-sites.com/services/apexrest/lwapic/webhook/channel/Record_creation";

  try {

    // Sending the name as a query parameter
    const response = await axios.get(endpoint, {
      params: { Name: name }
    });

    return {
      content: [
        { type: "text", text: `Account Creation Success!\nResponse: ${JSON.stringify(response.data)}` }
      ]
    };

  } catch (err) {
    console.error('Create error:', err);

    return {
      content: [
        { type: "text", text: `Account Creation failed!\nError: ${err.message || err}` }
      ]
    };
  }
}
  
  export async function getMovieRating({ title , token }) {

     const url = "https://enterprise-fun-4222-dev-ed.scratch.my.salesforce.com/services/apexrest/lwapic/lws/etl/Get_Movie_Ratings";

  try {
     const response = await axios.get(url, {
       params: {
         type: "ET",
  //      // fields: "Name",
  //      // object: objectName || "Account"
       },
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
        "Cookie": "BrowserId=_GI-41WKEfCaMen0_EwcMg; CookieConsentPolicy=0:1; LSKey-c$CookieConsentPolicy=0:1"
      }
    });
 
  const data = response.data
  
    const key = title.toLowerCase();
    const movie = data[key] || { rating: "N/A", summary: "No data available for this movie." };
  
    return {
      content: [
        {
          type: "text",
          text: `Title: ${title}\nRating: ${movie.rating}\nSummary: ${movie.summary}`,
        },
      ],
    };

    }catch (err) {
    console.error('Create error:', err);

    return {
      content: [
        { type: "text", text: `Account Creation failed!\nError: ${err.message || err}` }
      ]
    };
  }


  }

  